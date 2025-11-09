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
# 需要显示版本号时：
# go install -ldflags "-X main.version=v0.3.0" ./cmd/px-plugin
px-plugin --version

# 可选：同步模板与框架依赖，确保 CLI 输出与 Skeleton 一致
cd <workspace>/PowerX/Core/Plugins/PowerXPlugin
npm run sync:templates -- --check
npm run sync:templates -- --verbose
# npm --workspaces install
# go work sync
```

> `go install` 会把 `px-plugin` 安装到 `$(go env GOPATH)/bin`，请先将该路径加入 `PATH`。若更喜欢放在仓库里，可用 `go build -o <workspace>/PowerX/Core/Plugins/PowerXPlugin/bin/px-plugin ./tools/cli/cmd/px-plugin` 并把 `bin/` 目录加入 `PATH`。  
> 目前 Go CLI 只提供 `init`/`package`/`dist`/`publish`，`doctor`、`dev --watch`、`host start --mock` 仍在 004 backlog 未合入。

---

## 1. 准备环境（手动检查）

1. **同步插件仓库**  
   ```bash
   cd <workspace>/PowerX/Core/Plugins/PowerXPlugin
   git pull
   ```
2. **检测 CLI 依赖**（Node.js 18, Go 1.24+）  
   ```bash
   go version
   node -v
   pnpm --prefix skeleton/web-admin install
   ```
   - 确认 `go version` 返回 `go1.24.x`。
   - `node -v` 需 ≥ 18。
   - `pnpm install` 失败时清理 `node_modules` 后重试。
3. **Feature Flag**（宿主配置）  
   - `PX_PLUGIN_DEV_MODE`：允许 Dev API 接收 `px-plugin dev`、SSE 热更新请求。  
   - `PX_PLUGIN_PUBLISH`：解锁发布计划/灰度/回滚 API，是 `px-plugin publish` 工作的前提。  
   - `PX_PLUGIN_HUB_ENABLED`：开启 Publish Hub 的审计、审批与 doctor/import/host/sandbox 能力。  
   - **配置位置**：默认写在 `<workspace>/PowerX/backend/etc/config.yaml`（或 `etc/config.<env>.yaml`）的 `plugin_release.feature_flags` / `feature_gate` 部分；如需在容器/CI 中覆盖，可设置 `CORE_X_PLUGIN_RELEASE_ENABLE_LOCAL_INSTALL` 等环境变量（参阅 `backend/config/config.go`）。任意方式修改后都要重启宿主。

---

## 2. 初始化脚手架

> 对应 `SCN-DEV-PLUGIN-INIT-001` 的 UC-STEP-01/02。

```bash
# 默认生成（等价于显式指定 go-gin + nuxt）
px-plugin init com.powerx.helloworld

# 指定技术栈
px-plugin init --backend go-gin --admin nuxt com.powerx.helloworld

# 带应用前端（预留扩展）
px-plugin init --backend go-gin --admin nuxt --app vue com.powerx.helloworld

# 高级参数
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

- `--backend`/`--admin`/`--app` 的支持列表见 `tools/cli/internal/templates/constants.go`，CLI 会在运行时校验（可通过 `px-plugin init --help` 查看当前支持的框架）。
- `--module`/`--directory` 用于定制生成位置与 Go module，`--install-deps` 会自动执行 `go mod tidy` 与 `npm install`。
- CLI 会写入 `plugin.yaml`、`manifest.yaml`、`publish.yml`、`reports/sbom.json`，并调用 `POST /internal/plugins/bootstrap/validate` 生成审计记录（详见 spec 004）。
- 若未启用 `--install-deps`，团队成员克隆后需执行 `pnpm install && go mod tidy` 并记录运行时版本。

---

## 3. 校准 `plugin.yaml`

> 规范：`docs/standards/powerx-plugin/contract/plugin_yaml_spec.md`  
> 示例：`docs/standards/powerx-plugin/lifecycle/examples/plugin.yaml`

