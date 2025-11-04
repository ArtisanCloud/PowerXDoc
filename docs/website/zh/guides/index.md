# 使用与部署指南

本章节汇总 PowerX 的落地流程：从本地快速体验、到部署上线、再到插件生态与二次开发。按照下面的“快速开始”完成环境搭建后，可继续阅读部署、配置与运维篇章获取更深入的操作指引。

## 快速开始 {#quickstart}

> 目标：30 分钟内在本地启动 PowerX Core 与 PowerX Admin，并通过后台安装/启用示例插件。

### 步骤 0：环境要求

- **操作系统**：macOS / Linux / WSL2
- **工具链**：Go ≥ 1.22、Node.js ≥ 20（推荐 `npm`/`pnpm`）、Git、Make
- **基础服务**：PostgreSQL ≥ 14、Redis ≥ 6（可使用 Docker 快速拉起）
- **可选**：MinIO 或其他对象存储（若使用文件上传）

快速拉起依赖（示例，仅供开发环境）：

```bash
docker run -d --name powerx-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=powerx \
  -p 5432:5432 postgres:15

docker run -d --name powerx-redis -p 6379:6379 redis:7
```

### 步骤 1：获取 PowerX 源码

```bash
git clone https://github.com/ArtisanCloud/PowerX.git
cd PowerX/backend
```

仓库下同时包含：

- `backend/`：Go 编写的 PowerX Core（内核、插件管理器、API）
- `web-admin/`：Nuxt 4 构建的 PowerX Admin 控制台
- `plugins/installed/`：示例插件（如 `com.powerx.plugins.base`）

### 步骤 2：初始化配置

PowerX 默认读取 `backend/etc/config.yaml`。首次使用可直接复制示例并按需调整：

```bash
cp etc/config_example.yaml etc/config.yaml
```

关键项说明：

- `database`: 设置 `host/port/username/password/database`（或直接填 `dsn`）
- `cache`: Redis 连接信息
- `plugin.installed_dir`: 插件安装目录（保持默认即可）
- `storage`: 若暂不接入对象存储，可保持 `default_driver: local`

> 生产环境务必替换 `server.secret_key`、`auth.jwt_secret` 等敏感字段。

### 步骤 3：创建并迁移数据库

在 `backend/` 目录执行（根据上一节的数据库账号调整环境变量）：

```bash
export PGHOST=127.0.0.1
export PGUSER=postgres
export PGPASSWORD=postgres
export PGDATABASE=powerx

make db-create        # 若数据库尚未创建
make db-migrate       # 执行核心表结构迁移
make db-seed          # 写入 root 账号、权限、示例数据
```

完成后日志会提示 root 账户信息（默认用户名/密码均为 `root`，可通过 `POWERX_ROOT_PASSWORD` 覆盖）。

### 步骤 4：启动 PowerX Core

```bash
LOG_LEVEL=debug go run ./cmd/app/main.go
```

成功后可通过以下命令验证：

```bash
curl http://localhost:8077/api/v1/health
# {"status":"ok"}
```

控制台会监听：

- REST API：`http://localhost:8077/api/v1/**`
- WebSocket：`ws://localhost:8077/ws`
- 最小 OpenAPI：`http://localhost:8077/openapi.min.json`

保持该进程运行（建议使用 `tmux`/`screen` 或后台任务）。

### 步骤 5：启动 PowerX Admin

另开一个终端窗口：

```bash
cd ../web-admin
cp .env.example .env.local           # 或根据需要创建 .env
npm install                          # 或 pnpm install
npm run dev -- --port 3030
```

默认代理至 `http://127.0.0.1:8077/api`，如需修改可在 `.env.local` 中调整 `UPSTREAM` / `WS_UPSTREAM`。

浏览器访问 `http://localhost:3030/`，使用数据库种子生成的 root 账号登录：

- 用户名：`root`
- 密码：`root`（若设置了 `POWERX_ROOT_PASSWORD`，以实际值为准）

