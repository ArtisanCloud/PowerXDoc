# 🛡️ Security & Validation 插件安全与完整性校验规范（Makefile 版）

> 本文档定义 PowerX 插件在 **开发、打包、签名、上传、运行** 各阶段的安全策略与验证机制。  
> 所有示例均以 **Makefile 任务** 实现，而非 powerx CLI。

---

## 🧱 1. 安全架构总览

| 层级 | 说明 | 负责方 |
|------|------|---------|
| **开发与打包安全** | 插件代码完整性、版本与签名 | Vendor |
| **上传与审核安全** | Marketplace 病毒/依赖/内容扫描 | Marketplace |
| **运行时安全** | CoreX 运行隔离、权限校验、日志追踪 | PowerX CoreX |
| **持续合规监控** | 安全事件上报与版本撤销 | PowerX Security Team |

---

## 🔐 2. 密钥与签名（使用 `openssl`）

### 2.1 生成密钥对（一次性）

```bash
# 生成 4096 位 RSA 私钥与对应公钥
openssl genrsa -out keys/vendor_private.pem 4096
openssl rsa -in keys/vendor_private.pem -pubout -out keys/vendor_public.pem
```

### 2.2 计算包摘要并签名

```bash
# 计算 tar 包的 SHA-256
sha256sum dist/com.vendor.plugin-1.0.0.tar.gz | awk '{print $1}' > dist/sha256.txt

# 用私钥对摘要签名（得到二进制签名再 base64）
openssl dgst -sha256 -sign keys/vendor_private.pem \
  dist/com.vendor.plugin-1.0.0.tar.gz | base64 > dist/com.vendor.plugin-1.0.0.sig
```

### 2.3 验证签名

```bash
# 验证签名（将 base64 还原为二进制后验证）
base64 -d dist/com.vendor.plugin-1.0.0.sig > dist/sig.bin
openssl dgst -sha256 -verify keys/vendor_public.pem -signature dist/sig.bin \
  dist/com.vendor.plugin-1.0.0.tar.gz
```

> 建议将 **签名元信息**（`plugin_id`、`version`、`sha256`、`signed_at`、`vendor_id`）写入
> `dist/com.vendor.plugin-1.0.0.sig.json` 便于 Marketplace 校验。

---

## 🗂️ 3. Makefile 任务模板（可直接复制）