1. **基础字段**  
   - `id`：形如 `com.<org>.<domain>.<name>`，需与仓库路径一致。  
   - `name`、`version`、`description`、`corex_version`、`security_baseline_version`、`data_usage` 等元信息要完整并符合最新安全基线。  
   - 统一把作者、标签、分类等放在 `metadata` 段。

2. **运行入口与前端**  
   - `runtime` / `backend` 的 `entry` 指向生成的二进制，`health` 路径可被宿主探活。  
   - `frontend.admin`（以及可选的 `frontend.app`）需声明 process、静态兜底、i18n、菜单等信息；`assets.webAdminPath` 指向 `web-admin/.output`。

3. **路由与权限**  
   - `routes.*` 与 `manifest.yaml` 的路由、接口保持一致。  
   - `permissions`、`rbac.resources`、`menus` 的 ID、路径、策略必须与 `manifest.yaml` 同步。

4. **能力声明**  
   - `agents`、`capabilities`、`tools`、`events`、`migrations`、`assets`、`checksums`、`signature`、`metadata` 等段落请按模板逐项校对。

5. **手动校验**  
   - 使用 `diff` 或 IDE 比对 `plugin.yaml` 与 `manifest.yaml`（菜单、权限、版本等）。  
   - 运行 `pnpm lint` / `pnpm test`（或项目内脚本）保证 CI 能通过。  
   - 如需更严格的一致性检查，可执行 `node docs/standards/powerx-plugin/lifecycle/examples/manifest-mapping-check.mjs <plugin-root>`（若脚本不可用则按规范清单逐项核对）。

---

## 4. 启动本地调试（当前可行方式）

> `px-plugin dev --watch`、`px-plugin host start --mock` 尚未随 Go CLI 发布，可先使用宿主工程自带的调试方式。

1. 软链插件到 PowerX：`ln -sf <workspace>/PowerX/Core/Plugins/com.powerx.helloworld <workspace>/PowerX/backend/plugins/installed/com.powerx.helloworld`
2. 在 `<workspace>/PowerX/backend` 启动 Dev API / Admin（`make dev` 或仓库脚本）。
3. 在 Admin 的「插件中心 → 开发调试」加载 `com.powerx.helloworld`，观察 `../PowerX/backend/logs/audit.log`。
4. 需要完全离线时，可使用 skeleton：`go run skeleton/backend/cmd/plugin` + `pnpm --prefix skeleton/web-admin dev`。

---

## 5. 遥测与审计

1. **工作流指标**  
   ```bash
   node scripts/qa/workflow-metrics.mjs \
     --scenario SCN-DEV-PLUGIN-DEBUG-001
   ```
   结果写入 `reports/_state/workflows/*.json`。
2. **CLI 审计记录**  
   - 目前仅 `init`/`package`/`dist`/`publish` 会输出日志；待 `doctor`/`dev` 子命令发布后再补全。
3. **常见故障**  
   | 症状 | 排查路径 |
   |------|----------|
   | 注册失败 `401` | 检查 `px auth configure` 是否写入 `~/.powerx/credentials.json` |
   | 热更新超过 2s | 查看 `../PowerX/backend/logs/audit.log` 与浏览器 SSE，通常是宿主未启用 `PX_PLUGIN_DEV_MODE` 或热重载脚本仍在开发 |
   | SSE 无输出 | 验证宿主是否启用了 `PX_PLUGIN_DEV_MODE`，并查看 `../PowerX/backend/logs/audit.log` 中是否有 Dev API 事件 |

---

## 6. 自检步骤

- [ ] `px-plugin init` 在 60 秒内完成，并生成 manifest/publish.yml。
- [ ] `plugin.yaml` 按 `plugin_yaml_spec.md` 自检通过。
- [ ] 通过宿主或 skeleton 完成至少两次热更新，能在日志/SSE 中看到反馈。
- [ ] `scripts/qa/workflow-metrics.mjs` 中能看到最新的 SCN 指标。
- [ ] 所有示例路径均指向 `../Plugins/PowerXPlugin` 或目前仓库中的文件。
