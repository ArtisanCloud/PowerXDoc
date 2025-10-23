# A2A 协议与智能体互联规范（05_protocols_and_integrations/A2A_Protocol_and_Agent_Interconnect.md）

> 本文档定义 PowerX 插件如何通过 PowerX 宿主的“协议适配层”（Protocol Adapter Layer）  
> 对接 **A2A（Agent-to-Agent）协议** —— 一种由 Google 提出的智能体互联开放标准。  
>
> 目标：让 PowerX 内部、插件间、跨平台的智能体（Agent）可以安全地互相发现、通信与协作。

---

## 🧭 一、定位与背景

### 1. A2A 是什么？

A2A（Agent-to-Agent）是 2025 年 Google 公布的开放协议，用于在不同系统中的智能体间建立**统一通信与调度层**，  
实现以下核心目标：

- Agent 能“自发现”和“互操作”；
- 跨宿主（PowerX、Coze、LangGraph 等）互联；
- 支持多种消息语义：任务委派、上下文共享、事件通知；
- 与 MCP（Model Context Protocol）互补：  
  - **A2A 连接智能体 ↔ 智能体**；  
  - **MCP 连接智能体 ↔ 工具/数据源**。

PowerX 的 A2A 接入层既遵循此规范，也支持本地扩展（租户隔离、多租限流、ToolGrant 安全控制）。

---

## 🧱 二、PowerX 中的 A2A 层级架构

```

┌────────────────────────────────────┐
│           PowerX Core Runtime      │
│ ┌──────────────────────────────┐   │
│ │ Protocol Adapter Layer       │   │
│ │  ├─ HTTP Adapter             │   │
│ │  ├─ gRPC Adapter             │   │
│ │  ├─ MCP Adapter              │   │
│ │  ├─ A2A Adapter ← 本章焦点    │   │
│ │  └─ Webhook Adapter          │   │
│ └──────────────────────────────┘   │
│     ↓ (Unified Capability Bus)     │
│   Capability Registry / Invoker    │
│     ↓                              │
│   Plugin (PowerXPluginBase)        │
└────────────────────────────────────┘

```

宿主层负责：

- 统一监听各类协议；
- 进行身份验证（ToolGrant / JWT / VC）；
- 将外部请求转换为内部 `InvokeRequest`；
- 分发到插件侧的业务能力执行器。

插件层负责：

- 注册本地 Agent；
- 实现 `/a2a/inbox` 接口；
- 处理 Envelope、执行任务、返回结果。

---

## ⚙️ 三、插件侧启用 A2A 的步骤

### 1️⃣ manifest 增量配置

```yaml
runtime:
  protocols:
    a2a:
      enabled: true
      inbox_path: /a2a/inbox
      mode: gateway   # gateway | embedded
      version: "1.0"
a2a:
  agent:
    id: "agent.crm.sales"
    display_name: "Sales CRM Agent"
    intents:
      - "crm.contact.create"
      - "crm.contact.search"
  auth:
    type: "toolgrant+jwt"
    ttl: 3600
```

宿主安装插件时会：

- 在 **A2A Directory** 注册 `agent_id`；
- 建立能力索引；
- 创建安全上下文（租户隔离 + ToolGrant）；
- 生成 `/a2a/inbox` 的路由代理。

---

## 🧩 四、消息模型（Envelope 格式）

```json
{
  "a2a_version": "1.0",
  "message_id": "msg_8e7b12",
  "from": "agent.crm.sales",
  "to": "agent.ai.email",
  "intent": "ai.email.send",
  "context": {
    "tenant_id": "tenant_123",
    "trace_id": "c94aab8a-1a9b-4d4b"
  },
  "auth": {
    "toolgrant": "<JWT>",
    "sig": "ed25519:xyz"
  },
  "payload": {
    "email": "demo@powerx.io",
    "subject": "Hello",
    "body": "Welcome to PowerX!"
  }
}
```

- `from` / `to`：智能体标识；
- `intent`：调用的意图（可映射到 plugin capability）；
- `context`：租户、追踪与会话信息；
- `auth`：认证与签名；
- `payload`：任务输入数据。

响应结构（Result Envelope）：

```json
{
  "status": "ok",
  "result": {"message_id": "abc123"},
  "trace_id": "c94aab8a-1a9b-4d4b"
}
```

---

## 🔐 五、安全机制

| 层级  | 策略                          | 说明                                  |
| --- | --------------------------- | ----------------------------------- |
| 身份  | Agent Identity              | 由宿主注册并验证，格式：`agent.{plugin}.{name}` |
| 授权  | ToolGrant（内部） / JWT+VC（跨宿主） | 权限最小化，带 TTL                         |
| 签名  | EdDSA / HMAC                | 验证消息完整性与来源                          |
| 上下文 | 租户隔离                        | 插件不可跨租户通信                           |
| 传输  | HTTPS / gRPC-TLS            | A2A 所有通信均加密                         |

