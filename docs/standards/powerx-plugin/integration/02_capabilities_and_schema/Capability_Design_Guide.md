# 插件能力设计指南（02_capabilities_and_schema/Capability_Design_Guide.md）

> 本文档定义 PowerX 插件的能力（Capability）声明、分类、注册与交互约定，  
> 使插件在宿主系统、Marketplace、Agent 编排中具备清晰的「能做什么」语义。

---

## 🧭 一、文档目标

- 统一 PowerX 插件的能力（Capability）设计与命名；
- 规范能力声明的格式与命名空间；
- 定义宿主侧能力注册流程；
- 说明如何在 `.pxp` manifest 中描述能力与依赖；
- 为插件间、Agent 间调用（A2A / MCP）提供元数据基础。

---

## 🧩 二、什么是 Capability

> Capability = 插件向 PowerX 生态公开的「功能原子单位」。

举例：

- CRM 插件：`crm.contact.search`、`crm.account.sync`
- 营销插件：`marketing.campaign.create`、`email.send_batch`
- E-commerce 插件：`ec.product.list`、`ec.order.refund`
- AI Agent 插件：`agent.generate_copy`、`agent.classify_leads`

---

## 🧱 三、能力层级模型

PowerX 采用三层能力命名体系：

| 层级 | 说明 | 示例 |
|------|------|------|
| **Domain（领域）** | 模块或插件命名空间 | `crm` / `ec` / `marketing` |
| **Resource（资源）** | 可操作的对象或集合 | `contact` / `campaign` / `order` |
| **Action（动作）** | 对资源执行的行为 | `create` / `read` / `update` / `delete` / `sync` / `export` |

组合格式：

```

<domain>.<resource>.<action>

```

例如：

```

crm.contact.create
marketing.campaign.export
ec.order.refund

```

---

## ⚙️ 四、能力声明格式（manifest 中）

每个插件可在 `manifest.yaml` 中声明自身提供与依赖的能力：

```yaml
capabilities:
  provides:
    - crm.contact.create
    - crm.contact.update
    - crm.contact.list
  consumes:
    - core.media.upload
    - agent.ai.generate
```

宿主 PowerX 会在插件安装时：

1. 将 `provides` 注册为可调用能力；
2. 检查 `consumes` 是否在系统或其他插件中存在；
3. 生成能力映射表（供 Agent / MCP / Graph 编排使用）。

---

## 🧩 五、Capability 的分类与类型

| 类型                | 描述                   | 示例                             |
| ----------------- | -------------------- | ------------------------------ |
| **API型**          | 插件暴露 HTTP/gRPC 接口    | `crm.contact.create`           |
| **事件型（Event）**    | 插件通过事件总线发布/订阅主题      | `order.v1.events.OrderCreated` |
| **任务型（Job）**      | 插件提供定时/异步任务能力        | `report.generate_daily`        |
| **AI 工具型（Tool）**  | 插件暴露给 Agent 的 LLM 工具 | `agent.copywriter.summarize`   |
| **数据服务型（Schema）** | 插件提供结构化数据能力          | `crm.contact.dataset`          |
| **桥接型（Bridge）**   | 插件代理外部系统 API         | `bridge.hubspot.sync`          |

---

## 🧩 六、能力注册在宿主系统中的生命周期

| 阶段      | 行为                                                    | 执行者           |
| ------- | ----------------------------------------------------- | ------------- |
| **安装时** | 宿主读取 manifest.capabilities.provides / consumes 并写入数据库 | PowerX Core   |
| **运行时** | PowerX 通过 gRPC / HTTP 调用能力                            | CoreX 调度层     |
| **升级时** | 对比新旧 manifest 差异，增量注册或注销能力                            | PluginManager |
| **卸载时** | 移除该插件的能力映射记录                                          | PluginManager |

> 能力注册信息通常存储在宿主的表：
> `plugin_capabilities(plugin_id, capability_id, type, entrypoint, status)`。

---

## 🧠 七、Capability 设计规范

### 1️⃣ 命名规范

| 规则                     | 示例                                             |
| ---------------------- | ---------------------------------------------- |
| 使用小写字母与 `.` 分隔         | `crm.contact.create`                           |
| 动词使用动词原形               | `create`, `sync`, `import`                     |
| 领域名建议与插件 ID 保持一致前缀     | `com.powerx.plugin.crm` → `crm.*`              |
| 避免歧义动作名                | 不推荐：`do`, `process`, 推荐：`analyze`, `transform` |
| AI 工具能力应使用 `agent.` 前缀 | `agent.email.generate_copy`                    |

---

### 2️⃣ 描述文件（可选）

每个能力可带有独立描述文件（建议放在 `/contracts/capabilities/`）：

```yaml
# contracts/capabilities/crm.contact.create.yaml
id: crm.contact.create
summary: 创建新的客户联系人
input:
  type: object
  properties:
    name: { type: string }
    email: { type: string }
output:
  type: object
  properties:
    id: { type: string }
    created_at: { type: string, format: date-time }
permissions:
  - crm.contact.create
```

宿主或 Marketplace 可自动生成接口文档或测试用例。

---

