
# 后端结构说明（Backend Architecture & Development Guide）

> 本页目标：帮助你理解 **PowerX Plugin Base 后端工程结构、执行流与开发约定**。  
> 读者对象：插件开发者 / Go 工程师。

---

## 一、后端总体概览

后端基于 **Gin + GORM + Postgres**，采用“**应用层隔离 + RLS 兜底**”的多租户设计。

插件后端是一个**独立进程**，不依赖 PowerX 内核，通过 PowerX Plugin Manager 注入上下文运行。  
它既可以单独运行，也可以通过 PowerX 的反代统一访问。

---

## 二、目录结构说明

```

backend/
├── cmd/
│   ├── plugin/                 # 插件主进程入口
│   │   └── main.go
│   └── database/               # 可选：独立迁移、种子命令
│       ├── migrate/
│       └── seed/
│
├── etc/                        # 默认配置文件样例
│   └── config.yaml
│
├── internal/
│   ├── bootstrap/              # 启动初始化（日志、DB、gRPC）
│   ├── config/                 # 配置解析（ENV + YAML）
│   ├── db/                     # 数据库连接、事务与 RLS Hook
│   ├── domain/
│   │   ├── models/             # 实体模型（含租户字段）
│   │   └── repository/         # 数据访问层（读写封装）
│   ├── grpc/
│   │   ├── client/             # PowerX gRPC Client / STS 客户端
│   │   └── server/             # 插件自定义 gRPC 服务骨架
│   ├── middleware/             # Gin 中间件（JWT/RBAC/租户上下文）
│   ├── router/                 # 路由注册与中间件装配
│   ├── services/               # 领域服务层（逻辑封装）
│   ├── shared/                 # 全局依赖容器 app.Deps
│   └── transport/http/
│       ├── admin/              # manifest/rbac 上报接口
│       ├── agent/              # STS 与 Agent 凭据交换
│       ├── middleware/         # HTTP 层守卫（JWT、租户上下文）
│       └── templates/          # 示例业务 CRUD 接口
│
└── plugin/                     # 兼容老版本的打包占位（可忽略）

````

---

## 三、启动流程（Execution Flow）

```go
func main() {
    // 1. 加载配置与环境变量
    cfg := config.Load()

    // 2. 初始化日志与数据库连接
    app := bootstrap.NewApp(cfg)

    // 3. 启动 gRPC 客户端（与 PowerX 交互）
    app.InitGRPCClient()

    // 4. 注册 Gin 路由与中间件
    router := router.New(app)

    // 5. 启动 HTTP + 可选 gRPC 服务
    app.Run(router)
}
````

**流程说明：**

1. `internal/config` 负责加载 `.yaml` 与环境变量；
2. `internal/bootstrap` 完成数据库初始化、schema 检查、RLS 预设；
3. `internal/router` 组装 Gin 中间件（JWT、RBAC、CORS、日志）；
4. `internal/transport/http` 注册业务、管理与 Agent 路由；
5. 程序监听 `POWERX_BIND_ADDR` 并等待 PowerX 反代请求。

---

## 四、应用分层（DDD 风格）

| 层级             | 职责                         | 示例                                      |
| -------------- | -------------------------- | --------------------------------------- |
| **Transport**  | 接收 HTTP/gRPC 请求，解析上下文、参数验证 | `/transport/http/admin/manifest.go`     |
| **Service**    | 领域逻辑封装，可组合多个 Repo 操作       | `/services/agent/credential_service.go` |
| **Repository** | 直接与数据库交互，隐藏 GORM 实现细节      | `/domain/repository/template_repo.go`   |
| **Model**      | 实体定义（含 `tenant_id` 与审计字段）  | `/domain/models/template.go`            |

**好处：**

* 清晰的依赖方向（Controller → Service → Repository）
* 易于测试与替换（Mock Repository）
* 可插拔式迁移到其他语言实现（例如 Rust、Go 2）

---

## 五、租户上下文与事务封装

每个请求会经过以下链路：

```text
Gin Request → TenantContext Middleware
            → BeginTenantTx (事务 + SET LOCAL)
            → Repository / GORM 操作
            → Postgres RLS 校验
```

关键点：

* `TenantContext` 从 JWT/HMAC 上下文中提取 `tenant_id`；
* 每个请求开启事务，执行 `SET LOCAL app.tenant_id=?`；
* RLS 保证即使查询未带 where 也不会跨租户；
* Dev 模式（`POWERX_DEV_MODE=1`）下允许旁路调试。

---

## 六、中间件（Middleware）

| 中间件             | 作用            | 文件                                             |
| --------------- | ------------- | ---------------------------------------------- |
| `RequestLogger` | 打印请求耗时与响应码    | `internal/middleware/logger.go`                |
| `RequestID`     | 为每个请求注入唯一 ID  | `internal/middleware/request_id.go`            |
| `JWTAuth`       | 验签 JWT 并注入上下文 | `internal/transport/http/middleware/jwt.go`    |
| `RBACGuard`     | 校验请求资源权限      | `internal/transport/http/middleware/rbac.go`   |
| `TenantContext` | 提取租户 ID 并注入事务 | `internal/transport/http/middleware/tenant.go` |

---

## 七、业务接口注册

在 `internal/router/router.go` 中统一注册：

```go
func New(app *App) *gin.Engine {
    r := gin.New()
    r.Use(app.Middlewares()...)

    v1 := r.Group("/v1")
    {
        v1.GET("/ping", templates.Ping)
        v1.GET("/templates", templates.List)
    }

    admin := r.Group("/api/v1/admin")
    {
        admin.GET("/manifest", admin.Manifest)
        admin.GET("/rbac", admin.RBAC)
    }

    return r
}
```

---

## 八、开发与运行命令

### Makefile 常用目标

| 命令             | 说明                         |
| -------------- | -------------------------- |
| `make build`   | 编译产物到 `backend/bin/plugin` |
| `make run`     | 启动插件（默认端口 8086）            |
| `make migrate` | 执行迁移逻辑                     |
| `make package` | 打包 plugin.zip（含前端）         |
| `make docker`  | 构建 Docker 镜像               |

### 本地运行（开发模式）

```bash
POWERX_DEV_MODE=1 POWERX_BIND_ADDR=":8086" go -C backend run ./cmd/plugin
curl :8086/healthz
```

---

## 九、最佳实践建议

✅ **事务一致性**
所有数据库操作应在 `BeginTenantTx` 中执行，确保租户作用域与日志追踪一致。

✅ **日志与追踪**
中间件注入 `RequestID`，建议在 `app.Deps.Logger` 中统一格式化输出。

✅ **错误处理**
返回结构建议遵循：

```json
{ "code": "ErrCode", "message": "描述信息", "details": {} }
```

✅ **测试结构**
单元测试放在 `internal/tests/` 下，支持 `make test`。

✅ **多环境配置**
优先使用环境变量覆盖 YAML，例如：

```
POWERX_DB_DSN, POWERX_LOG_LEVEL, POWERX_DEV_MODE
```

---

## 十、参考执行链路

```text
PowerX → (反代请求)
      → Gin Router
      → JWTAuth → TenantContext
      → BeginTenantTx
      → Service / Repository
      → GORM + Postgres (RLS)
      → Response
```

---

## 下一步阅读

* 🔐 [多租户与 RLS 机制](./tenant_rls.md)
* 🔌 [API 设计规范](./api_guidelines.md)
* 🤖 [Agent Hub 集成指南](./agent_integration.md)
