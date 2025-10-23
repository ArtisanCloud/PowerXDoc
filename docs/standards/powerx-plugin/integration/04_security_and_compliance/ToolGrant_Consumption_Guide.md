# 工具授权与消费指南（04_security_and_compliance/ToolGrant_Consumption_Guide.md）

> 本文档定义 PowerX 插件在调用宿主能力、其他插件能力或内部智能体工具（Tool）时，  
> 必须遵循的授权机制 —— **ToolGrant（工具授权）模型**。  
> 它确保插件在受控范围内使用宿主与跨插件资源，避免权限越界与滥用调用。

---

## 🧭 一、文档目标

- 解释 ToolGrant 的作用、生命周期与作用范围；
- 定义插件请求与验证 ToolGrant 的标准流程；
- 明确 ToolGrant 与 IAM / RBAC / Tenant Context 的关系；
- 规范 ToolGrant 的续期、吊销与审计策略；
- 提供在插件中安全使用 ToolGrant 的最佳实践。

---

## 🧱 二、什么是 ToolGrant

**ToolGrant** 是 PowerX Core 向插件或 Agent 签发的一种“临时调用授权”，  
用于限定其在特定上下文中调用某一类能力（Capability）。

它可理解为：
> 🪪 *“能力级别的租约（Capability Lease）”*，  
> 在生命周期内允许插件调用宿主或其他插件注册的特定能力接口。

示意：

```

┌──────────────────────────┐
│ PowerX Core              │
│  ├─ IAM & RBAC           │
│  ├─ ToolGrant Manager    │
│  └─ Capability Registry  │
│            ↓ issue grant │
│ ┌──────────────────────┐ │
│ │ PowerXPluginBase     │ │
│ │ ├─ Agent / Tool A    │ │
│ │ └─ ToolGrant Token   │ │
│ └──────────────────────┘ │
└──────────────────────────┘

```

---

## 🧩 三、ToolGrant 生命周期

| 阶段 | 说明 | 触发方 |
|------|------|---------|
| **申请（Request）** | 插件向宿主请求 ToolGrant | 插件 |
| **签发（Issue）** | 宿主验证权限后生成 Token | 宿主 |
| **消费（Consume）** | 插件调用被授权的能力 | 插件 |
| **续期（Renew）** | 插件请求延长有效期 | 插件 / 宿主 |
| **吊销（Revoke）** | 宿主因风险或策略撤销授权 | 宿主 |
| **过期（Expire）** | 达到 TTL 自动失效 | 系统自动 |

---

## 🧩 四、ToolGrant 数据结构（签发格式）

ToolGrant 以 JWT 形式签发，包含如下字段：

```json
{
  "grant_id": "tg_4f93a2...",
  "issuer": "powerx.core",
  "subject": "com.powerx.plugin.crm",
  "tenant_id": "tenant_123",
  "capability": "crm.contact.create",
  "scope": ["create", "read"],
  "issued_at": "2025-10-13T08:00:00Z",
  "expires_at": "2025-10-13T09:00:00Z",
  "signature": "HMAC-SHA256"
}
```

### 签名算法

- 默认算法：`HS256`
- 密钥来源：宿主（PowerX Core）签发密钥
- 验证方：插件或被调用的插件端验证签名合法性

---

## 🧩 五、ToolGrant 与 RBAC 的关系

ToolGrant 并不替代 RBAC，而是 **RBAC 的临时实例化结果**。

| 概念             | 作用                            |
| -------------- | ----------------------------- |
| **RBAC Role**  | 定义“谁可以访问哪些资源”                 |
| **Permission** | 权限三元组（plugin/resource/action） |
| **ToolGrant**  | 由宿主根据 RBAC 生成的“短期调用凭证”        |

示例：

```
RBAC: role = crm_editor → crm.contact.create
↓
ToolGrant: allow crm.contact.create (TTL=1h)
```

---

## 🧩 六、请求 ToolGrant 的流程

### 1️⃣ 插件向宿主发起请求

HTTP 请求示例：

```http
POST /_core/toolgrants
Authorization: Bearer <PLUGIN_AUTH_TOKEN>
Content-Type: application/json

{
  "capability": "crm.contact.create",
  "scope": ["create"],
  "ttl": 3600
}
```

### 2️⃣ 宿主验证

- 校验插件 ID、租户上下文；
- 检查 RBAC 权限表；
- 生成 ToolGrant（JWT Token）；
- 返回授权 Token。

### 3️⃣ 插件使用

插件在调用宿主或其他插件能力时附带 Header：

```
X-PowerX-ToolGrant: <JWT_TOKEN>
```

宿主或目标插件验证签名与有效期。

---

## 🧩 七、在插件中使用 ToolGrant

示例 Go 代码：

```go
grantToken := os.Getenv("POWERX_TOOLGRANT_TOKEN")

req, _ := http.NewRequest("POST", host+"/api/v1/contact/create", body)
req.Header.Set("X-PowerX-ToolGrant", grantToken)
resp, err := http.DefaultClient.Do(req)
```

