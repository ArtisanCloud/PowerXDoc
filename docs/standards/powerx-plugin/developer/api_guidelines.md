# API 设计规范（HTTP & gRPC Guidelines）

> 本页目标：说明 **PowerX 插件后端 API 的统一设计规范**，  
> 包括命名、路径、权限验证、分页格式与错误结构。  
> 读者对象：插件后端开发者 / 接口设计者 / QA 测试人员。

---

## 一、接口分层

PowerX 插件的接口分为三类：

| 类型 | 说明 | 典型路径 |
|------|------|----------|
| **业务接口** | 面向业务实体（CRUD、查询） | `/v1/...` |
| **管理接口** | 供宿主 PowerX 调用，返回 manifest/rbac 信息 | `/api/v1/admin/...` |
| **Agent 接口** | Agent Hub 与插件交互，用于注册或工具调用 | `/api/v1/agent/...` |

所有接口都必须在 `router.go` 中显式注册。

---

## 二、路由命名规范

| 分类 | 路径前缀 | 示例 |
|------|-----------|------|
| 插件 API 主入口 | `/v1` | `/v1/templates` |
| 管理接口 | `/api/v1/admin` | `/api/v1/admin/manifest` |
| Agent 接口 | `/api/v1/agent` | `/api/v1/agent/exchange` |

> ⚠️ 注意：  
> PowerX 反代路径为 `/_p/<plugin-id>/api/*`，  
> 它不会自动拼接 `/v1`，因此前端请求必须带 `/v1/...`。

---

## 三、HTTP 响应规范

### 1️⃣ 成功响应格式

统一返回 JSON 对象：

```json
{
  "code": 0,
  "message": "ok",
  "data": { "items": [...], "total": 32 }
}
````

| 字段        | 类型     | 说明                 |
| --------- | ------ | ------------------ |
| `code`    | int    | 0 表示成功，非 0 表示业务错误码 |
| `message` | string | 文本说明               |
| `data`    | any    | 实际数据内容             |

### 2️⃣ 分页约定

请求参数：

```
GET /v1/templates?page=1&page_size=20
```

响应格式：

```json
{
  "code": 0,
  "data": {
    "items": [...],
    "total": 135,
    "page": 1,
    "page_size": 20
  }
}
```

### 3️⃣ 错误响应格式

```json
{
  "code": 40001,
  "message": "permission denied",
  "details": { "resource": "base:template", "action": "update" }
}
```

> **建议错误码区间**
>
> * 10000–19999：系统错误（数据库、网络）
> * 20000–29999：业务逻辑错误
> * 40000–49999：权限或签名错误

---

## 四、权限校验（RBAC Guard）

插件中间件 `RBACGuard` 会根据上下文中的权限数组进行判断。

示例（伪代码）：

```go
func RBACGuard(resource, action string) gin.HandlerFunc {
    return func(c *gin.Context) {
        perms := GetPermissions(c)
        if !perms.Contains(resource, action) {
            c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
                "code": 40001,
                "message": "permission denied",
                "details": map[string]string{"resource": resource, "action": action},
            })
            return
        }
        c.Next()
    }
}
```

> 插件无需自行维护角色与权限配置，
> 由 PowerX Settings 页面统一管理并通过上下文回传。

---

## 五、示例接口（CRUD）

以 `template` 实体为例：

```go
// GET /v1/templates
func ListTemplates(c *gin.Context) {
    var req PaginationReq
    if err := c.ShouldBindQuery(&req); err != nil {
        c.JSON(400, Error("invalid parameters"))
        return
    }

    items, total, _ := repo.List(req.Page, req.PageSize)
    c.JSON(200, Ok(Pagination(items, total, req)))
}

// POST /v1/templates
func CreateTemplate(c *gin.Context) {
    var input CreateTemplateReq
    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(400, Error("invalid body"))
        return
    }

    if err := service.Create(&input); err != nil {
        c.JSON(500, Error(err.Error()))
        return
    }

    c.JSON(200, Ok(nil))
}
```

---

## 六、gRPC 接口规范（可选）

如果插件需要与 PowerX 或 Agent Hub 通过 gRPC 通信：

| 位置                      | 职责                             |
| ----------------------- | ------------------------------ |
| `internal/grpc/server/` | 定义插件自有的 gRPC 服务                |
| `internal/grpc/client/` | 调用 PowerX 上游接口（如 STS、Agent 注册） |

建议约定：

* 所有 gRPC 服务以 `com.powerx.plugins.<id>.v1` 为命名空间；
* 使用 protobuf3；
* 包含 `tenant_id` 与 `request_id` 字段；
* 错误使用标准 `google.rpc.Status`。

---

## 七、上下文 Header 规范

| Header             | 说明           | 示例                               |
| ------------------ | ------------ | -------------------------------- |
| `X-PowerX-CTX`     | HMAC 模式签名    | `base64(hmac(payload))`          |
| `X-PowerX-CTX-JWT` | JWT 模式签名     | `Bearer eyJhbGciOiJSUzI1NiIs...` |
| `X-Request-ID`     | 请求唯一标识       | 自动生成                             |
| `X-Tenant-ID`      | （仅开发模式）显式传租户 | `1`                              |

---

## 八、日志与追踪要求

* 日志必须包含 `request_id`、`tenant_id`；
* 建议打印：方法、路径、耗时、状态码；
* 长耗时请求 (>500ms) 应标记为 `slow request`；
* 出错时应打印堆栈并返回结构化 JSON。

---

## 九、版本与兼容性

* 主版本（v1、v2）通过路径区分：`/v1/...`；
* 小版本通过 `plugin.yaml.version` 管理；
* 向后兼容原则：

  * 不移除字段；
  * 新增字段必须为可选；
  * 保留老路径至少一个小版本周期。

---

## 十、示例目录参考

```
internal/
└── transport/http/
    ├── templates/
    │   ├── routes.go
    │   ├── handler_list.go
    │   └── handler_create.go
    ├── admin/
    │   ├── manifest.go
    │   └── rbac.go
    └── agent/
        ├── exchange.go
        └── register.go
```

---

## 十一、测试与文档建议

* 使用 **httptest** 模拟带签名请求；
* 建议生成 OpenAPI / Swagger 文件；
* PowerX 可自动聚合插件接口到统一 API 文档中心；
* 测试路径示例：

  ```bash
  curl "http://localhost:8080/_p/com.powerx.plugins.base/api/v1/templates?page=1" \
       -H "X-PowerX-CTX-JWT: <token>"
  ```

---

## 下一步阅读

* 🤖 [Agent Hub 集成指南](./agent_integration.md)
* 💡 [前端结构说明](./frontend.md)
* 🧩 [plugin.yaml 规范](../contract/plugin_yaml_spec.md)
