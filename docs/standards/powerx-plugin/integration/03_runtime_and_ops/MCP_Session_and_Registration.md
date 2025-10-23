# MCP 会话与注册机制（03_runtime_and_ops/MCP_Session_and_Registration.md）

> 本文档定义 **PowerX MCP（Module Communication Protocol）** 的基础会话机制、注册流程与生命周期，  
> 用于实现宿主（CoreX）、插件（Plugin）、Agent 之间的实时通信、能力发现与任务编排。

---

## 🧭 一、文档目标

- 规范插件启动后与宿主 PowerX Core 的 MCP 注册流程；
- 定义 Session 生命周期与心跳机制；
- 支持插件向宿主报告能力（Capability）与健康状态；
- 支持宿主对插件进行任务调用、事件下发、Agent 工具同步；
- 支持多语言实现（Go / Node / Python / Rust）。

---

## 🧩 二、MCP 概述

MCP（Module Communication Protocol）是 PowerX 插件与宿主的通信协议层。  
它抽象了不同通信方式（HTTP/gRPC/WebSocket）的统一语义，用于实现以下目标：

| 功能 | 描述 |
|------|------|
| **Session** | 插件与宿主之间的长连接会话 |
| **Handshake** | 双方身份认证与上下文同步 |
| **Capability Exchange** | 插件上报自身提供/依赖的能力 |
| **Invocation** | 宿主调用插件提供的能力 |
| **Event Delivery** | 宿主或插件之间事件分发 |
| **Agent ToolBridge** | 为智能体注册可调用工具 |

---

## 🧱 三、MCP 会话拓扑结构

```

┌─────────────────────────────┐
│         PowerX Core         │
│ ┌─────────────────────────┐ │
│ │ MCP Runtime Controller  │ │
│ └─────────────────────────┘ │
│       ↑  ↑  ↑               │
│       │  │  │               │
│ ┌───────────────┐ ┌───────────────┐
│ │ Plugin CRM    │ │ Plugin EC     │
│ │ MCP Client    │ │ MCP Client    │
│ └───────────────┘ └───────────────┘
│       ↑                         │
│       │                         │
│ ┌───────────────┐                │
│ │ Agent Runtime │ ←→ Tools / KB │
│ └───────────────┘                │
└─────────────────────────────┘

````

---

## ⚙️ 四、连接方式

MCP 支持两种连接模式：

| 模式 | 说明 | 示例 |
|------|------|------|
| **嵌入模式（Embedded）** | 插件进程启动后主动与宿主建立 TCP/WS 连接 | `ws://localhost:8077/mcp/register` |
| **代理模式（Proxy）** | 宿主通过 HTTP/gRPC 调用插件公开的 MCP API | `POST /_mcp/register` |

推荐默认使用「嵌入模式」。

---

## 🧩 五、注册流程（Handshake）

插件启动后，会在初始化阶段执行 MCP 注册，流程如下：

| 步骤 | 发起方 | 动作 | 描述 |
|------|---------|------|------|
| 1️⃣ | 插件 | `REGISTER` | 向宿主上报自身信息（manifest + env） |
| 2️⃣ | 宿主 | `ACK` | 校验签名与版本，返回会话 token |
| 3️⃣ | 插件 | `CAPABILITY_SYNC` | 上报 manifest.capabilities.provides / consumes |
| 4️⃣ | 宿主 | `READY` | 返回会话确认与任务通道信息 |
| 5️⃣ | 双方 | 保持心跳（PING/PONG） | 维持长连接状态 |

### 示例消息（JSON）

