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
px-plugin init com.powerx.demo \
  --template react-dashboard \
  --org artisan \
  --lang go-nuxt \
  --enable-license-scan
```

- CLI 会在 60 秒内生成目录并写入 `plugin.yaml`, `manifest.yaml`, `publish.yml`。
- 执行完成后自动触发 `POST /internal/plugins/bootstrap/validate`（详见 `../Plugins/PowerXPlugin/specs/004-publish-hub-spec/spec.md#user-story-0`）。
- 团队成员克隆后请立即执行 `pnpm install && go mod tidy`，并手动记录当前 Go/Node 版本，待 `px-plugin doctor` 合入后再改用 CLI 健康检查。

---

## 3. 校准 plugin.yaml

1. 打开 `plugin.yaml` 并确认以下字段：
   - `id` 与 Git 仓库路径一致（推荐命名：`com.<org>.<domain>.<name>`）。
   - `version` 遵循 semver，首个版本建议 `0.1.0`。
   - `backend.entry` 指向 `backend/bin/<binary>`。
   - `assets.webAdminPath`（如果有前端）指向 `web-admin/.output`。
2. 如果需要示例，请参考 `docs/standards/powerx-plugin/lifecycle/examples/plugin.yaml`。
3. 手动校验元数据：
   - 对照 `docs/standards/powerx-plugin/contract/plugin_yaml_spec.md` 确认必填字段。
   - 使用 `diff` 或 IDE 对比 `manifest.yaml` 与 `plugin.yaml` 中的 `menus`/`permissions` 是否一致。
   - 执行 `pnpm lint`（或项目内 lint/test 脚本）确保 CI 规则通过。
   - 需要更严格检查时可运行 `node docs/standards/powerx-plugin/lifecycle/examples/manifest-mapping-check.mjs <plugin-root>`（如无脚本则按文档清单逐项核对）。

---

## 4. 启动本地调试（当前可行方式）

> `px-plugin dev --watch` 与 `px-plugin host start --mock` 仍在开发中，可先用宿主工程自带的调试方式。

1. **挂载插件到 PowerX**  
   ```bash
   ln -sf <workspace>/PowerX/Core/Plugins/com.powerx.demo \
          <workspace>/PowerX/backend/plugins/installed/com.powerx.demo
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
