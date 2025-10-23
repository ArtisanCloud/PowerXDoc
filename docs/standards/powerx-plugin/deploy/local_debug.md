# 本地调试与联调指南（Local Development & Debug Guide）

> 本页目标：说明 PowerX 插件在本地开发与宿主环境联调的完整流程，  
> 包括前端热加载、后端调试、gRPC/HTTP 测试与上下文签名模拟。  
>
> 读者对象：插件开发者 / 测试工程师 / 集成开发人员。

---

## 一、开发前准备

| 工具 | 版本建议 | 用途 |
|------|-----------|------|
| Go | ≥ 1.21 | 后端编译与调试 |
| Node.js | ≥ 20 | 前端构建与热加载 |
| Postgres | ≥ 15 | 数据库 |
| Insomnia / Hoppscotch | 最新版 | HTTP API 调试 |
| grpcurl / Evans | 最新版 | gRPC 接口调试 |
| Docker (可选) | ≥ 24 | 本地容器化联调 |

---

## 二、推荐目录结构

```

powerx-plugin-base/
├── backend/
│   ├── cmd/plugin/main.go
│   ├── internal/
│   │   ├── service/
│   │   ├── repository/
│   │   └── transport/
│   └── go.mod
├── web-admin/
│   ├── app/
│   ├── pages/
│   └── nuxt.config.ts
├── plugin.yaml
├── Makefile
└── .env

````

---

## 三、后端本地运行

### 1️⃣ 启动命令

```bash
cd backend
POWERX_DEV_MODE=1 \
POWERX_PLUGIN_ID=com.powerx.plugins.base \
POWERX_DB_DSN="postgres://user:pwd@localhost:5432/powerx?sslmode=disable" \
POWERX_DB_SCHEMA=px_com_powerx_plugins_base \
go run ./cmd/plugin
````

### 2️⃣ 日志输出示例

```
[INFO] Starting plugin com.powerx.plugins.base on :8086
[DEBUG] tenant_id=1 ctx_mode=hmac
[INFO] Health check endpoint /healthz ready
```

访问：

```
curl http://localhost:8086/healthz
```

---

## 四、前端热加载运行（Nuxt 4 + Nuxt UI 3.3.2）

### 1️⃣ 安装依赖

```bash
cd web-admin
npm install
```

### 2️⃣ 启动开发模式

```bash
npm run dev
```

访问：

```
http://localhost:3000
```

### 3️⃣ 调整运行配置（nuxt.config.ts）

```ts
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || "http://localhost:8086/v1",
      pluginId: process.env.NUXT_PUBLIC_PLUGIN_ID || "com.powerx.plugins.base",
      powerxProxy: 0,
    },
  },
  modules: ["@nuxt/ui"],
})
```

---

## 五、使用 Insomnia / Hoppscotch 调试 HTTP 接口

### 1️⃣ 基础请求示例

```
GET http://localhost:8086/v1/templates
```

### 2️⃣ 模拟签名上下文（HMAC）

Header 示例：

```
X-PowerX-CTX: <base64url(payload)>.<signature>
X-PowerX-CTX-KID: com.powerx.plugins.base:v1
```

Payload 示例：

```json
{
  "tenant_id": 1,
  "user_id": 1001,
  "permissions": ["base:template:read"],
  "exp": 1735698195
}
```

可使用以下命令生成签名：

```bash
echo -n '<payload>' | openssl dgst -sha256 -hmac '<secret>' -binary | base64
```

---

## 六、gRPC 接口调试与 Reflection

### 1️⃣ 启用 Reflection（Go 示例）

```go
import "google.golang.org/grpc/reflection"

s := grpc.NewServer()
reflection.Register(s)
```

### 2️⃣ 使用 grpcurl 查看服务

```bash
grpcurl -plaintext localhost:51031 list
```

### 3️⃣ 调试示例

```bash
grpcurl -plaintext -d '{"title":"test"}' localhost:51031 base.TemplateService/Create
```

---

## 七、宿主 PowerX 联调

### 1️⃣ 启动宿主 CoreX

```bash
docker compose up powerx-core
```

宿主运行在 `http://localhost:8080`

### 2️⃣ 启动插件

```bash
POWERX_CTX_MODE=jwt \
POWERX_CTX_JWKS_URL=http://localhost:8080/_p/_internal/jwks \
POWERX_PLUGIN_ID=com.powerx.plugins.base \
POWERX_DB_SCHEMA=px_com_powerx_plugins_base \
go run ./cmd/plugin
```

### 3️⃣ 验证反代映射

宿主路由：

```
/_p/com.powerx.plugins.base/api/* → localhost:8086
```

访问：

```
curl http://localhost:8080/_p/com.powerx.plugins.base/api/v1/healthz
```

---

## 八、常见调试任务（Makefile）

| 命令              | 说明             |
| --------------- | -------------- |
| `make run`      | 启动后端（读取 .env）  |
| `make frontend` | 启动 Nuxt 开发服务器  |
| `make check`    | 执行 Lint + Test |
| `make migrate`  | 执行数据库迁移        |
| `make logs`     | 打印后端日志         |
| `make reload`   | 重启插件进程         |

---

## 九、上下文验证测试

### 1️⃣ JWT 模式测试