```makefile
# ===== Config =====
PLUGIN_ID      ?= com.vendor.data_forge
VERSION        ?= 1.2.0
DIST_DIR       ?= dist
PKG_NAME       := $(PLUGIN_ID)-$(VERSION)
PKG_FILE       := $(DIST_DIR)/$(PKG_NAME).tar.gz
SIG_FILE       := $(DIST_DIR)/$(PKG_NAME).sig
SIG_META       := $(DIST_DIR)/$(PKG_NAME).sig.json
PRIV_KEY       ?= keys/vendor_private.pem
PUB_KEY        ?= keys/vendor_public.pem

BACKEND_DIR    ?= backend
FRONTEND_DIR   ?= web-admin
YAML_FILE      ?= plugin.yaml

# ===== Helpers =====
TS_ISO := $(shell date -u +"%Y-%m-%dT%H:%M:%SZ")

.PHONY: all clean validate build sign verify audit sandbox secure-pack

all: clean validate build sign verify audit

clean:
 @rm -rf $(DIST_DIR) && mkdir -p $(DIST_DIR)

# 1) 基础验证（YAML、目录、必需文件）
validate:
 @test -f $(YAML_FILE) || (echo "missing $(YAML_FILE)"; exit 1)
 @test -d $(BACKEND_DIR) || (echo "missing $(BACKEND_DIR)/"; exit 1)
 @echo "YAML/结构检查通过"

# 2) 前端构建（可选）
frontend-build:
 @if [ -d "$(FRONTEND_DIR)" ]; then \
  cd $(FRONTEND_DIR) && pnpm install && pnpm build; \
 fi

# 3) 打包
build: frontend-build
 @tar -czf $(PKG_FILE) \
  $(YAML_FILE) README.md LICENSE \
  $(BACKEND_DIR) \
  $(FRONTEND_DIR)/dist 2>/dev/null || true
 @echo "打包完成: $(PKG_FILE)"

# 4) 生成签名及元信息
sign:
 @test -f $(PRIV_KEY) || (echo "missing $(PRIV_KEY)"; exit 1)
 @openssl dgst -sha256 -sign $(PRIV_KEY) $(PKG_FILE) | base64 > $(SIG_FILE)
 @SHA256=$$(sha256sum $(PKG_FILE) | awk '{print $$1}'); \
 echo "{\"plugin_id\":\"$(PLUGIN_ID)\",\"version\":\"$(VERSION)\",\"sha256\":\"$$SHA256\",\"signed_at\":\"$(TS_ISO)\"}" > $(SIG_META)
 @echo "签名完成: $(SIG_FILE) / 元信息: $(SIG_META)"

# 5) 验证签名
verify:
 @test -f $(PUB_KEY) || (echo "missing $(PUB_KEY)"; exit 1)
 @base64 -d $(SIG_FILE) > $(DIST_DIR)/sig.bin
 @openssl dgst -sha256 -verify $(PUB_KEY) -signature $(DIST_DIR)/sig.bin $(PKG_FILE)
 @echo "签名验证通过"

# 6) 依赖与安全审计（按需安装工具）
audit:
 @echo "== Go 后端审计 =="
 @if [ -f "$(BACKEND_DIR)/go.mod" ]; then \
  ( cd $(BACKEND_DIR) && go vet ./... && go test ./... && govulncheck ./... ); \
 else echo "skip go"; fi
 @echo "== Rust 后端审计 =="
 @if [ -f "$(BACKEND_DIR)/Cargo.toml" ]; then \
  ( cd $(BACKEND_DIR) && cargo check && cargo test && cargo audit || true ); \
 else echo "skip rust"; fi
 @echo "== 前端依赖审计 =="
 @if [ -f "$(FRONTEND_DIR)/package.json" ]; then \
  ( cd $(FRONTEND_DIR) && pnpm install && pnpm audit --fix --audit-level=high || true ); \
 else echo "skip frontend"; fi
 @echo "== 文件/恶意扫描（可选，需安装 trivy/clamav） =="
 @which trivy >/dev/null 2>&1 && trivy fs . || echo "skip trivy"
 @echo "审计完成"

# 7) 本地沙盒运行（示例：通过 docker-compose 启动 corex sandbox）
sandbox:
 @echo "启动本地 Sandbox（示意，需要你提供 docker-compose.sandbox.yml）"
 @docker compose -f docker-compose.sandbox.yml up -d
 @echo ">>> 将 $(PKG_FILE) 上传到 Sandbox 的安装接口，或挂载到容器内测试"

# 8) 一键安全打包
secure-pack: clean validate build audit sign verify
 @echo "secure-pack 完成 → $(PKG_FILE) + $(SIG_FILE)"
```

> 你可以根据语言栈裁剪 `audit` 步骤（例如仅 Go 或仅 Node）。
> **CI/CD** 中只需调用 `make secure-pack` 即可完成「验证 → 打包 → 审计 → 签名 → 验证」。

---

## ⚙️ 4. 运行时隔离（CoreX 侧约束）

| 层级          | 机制                                             | 说明         |
| ----------- | ---------------------------------------------- | ---------- |
| **进程/容器隔离** | 每插件独立进程/容器                                     | 防内存/文件泄漏   |
| **租户隔离**    | 独立 DB Schema                                   | 严禁跨租户访问    |
| **文件系统**    | 只读映射 + 临时目录 `/tmp/{plugin_id}`                 | 禁止越权读写     |
| **网络**      | 默认封外网；需在 manifest 白名单域名                        | 最小出网       |
| **环境变量**    | CoreX 注入最小上下文（`tenant_id`/`plugin_id`/`token`） | 严禁泄露系统变量   |
| **权限**      | RBAC + ToolGrant                               | 超界访问直接 403 |

---

## 🧰 5. 权限与声明（`plugin.yaml`）

```yaml
permissions:
  - resource: media
    actions: [read, write]
    scope: tenant
  - resource: data_visualization
    actions: [create, read, delete]
    scope: tenant
```

> **最小权限原则**：仅声明必要资源与动作。安装时 CoreX 生成 ToolGrant 并生效。

---

## 🧠 6. 依赖安全（语言栈建议）