### 2.1 Manifest 引用

在 `plugin.yaml` / release `manifest.yaml` 中只需要引用能力 ID 与描述文件路径，避免重复维护 Schema：

```yaml
capabilities:
  provides:
    - id: crm.contact.create
      version: 1.0.0
      descriptor: contracts/capabilities/crm.contact.create.yaml
      schemas:
        input:
          - schema/input/crm.contact.create.v1.json
        output:
          - schema/output/crm.contact.create.v1.json
```

安装流程会根据这些引用加载 `contracts/capabilities/*` 与 `contracts/schema/*`，同时与 RBAC 配置做对齐校验。

---

### 3️⃣ 输入输出模式（IO Schema）

每个能力应定义标准化的输入输出（参考下一篇 [IO_Schema_and_Validation.md](./IO_Schema_and_Validation.md)），
PowerX 要求：

- 所有能力都应具备 JSON Schema；
- 所有能力都可通过 LLM Agent 解析成参数；
- Schema 存放路径：`/contracts/capabilities/*.yaml`。

---

## 🧰 八、Capability 与 RBAC 的绑定关系

在宿主 PowerX 的权限模型中，`capability_id` 通常直接对应 `rbac.resource + action`：

| Capability              | RBAC 权限                 |
| ----------------------- | ----------------------- |
| crm.contact.create      | crm.contact.create      |
| marketing.campaign.list | marketing.campaign.read |
| agent.ai.generate       | agent.tool.use          |

> 插件安装时，宿主会自动同步 capabilities → permissions 表。
> 因此每个插件都应保证：
>
> - `rbac.resources` 与 `capabilities.provides` 一致；
> - 能力的输入输出遵循相应权限边界。

---

## ⚙️ 九、插件间调用（A2A）与能力互操作

通过 `capabilities.consumes`，插件可调用其他插件的能力：

```yaml
capabilities:
  consumes:
    - ec.product.list
    - crm.contact.search
```

PowerX 调用方式：

- 在安装时建立依赖映射；
- 运行时通过 MCP 或 HTTP/gRPC 调度；
- 失败时返回 404（Capability Not Found）。

### 调用安全策略

- 调用方必须具备对应租户的授权；
- 宿主在调用时附带 `X-PowerX-Auth` 令牌；
- 插件侧可在中间件中验证 Token 及租户身份。

---

## 🔌 十、Capability 的演进与版本化

> 能力也应有版本语义。

### 1️⃣ 事件命名方式

```
<domain>.<version>.events.<Topic>
```

示例：

```
crm.v1.events.ContactCreated
crm.v2.events.ContactMerged
```

### 2️⃣ 能力版本控制（可选字段）

```yaml
capabilities:
  provides:
    - id: crm.contact.create
      version: v2
      deprecated: false
    - id: crm.contact.sync
      version: v1
      deprecated: true
```

宿主将根据版本号区分不同接口签名，并允许多版本并存。

---

## 🧩 十一、Marketplace 能力注册与搜索

Marketplace 端会为每个插件生成能力索引，用于：

- 插件互操作搜索；
- Agent 自动发现（选择哪个插件调用）；
- 安装前依赖检查。

字段示例：

```json
{
  "plugin_id": "com.powerx.plugin.crm",
  "capability": "crm.contact.create",
  "type": "api",
  "input_schema": "object",
  "output_schema": "object",
  "deprecated": false,
  "docs_url": "https://market.powerx.cloud/plugins/crm/contact/create"
}
```

---

## 🧱 十二、Capability 示例一览

| 插件         | 类型      | 提供能力                      | 消费能力                 |
| ---------- | ------- | ------------------------- | -------------------- |
| CRM        | API     | `crm.contact.*`           | `core.media.upload`  |
| E-Commerce | Event   | `ec.order.*`              | `crm.contact.lookup` |
| Marketing  | AI Tool | `agent.campaign.generate` | `crm.segment.list`   |
| DataForge  | Bridge  | `bridge.snowflake.query`  | `core.secret.fetch`  |

---

## 🧠 十三、最佳实践

- 每个插件至少应提供 1 个 `provides` 能力；
- 能力描述文件命名与 ID 一致；
- 尽量保持 action 粒度一致；
- 提供版本号以便未来兼容；
- 设计能力时优先考虑 **幂等性**；
- 为能力提供 JSON Schema；
- 对外暴露能力需在 RBAC 注册；
- 发布前应运行 `capability:validate` 测试脚本（可选）。

---

## 📚 延伸阅读

- [IO_Schema_and_Validation.md](./IO_Schema_and_Validation.md)
- [Backward_Compatibility_Strategy.md](./Backward_Compatibility_Strategy.md)
- [01_plugin_lifecycle/Manifest_and_Metadata.md](../01_plugin_lifecycle/Manifest_and_Metadata.md)
- [05_a2a_and_integrations/A2A_Enablement_for_Plugin.md](../05_a2a_and_integrations/A2A_Enablement_for_Plugin.md)

---

> **文档版本：** v1.0.0
> **适用范围：** PowerX ≥ 0.9.0
> **维护团队：** PluginBase 核心组
> **最后更新：** 2025-10