宿主负责：

- 验签与租户上下文恢复；
- ToolGrant 校验；
- 调用计费与配额；
- 审计日志记录。

---

## 🧠 六、A2A 与 MCP 的关系

| 层     | 协议      | 职责                  | 示例                                           |
| ----- | ------- | ------------------- | -------------------------------------------- |
| 🔹 上层 | **A2A** | Agent ↔ Agent 调度、互联 | “CRM Agent 调用 AI Email Agent 发送邮件”           |
| 🔸 下层 | **MCP** | Agent ↔ 工具/模型访问     | “AI Email Agent 调用 OpenAI ChatCompletion 工具” |

两者协同方式：

- A2A 调度任务（多智能体编排）；
- MCP 执行具体工具调用；
- PowerX 宿主通过统一的 Transport Adapter 层管理两者通信。

---

## 📈 七、限流与配额

A2A 通信统一由宿主限流控制：

| 维度             | 默认限额       | 说明                   |
| -------------- | ---------- | -------------------- |
| 每租户 Agent 调用频率 | 60 req/min | 可在 Marketplace 计划中调整 |
| 单消息大小          | 1MB        | 超出返回 413             |
| 并发连接           | 10         | 超出将排队                |
| Token TTL      | 1h         | ToolGrant 过期后需刷新     |

超过限制触发事件：

```json
{
  "event": "a2a.limit.exceeded",
  "agent_id": "agent.crm.sales",
  "intent": "ai.email.send"
}
```

---

## 🧩 八、观测与审计

宿主自动记录以下指标：

| 类型      | 指标名                                 | 说明                    |
| ------- | ----------------------------------- | --------------------- |
| Logs    | `a2a_call.log`                      | 完整消息流转日志              |
| Metrics | `a2a_messages_total{intent,status}` | 每 intent 的消息数         |
| Trace   | `trace_id` 贯穿宿主-插件-外部 Agent         |                       |
| Audit   | `audit_a2a_events`                  | 包含 ToolGrant 验证、结果、时延 |

---

## ⚙️ 九、插件侧实现参考（Go Gin 示例）

```go
r.POST("/a2a/inbox", func(c *gin.Context) {
    var env A2AEnvelope
    if err := c.ShouldBindJSON(&env); err != nil {
        c.JSON(400, gin.H{"error": "invalid envelope"})
        return
    }
    // 验证签名与授权
    if err := VerifyToolGrant(env.Auth.ToolGrant); err != nil {
        c.JSON(403, gin.H{"error": "unauthorized"})
        return
    }
    // 调度本地 Agent 处理意图
    result, err := agent.Dispatch(env.Intent, env.Payload)
    if err != nil {
        c.JSON(500, gin.H{"error": err.Error()})
        return
    }
    c.JSON(200, gin.H{"status": "ok", "result": result})
})
```

---

## 🧩 十、版本与兼容性

| 字段               | 说明                        |
| ---------------- | ------------------------- |
| `a2a_version`    | 协议版本（推荐 `"1.0"`）          |
| `schema_version` | Payload Schema 版本         |
| `intent`         | 可携版本后缀：`ai.email.send:v2` |
| `capability_ref` | 对应内部定义的能力 ID              |

兼容策略参考：`02_capabilities_and_schema/Backward_Compatibility_Strategy.md`

---

## 🧪 十一、自检清单（A2A Ready Checklist）

| 检查项                               | 状态 |
| --------------------------------- | -- |
| manifest 中启用 `a2a.enabled = true` | ✅  |
| `/a2a/inbox` 路由已注册                | ✅  |
| 消息 Envelope 校验通过                  | ✅  |
| ToolGrant / JWT 验证可用              | ✅  |
| 租户上下文隔离生效                         | ✅  |
| Tracing / Audit 已配置               | ✅  |
| 兼容 MCP 工具调用链                      | ✅  |

---

## 📚 十二、参考文献与延伸阅读

- Google A2A 官方规范与 SDK 公布说明（2025.04）
- PowerX `MCP_Session_and_Registration.md`
- PowerX `ToolGrant_Consumption_Guide.md`
- PowerX `Logs_Metrics_and_Tracing.md`

---

> **文档版本：** v1.1.0
> **适用范围：** PowerX ≥ 0.9.0
> **维护团队：** PluginBase Integration Team
> **最后更新：** 2025-10

```

---

✅ **总结要点**
- 文件夹更名为 `05_protocols_and_integrations/` 是正确的；
- 这篇文档现在以 **Google A2A 协议 + PowerX Adapter 层映射** 为中心；
- 明确区分了 A2A 与 MCP；
- 形成了统一消息模型、鉴权、审计和限流机制。
