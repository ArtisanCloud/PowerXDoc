# 插件本地初始化指南

- **覆盖场景**: `SCN-DEV-PLUGIN-INIT-001`
- **配套文档**: `../PowerXPlugin/docs/guides/develop/framework-release.md`（框架版本同步）、`../PowerXPlugin/docs/guides/develop/standalone-mode.md`（Skeleton 独立运行观测）、`../PowerXPlugin/docs/guides/develop/cli-plugin-tutorial.md`（CLI 插件初始化）
- **读者角色**: 插件开发者、Demo 维护者、交付项目负责人

目标：在 PowerX 宿主接入之前，先在本地把脚手架、Skeleton Admin 与基础依赖跑起来，让团队成员都能看到可操作的 UI。

---

## 0. 运行模式速览

| 目标 | 推荐路径 | 参考文档 |
|------|----------|----------|
| 初始化真实插件工程，生成 `plugin.yaml`/`manifest.yaml` 并进入日常开发 | `px-plugin init`（CLI 插件教程主线） | `../PowerXPlugin/docs/guides/develop/cli-plugin-tutorial.md` |
| 仅需快速观察官方 Skeleton 的默认实现、验证 UI/接口 | Skeleton Standalone（辅助模式） | `../PowerXPlugin/docs/guides/develop/standalone-mode.md` |

主线步骤（章节 1→6）全部围绕 CLI 生成的插件展开；Standalone 只是一份附录，你可随时跳阅，用于对照模板或 Demo。

---

## 1. 同步模板与 CLI 版本

> 详细背景可参考 `PowerXPlugin/docs/guides/develop/framework-release.md`。

```bash
# 在 PowerXPlugin 仓库根目录同步模板
cd <workspace>/PowerX/Core/Plugins/PowerXPlugin
npm run sync:templates -- --check
npm run sync:templates -- --verbose
# npm --workspaces install   # 需要联调 framework-admin / client 时启用
# go work sync               # 需要刷新 framework/ 模块引用时启用

# 再构建或更新 px-plugin CLI
cd <workspace>/PowerX/Core/Plugins/PowerXPlugin/tools/cli
go install ./cmd/px-plugin
# 若需指定版本号：
# go install -ldflags "-X main.version=v0.3.0" ./cmd/px-plugin
px-plugin --version
```

> `go install` 会把二进制写入 `$(go env GOPATH)/bin`。如果希望固定到仓库，可运行 `go build -o <workspace>/PowerX/Core/Plugins/PowerXPlugin/bin/px-plugin ./tools/cli/cmd/px-plugin` 并把 `bin/` 目录加入 `PATH`。

---

## 2. 准备运行环境

1. **同步插件仓库**
   ```bash
   cd <workspace>/PowerX/Core/Plugins/PowerXPlugin
   git pull
   ```
2. **校验依赖版本**（Node.js 18、Go 1.24+）
   ```bash
   go version      # 需返回 go1.24.x
   node -v         # 需 >= 18
   npm --prefix skeleton/web-admin install
   ```
   - Go 版本不足请到 https://go.dev/dl 安装后重开终端。
   - Node 版本不足可使用 nvm/volta 切换到 18 LTS。
   - `skeleton/web-admin` 安装失败时执行 `rm -rf node_modules && npm install` 重新拉依赖。
3. **本地配置与 Feature Flag**
   - `px-plugin` 侧只需要读取模板与示例；宿主运行时才需要 `PX_PLUGIN_DEV_MODE`、`PX_PLUGIN_PUBLISH` 等 Flag。
   - 如果计划在宿主仓库跑 Demo，请提前在 `<workspace>/PowerX/backend/etc/config.yaml`（或 `etc/config.<env>.yaml`）设置 `plugin_release.feature_flags`，并准备 `~/.powerx/credentials.json`。

---

## 3. 初始化脚手架（CLI 插件模式）

> 下列命令与 `../PowerXPlugin/docs/guides/develop/cli-plugin-tutorial.md` 完整一致；如需更细的参数讲解和目录截图，可回到该教程查阅。

```bash
# 默认组合（等价于显式指定 go-gin + nuxt）
px-plugin init com.powerx.helloworld

# 指定技术栈 / 应用前端
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

- 支持的 `--backend`、`--admin`、`--app` 组合可通过 `px-plugin init --help` 查看（定义在 `tools/cli/internal/templates/constants.go`）。
- `--module`/`--directory` 用于自定义 Go module 与输出路径；`--install-deps` 会在生成后自动执行 `go mod tidy` 与 `npm install`。
- CLI 会在 60 秒内渲染模板、写入 `plugin.yaml`/`manifest.yaml`/`publish.yml`/`reports/sbom.json`，并调用 `POST /internal/plugins/bootstrap/validate` 生成审计记录。
- 团队成员克隆后仍需执行 `npm install && go mod tidy`，同时记录当前 Go/Node 版本供审计留档。

---

## 4. 启动 CLI 生成的插件（开发模式）

> 该章节对应 `cli-plugin-tutorial` 的 Step 4-7，省略了截图与扩展说明。默认假设你的插件输出目录为 `<workspace>/plugins/com.powerx.helloworld`，请根据实际路径替换。

1. **安装后端与前端依赖**
   ```bash
   export PLUGIN_ROOT=<path-to-your-plugin>
   cd $PLUGIN_ROOT/backend
   go mod tidy

   cd $PLUGIN_ROOT/web-admin
   npm install
   ```
   - 如需引用本地 `framework/` 源码，可在 `backend/go.mod` 中添加 `replace github.com/ArtisanCloud/PowerXPlugin/framework => <path>/PowerXPlugin/framework`，再执行一次 `go mod tidy`。
   - 前端默认使用已发布的 `@artisan-cloud/plugin-framework-*` 版本。若需要连到 monorepo 源码，请在运行 `px-plugin init` 前设置 `POWERXPLUGIN_USE_LOCAL_FRONTEND=1` 并重新安装依赖。
2. **准备数据库与配置**
   ```bash
   cd $PLUGIN_ROOT/backend
   cp etc/config.example.yaml etc/config.yaml   # 如尚未创建
   go run ./cmd/database/main.go setup          # 或 migrate / seed
   ```
   - 默认 DSN 为内存 SQLite；若希望落地文件或接入 Postgres，请修改 `etc/config.yaml` 后重新执行 `migrate`。
3. **启动插件后端**
   ```bash
   cd $PLUGIN_ROOT/backend
   go run ./cmd/plugin
   ```
   - 默认监听 `http://127.0.0.1:8087`，可通过 `PORT` 或 `POWERX_LISTEN` 覆盖。
   - `curl http://127.0.0.1:8087/healthz` 验证服务是否就绪。
