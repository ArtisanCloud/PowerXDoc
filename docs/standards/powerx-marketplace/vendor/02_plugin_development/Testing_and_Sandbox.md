# Plugin Manifest & Packaging Pipeline 测试指南

本文档按顺序演示如何验证插件能力契约、清单、打包产物以及 REST API 的联动流程。执行前请先熟悉并编译 `px` CLI（见《px_cli.md》），确保可在本地正常运行。

---

## 示例目录结构（建议）

文档中出现的 `contracts/`、`tmp/workspace/`、`tmp/dist/` 等路径都是本地演示用的临时目录，仓库默认仓不包含它们。建议参考以下结构手动创建，便于管理契约、清单和打包产物：

```
.
├── contracts/          # 本地能力契约草稿（YAML）
├── tmp/
│   ├── workspace/      # 插件工作区：manifest、待打包文件
│   └── dist/           # CLI 输出的 .pxp 产物、摘要文件
└── backend/            # 实际服务代码、px CLI 源码
```

当然，你也可以根据实际项目路径自行调整，只要在 CLI 命令里使用匹配的路径即可。

> 这些目录仅用于本地演练，跟随示例创建即可。若不再需要，完成测试后可以安全删除。

---

## 0. 准备 `px` CLI

1. 编译或安装（任选其一）：
   ```bash
   cd backend
   go build -o bin/px ./cmd/px        # 推荐：调试阶段将可执行文件放到 bin/
   # go install ./cmd/px              # 测试通过后，可安装至 $GOBIN
   ./bin/px --config etc/config.yaml --version
   ```
   若输出版本信息，说明 CLI 在 `backend/` 下可正常运行。

2. 将 `px` 加入 PATH（可选）：
   ```bash
   cd ..                               # 回到仓库根目录
   export PATH="$(pwd)/backend/bin:$PATH"
   px --config backend/etc/config.yaml --version
   ```
如果不想修改 PATH，可在任意位置使用 `./backend/bin/px` 运行 CLI。若选择配置环境变量，也可以执行 `export CONFIG_PATH=backend/etc/config.yaml`，随后所有 `px` 命令会默认读取该配置文件（文档中的 `--config` 参数便可省略）。

> 后续示例默认在仓库根目录执行；请根据自身习惯选择 `px` 或 `./backend/bin/px` 形式。

---

## 1. 准备能力契约

> Manifest 必须引用已发布的 capability，先完成该步骤。

先为契约草稿准备目录：

```bash
mkdir -p ./contracts
cat > ./contracts/payments.transfer.yaml <<'YAML'
capability_id: payments.transfer
version: 1.0.0
classification: backward_compatible
inputs:
  amount:
    type: number
    required: true
outputs:
  transaction_id:
    type: string
    required: true
YAML
```

1. **校验契约**
   ```bash
   px --config backend/etc/config.yaml contract validate ./contracts/payments.transfer.yaml
   ```
2. **发布契约**
   ```bash
   px --config backend/etc/config.yaml contract publish ./contracts/payments.transfer.yaml
   ```
   确认输出包含 `capability_id=payments.transfer` 且版本 `1.0.0`。

---

## 2. 准备插件 manifest

> 可选：若希望生成完整的插件骨架，可执行 `px plugin init`（默认输出到 `plugins/<name>`）并在生成目录下继续以下步骤。

1. **生成 manifest 模板**
   ```bash
   px --config backend/etc/config.yaml plugin manifest scaffold \
     --plugin-id vendor.payment-service \
     --vendor-id 9f77f4c5-7ef3-4c2d-8efa-4ff60b7f845e \
     --capability payments.transfer@1.0.0 \
     --out ./tmp/workspace/plugin.yaml
   ```
   生成后的 `plugin.yaml` 可根据需要继续补充 transports、permissions 等字段。

2. **准备 workspace 内容**
   ```bash
   mkdir -p ./tmp/workspace
   echo "sample binary/data" > ./tmp/workspace/README.md
   ```

---

## 3. CLI 测试

> `px` CLI 源码位于 `backend/cmd/px/main.go`，编译命令如下：
> ```bash
> cd backend
> go build -o bin/px ./cmd/px            # 调试时将可执行文件放到本项目 bin/ 目录
> # go install ./cmd/px                  # 如需全局安装到 $GOBIN，可在验证无误后执行
> ```
> 执行 CLI 时建议显式指定配置：`./backend/bin/px --config backend/etc/config.yaml ...`

1. **Manifest 校验**
   ```bash
   px --config backend/etc/config.yaml plugin manifest validate --manifest ./tmp/workspace/plugin.yaml
   ```
   期望输出 `manifest valid for vendor.payment-service`。

2. **构建产物**
   ```bash
   px --config backend/etc/config.yaml plugin build \
     --manifest ./tmp/workspace/plugin.yaml \
     --workspace ./tmp/workspace \
     --out ./tmp/dist
   ```
   该命令会生成 `.pxp` 文件并打印 digest。

