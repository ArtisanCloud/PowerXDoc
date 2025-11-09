# 插件初始化与本地调试实践

- **覆盖场景**: `SCN-DEV-PLUGIN-INIT-001`, `SCN-DEV-PLUGIN-DEBUG-001`（`../../website/zh/scenarios`）
- **关联规范**: `../Plugins/PowerXPlugin/specs/004-publish-hub-spec/spec.md`
- **读者角色**: 插件开发者、技术负责人

本指南用于把脚手架、plugin.yaml 调整、`px-plugin dev` 热加载与 Dev API/SSE 遥测串成一条可重复的链路。

---

## 0. 安装 / 更新 px-plugin CLI

```bash
cd <workspace>/PowerX/Core/Plugins/PowerXPlugin/tools/cli
go install ./cmd/px-plugin
# 如需带上版本号，可执行：
# go install -ldflags "-X main.version=v0.3.0" ./cmd/px-plugin
px-plugin --version

# 可选：预先同步模板与框架依赖（避免脚手架与 Skeleton 漏同步）
cd <workspace>/PowerX/Core/Plugins/PowerXPlugin
npm run sync:templates -- --check   # 仅检查差异
npm run sync:templates -- --verbose # 写入模板
# npm --workspaces install          # 若需调试 framework-admin/client 源码
# go work sync                      # 确保 framework/ 模块引用最新
```

> CLI 模板依赖 `framework/` 与 `skeleton/`，建议按 `docs/guides/cli-plugin-tutorial.md` 的 Step 1 同步模板后再构建。  
> `go install` 会把可执行文件输出到 `$(go env GOPATH)/bin`，请确认该目录在 `PATH` 中。若要就地编译，可用 `go build -o <workspace>/PowerX/Core/Plugins/PowerXPlugin/bin/px-plugin ./tools/cli/cmd/px-plugin` 并把 `bin/` 目录加入 `PATH`。  
> 当前 Go CLI 仅实现 `init`、`package`、`dist`、`publish` 指令，`doctor`、`dev --watch`、`host start --mock` 仍在 004 backlog 中，运行旧版二进制会出现 `unknown command`。
```


---

## 1. 准备环境（手动检查）

1. **同步插件仓库**  
   ```bash
   cd <workspace>/PowerX/Core/Plugins/PowerXPlugin
   git pull
   ```
2. **检测 CLI 依赖**（Node.js 18, Go 1.24+）  
   ```bash
   go version      # 需返回 go1.24.x
   node -v         # 需 >= 18
   pnpm --prefix skeleton/web-admin install
   ```
   - Go 未达到 1.24 请到 https://go.dev/dl 安装并重新打开终端。
   - Node 版本不足可使用 nvm/volta 切换到 18 LTS。
   - `skeleton/web-admin` 安装失败可执行 `rm -rf node_modules && pnpm install` 重新拉依赖。
3. **Feature Flag**（宿主配置）  
   - `PX_PLUGIN_DEV_MODE`：允许 Dev API 接收 `px-plugin dev`、hot reload、SSE 日志等调试流量。关闭后所有 register/reload 请求会被拒绝。  
   - `PX_PLUGIN_PUBLISH`：解锁 `px-plugin publish` 相关的计划、灰度、回滚 API；没有该 flag 就无法创建发布计划，也看不到 Marketplace 回执。  
   - `PX_PLUGIN_HUB_ENABLED`：启用 Publish Hub 侧的审计/遥测/审批链路，用于 doctor/import/host/sandbox 等后续能力。  
   - **配置位置**：运行时开关位于 `<workspace>/PowerX/backend/etc/config.yaml`（或 `etc/config.<env>.yaml`）的 `plugin_release.feature_flags` / `feature_gate` 段落。容器化部署可用环境变量 `CORE_X_PLUGIN_RELEASE_ENABLE_LOCAL_INSTALL` 等覆盖（详见 `backend/config/config.go`）。改动任一途径后都要重启宿主。

---

## 2. 初始化脚手架

> 对应 `SCN-DEV-PLUGIN-INIT-001` 的 UC-STEP-01/02。

```bash
# 默认组合（等价于显式指定）
px-plugin init com.powerx.helloworld
# = px-plugin init --backend go-gin --admin nuxt com.powerx.helloworld

# 指定管理端 + 预留应用前端（未来扩展）
px-plugin init --backend go-gin --admin nuxt --app vue com.powerx.helloworld

# 高级参数示例
px-plugin init \
  --module github.com/example/acme-plugin \
  --directory ./plugins/acme \
  --version 1.0.0 \
  --go-version 1.24 \
  --install-deps \
  --sbom-path ./reports/sbom.json \
  --publish-manifest-path ./deploy/publish.yml \
  --force \
  com.powerx.helloworld
```

- `--backend`（默认 `go-gin`）与 `--admin`（默认 `nuxt`）来自 `tools/cli/internal/templates/constants.go`，CLI 会验证输入是否在支持列表中（`px-plugin init --help` 可查看当前支持的框架）。
- `--module` 会写入 `backend/go.mod`，`--directory` 可把输出定向到自定义位置。
- `--install-deps` 会在生成后自动执行 `go mod tidy` 与 `npm install`；若未开启，请在团队仓库克隆后手动执行。
- CLI 会在 60 秒内渲染模板、写入 `plugin.yaml`、`manifest.yaml`、`publish.yml`、`reports/sbom.json`，并调用 `POST /internal/plugins/bootstrap/validate`（详见 `../Plugins/PowerXPlugin/specs/004-publish-hub-spec/spec.md#user-story-0`）。
- 团队成员克隆后仍需执行 `pnpm install && go mod tidy`（或使用 `--install-deps` 生成脚手架），记录当前 Go/Node 版本以便审计。