```json
{
  "type": "REGISTER",
  "payload": {
    "plugin_id": "com.powerx.plugin.crm",
    "version": "1.3.0",
    "runtime_type": "exec",
    "capabilities": ["crm.contact.create", "crm.contact.list"],
    "endpoint": "http://127.0.0.1:8088",
    "signature": "base64:AbCdEf..."
  }
}
````

宿主返回：

```json
{
  "type": "ACK",
  "session_id": "sess_88b9b2d4",
  "issued_at": "2025-10-13T10:00:00Z",
  "token": "jwt-encoded-session-token"
}
```

---

## 🧠 六、Session 生命周期

| 阶段             | 状态         | 描述                 |
| -------------- | ---------- | ------------------ |
| **CONNECTING** | 插件尝试建立连接   | 网络初始化              |
| **REGISTERED** | 已注册但未同步能力  | 等待 CAPABILITY_SYNC |
| **READY**      | 会话稳定，可调用能力 | 插件正式运行             |
| **STALE**      | 心跳失联       | 等待重连               |
| **CLOSED**     | 会话关闭       | 插件退出或被卸载           |

宿主维护表：

```
plugin_sessions(session_id, plugin_id, version, tenant, status, last_heartbeat)
```

---

## 🧩 七、心跳与断线重连

插件需每隔 **15 秒** 发送一次心跳包（默认值可通过 `runtime_ops.heartbeat_seconds` 调整）：

```json
{ "type": "PING", "timestamp": "2025-10-13T10:00:30Z" }
```

宿主回复：

```json
{ "type": "PONG", "timestamp": "2025-10-13T10:00:30Z" }
```

若连续 **3 次** 未收到心跳（`runtime_ops.heartbeat_misses`）：

- 宿主标记状态为 `STALE`；
- 触发 `MCP_RECONNECT`；
- 若仍失败，则执行重启或降级处理。

宿主在 `config/host-values.yaml` 中下发的 `runtime_ops` 配置同样约束 MCP 会话：

```yaml
runtime_ops:
  heartbeat_seconds: 15
  heartbeat_misses: 3
  quota_window_minutes: 5
