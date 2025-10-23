# Agent Contract 规范（Agent / Tool / Workflow Registration Contract）

> 本页目标：定义 **插件如何注册与暴露智能体（Agent）、工具（Tool）与工作流（Workflow）能力**，  
> 以供 PowerX 平台的 **Agent Hub** 统一调用与展示。  
> 
> 读者对象：AI 能力开发者 / 插件工程师 / 平台集成方。

---

## 一、设计背景

PowerX 的 **Agent Hub** 负责统一管理各插件注册的智能体（Agent）、工具（Tool）与自动化流程（Workflow）。  
插件通过注册接口或 `plugin.yaml` 声明，将自己的 AI 能力纳入平台体系。

### 功能目标

- 统一管理智能体目录；
- 支持多语言 Agent / Tool；
- 标准化输入输出 Schema；
- 兼容 HTTP 与 gRPC；
- 支持同步与异步调用；
- 允许插件间复用与协作。

---

## 二、定义层次

| 层级 | 说明 | 示例 |
|------|------|------|
| **Agent** | 表示一个「人格化智能体」或「主助手」 | “营销助理”、“客户画像助手” |
| **Tool** | Agent 可调用的具体功能 | “创建客户”、“生成任务” |
| **Workflow** | 多步骤工作流（由多个 Tool 组成） | “自动生成并分配任务计划” |

---

## 三、注册方式

PowerX 提供两种注册模式：

| 模式 | 触发方式 | 推荐场景 |
|------|-----------|-----------|
| **自动注册** | 在 `plugin.yaml` 或 `contracts/agents.yaml` 中定义，宿主 Plugin Manager 启动时自动同步 | 推荐所有插件默认使用 |
| **主动注册** | 插件运行时通过 API 调用 PowerX 的 `/api/v1/agents/register` | 适用于动态生成、更新、或按租户差异化注册场景 |

---

## 四、注册结构定义

### 1️⃣ agents.yaml（或在 plugin.yaml 内嵌）

```yaml
agents:
  - id: "base.assistant"
    plugin_id: "com.powerx.plugins.base"
    name: "Note 助理"
    description: "生成任务清单并分配责任人"
    avatar: "https://cdn.powerx.io/assets/icons/assistant.svg"
    default_tools: ["template.template.create", "template.template.query"]
    category: "productivity"
    visibility: "public"  # public / private / internal
    language: "zh-CN"
    version: "0.1.0"
````

| 字段              | 类型       | 说明                                                 |
| --------------- | -------- | -------------------------------------------------- |
| `id`            | string   | 唯一标识（`<plugin>.<agent>`）                           |
| `plugin_id`     | string   | 所属插件                                               |
| `name`          | string   | Agent 名称                                           |
| `description`   | string   | 功能说明                                               |
| `avatar`        | string   | 图标或头像 URL                                          |
| `default_tools` | string[] | 默认绑定的工具 ID 列表                                      |
| `category`      | string   | 分类（marketing / crm / ecommerce / etc.）             |
| `visibility`    | string   | 可见性：`public`（平台共享）、`private`（租户私有）、`internal`（仅调试） |
| `language`      | string   | 默认语言                                               |
| `version`       | string   | Agent 版本号                                          |

---

### 2️⃣ tools.yaml（或 plugin.yaml 内嵌）

```yaml
tools:
  - id: "template.template.create"
    plugin_id: "com.powerx.plugins.base"
    name: "创建任务"
    description: "根据输入创建模板任务"
    transport: "grpc"         # grpc / http
    endpoint: "127.0.0.1:51031"
    method: "POST /v1/templates"
    rbac_resource: "base:template"
    input_schema:
      type: object
      properties:
        title: { type: string }
        assignee: { type: integer }
      required: ["title"]
    output_schema:
      type: object
      properties:
        id: { type: integer }
        title: { type: string }
```

| 字段              | 类型     | 说明                    |
| --------------- | ------ | --------------------- |
| `id`            | string | 唯一标识                  |
| `plugin_id`     | string | 所属插件                  |
| `name`          | string | 工具名称                  |
| `transport`     | string | 调用方式（`grpc` 或 `http`） |
| `endpoint`      | string | 工具服务地址或 API 路径        |
| `method`        | string | （仅 HTTP）请求方法与路径       |
| `rbac_resource` | string | 关联权限资源                |
| `input_schema`  | object | 输入参数结构（JSON Schema）   |
| `output_schema` | object | 返回结果结构（JSON Schema）   |

---

### 3️⃣ workflows.yaml（或 plugin.yaml 内嵌）

```yaml
workflows:
  - id: "template.plan.generate"
    plugin_id: "com.powerx.plugins.base"
    name: "生成 Sprint 计划"
    description: "根据任务模板自动生成冲刺计划"
    entry: "grpc://127.0.0.1:51031/workflows/plan_generate"
    steps:
      - tool: "template.template.query"
      - tool: "template.template.create"