* **Go**：`go vet` / `go test` / `govulncheck`
* **Rust**：`cargo check` / `cargo test` / `cargo audit`
* **Node**：`pnpm audit --audit-level=high`（或 `npm audit`）
* **镜像/文件扫描**：`trivy fs .`、`clamscan -r .`（可选）

---

## 🔒 7. 敏感信息与外链控制

| 内容                   | 规范                   | 检测                 |
| -------------------- | -------------------- | ------------------ |
| `.env`/`.pem`/`.key` | **禁止**出现在包内          | Makefile 自检 + 市场扫描 |
| Token/Secret         | **禁止**硬编码            | 静态扫描               |
| 日志                   | 不得记录隐私/密钥            | 审计采集               |
| 外部请求                 | 必须在 manifest 声明域名白名单 | 运行时网关校验            |

---

## 🧾 8. 版本撤销（Revoke）与签名吊销

* Vendor 可提交某版本的撤销请求（JSON + 重新签名）
* Marketplace 可强制下架并同步至 CoreX
* CoreX 加载时将校验版本签名状态（`active/revoked`）

撤销请求示例：

```json
{
  "plugin_id": "com.vendor.data_forge",
  "version": "1.2.0",
  "reason": "发现安全漏洞，需紧急撤销",
  "vendor_signature": "base64-signature"
}
```

---

## 📜 9. 日志与追踪字段

| 字段          | 示例                    | 说明     |
| ----------- | --------------------- | ------ |
| `trace_id`  | px-23ab4e             | 请求链路追踪 |
| `plugin_id` | com.vendor.data_forge | 插件标识   |
| `tenant_id` | t-88a0d               | 当前租户   |
| `action`    | upload_asset          | 动作名称   |
| `status`    | success/failed        | 结果     |

> 建议使用统一 Logger 封装输出上述字段。

---

## 🧪 10. 审核阶段自动检查（Marketplace）

| 检查项   | 描述                    |
| ----- | --------------------- |
| 签名验证  | `openssl` 公钥验证通过      |
| 文件结构  | `plugin.yaml` 完整、路径合规 |
| 依赖风险  | CVE 扫描无高危             |
| 权限差异  | 声明与实际调用比对             |
| 外链/恶意 | 拦截可疑外链与脚本             |
| 日志合规  | 无敏感信息输出               |

---

## 🚀 11. CI/CD 示例（GitHub Actions）

```yaml
name: Build & Sign Plugin

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  build-sign-verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Go
        uses: actions/setup-go@v5
        with:
          go-version: '1.22'

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: corepack enable

      - name: Setup Rust
        uses: dtolnay/rust-toolchain@stable

      - name: Install tools
        run: |
          sudo apt-get update && sudo apt-get install -y openssl clamav
          go install golang.org/x/vuln/cmd/govulncheck@latest
          cargo install cargo-audit || true

      - name: Prepare keys
        run: |
          mkdir -p keys dist
          echo "$VENDOR_PRIVATE_PEM" > keys/vendor_private.pem
          echo "$VENDOR_PUBLIC_PEM"  > keys/vendor_public.pem
        env:
          VENDOR_PRIVATE_PEM: ${{ secrets.VENDOR_PRIVATE_PEM }}
          VENDOR_PUBLIC_PEM:  ${{ secrets.VENDOR_PUBLIC_PEM }}

      - name: Secure Pack (validate/build/audit/sign/verify)
        run: make secure-pack VERSION=${{ github.run_number }}
```

---

## 🪶 12. 最佳实践

* **密钥管理**：私钥仅在本地或 CI Secret 中保存；发布仅上传公钥。
* **最小权限**：权限声明与实际调用保持一致，避免过度授权。
* **持续审计**：将 `make audit` 加入每次提交的必跑步骤。
* **可撤销**：发现漏洞立刻提交 Revoke，避免扩散。
* **可追踪**：统一日志字段，便于平台侧审计与回溯。

---

## 📘 13. 关联文档

* 👉 [Testing & Sandbox 测试与沙盒环境指南](./Testing_and_Sandbox.md)
* 👉 [Submission & Review 插件上架与审核流程](../03_listing_and_lifecycle/Submission_and_Review.md)
* 👉 [Deprecation & Sunset 生命周期终止策略](../03_listing_and_lifecycle/Deprecation_and_Sunset.md)

---