### 步骤 6：浏览示例插件

快速验证插件生态链路：

1. 登录 PowerX Admin → **插件市场**
2. 你将看到已经随仓库放置的 `Base template Plugin`（ID: `com.powerx.plugins.base`）
3. 如需重新安装，可在 `PowerX/backend/plugins/installed/com.powerx.plugins.base/` 下执行：

   ```bash
   # 以 0.1.0 版本为例
   cd ../../plugins/installed/com.powerx.plugins.base/0.1.0
   go run ./backend/cmd/plugin/main.go   # 单独验证插件 API
   ```

4. 在 Admin 中启用后，访问 `/_p/com.powerx.plugins.base/admin/`（Admin 会自动拼接链接）即可进入插件的前端界面。

至此，本地体验环境搭建完毕。若需要开发自定义插件，可参考《插件 SDK 指南》；若要继续部署到测试/生产环境，请阅读下方的部署与运维章节。

---

## 部署指南 {#deployment}

- **运行模式选择**
  - 单体（PoC / 开发）：直接运行 `go run ./cmd/app/main.go`，Redis+Postgres 使用容器即可。
  - Compose/K8s：将 Core、Admin、依赖组件拆分为独立服务，结合现有镜像或扩展 Makefile 中的 `docker-*` 任务。
  - 云托管：复用 `etc/config.yaml` 中的远程 Redis / RDS / 对象存储配置。
- **必备操作**
  - 生成强随机的 `server.secret_key`、`auth.jwt_secret`；对外暴露端口务必配合 HTTPS 与反向代理。
  - 使用 `make db-migrate` / `make db-seed` 在部署流水线中执行 schema 与初始数据更新。
  - 将 `plugins/installed` 与 `plugins/registry.json` 挂载到持久卷，避免升级时丢失插件安装状态。
- **参考文档**
  - 《Docker 化与生产部署指南》：Nuxt Admin 的镜像与探针实践。
  - 《运行时配置规范》：各环境变量与 YAML 字段的含义及默认值。

## 配置与集成 {#configuration}

- **身份认证与租户**
  - 通过 Admin 的【系统设置 → 组织与租户】创建租户、成员、角色；配合 `make permgen.*` 自动同步 API 权限表。
  - 外部登录集成可参考《IAM / SSO 集成指南》，通过 JWT 或 OIDC 与企业 IdP 对接。
- **插件生态**
  - 将插件目录放入 `backend/plugins/installed/<plugin-id>/<version>` 并更新 `plugins/registry.json`，宿主会在启动时扫描并挂载反向代理。
  - 插件运行时与 Admin 菜单注册规范详见《PowerX Plugin Manifest》。
- **对象存储与媒体**
  - 如需上传文件，可启用 `storage.s3` 配置并在 MinIO/S3 上创建 `powerx-media` 桶；Admin 的媒体中心即会使用该存储。

## 运维 FAQ {#ops-faq}

- **服务无法启动 / 配置报错**  
  查看 `backend/logs` 或控制台输出，常见原因是数据库尚未创建、Redis 未就绪或 YAML 配置缺失。

- **插件安装后看不到菜单**  
  检查 `registry.json` 是否写对版本、`plugin.yaml` 中的 `frontend.admin.menus` 是否声明菜单，以及 Admin 是否缓存（可在 Admin → 插件管理中点击“刷新菜单”）。

- **API 鉴权失败 / 401**  
  确认调用方使用 Admin 登录返回的 `access_token`，并检查 `auth.audience_*`、`auth.jwt_secret` 是否在 Core 与前端保持一致。

- **如何升级 PowerX**  
  先拉取代码并执行 `make db-migrate`，验证 Admin / 插件菜单正常后再切换生产流量；旧版本插件可通过 Admin 的灰度/回滚面板进行切换。

更多实践、脚本与 SOP，请继续浏览本章节下的其他文章，或前往《开发与扩展》获取二次开发资料。