```

---

## 五、主动注册 API（可选）

### 请求

```bash
POST /api/v1/agents/register
Content-Type: application/json
Authorization: Bearer <PowerX-CTX-JWT>
```

### 请求体

```json
{
  "plugin_id": "com.powerx.plugins.base",
  "agents": [...],
  "tools": [...],
  "workflows": [...]
}
```

### 响应

```json
{ "code": 0, "message": "registered" }
```

> 插件应在启动阶段调用此接口注册最新的能力。
> PowerX 会将结果缓存并展示在 Agent Hub。

---

## 六、调用与调度

### 1️⃣ 调度流程（平台侧）

```text
用户 → Agent Hub → (选择 Agent)
      → 调用插件注册的 Tool / Workflow
      → 插件执行逻辑并返回结果
```

### 2️⃣ 插件侧响应格式

所有调用（HTTP / gRPC）建议统一返回：

```json
{
  "code": 0,
  "message": "ok",
  "data": {...}
}
```

错误返回：

```json
{
  "code": 40001,
  "message": "invalid input",
  "details": { "field": "title" }
}
```

---

## 七、安全与权限机制

| 机制               | 说明                                   |
| ---------------- | ------------------------------------ |
| **JWT/HMAC 上下文** | Agent Hub 调用时自动注入 `X-PowerX-CTX-JWT` |
| **租户隔离**         | `tenant_id` 会包含在签名上下文中               |
| **RBAC 校验**      | 插件根据 `rbac_resource` 检查是否授权执行        |
| **请求溯源**         | 每次 Tool 调用都会包含 `request_id`          |
| **安全策略**         | 插件不得主动执行外部 HTTP 调用到宿主以外域名（除非声明允许）    |

---

## 八、示例（Go 实现）

```go
// internal/transport/http/agent/register.go
func RegisterAgentHandlers(r *gin.RouterGroup) {
    r.POST("/register", func(c *gin.Context) {
        // 模拟注册流程
        c.JSON(200, gin.H{"code": 0, "message": "registered"})
    })
}

// internal/transport/http/agent/exchange.go
func ExchangeToken(c *gin.Context) {
    // STS 短期凭据交换示例
    c.JSON(200, gin.H{
        "access_key": "STS.ABC123",
        "expires_in": 3600,
    })
}
```

---

## 九、UI 集成：Agent Widget（可选）

插件可以在自己的页面中嵌入统一的 Agent 对话组件：

```vue
<template>
  <AgentWidget agent-id="base.assistant" />
</template>
```

属性：

| Prop         | 类型      | 说明          |
| ------------ | ------- | ----------- |
| `agent-id`   | string  | 指定注册的 Agent |
| `tenant`     | number  | 当前租户 ID（可选） |
| `fullscreen` | boolean | 是否全屏显示      |

---

## 十、最佳实践

✅ **工具最小化原则**：每个 Tool 只完成一个明确动作。
✅ **Schema 完整化**：所有输入/输出定义必须清晰。
✅ **gRPC 优先**：推荐使用 gRPC 实现高性能调用。
✅ **按需注册**：仅注册真正可复用的能力。
✅ **多语言描述**：使用多语言 key 描述 Agent 名称与简介。
✅ **测试注册接口**：在 PowerX 启动后执行：

```bash
curl "http://localhost:8080/_p/com.powerx.plugins.base/api/v1/agent/register"
```

---

## 十一、注册与生命周期事件

| 事件          | 含义                        |
| ----------- | ------------------------- |
| `install`   | 插件被安装，Plugin Manager 触发注册 |
| `enable`    | 插件启用，Agent 能力恢复可调用        |
| `update`    | 插件升级，重新注册 Agent 能力        |
| `disable`   | 插件停用，Agent 能力暂停调用         |
| `uninstall` | 插件卸载，Agent 能力删除           |

---

## 十二、调试与排错

| 问题        | 原因                  | 解决方案                     |
| --------- | ------------------- | ------------------------ |
| Agent 未显示 | 未正确注册或注册格式错误        | 检查 plugin.yaml / 注册接口返回  |
| Tool 调用失败 | endpoint 不通或反代配置错误  | 检查 gRPC/HTTP 路径          |
| JWT 验签失败  | 缺少宿主公钥              | 确认 `POWERX_CTX_JWKS_URL` |
| 权限不足      | 未配置 `rbac_resource` | 检查 PowerX 权限设置           |
| Schema 错误 | JSON Schema 拼写不符    | 校验 schema 结构             |

---

## 十三、未来扩展（PowerX 规划）

| 模块                          | 功能                                  |
| --------------------------- | ----------------------------------- |
| **Tool Discovery API**      | 插件可暴露 `/api/v1/agent/tools` 动态返回工具集 |
| **Agent Marketplace**       | 允许插件上架智能体，用户可一键订阅                   |
| **Conversation Memory API** | 支持 Agent 记忆功能（上下文缓存）                |
| **Cross-Agent Workflow**    | 允许多个插件协同完成任务流                       |

---

## 下一步阅读

- 🔐 [上下文签名规范（HMAC / JWT）](./ctx_signing.md)
- 🧠 [PowerX Integration 交互协议](./powerx_integration.md)