> ✅ **总结一句话：**
> 用 **Makefile** 把「验证 → 打包 → 审计 → 签名 → 校验」固化成一键流程，
> 才能让每次发布都 **可重复、可审计、可追责**。
好的 👍
我们继续完善这一章节的下一部分（续篇）——本节将聚焦于 **插件运行期的安全策略、版本指纹、加密、审计与撤销机制**，作为 `docs/vendor/02_plugin_development/Security_and_Validation.md` 的后半篇（Part 2）。
如果你已经放入前一部分（Makefile 版），可以直接在其后追加这一节内容。

---

````markdown
# 🔒 Security & Validation（续）运行期安全、加密与版本指纹策略

---

## 🧩 14. 运行期安全策略（Runtime Security）

PowerX CoreX 在加载和运行插件时执行多层实时防护：

| 维度 | 防护措施 | 说明 |
|------|-----------|------|
| **进程安全** | 每个插件独立运行子进程 | 防止崩溃传播与内存污染 |
| **系统调用白名单** | 拦截文件/网络系统调用 | 禁止访问宿主根目录与外网 |
| **动态沙箱 UID/GID** | 每插件独立 UID | 防止跨插件文件访问 |
| **资源限制** | cgroup 限制 CPU / 内存 / IO | 避免滥用宿主资源 |
| **安全上下文注入** | 自动注入 `tenant_id` 、 `plugin_id` 、 `trace_id` | 运行期审计追踪 |
| **日志拦截** | 统一 Logger 输出 → 安全 Agent 收集 | 防止打印 PII 或 Token 信息 |

> CoreX Security Agent 实时监控每个插件的资源与调用行为，  
> 一旦发现异常（CPU 峰值 / 频繁外网请求 / 可疑文件写入）立即触发 `security_violation` 事件。

---

## 🧠 15. 版本指纹（Version Fingerprint）

每个插件包在构建时生成唯一 `fingerprint`，由 SHA-256 摘要、Vendor 签名和 Manifest 特征共同组成。

```bash
FINGERPRINT=$(sha256sum dist/com.vendor.plugin-1.0.0.tar.gz | cut -d' ' -f1)
echo $FINGERPRINT > dist/com.vendor.plugin-1.0.0.fingerprint
````

### 校验方式

CoreX 加载插件时会：

1. 读取 `plugin.yaml` 中的 `version`；
2. 计算当前文件 SHA-256；
3. 比对 Marketplace 登记的指纹；
4. 校验 签名 → 版本 → 依赖 → 权限。

若任一环节不一致 → 插件被标记为 `tampered` 并拒绝运行。

---

## 🧰 16. 加密机制（Encryption）

| 场景        | 加密方式                     | 说明                  |
| --------- | ------------------------ | ------------------- |
| **签名文件**  | RSA 4096 / SHA-256       | Vendor 签名 → 可验证来源   |
| **传输通道**  | HTTPS + mTLS （双向认证）      | 插件与 Marketplace 间通信 |
| **插件存储包** | AES-256 静态加密（可选）         | 私有 Marketplace 部署   |
| **日志流**   | TLS 1.3 加密传输             | 防止被动窃听              |
| **数据库凭据** | PowerX Secret Vault 动态注入 | 不落盘、不暴露             |

---

## 🧾 17. 审计与追踪（Audit Trail）

### 审计日志字段（统一规范）

| 字段          | 示例                           | 说明     |
| ----------- | ---------------------------- | ------ |
| `timestamp` | 2025-10-13T12:30:01Z         | UTC 时间 |
| `plugin_id` | com.vendor.data_forge        | 插件标识   |
| `tenant_id` | t-a98c                       | 所属租户   |
| `action`    | data_forge.report.create     | 行为事件   |
| `level`     | info / warn / error          | 日志等级   |
| `trace_id`  | px-2f9f5                     | 链路追踪   |
| `origin`    | corex / marketplace / plugin | 来源模块   |
| `status`    | success / fail               | 执行结果   |

### 审计存储策略

* 每条日志流经 PowerX Event Bus → 安全审计 Topic `audit.plugin.logs`；
* CoreX 每日轮转日志 + 压缩归档 7 天；
* Marketplace 定期汇总 → 安全团队审查；
* 高风险事件会自动触发邮件通知 Vendor。

---

## 🚫 18. 插件吊销（Revoke Mechanism）

当 Marketplace 或 Vendor 发现漏洞，可立即吊销已发布版本：

| 状态           | 说明        |
| ------------ | --------- |
| `active`     | 正常运行      |
| `revoked`    | 已撤销，不再加载  |
| `suspended`  | 暂停中，等待修复  |
| `deprecated` | 已弃用（仍可运行） |

### 吊销步骤

1. Vendor 签发 `revoke.json`：

   ```json
   {
     "plugin_id": "com.vendor.data_forge",
     "version": "1.2.0",
     "reason": "漏洞修复发布前暂停使用",
     "signature": "base64-rsa-signature"
   }
   ```

2. Marketplace 验证签名 → 更新状态；
3. CoreX 同步缓存 → 禁止加载；
4. Admin 显示警告标识 ⚠️ 「此插件已被暂停」。

---

## ⚡ 19. 威胁检测（Threat Detection）

PowerX Security Agent 具备实时检测规则：

| 检测类型       | 示例触发条件               | 处理动作                   |
| ---------- | -------------------- | ---------------------- |
| **越权访问**   | 插件尝试访问其他 Schema      | 自动 403 + 记录 trace      |
| **异常出网**   | 外网请求超阈值 > 10/min     | 阻断网络接口                 |
| **CPU 暴涨** | 进程 > 200% 持续 60 s    | 暂停进程、上报 Security Event |
| **文件注入**   | 写入 /root 或 /etc      | 强制卸载插件                 |
| **签名篡改**   | 运行包 SHA 与登记不符        | 标记 `tampered` 状态       |
| **日志泄露**   | 检测到 Token / 邮箱 / PII | 自动脱敏 + 告警              |

---

## 🧩 20. Vendor 安全自检脚本

在 `Makefile` 中可追加 `make secure-check` 用于本地预检：

```makefile
secure-check:
 @echo "🔒 运行本地安全自检..."
 @grep -R "SECRET\|TOKEN" backend/ || true
 @grep -R "http://" backend/ || echo "✅ 无明文 HTTP 链接"
 @find . -name "*.pem" -o -name "*.key" | grep -v "keys/" || echo "✅ 无多余私钥"
 @echo "✅ 代码中未发现明显敏感内容"
