# 插件输入输出 Schema 与验证规范（02_capabilities_and_schema/IO_Schema_and_Validation.md）

> 本文档定义 PowerX 插件的输入/输出结构（IO Schema）、验证方式、Schema 文件布局与版本演进策略。  
> 适用于所有基于 **PowerXPluginBase** 的插件（Go / Node / Rust / PHP 均通用）。

---

## 🧭 一、文档目标

- 统一插件输入输出（Input / Output）的定义格式；
- 建立插件能力的参数契约（JSON Schema + YAML 描述）；
- 确保插件之间、宿主与插件之间的调用可验证；
- 提供向前/向后兼容的 Schema 版本策略；
- 支持插件生成自动化 SDK、前端表单与文档。

---

## 🧩 二、IO Schema 的位置与文件结构

所有 Schema 文件应位于：

```

contracts/
├── capabilities/
│   ├── crm.contact.create.yaml
│   ├── crm.contact.list.yaml
│   └── ...
├── http.yaml
├── events.yaml
└── schema/
├── input/
│   ├── crm.contact.create.json
│   └── crm.contact.update.json
└── output/
├── crm.contact.create.json
└── crm.contact.update.json

```

> `contracts/capabilities/*.yaml`：用于注册到 manifest 中的能力声明。  
> `contracts/schema/input|output/`：独立的 JSON Schema 文件，用于强类型验证与 SDK 生成。

---

## 🧱 三、Schema 的通用结构

### 示例：能力描述文件（YAML）

```yaml
id: crm.contact.create
summary: 创建新的联系人
description: 通过 API 创建新的客户联系人并返回 ID。
version: v1
input_schema: ./schema/input/crm.contact.create.json
output_schema: ./schema/output/crm.contact.create.json
errors:
  - code: 409
    message: "Contact already exists"
rbac:
  permissions:
    - crm.contact.create
```

### 示例：输入 Schema（JSON）

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "ContactCreateInput",
  "type": "object",
  "required": ["name", "email"],
  "properties": {
    "name": { "type": "string", "description": "联系人姓名" },
    "email": { "type": "string", "format": "email" },
    "tags": {
      "type": "array",
      "items": { "type": "string" }
    },
    "source": { "type": "string", "enum": ["manual", "import", "form"] }
  }
}
```

### 示例：输出 Schema（JSON）

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "ContactCreateOutput",
  "type": "object",
  "required": ["id", "created_at"],
  "properties": {
    "id": { "type": "string", "description": "新建联系人 ID" },
    "created_at": { "type": "string", "format": "date-time" },
    "status": { "type": "string", "enum": ["created", "pending"] }
  }
}
```

---

## ⚙️ 四、宿主与插件的 Schema 验证流程

| 阶段           | 责任方            | 行为                                | 验证项            |
| ------------ | -------------- | --------------------------------- | -------------- |
| **安装时**      | PowerX 宿主      | 校验插件 manifest 中的所有 Schema 路径是否存在  | 路径有效性          |
| **运行时（请求前）** | 插件侧（后端）        | 对输入参数进行结构校验                       | JSON Schema 校验 |
| **运行时（返回前）** | 插件侧            | 校验输出结果                            | JSON Schema 校验 |
| **事件分发**     | PowerX 核心      | 校验事件 payload 是否匹配声明的 event schema | 类型与字段完整性       |
| **测试阶段**     | Developer / CI | 自动测试所有 capabilities 的输入输出匹配       | 合规性测试          |

---

## 🧩 五、插件侧的验证实现（Go 示例）

