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
px-plugin init com.powerx.demo \
  --template react-dashboard \
  --org artisan \
  --lang go-nuxt \
  --enable-license-scan
```

- CLI 会在 60 秒内生成目录并写入 `plugin.yaml`, `manifest.yaml`, `publish.yml`。
- 执行完成后自动触发 `POST /internal/plugins/bootstrap/validate`（详见 `../Plugins/PowerXPlugin/specs/004-publish-hub-spec/spec.md#user-story-0`）。
- 团队成员克隆后请执行 `pnpm install && go mod tidy`，并记录本机 Go/Node 版本，等待 `px-plugin doctor` 合入后再改用 CLI 健康检查。

---

## 3. 校准 plugin.yaml

1. 打开 `plugin.yaml` 并确认以下字段：
   - `id` 与 Git 仓库路径一致（推荐命名：`com.<org>.<domain>.<name>`）。
   - `version` 遵循 semver，首个版本建议 `0.1.0`。
   - `backend.entry` 指向 `backend/bin/<binary>`。
   - `assets.webAdminPath`（如果有前端）指向 `web-admin/.output`。
2. 如果需要示例，请参考 `docs/standards/powerx-plugin/lifecycle/examples/plugin.yaml`。
3. 手动校验：
   - 对照 `docs/standards/powerx-plugin/contract/plugin_yaml_spec.md`。
   - 用 IDE/`diff` 核对 `plugin.yaml` 与 `manifest.yaml` 的菜单、权限、版本号。
   - 运行 `pnpm lint` 或项目内的 lint/test，确保 CI 能通过。

---

## 4. 启动本地调试（当前可行方式）

> `px-plugin dev --watch`、`px-plugin host start --mock` 尚未随 Go CLI 发布，可先使用宿主工程自带的调试方式。

1. 软链插件到 PowerX：`ln -sf <workspace>/PowerX/Core/Plugins/com.powerx.demo <workspace>/PowerX/backend/plugins/installed/com.powerx.demo`
2. 在 `<workspace>/PowerX/backend` 启动 Dev API / Admin（`make dev` 或仓库脚本）。
3. 在 Admin 的「插件中心 → 开发调试」加载插件，观察 `../PowerX/backend/logs/audit.log`。
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