4. **启动插件管理端**
   ```bash
   cd $PLUGIN_ROOT/web-admin
   npm run dev
   ```
   - 默认端口 `3031`。访问 `http://localhost:3031/_p/<plugin-id>/admin/` 即可看到 Starter UI。
   - 若端口冲突，可 `npm run dev -- --port 3033 --hmr-port 24733`。
5. **下一步**
   - 该运行模式用于日常开发、联调或配合 `px-plugin dev --watch` 完成本地热更新。完成上述步骤后，可转到 [插件本地调试实践](./local-dev-debug.md) 掌握宿主挂载、SSE 排错流程。

---

## 5. 校准 `plugin.yaml`

> 规范来源：`docs/standards/powerx-plugin/contract/plugin_yaml_spec.md`；示例位于 `docs/standards/powerx-plugin/lifecycle/examples/plugin.yaml`。

1. **基础元信息**
   - `id` 使用 `com.<org>.<domain>.<name>` 格式，并和仓库路径一致。
   - `name`、`version`、`description`、`corex_version`、`security_baseline_version`、`data_usage` 等字段需完整。
   - 作者、标签、类目统一放在 `metadata`。
2. **运行入口与前端**
   - `runtime/backend` 的 `entry` 指向可执行文件，`health` 路径需可访问。
   - `frontend.admin`（以及可选的 `frontend.app`）要声明 process、静态目录、i18n、菜单等；`assets.webAdminPath` 指向 `web-admin/.output`。
3. **路由与权限**
   - `routes.*` 与 `manifest.yaml` 一致。
   - `permissions`、`rbac.resources`、`menus` 的 ID / 路径 / 策略需与 `manifest.yaml` 对齐。
4. **能力声明**
   - `agents`、`capabilities`、`tools`、`events`、`migrations`、`assets`、`checksums`、`signature` 等段落请逐项校对。

---

## 6. 自检清单

- [ ] `npm run sync:templates -- --check` 无漂移，或 `--verbose` 已写入最新模板。
- [ ] `px-plugin --version` 返回预期版本，脚手架能在 60 秒内生成。
- [ ] CLI 生成的插件后端（`go run ./cmd/plugin`）与 `web-admin` 均可在本地启动，健康检查/页面可访问。
- [ ] 新仓库执行 `npm install && go mod tidy`、`npm run dev` 均成功。
- [ ] `plugin.yaml` / `manifest.yaml` 差异已对齐，准备好进入 [离线发布与导入](./offline-publish.md) 或 [本地调试](./local-dev-debug.md)。

完成上述步骤后，就可以根据交付需求继续阅读下一篇指南：若要在隔离环境演示或快速验证 `.pxp` 流程，直接进入 [离线发布与导入](./offline-publish.md)；若需要连接真实宿主/租户，则转到 [插件本地调试实践](./local-dev-debug.md)。

---

## 附录 · Skeleton Standalone（可选）

> 该模式仅用于快速查看官方 Skeleton 的默认页面与 API，不会写入你的业务代码。完整说明请参考 `PowerXPlugin/docs/guides/develop/standalone-mode.md`。

1. **准备配置与数据库**
   ```bash
   cd <workspace>/PowerX/Core/Plugins/PowerXPlugin/skeleton/backend
   cp etc/config.example.yaml etc/config.yaml
   go run ./cmd/database/main.go setup   # 运行 migrate + seed
   ```
   - 默认 DSN 指向 `skeleton/.cache/powerxplugin.db`，必要时通过 `CONFIG_PATH` 或 `POWERX_DB_DSN` 覆盖。
   - 也可以设置 `POWERX_RUN_MIGRATE=true` 让服务启动时自动 migrate。
2. **启动后端**
   ```bash
   go run ./cmd/plugin
   # HTTP 默认为 8087，可通过 PORT 覆盖；gRPC 默认为 8079。
   curl http://127.0.0.1:8087/healthz   # 健康检查
   ```
3. **启动管理端**
   ```bash
   cd ../web-admin
   npm install          # 首次运行
   npm run dev
   ```
   - 默认端口 3031，发生冲突时会自动寻找空闲端口。
   - 如需替换 Logo，可覆盖 `app/assets/images/logo-s.svg` 或修改 `app/components/AppNavbar.vue` 中的 `logoMark` 引用；主题样式仍可在 `app/` 目录中自定义。
4. **观察示例或对比模板**
   - Standalone 目录下的代码与 CLI 模板保持一致，可用于对照或演示。
   - 若要转入真实开发，请回到章节 3-6，使用 `px-plugin init` 生成你自己的插件仓库。