```bash
curl -H "X-PowerX-CTX-JWT: Bearer <jwt>" http://localhost:8086/v1/templates
```

可使用 PowerX 提供的 JWT 测试签发工具：

```bash
powerx jwt issue --tenant 1 --user 1001 --permissions base:template:read
```

### 2️⃣ HMAC 模式测试

配置：

```bash
export PLUGIN_CTX_HMAC_SECRET="base64:xxxxx"
export POWERX_CTX_MODE=hmac
```

执行：

```bash
make run
```

---

## 十、数据库调试（psql）

连接：

```bash
psql "postgres://user:pwd@localhost:5432/powerx?sslmode=disable"
```

查看插件 Schema：

```sql
\dn
SET search_path TO px_com_powerx_plugins_base;
\dt
```

---

## 十一、调试日志与追踪

| 配置                          | 含义               |
| --------------------------- | ---------------- |
| `POWERX_LOG_LEVEL=debug`    | 输出所有调试日志         |
| `POWERX_LOG_ENABLE_TRACE=1` | 打印 trace span id |
| `POWERX_DB_LOG_SQL=1`       | 打印 SQL 语句        |
| `POWERX_DEV_MODE=1`         | 跳过签名验证（仅限本地）     |

示例输出：

```
[DEBUG] [req-1a23b] user=1001 tenant=1 action=base.template.create
```

---

## 十二、调试插件注册接口

```bash
curl http://localhost:8086/api/v1/admin/manifest
curl http://localhost:8086/api/v1/admin/rbac
curl http://localhost:8086/api/v1/agent/register
```

成功返回 JSON 即代表插件注册逻辑正常。

---

## 十三、前后端联动调试

在 `web-admin/composables/usePluginBridge.ts` 中配置 API：

```ts
export const usePluginBridge = () => {
  const config = useRuntimeConfig()
  const api = $fetch.create({ baseURL: config.public.apiBase })
  return { api }
}
```

运行：

```bash
npm run dev
```

点击前端页面按钮时触发：

```
→ /v1/templates
→ 返回后端数据
```

---

## 十四、断点调试（VSCode）

`.vscode/launch.json` 示例：

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch Plugin (Go)",
      "type": "go",
      "request": "launch",
      "mode": "debug",
      "program": "${workspaceFolder}/backend/cmd/plugin"
    },
    {
      "name": "Nuxt Frontend",
      "type": "node",
      "request": "launch",
      "cwd": "${workspaceFolder}/web-admin",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"]
    }
  ]
}
```

---

## 十五、常见问题（FAQ）

| 问题              | 原因                         | 解决方案                  |
| --------------- | -------------------------- | --------------------- |
| 无法访问 `/healthz` | 端口占用                       | 修改 `POWERX_BIND_ADDR` |
| 权限校验失败          | JWT/HMAC 配置错误              | 检查签名方式与密钥             |
| 数据库表不存在         | schema 未初始化                | 执行 `make migrate`     |
| 前端无法请求后端        | `NUXT_PUBLIC_API_BASE` 未设置 | 修改 `nuxt.config.ts`   |
| Insomnia 返回 401 | Header 缺失或过期               | 重新生成签名上下文             |

---

## 十六、完整本地联调拓扑

```
[Nuxt Frontend:3000] → http://localhost:8086/v1/... → [Backend Plugin]
                                          ↘
                                           ↳ (PowerX反代) http://localhost:8080/_p/com.powerx.plugins.base/api/...
```

* `NUXT_PUBLIC_API_BASE=http://localhost:8086/v1`
* 或通过宿主 Proxy 联调：
  `NUXT_PUBLIC_API_BASE=http://localhost:8080/_p/com.powerx.plugins.base/api/v1`

---

## 十七、快速回归清单（Debug Checklist）

✅ `/healthz` 可访问
✅ `/api/v1/admin/manifest` 返回正确 JSON
✅ `/api/v1/admin/rbac` 权限结构完整
✅ 数据库 schema 初始化成功
✅ 前端 `.output` 可构建
✅ PowerX 反代转发正常
✅ HMAC/JWT 验证通过
✅ 日志中无 panic 或 500 报错

---

## 十八、总结

* 使用 `make run` 和 `npm run dev` 可快速启动后端 + 前端；
* 反代路径和上下文签名是联调关键；
* Insomnia / grpcurl 可测试接口连通性；
* 所有配置通过 `.env` 管理；
* 联调目标是确保 **manifest + rbac + agent** 均可正常注册。

---

## 十九、关联文档

| 模块        | 文档                                                               |
| --------- | ---------------------------------------------------------------- |
| 环境变量配置说明  | [env_vars.md](./env_vars.md)                                     |
| 签名上下文规范   | [../contract/ctx_signing.md](../contract/ctx_signing.md)         |
| 构建与任务说明   | [../developer/makefile_tasks.md](../developer/makefile_tasks.md) |
| 安全加固指南    | [security_hardening.md](./security_hardening.md)                 |
| Docker 部署 | [docker_guide.md](./docker_guide.md)                             |

---

## 二十、下一步阅读

* 🧩 [插件开发与架构指南](../architecture.md)
* 🧱 [多租户与 RLS 开发指引](../developer/tenant_rls.md)