在 PowerXPluginBase 的 Go 后端中，建议使用 [gojsonschema](https://github.com/xeipuuv/gojsonschema) 或 [go-playground/validator](https://github.com/go-playground/validator)。

```go
package validation

import (
  "github.com/xeipuuv/gojsonschema"
)

func ValidateJSONSchema(schemaPath string, data interface{}) error {
  loader := gojsonschema.NewReferenceLoader("file://" + schemaPath)
  document := gojsonschema.NewGoLoader(data)
  result, err := gojsonschema.Validate(loader, document)
  if err != nil {
    return err
  }
  if !result.Valid() {
    for _, desc := range result.Errors() {
      return fmt.Errorf("schema validation failed: %s", desc)
    }
  }
  return nil
}
```

插件调用示例：

```go
err := validation.ValidateJSONSchema("./contracts/schema/input/crm.contact.create.json", reqBody)
if err != nil {
  return c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
}
```

---

## 🧰 六、Schema 版本与兼容性策略

| 类型                            | 描述                              | 版本处理                 | 示例          |
| ----------------------------- | ------------------------------- | -------------------- | ----------- |
| **向后兼容（Backward Compatible）** | 仅新增字段，不移除旧字段                    | MINOR +0.1           | `v1 → v1.1` |
| **破坏性变更（Breaking Change）**    | 修改类型或删除字段                       | MAJOR +1             | `v1 → v2`   |
| **扩展性（Extensible）**           | 允许 `additionalProperties: true` | 无需版本变更               |             |
| **字段弃用（Deprecated Field）**    | 保留字段但标记弃用                       | 加 `deprecated: true` |             |

### 示例

```json
{
  "type": "object",
  "properties": {
    "phone": { "type": "string", "deprecated": true },
    "mobile": { "type": "string" }
  }
}
```

宿主在解析时会：

- 对弃用字段发出警告；
- 在未来版本中自动移除。

---

## 🧩 七、Schema 与 Agent / LLM 的关系

PowerX 的 Agent 模块会自动解析每个 capability 的 Schema：

- Input → 参数推理提示（Prompt Injection）；
- Output → 结果结构化展示；
- Schema 描述字段将转化为 LLM tool definition；
- 插件可在 manifest 中注册 “tool-capability”：

```yaml
agent_tools:
  - name: contact_create
    capability: crm.contact.create
    description: "创建新的联系人"
    input_schema: ./contracts/schema/input/crm.contact.create.json
    output_schema: ./contracts/schema/output/crm.contact.create.json
```

这样，Agent 在执行任务编排时可自动注入插件能力作为 Tool。

---

## 🧩 八、Schema 校验的自动化测试

PowerXPluginBase 建议在 CI 阶段添加 Schema 检查：

示例 Makefile 目标：

```makefile
validate-schema:
 @echo "🧩 Validating JSON Schemas..."
 go run ./backend/cmd/tools/validate_schema.go
```

示例验证脚本：

```go
schemas := []string{
  "./contracts/schema/input/crm.contact.create.json",
  "./contracts/schema/output/crm.contact.create.json",
}
for _, path := range schemas {
  if err := validation.ValidateJSONSchema(path, sampleData[path]); err != nil {
    log.Fatalf("Schema %s validation failed: %v", path, err)
  }
}
```

---

## 🧩 九、Schema 兼容性检查（diff 工具）

版本升级前建议运行：

```bash
npx json-diff ./v1/schema/input.json ./v2/schema/input.json
```

确保：

- 新版字段未破坏旧逻辑；
- 必填字段未被删除；
- 类型未被改变；
- 保留 `deprecated: true` 以兼容旧客户端。

---

## 🧠 十、Schema 与 UI 自动渲染（配置页）

当插件 manifest 指定：

```yaml
config_schema: ./config.schema.json
```

PowerX Admin 会自动生成配置界面。
规则：

- type → 组件类型 (`string → input`, `boolean → switch`)
- enum → 下拉选项 (`USelect`)
- description → 表单提示
- default → 初始值

示例：

```json
{
  "type": "object",
  "properties": {
    "API_KEY": { "type": "string", "description": "第三方服务密钥" },
    "ENABLE_SYNC": { "type": "boolean", "default": true }
  }
}
```

生成的 UI（自动）：

| 字段          | 类型      | 控件      |
| ----------- | ------- | ------- |
| API_KEY     | string  | UInput  |
| ENABLE_SYNC | boolean | USwitch |

---

## 🧩 十一、常见错误与排查

| 问题             | 原因                        | 解决方法                  |
| -------------- | ------------------------- | --------------------- |
| ❌ Schema 路径不存在 | 文件未打包进 `.pxp`             | 检查 Makefile 打包路径      |
| ❌ 字段类型不匹配      | API 输入与 Schema 不一致        | 更新 Schema 或代码结构体      |
| ⚠️ 字段弃用但仍被使用   | 旧客户端未升级                   | 标注 deprecated 并提供迁移文档 |
| ❌ 校验库版本冲突      | gojsonschema 不兼容 Draft-07 | 固定 Schema 版本或切换库      |

---

## 🧩 十二、Schema 文件命名约定

| 类型 | 文件名规则                  | 示例                                  |
| -- | ---------------------- | ----------------------------------- |
| 输入 | `<capability_id>.json` | `crm.contact.create.json`           |
| 输出 | `<capability_id>.json` | `crm.contact.create.json`           |
| 配置 | `config.schema.json`   | 同 manifest 引用                       |
| 事件 | `<event_topic>.json`   | `crm.v1.events.ContactCreated.json` |

---

## 🧱 十三、Schema 版本管理与文档链接

- 每个 major 版本应有独立目录：

  ```
  contracts/v1/
  contracts/v2/
  ```

- 每个版本在 manifest 中引用对应路径；
- Marketplace 自动生成文档索引与版本切换链接：

  ```
  https://market.powerx.cloud/plugins/crm/v1/docs
  ```

---

## 📚 延伸阅读

- [Capability_Design_Guide.md](./Capability_Design_Guide.md)
- [Backward_Compatibility_Strategy.md](./Backward_Compatibility_Strategy.md)
- [03_runtime_and_ops/Logs_Metrics_and_Tracing.md](../03_runtime_and_ops/Logs_Metrics_and_Tracing.md)
- [08_dev_console_and_ui/Common_Tasks_and_Troubleshooting.md](../08_dev_console_and_ui/Common_Tasks_and_Troubleshooting.md)

---

> **文档版本：** v1.0.0
> **适用范围：** PowerX ≥ 0.9.0
> **维护团队：** PluginBase 核心组
> **最后更新：** 2025-10