验证中间件（Gin）：

```go
func MiddlewareVerifyToolGrant() gin.HandlerFunc {
    return func(c *gin.Context) {
        token := c.GetHeader("X-PowerX-ToolGrant")
        claims, err := powerx.VerifyToolGrant(token)
        if err != nil {
            c.AbortWithStatusJSON(403, gin.H{"error": "invalid toolgrant"})
            return
        }
        c.Set("capability", claims.Capability)
        c.Next()
    }
}
```

---

## ⚙️ 八、ToolGrant 的作用范围（Scope）

| 作用范围         | 示例                                        | 说明                  |
| ------------ | ----------------------------------------- | ------------------- |
| **宿主能力**     | `core.media.upload`                       | 插件调用宿主上传文件          |
| **跨插件调用**    | `crm.contact.create` → `ai.embedding.run` | 插件调用其他插件的 AI 工具     |
| **Agent 工具** | `agent.email.send`                        | 智能体使用特定插件能力         |
| **外部代理能力**   | `marketplace.sync.listings`               | 限定 Marketplace 交互权限 |

> 插件不得使用未经 ToolGrant 授权的能力调用。
> 宿主统一维护能力注册表（Capability Registry）。

---

## 🧩 九、ToolGrant 与多智能体（Multi-Agent）协作

当插件内包含多个 Agent（智能体）时，每个 Agent 必须独立持有 ToolGrant。

| 场景       | 策略                         |
| -------- | -------------------------- |
| 主 Agent  | 拥有全部插件级能力                  |
| 子 Agent  | 按功能授予部分 ToolGrant          |
| 临时 Agent | 使用短期 TTL（如 10 分钟）          |
| 异步任务     | ToolGrant 可附带单次用途标识（nonce） |

示例：

```yaml
agent_roles:
  - id: "agent.sales"
    grants:
      - capability: crm.contact.create
        ttl: 1800
  - id: "agent.analytics"
    grants:
      - capability: crm.report.generate
        ttl: 600
```

---

## 🧩 十、ToolGrant 的续期与吊销

| 操作             | 说明          | 触发方  |
| -------------- | ----------- | ---- |
| **续期（Renew）**  | 插件请求延长授权有效期 | 插件   |
| **吊销（Revoke）** | 宿主检测到风险或违规  | 宿主   |
| **批量吊销**       | 插件卸载 / 租户禁用 | 系统自动 |

续期示例：

```http
POST /_core/toolgrants/renew
Authorization: Bearer <PLUGIN_AUTH_TOKEN>
{
  "grant_id": "tg_abc123"
}
```

吊销通知事件：

```json
{
  "event": "toolgrant.revoked",
  "grant_id": "tg_abc123",
  "reason": "tenant_suspended"
}
```

---

## 🧩 十一、ToolGrant 审计与追踪

所有 ToolGrant 的签发、使用、吊销事件均写入审计日志：

```
/logs/audit.log
```

示例记录：

```json
{
  "timestamp": "2025-10-13T09:01:02Z",
  "plugin_id": "com.powerx.plugin.crm",
  "tenant_id": "tenant_123",
  "capability": "crm.contact.create",
  "action": "consumed",
  "grant_id": "tg_4f93a2",
  "trace_id": "9f1ab2c8"
}
```

---

## 🧠 十二、安全与合规要求

| 项目       | 要求                           |
| -------- | ---------------------------- |
| **最小权限** | ToolGrant 仅包含执行所需能力          |
| **时效性**  | TTL 最长不超过 24 小时              |
| **不可共享** | 禁止多插件共用 Token                |
| **可撤销性** | 宿主可即时吊销                      |
| **可追溯性** | 所有事件写入审计日志                   |
| **保密性**  | 通过 HTTPS/TLS 传输，禁止日志打印 Token |

---

## 📋 十三、自检清单

| 编号    | 检查项                      | 状态 |
| ----- | ------------------------ | -- |
| TG-01 | 插件所有跨能力调用均携带有效 ToolGrant | ✅  |
| TG-02 | ToolGrant 验证中间件已启用       | ✅  |
| TG-03 | ToolGrant TTL ≤ 24h      | ✅  |
| TG-04 | Token 不出现在日志或错误栈         | ⚠️ |
| TG-05 | 插件支持宿主吊销通知处理             | ✅  |
| TG-06 | 子 Agent 使用独立 ToolGrant   | ✅  |

---

## 📚 十四、延伸阅读

- [MCP_Session_and_Registration.md](../03_runtime_and_ops/MCP_Session_and_Registration.md)
- [Capability_Design_Guide.md](../02_capabilities_and_schema/Capability_Design_Guide.md)
- [Plugin_Security_Checklist.md](./Plugin_Security_Checklist.md)
- [Vulnerability_Response.md](./Vulnerability_Response.md)

---

> **文档版本：** v1.0.0
> **适用范围：** PowerX ≥ 0.9.0
> **维护团队：** PluginBase Security Team
> **最后更新：** 2025-10
