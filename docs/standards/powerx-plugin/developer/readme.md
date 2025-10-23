# Developer Overview（PowerX Plugin Base）

> 这是一份面向工程实践的总览文档（工具无关）。  
> 目标：让开发者快速理解 **PowerX ↔ Plugin 的通讯边界**、**插件在系统中的职责**、以及**前后端分离结构**与协作方式。  
> 读者：后端 / 前端 / 全栈 / DevOps。

---

## 1. PowerX ↔ Plugin 的通讯关系

### 1.1 拓扑与反代路径

```markdown

+-----------------------------+

| PowerX Core                     |
| ------------------------------- |
| IAM / RBAC / STS / JWKS         |
| Plugin Manager / Agent Hub      |
| Dynamic Router (Reverse)        |
| +-------------+---------------+ |



          │  (JWT/HMAC)
          ▼



+-----------------------------+

| Plugin (Your)                   |
| ------------------------------- |
| backend/bin/plugin (Go)         |
| web-admin/.output (Nuxt)        |
| /v1/...  /api/v1/admin/...      |
| +-----------------------------+ |

```

**反代路径（宿主统一挂载）：**

- 前端管理页：`/_p/<plugin-id>/admin/*  → web-admin/.output/`
- 业务接口：`/_p/<plugin-id>/api/*    → backend : /v1/...`
- 管理接口：`/_p/<plugin-id>/api/v1/admin/{manifest|rbac}`

### 1.2 安全上下文（入站）

PowerX 调用插件时注入**签名上下文**（二选一）：

- `X-PowerX-CTX-JWT: Bearer <jwt>`（**生产推荐**，公钥校验，JWKS 轮换）
- `X-PowerX-CTX: <payload>.<sig>`（HMAC，对称密钥，适合本地开发）

上下文包含：`tenant_id, user_id, permissions, request_id, exp, iat, iss, aud`。  
插件的 **Middleware** 负责验证并注入 `TenantContext` 用于 RLS。

### 1.3 授权回流（出站）

插件访问宿主能力（如 Core API、文件、Agent Hub 注册）使用 **STS 短期凭证**：

- `POST /_p/_internal/sts/exchange` → 返回 `access_token`
- 后续请求添加：`Authorization: Bearer STS.***`（有效期 ~ 5 分钟，最小权限 Scope）

---

## 2. Plugin 的项目作用与分层职责

### 2.1 插件在生态中的定位

- 插件是 **能力提供者**：封装独立业务域（模型 / 规则 / 工具）。
- 宿主 PowerX 负责 **统一安全、路由、权限、Agent 调度、UI 壳**。
- 插件对外提供：**HTTP API**、**gRPC 服务**、（可选）**MCP 工具**，由 Agent Hub/前端使用。

### 2.2 后端分层（薄 Handler，重 Service）

```

internal/
├── domain/
│   └── models/template/          # GORM 实体（DB & Domain）
├── domain/repository/template/   # Repository 接口与实现（事务、RLS）
├── services/template/            # Service（幂等、审计、错误分层）
├── transport/
│   ├── http/templates/           # HTTP 路由 & Handler（薄）
│   └── grpc/server/template/     # gRPC Service（薄）
└── grpc
│   ├── client
│   │   └── clientset/          # 统一建链/拦截器/STS，聚合各模块客户端
│   │   │   └── clientset.go
│   │   ├── common/             # 连接、拦截器、动态反射工具（可选兜底）
│   │   │   ├── conn.go
│   │   │   └── interceptors.go
│   │   ├── iam/                # 示例：IAM 模块（强类型 SDK）
│   │   │   └── iam.go
│   │   ├── files/              # 示例：文件模块（强类型 SDK）
│   │   │   └── files.go
│   │   ├── sts/                # 你已经有的 STS TokenManager（保留）
│   │   │   └── sts.go
│   │   └── reflect/            # 反射动态调用（仅作兜底/调试）
│   │       └── reflect.go
└── ├── server
        └── server.go           # 仅当你要对外提供服务时才需要注册

```

**职责边界：**

- **Model**：实体定义（同时约束 DB 结构与领域属性）。
- **Repository**：数据访问（携带上下文 / 事务 / RLS）。  
- **Service**：唯一的业务编排层（幂等、防重、审计、错误码）。  
- **Handler（HTTP/gRPC）**：只做协议适配（参数校验、RBAC、调用 Service、组装响应）。  
  > 同一业务只在 Service 实现一次，HTTP/gRPC 共同复用。