---

## 3. 校准 `plugin.yaml`

> 规范来源：`docs/standards/powerx-plugin/contract/plugin_yaml_spec.md`  
> 示例文件：`docs/standards/powerx-plugin/lifecycle/examples/plugin.yaml`

1. **基础元信息**  
   - `id`: `com.<org>.<domain>.<name>`，需与仓库路径一致（`plugins/com.powerx.helloworld`）。  
   - `name` / `version` / `description`: 版本遵循 SemVer；新增的 `corex_version`、`security_baseline_version`、`data_usage` 等字段应与示例一致。  
   - `metadata` 段统一维护作者、标签、类目等信息，避免在顶层重复。

2. **运行入口与前端**  
   - `runtime.entry`、`backend.entry` 均指向 `backend/bin/plugin`（或你的自定义二进制）；`health` 路径需可访问。  
   - `frontend.admin`（Nuxt/Nitro）应包含 `process.entry`、`static_dir`、`i18n`、`menus`，`assets.webAdminPath` 指向 `web-admin/.output`。  
   - 若你启用了应用前端（`--app`），请同步维护对应的 `frontend.app` 段。

3. **路由、权限与能力**  
   - `routes.basePath/adminManifest/rbac/...` 与 `manifest.yaml` 的路由保持一致。  
   - `permissions`、`rbac.resources`、`menus` 的 ID、路径、所需策略要与 `manifest.yaml` 中的 `admin.permissions/menus` 完全对齐。  
   - `agents/capabilities/tools/events/migrations/assets/checksums/signature` 等段落如在模板中生成，请逐项确认字段语义是否符合实际实现。

4. **手动校验**  
   - 使用 `diff` 或 IDE 同步对比 `plugin.yaml` 与 `manifest.yaml` 中的菜单、权限、版本号、端点。  
   - 运行 `pnpm lint` / `pnpm test`（或项目内脚本）确保模板 lint 通过。  
   - 如需更严格的一致性检查，可运行 `node docs/standards/powerx-plugin/lifecycle/examples/manifest-mapping-check.mjs <plugin-root>`（若脚本不可用，则按规范清单逐项核对）。

---

## 4. 启动本地调试（当前可行方式）

> `px-plugin dev --watch` 与 `px-plugin host start --mock` 仍在开发中，可先用宿主工程自带的调试方式。

1. **挂载插件到 PowerX**  
   ```bash
   ln -sf <workspace>/PowerX/Core/Plugins/com.powerx.helloworld \
          <workspace>/PowerX/backend/plugins/installed/com.powerx.helloworld
   ```
2. **启动 Dev API / Admin**（参考 `../PowerX/docs/guide/dev-environment.md`）：  
   ```bash
   cd <workspace>/PowerX/backend
   make dev             # 或 npm run dev，根据本地脚本决定
   ```
3. **在 Admin 中调试**  
   - 登录 `http://localhost:5173/admin`（端口以实际配置为准）。
   - 通过「插件中心 → 开发调试」加载 `com.powerx.demo`。
   - 观察 `../PowerX/backend/logs/audit.log` 与浏览器 SSE 流获知热更新结果。
4. **可选：使用 skeleton**  
   - `go run skeleton/backend/cmd/plugin` 运行后端。
   - `pnpm --prefix skeleton/web-admin dev` 打开前端，与宿主保持一致的 API 契约。

---

## 5. 遥测与审计

1. **工作流指标**  
   ```bash
   node scripts/qa/workflow-metrics.mjs \
     --scenario SCN-DEV-PLUGIN-DEBUG-001
   ```
   结果写入 `reports/_state/workflows/*.json`。
2. **CLI 审计记录**  
   - 目前仅 `init` / `package` / `dist` / `publish` 会输出日志；待 `doctor`/`dev` 子命令发布后再补全审计。
3. **常见故障**  
   | 症状 | 排查路径 |
   |------|----------|
   | 注册失败 `401` | 检查 `px auth configure` 是否写入 `~/.powerx/credentials.json` |
    | 热更新超过 2s | 查看 `../PowerX/backend/logs/audit.log` 与浏览器 SSE，通常是宿主没有启用 `PX_PLUGIN_DEV_MODE` 或热重载脚本仍在开发中 |
   | SSE 无输出 | 验证宿主是否启用了 `PX_PLUGIN_DEV_MODE`，并检查 Dev API mTLS/Feature Flag |

---

## 6. 自检步骤

- [ ] `px-plugin init` 在 60 秒内完成，并生成 manifest/publish.yml。
- [ ] `plugin.yaml` 按 `plugin_yaml_spec.md` 自检通过。
- [ ] 通过宿主/骨架方式完成至少两次代码修改并看到日志/SSE 输出。
- [ ] `scripts/qa/workflow-metrics.mjs` 中能看到最新的 SCN 指标。
- [ ] 所有示例路径均指向 `../Plugins/PowerXPlugin` 或目前仓库中的文件。