```

插件与调试脚本应读取上述配置，而不是在代码中写死心跳或窗口参数。

---

## 🧩 八、能力同步（Capability Sync）

插件在注册后立即同步能力定义，宿主将更新内部注册表：

```json
{
  "type": "CAPABILITY_SYNC",
  "payload": {
    "provides": ["crm.contact.create", "crm.contact.list"],
    "consumes": ["core.media.upload"]
  }
}
```

宿主返回：

```json
{ "type": "ACK_CAPABILITY", "count": 2 }
```

> 该同步机制与 manifest.capabilities 一致，宿主更新数据库中 `plugin_capabilities` 表。

---

## 🧩 九、能力调用（Invocation）

当宿主或其他 Agent 调用插件提供的能力时，MCP 传递统一请求：

```json
{
  "type": "INVOKE",
  "capability": "crm.contact.create",
  "session_id": "sess_88b9b2d4",
  "tenant_id": "tenant_123",
  "params": { "name": "Alice", "email": "alice@example.com" }
}
```

插件返回：

```json
{
  "type": "RESULT",
  "capability": "crm.contact.create",
  "result": { "id": "contact_1001", "status": "created" }
}
```

宿主记录调用日志：

```
[INFO] invoke crm.contact.create success (42ms)
```

---

## 🧩 十、事件通知（Event Dispatch）

插件可主动向宿主发布事件：

```json
{
  "type": "EVENT_PUBLISH",
  "topic": "crm.v1.events.ContactCreated",
  "data": { "id": "contact_1001" }
}
```

宿主收到后：

- 写入事件总线；
- 根据订阅表广播给其他插件或 Agent；
- 记录日志与指标。

> 事件结构需符合 `contracts/events.yaml` 定义。
> （参见 [02_capabilities_and_schema/IO_Schema_and_Validation.md](../02_capabilities_and_schema/IO_Schema_and_Validation.md)）

---

## ⚙️ 十一、Agent 工具注册（ToolBridge）

当插件内含智能体能力（如 AI 工具、MCP Adapter），应在注册阶段附带 `agent_tools`：

```json
{
  "type": "AGENT_TOOL_SYNC",
  "payload": [
    {
      "name": "generate_email_copy",
      "capability": "agent.marketing.copywriter",
      "description": "生成邮件文案",
      "input_schema": "./contracts/schema/input/agent.marketing.copywriter.json"
    }
  ]
}
```

宿主 AgentRuntime 注册后，即可在 ReAct 编排中自动调用该工具。

---

## 🧩 十二、安全机制

| 策略        | 说明                                      |
| --------- | --------------------------------------- |
| **身份认证**  | 插件注册时携带 `POWERX_AUTH_TOKEN`（JWT）        |
| **签名校验**  | 注册包内的 manifest.signature 与 .pxp HASH 比对 |
| **双向信任**  | 宿主验证插件签名，插件验证宿主公钥                       |
| **多租户隔离** | 会话与租户绑定，不可跨租户访问                         |
| **加密通道**  | WebSocket 或 gRPC 通信均强制使用 TLS            |
| **防重放攻击** | 每个 REGISTER 消息附带时间戳与随机 nonce            |

---

## 🧩 十三、错误与异常处理

| 错误码   | 描述     | 处理方式       |
| ----- | ------ | ---------- |
| `401` | 认证失败   | 重新获取 Token |
| `409` | 插件版本冲突 | 升级或回滚版本    |
| `410` | 插件已退役  | 停止运行       |
| `429` | 调用频率超限 | 限流与重试      |
| `500` | 内部错误   | 记录日志并上报    |

宿主在 MCP 通道中会发送统一错误格式：

```json
{ "type": "ERROR", "code": 409, "message": "Version conflict" }
```

---

## 🧩 十四、Session 调试与日志

插件可在本地启用 MCP 调试：

```bash
export POWERX_MCP_DEBUG=true
export POWERX_MCP_ENDPOINT="ws://localhost:8077/mcp/debug"
```

日志输出样例：

```
[DEBUG] MCP REGISTER sent
[DEBUG] MCP ACK received (session sess_12345)
[DEBUG] CAPABILITY_SYNC ok (3 capabilities)
```

宿主日志：

```
[INFO] Plugin com.powerx.plugin.crm registered (pid=31245, port=8088)
```

---

## 🧱 十五、MCP 会话状态监控指标

PowerX 宿主暴露指标（Prometheus 格式）：

```
powerx_mcp_sessions_total{status="ready"} 12
powerx_mcp_ping_latency_ms{plugin="crm"} 32
powerx_mcp_invocations_total{plugin="crm"} 154
powerx_mcp_errors_total{plugin="crm"} 3
```

这些指标可在 Admin 的「插件运行监控面板」中查看。

---

## 🧩 十六、Go 实现示例（插件侧）

```go
func StartMCPClient() {
    ws, _, err := websocket.DefaultDialer.Dial(os.Getenv("POWERX_MCP_ENDPOINT"), nil)
    if err != nil {
        log.Fatalf("MCP connect error: %v", err)
    }
    defer ws.Close()

    register := map[string]any{
        "type": "REGISTER",
        "payload": map[string]any{
            "plugin_id": os.Getenv("POWERX_PLUGIN_ID"),
            "version": os.Getenv("POWERX_PLUGIN_VERSION"),
            "endpoint": "http://localhost:" + os.Getenv("POWERX_PLUGIN_PORT"),
        },
    }
    ws.WriteJSON(register)
    log.Println("✅ MCP REGISTER sent")

    // Heartbeat
    ticker := time.NewTicker(10 * time.Second)
    for range ticker.C {
        ws.WriteJSON(map[string]string{"type": "PING"})
    }
}
```

---

## 🧠 十七、最佳实践

- 插件启动后必须完成 REGISTER + CAPABILITY_SYNC 才能进入 `READY` 状态；
- MCP Session 应独立线程运行，保持心跳；
- 所有调用应带 session_id 与 tenant_id；
- 插件在退出时应主动发送 `CLOSE` 消息；
- Agent 工具注册（ToolBridge）必须与 manifest.capabilities 对齐；
- 不建议多个插件共享同一 MCP 通道；
- 对关键消息使用签名校验。

---

## 📚 延伸阅读

- [Runtime_Env_and_Ports.md](./Runtime_Env_and_Ports.md)
- [Logs_Metrics_and_Tracing.md](./Logs_Metrics_and_Tracing.md)
- [02_capabilities_and_schema/Capability_Design_Guide.md](../02_capabilities_and_schema/Capability_Design_Guide.md)
- [05_a2a_and_integrations/A2A_Enablement_for_Plugin.md](../05_a2a_and_integrations/A2A_Enablement_for_Plugin.md)

---

> **文档版本：** v1.0.0
> **适用范围：** PowerX ≥ 0.9.0
> **维护团队：** PluginBase Runtime & Agent Team
> **最后更新：** 2025-10
