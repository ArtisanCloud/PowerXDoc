# Agent Hub 集成指南（Agent Integration Guide）

> 本页目标：说明插件如何与 **PowerX Agent Hub** 对接，  
> 注册智能体（Agent）、工具（Tool）、与工作流（Workflow）能力。  
> 读者对象：AI 能力开发者 / Agent 工程师 / 插件开发者。

---

## 一、概述

PowerX 的 **Agent Hub** 是一个统一的智能体注册与调度中心，  
所有插件可以在这里：

- 注册自有智能体（Agent Profile）
- 暴露可供调用的工具（Tool）
- 定义自动化流程（Workflow）

PowerX 会统一展示这些能力，并在执行时通过 gRPC 或 HTTP 调用插件接口。

---

## 二、三类能力结构

| 能力类型 | 定义方式 | 调用方 | 典型用途 |
|-----------|-----------|---------|-----------|
| **Agent** | 描述型定义（profile） | 用户 / 主 Agent | 聊天智能体、助手 |
| **Tool** | 可执行接口（HTTP/gRPC） | 由 Agent 调用 | 原子能力（如创建任务） |
| **Workflow** | 多步骤自动化任务 | Agent Hub 调度 | 复合任务（如生成计划） |

---

## 三、注册清单格式（YAML / JSON）

可通过 `plugin.yaml` 或单独文件（如 `contracts/agents.yaml`）声明：

```yaml
agents:
  - id: "base.assistant"
    plugin_id: "com.powerx.plugins.base"
    name: "Note 助理"
    description: "根据笔记生成任务清单并分配责任人"
    default_tools: ["template.template.create", "template.template.query"]

tools:
  - id: "template.template.create"
    plugin_id: "com.powerx.plugins.base"
    name: "创建任务"
    transport: "grpc"         # 可选: grpc / http
    endpoint: "127.0.0.1:51031"
    rbac_resource: "base:template"
    input_schema:
      type: object
      properties:
        title: { type: string }
        assignee: { type: integer }
    output_schema:
      type: object
      properties:
        id: { type: integer }
        title: { type: string }

workflows:
  - id: "template.plan.generate"
    plugin_id: "com.powerx.plugins.base"
    name: "生成 Sprint 计划"
    endpoint: "grpc://127.0.0.1:51031/workflows/plan_generate"
````

---

## 四、注册方式

### 1️⃣ 启动时主动注册（推荐）

插件启动后调用 PowerX 注册接口：

```bash
POST /api/v1/agents/register
Content-Type: application/json
Authorization: Bearer <PowerX-CTX-JWT>
```

请求体示例：

```json
{
  "plugin_id": "com.powerx.plugins.base",
  "agents": [...],
  "tools": [...],
  "workflows": [...]
}
```

返回：

```json
{ "code": 0, "message": "registered" }
```

---

### 2️⃣ 由 Plugin Manager 代注册（自动）

如果你在 `plugin.yaml` 中包含了 `agents/tools/workflows` 字段，
PowerX Plugin Manager 会在插件安装或启用时自动完成注册。

**好处：**

- 无需额外 HTTP 调用；
- 统一由宿主管理 Agent 能力生命周期。

---

## 五、Agent Hub 调用插件的方式

| 传输方式          | 说明                                | 场景             |
| ------------- | --------------------------------- | -------------- |
| **HTTP POST** | 调用插件 `/v1/...` 接口，传入 JSON payload | 简单工具或小任务       |
| **gRPC 调用**   | 调用插件的 gRPC server 方法              | 高并发、长连接或二进制流任务 |
| **异步工作流**     | Agent Hub 创建任务，异步回调插件             | 大规模或耗时任务       |

插件模板默认在 `internal/grpc/server` 中预留了注册点：

```go
// server.go
func RegisterPluginServer(grpcServer *grpc.Server) {
    pb.RegisterBasePluginServer(grpcServer, &BasePluginService{})
}
```

---

## 六、Agent Widget 内嵌（可选）

PowerX 提供 `<AgentWidget />` 微前端组件，
可在插件管理页（`web-admin`）中嵌入统一的对话界面。

示例（Vue/Nuxt）：

```vue
<template>
  <AgentWidget agent-id="base.assistant" :tenant="tenant" />
</template>
```

> 这样插件就可以在自身页面内使用与平台一致的 Agent 聊天体验。

---

## 七、安全与权限控制

- 每个 Tool 绑定一个 `rbac_resource`，执行时会带入当前上下文权限；
- 插件端可使用 `RBACGuard` 中间件校验；
- Agent Hub 在调度时自动注入 `X-PowerX-CTX-JWT`；
- 所有调用均记录 `request_id` 与 `tenant_id`，便于审计。

---

## 八、调试建议

1. 启动插件并确保 `/v1/...` 或 gRPC 服务可访问；
2. 在 PowerX 平台 Agent Hub 页面手动触发同步注册；
3. 查看 PowerX 日志确认是否注册成功；
4. 发送测试指令（如 “帮我创建一个任务”）验证 Tool 调用链；
5. 若 JWT 验签失败，可临时开启 `POWERX_DEV_MODE=1` 旁路。

---

## 九、版本与生命周期

| 阶段            | 描述                                |
| ------------- | --------------------------------- |
| **register**  | 插件初次上报 Agent / Tool / Workflow 能力 |
| **update**    | 插件升级时更新注册清单                       |
| **disable**   | 插件被停用，Agent Hub 暂停调用              |
| **uninstall** | 插件被卸载，Agent 能力从平台移除               |

---

## 十、最佳实践

✅ **每个 Tool 独立成微接口**，不要混合多种功能。
✅ **Agent 描述尽量人性化**，便于平台展示与搜索。
✅ **Schema 要完整定义输入/输出**，避免歧义。
✅ **RPC 推荐用 gRPC**，比 HTTP 延迟更低。
✅ **版本管理**：变更工具结构需更新 `plugin.yaml.version`。

---

## 下一步阅读

- 💡 [前端结构说明](./frontend.md)
- ⚙️ [Makefile 与运行任务说明](./makefile_tasks.md)
- 🧩 [Agent Contract 协议规范](../contract/agent_contract.md)
