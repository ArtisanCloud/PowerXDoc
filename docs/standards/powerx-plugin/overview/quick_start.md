
# 快速上手（Quick Start）

> 本页目标：**5–10 分钟内跑通插件后端与（可选）前端，并完成与 PowerX 的联调验证**。  
> 读者对象：插件作者 / 评估者 / 本地调试工程师。

---

## 先决条件

- **Go** ≥ 1.21（后端）
- **Postgres** ≥ 13（推荐 14/15），能创建数据库与 schema
- **Node.js** ≥ 18（仅当需要构建/预览 `web-admin` 时）
- （可选）**PowerX 宿主**：包含 Plugin Manager + Dynamic Router

---

## 一、获取代码并安装依赖

```bash
# 克隆仓库
git clone git@github.com:ArtisanCloud/PowerXPluginBase.git
cd PowerXPluginBase

# 后端依赖
cd backend
go mod tidy
cd ..
````

> 若你准备使用前端 `web-admin`，在后文“可选：前端管理端”章节再执行 Node 相关命令。

---

## 二、准备数据库（必做）

为插件准备数据库连接与**独立 schema**：

```bash
export POWERX_DB_DSN="postgres://user:pass@127.0.0.1:5432/powerx?sslmode=disable"
export POWERX_DB_SCHEMA="px_com_powerx_plugins_base"   # 建议用带前缀的 schema 名避免冲突
```

> 说明
>
> - 插件与宿主可复用同一 Postgres 实例，但**必须使用独立 schema**。
> - 后文将通过迁移自动创建表与 RLS 策略。
> - 生产建议对插件 schema 设定**最小权限**的数据库角色。

---

## 三、初始化迁移（创建表与 RLS）

方式 A：使用模板内置迁移开关（最快）

```bash
cd backend
POWERX_RUN_MIGRATE=true go run ./cmd/plugin/main.go
cd ..
```

方式 B：使用单独命令（如果你实现了独立的 migrate/seed 程序）

```bash
# 示例（按你的实际命令实现为准）
go -C backend run ./cmd/database/migrate
go -C backend run ./cmd/database/seed
```

> 迁移应完成：
>
> - 创建 `${POWERX_DB_SCHEMA}`
> - 创建示例业务表（均含 `tenant_id BIGINT NOT NULL`）
> - 启用 **Row Level Security (RLS)** 与 `app.tenant_id` 基于 `SET LOCAL` 的策略

---

## 四、启动后端服务（独立运行）

开发期可启用**受控旁路**以便单跑：

```bash
export POWERX_BIND_ADDR=":8086"
export POWERX_LOG_LEVEL="debug"
export POWERX_DEV_MODE=1   # 仅开发期启用，线上务必关闭

go -C backend run ./cmd/plugin

# 健康检查
curl :8086/healthz

# 示例业务接口（开发旁路下可不带签名，或模拟携带）
curl :8086/v1/ping
```

> 说明
>
> - 生产环境**不要**设置 `POWERX_DEV_MODE=1`。
> - 非旁路模式下，业务接口需要来自 PowerX 的上下文（HMAC/JWT）头部，用于注入 `tenant_id`、`permissions` 等。

---

## 五、与 PowerX 联调（推荐）

1. 启动 **PowerX**（包含 Plugin Manager + Dynamic Router）。
2. 将本插件目录放入（或软链到）PowerX 的 `plugins/` 目录，确保存在有效的 `plugin.yaml`。
3. PowerX 扫描并挂载反代：

   - `/_p/<plugin-id>/admin/*` → 指向 `web-admin`（若存在）
   - `/_p/<plugin-id>/api/*` → 指向插件后端（`POWERX_BIND_ADDR`）
4. 验证反代链路（假设 `plugin-id=com.powerx.plugins.base`）：

```bash
# 健康检查（通过 PowerX 反代）
curl "http://localhost:8080/_p/com.powerx.plugins.base/api/v1/ping"
```

**重要路由约定**

- 插件自身 API 必须挂在 **`/v1`** 下（例如 `/v1/ping`），
- 宿主反代统一走 **`/_p/<plugin-id>/api/**`**，不会**自动拼接** `/v1`，因此**前端请求必须带 `/v1/...`**。

---

## 六、（可选）前端管理端 web-admin

若此插件提供管理端 UI（Nuxt 4）：

**本地开发（直连后端）**

```bash
cd web-admin
npm i
npm run dev
# 根据 nuxt.config.ts，开发期通常直连 http://127.0.0.1:8086/v1
```

**构建产物供 PowerX 反代**

```bash
cd web-admin
npm run build
# 产物在 .output/，打包时由 plugin.yaml 的 assets.webAdminPath 指定
```

> 约定
>
> - 前端 `baseURL` 必须以 `/_p/<plugin-id>/admin/` 开头，以适配宿主反代。
> - 所有 API 调用使用 `/_p/<plugin-id>/api/v1/...`。

---

## 七、（可选）Docker 快速体验

```bash
# 在仓库根目录
docker build -t powerx-plugin-base:0.1.0 .

docker run --rm -p 8086:8086 \
  -e POWERX_BIND_ADDR=":8086" \
  -e POWERX_DB_DSN="postgres://user:pwd@host:5432/powerx?sslmode=disable" \
  -e POWERX_DB_SCHEMA="px_com_powerx_plugins_base" \
  -e POWERX_CTX_JWKS_URL="http://powerx/_p/_internal/jwks" \
  -e POWERX_CTX_ISSUER="powerx-auth" \
  -e POWERX_CTX_AUDIENCE="powerx-plugin" \
  powerx-plugin-base:0.1.0
```

---

## 常见问题速查（Troubleshooting）

- **端口占用**：修改 `POWERX_BIND_ADDR`。
- **schema 不存在 / 权限不足**：检查 `POWERX_DB_SCHEMA`、数据库用户权限。
- **JWT/HMAC 验签失败**：确认 `POWERX_CTX_JWKS_URL`（JWT）或 `PLUGIN_CTX_HMAC_SECRET`（HMAC）是否由宿主正确注入。
- **通过宿主访问 404**：确认**前端请求路径**包含 `/v1/...`，且反代已挂载 `/_p/<plugin-id>/api/*`。
- **跨租户数据**：检查是否开启 RLS，并确保每请求事务正确执行 `SET LOCAL app.tenant_id=?`。

---

## 下一步阅读

- 开发者：**[后端结构说明](../developer/backend.md)**
- 架构/安全：**[多租户与 RLS 机制](../developer/tenant_rls.md)**
- 协议：**[plugin.yaml 规范](../contract/plugin_yaml_spec.md)**、**[上下文签名规范](../contract/ctx_signing.md)**
- 运维：**[本地调试与联调](../deploy/local_debug.md)**、**[Docker 部署](../deploy/docker_guide.md)**