**错误分层建议：**

- 系统：`1xxxx`（数据库、网络、未知）
- 业务：`2xxxx`（校验、状态非法、资源冲突）
- 权限：`4xxxx`（未授权、无权限、签名失败）

---

## 3. 前后端分离的结构与协作

### 3.1 目录与运行模式

```

web-admin/  (Nuxt 4 + Nuxt UI 3.3.2)
├── app/ (pages/layouts/components/plugins/stores/...)
├── i18n/
├── public/
└── nuxt.config.ts

````

**运行模式：**

- **本地开发**：`/` → 直连 `http://127.0.0.1:8086/v1`
- **宿主反代**：`/_p/<plugin-id>/admin/` → API 前缀 `/_p/<plugin-id>/api/v1`

在 `nuxt.config.ts` 里通过 `runtimeConfig.public.apiBaseUrl` 动态切换。

### 3.2 前后端约定

- **API 前缀**：`/v1`（业务） / `/api/v1/admin`（宿主管理） / `/api/v1/agent`（Agent）
- **响应统一格式**：

  ```json
  { "code": 0, "message": "ok", "data": { ... } }

````

* **分页**：

  * 请求：`?page=1&page_size=20`
  * 响应：`{ "items": [...], "total": 135, "page": 1, "page_size": 20 }`
* **错误响应**：

  ```json
  { "code": 40001, "message": "permission denied", "details": { "resource": "...", "action": "..." } }
  ```

* **权限**：前端仅做**展示控制**（隐藏禁用），真正鉴权在后端（RBAC Guard）。

### 3.3 与 Agent Hub 协作（可选）

* 在 `plugin.yaml` 或启动注册中声明 **Agent / Tool / Workflow**。
* 前端可直接嵌入平台提供的 `<AgentWidget agent-id="..."/>`，由宿主管理对话与工具调用。

---

## 4. 以「Template」为例的最小闭环

### 4.1 模型（Domain & DB）

```go
// internal/domain/models/template/template.go
type Template struct {
  models.BaseModel
  Name        string `gorm:"type:varchar(255);not null;comment:模板名称" json:"name"`
  Description string `gorm:"type:text;comment:模板描述" json:"description"`
  Content     string `gorm:"type:text;comment:模板内容" json:"content"`
}
func (t *Template) TableName() string { return models.S(models.TableTemplate) }
```

### 4.2 对外 API（HTTP）

* `GET    /v1/templates`（分页/筛选）
* `GET    /v1/templates/:id`
* `POST   /v1/templates`
* `PUT    /v1/templates/:id`
* `DELETE /v1/templates/:id`

> Handler 仅负责：参数校验 → RBACGuard(`base:template`) → 调用 `TemplateService`。

### 4.3 gRPC（可选）

* `TemplateService` 提供 `Create/Update/Delete/Get/List`
* 与 HTTP 共享相同 Service，实现 1 份业务逻辑，多协议复用。

---

## 5. 运行、打包与部署（一句话指南）

* **本地开发**

  * 后端：`POWERX_DEV_MODE=1 go run ./backend/cmd/plugin`
  * 前端：`npm run dev`（默认直连 `:8086/v1`）
* **发布打包**

  * `make release && make package-release` → `target/<ver>/*.zip`
* **Docker**

  * `docker build -t <image:ver> -f backend/Dockerfile .`
  * 宿主通过内部网络反代 `/_p/<plugin-id>/*` 到插件容器 `:8086`

---

## 6. 你需要记住的三个“关键边界”

1. **通讯边界**：

   * 入站：PowerX → Plugin（JWT/HMAC 上下文，反代）
   * 出站：Plugin → PowerX（STS 临时凭据）

2. **职责边界**：

   * Handler 做协议（薄），**Service 承担业务（重）**，Repo 负责数据与 RLS。

3. **前后端边界**：

   * 前端只拿统一 JSON，权限仅做可见性与交互约束；
   * 所有安全判断在后端（JWT/RBAC/RLS）。

---

## 7. 关联阅读（选看）

* `docs/contract/ctx_signing.md`（上下文签名：JWT/HMAC）
* `docs/contract/powerx_integration.md`（宿主交互协议）
* `docs/developer/frontend.md`（Nuxt 前端结构）
* `docs/developer/makefile_tasks.md`（构建与打包任务）
* `docs/deploy/local_debug.md`（本地联调）