3. **打包产物（验证可重复性）**
   ```bash
   mkdir -p ./tmp/dist
   px --config backend/etc/config.yaml plugin package \
     --manifest ./tmp/workspace/plugin.yaml \
     --workspace ./tmp/workspace \
     --out ./tmp/dist
   ```
   - 记录输出的 `artifact` 路径与 `digest`。
   - 再次执行一次命令，确认 digest 不变（保证可重复构建）。

4. **可选：错误场景验证**
   - 删除 manifest 中的 `plugin_id`，重新执行步骤 1，应提示缺少 `plugin_id`。
   - 将 `transport_type` 改为 `websocket`，执行步骤 1 或 2，应提示不支持的 transport。

5. **可选：签名并发布产物**
   ```bash
   ARTIFACT=$(ls ./tmp/dist/*.pxp | head -n1)
   px --config backend/etc/config.yaml plugin sign --artifact "$ARTIFACT" --signer local-dev
   px --config backend/etc/config.yaml plugin publish \
     --manifest ./tmp/workspace/plugin.yaml \
     --artifact "$ARTIFACT" \
     --signature "$ARTIFACT.sig.json" \
     --version 1.0.0 \
     --channel beta
   ```
   发布成功后，可在数据库中查看 manifest 状态，也可通过 API 查询（见下一章节）。

---

## 4. REST API 测试（当前实现）

> 后端服务默认监听 `http://localhost:8080`。目前仅开出内部调试接口，路径位于 `/internal/plugins/contracts/*`，不在 `/api/v1` 之下。请求需要携带 `Authorization: Bearer dev-123456` 才能通过默认的鉴权中间件。

1. **提交契约（验证或发布）**
   - **POST** `http://localhost:8080/internal/plugins/contracts/validate`
   - Headers：`Content-Type: application/json`、`Authorization: Bearer dev-123456`
   - Body 示例：
     ```json
     {
       "capability_id": "payments.transfer",
       "vendor_id": "9f77f4c5-7ef3-4c2d-8efa-4ff60b7f845e",
       "version": "1.0.0",
       "schema_io": {
         "request": {"type": "object"},
         "response": {"type": "object"}
       },
       "error_catalog": {
         "codes": [{"code": "insufficient_funds", "type": "business"}]
       },
       "scopes_required": ["payments.write"]
     }
     ```
   - 验证通过返回 `HTTP 200`，body 为校验结果。

2. **直接发布契约**
   - **POST** `http://localhost:8080/internal/plugins/contracts/publish`
   - Body 与校验接口一致；成功时返回 `HTTP 201` 和持久化后的契约信息。

3. **查询契约**
   - **GET** `http://localhost:8080/internal/plugins/contracts/{capability_id}`
   - 返回当前契约及版本历史。

4. **Manifest 接口（可选）**
   - **POST** `http://localhost:8080/internal/plugins/manifests/validate` 用于仅校验 manifest。
   - **POST** `http://localhost:8080/internal/plugins/manifests` 持久化 manifest 元数据。
   - **POST** `http://localhost:8080/internal/plugins/manifests/artifacts` 登记打包产物（需提供存储 `artifact_key` 与 `artifact_hash`）。

> 尚未开放 `/api/v1/plugin-manifests:*` 路由；若需通过 REST 调用，请使用上述内部接口或直接使用 CLI (`px plugin publish`) 流程。

5. **传输兼容性**
   - **POST** `http://localhost:8080/internal/plugins/transports/compatibility` 上传兼容性报告（字段格式与 `px plugin transport check --report` 一致）。
   - **GET** `http://localhost:8080/internal/plugins/transports/compatibility/{plugin_id}` 查看最近一次兼容性矩阵结果。

---

## 5. 常见错误验证（建议执行）

- `plugin_id` 缺失 → REST/CLI 均应返回 400。
- 使用未知 `capability_id` → 提交正式 manifest 时返回 409/422。
- 修改 workspace 内容后重新打包 → digest 应随内容变化。

---

## 6. 后续扩展测试

- 配合安全扫描、沙箱测试命令（US4）执行 `px plugin security scan --input security-scan.json`、`px plugin test --sandbox`。
- 将文档示例集成到 Postman / 自动化脚本中，执行完整 CI 流程。

完成上述步骤后，即可确认 manifest & packaging 管线在本地环境运行正常。

---

## 清理临时目录（可选）

如仅为了测试 CLI，可在完成演练后删除临时目录，避免示例文件残留：

```bash
rm -rf ./contracts
rm -rf ./tmp/workspace
rm -rf ./tmp/dist
```

删除前请确认没有误将真实项目文件放在这些路径下；若 `.pxp` 已上传到对象存储，保留或删除本地 `tmp/dist/` 均不影响线上环境。***