```

---

## 🧠 21. 异常处置与通报流程

| 阶段                 | 动作                     | 响应时间    |
| ------------------ | ---------------------- | ------- |
| **漏洞上报**           | Vendor → Security Team | ≤ 24 小时 |
| **Marketplace 验证** | 重现与影响评估                | ≤ 48 小时 |
| **紧急撤销**           | 发布 Revoke 公告           | ≤ 72 小时 |
| **补丁发布**           | Vendor 提交新版本           | ≤ 7 天   |
| **恢复上架**           | 审核通过 → 恢复 `active`     | ≤ 10 天  |

---

## 🪶 22. 最佳实践汇总

| 类别       | 建议                                         |
| -------- | ------------------------------------------ |
| **加密**   | 全程 TLS 通信 + RSA 签名                         |
| **签名**   | 使用 4096 位 RSA 密钥，定期轮换                      |
| **构建流程** | Makefile 自动化 + CI 审计                       |
| **权限**   | RBAC 最小化原则                                 |
| **日志**   | 统一格式 + 脱敏输出                                |
| **安全测试** | 每次发布前运行 `make audit` 与 `make secure-check` |
| **版本回滚** | 预留 Revoke 通道，保持可恢复性                        |

---

## 📘 23. 关联文档

* 👉 [Testing & Sandbox 测试与沙盒环境指南](./Testing_and_Sandbox.md)
* 👉 [Submission & Review 插件上架与审核流程](../03_listing_and_lifecycle/Submission_and_Review.md)
* 👉 [Deprecation & Sunset 生命周期终止策略](../03_listing_and_lifecycle/Deprecation_and_Sunset.md)
* 👉 [PowerX Plugin Manifest 对接规范](../06_integration_with_powerx/PowerX_Plugin_Manifest.md)

---

> ✅ **总结一句话：**
> PowerX 插件安全体系以 **签名 → 完整性 → 隔离 → 加密 → 审计 → 可撤销** 为核心闭环。
> 任何未通过签名验证或被标记为 `tampered` 的插件，将被 **即时阻断、追踪并吊销**。
