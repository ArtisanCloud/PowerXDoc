# ⚙️ Capability & API Design 插件能力与接口设计规范

> 本文档定义 PowerX 插件的 **能力声明（Capability）** 与 **接口设计规范（API / gRPC / MCP / Agent2Agent）**。  
> 所有插件在发布前必须遵循以下标准，以确保能被 PowerX CoreX 平台正确识别、注册与编排。

---

## 🧩 1. 能力（Capability）概念

在 PowerX 体系中，**Capability** 表示一个插件所“提供”或“消费”的功能单元。  
PowerX CoreX 在启动时会扫描所有插件的 `plugin.yaml`，读取其中的 capability 元信息，从而实现：

- 自动注册插件能力（Provides）  
- 自动生成 SDK 调用代理（Proxy）  
- 自动管理依赖（Consumes）  
- 支持插件间复用与编排（例如：Agent Flow、MCP Graph）

---

## 🧱 2. 能力声明结构（plugin.yaml 节选）

```yaml
capabilities:
  provides:
    - name: data-source
      type: api
      description: 提供统一数据源 API 接口
      endpoint: /api/v1/data-source
      methods: [GET, POST]
      protocol: http
    - name: data-chart
      type: ui
      description: 注册新的图表渲染组件
  consumes:
    - name: media-storage
      type: api
      version: ">=1.0.0"
      required: true
```

| 字段            | 类型     | 说明                                               |
| ------------- | ------ | ------------------------------------------------ |
| `name`        | string | 能力名称（唯一标识符）                                      |
| `type`        | enum   | 能力类型：`api`、`ui`、`event`、`agent`、`tool`、`storage` |
| `description` | string | 能力说明                                             |
| `endpoint`    | string | HTTP / gRPC 接口地址                                 |
| `protocol`    | enum   | `http`、`grpc`、`mcp`、`agent`                      |
| `methods`     | array  | HTTP 方法（若为 http 协议）                              |
| `required`    | bool   | 对于 consumes 表示是否强依赖                              |
| `version`     | string | 能力版本号                                            |
| `category`    | string | 可选，能力所属分类（如：Data、AI、Commerce）                    |

---

## 🔌 3. 能力类型定义

| 类型          | 说明                               | 示例                     |
| ----------- | -------------------------------- | ---------------------- |
| **api**     | 提供 HTTP/gRPC 接口能力                | `/api/v1/media/upload` |
| **ui**      | 在 PowerX Admin 注册 UI 模块          | 注册图表组件、Dashboard 页面    |
| **event**   | 发布或监听事件总线 Topic                  | `media.asset.uploaded` |
| **agent**   | 提供智能体调用的工具接口                     | AI 插件 / LLM Agent      |
| **tool**    | 可供其他插件引用的工具模块                    | 例如「OCR Tool」           |
| **storage** | 存储/缓存能力（通常依赖 PowerX Storage SDK） | local/s3/redis         |

---

## 🧠 4. API 接口设计规范（HTTP）

### 4.1 命名与路径约定

- 插件的所有 HTTP 接口应遵循统一前缀：

  ```text
  /_p/{plugin_id}/api/{version}/{resource}
  ```

  示例：

  ```text
  /_p/com.vendor.data_forge/api/v1/data-source
  ```

- 插件内部定义时，只需使用相对路径：

  ```go
  router.GET("/api/v1/data-source", handler.ListSources)
  ```

  CoreX 启动时会自动代理到：

  ```
  /_p/com.vendor.data_forge/api/v1/data-source
  ```

### 4.2 HTTP 接口规范

| 要素    | 要求                              |
| ----- | ------------------------------- |
| 协议    | HTTPS / JSON                    |
| 编码    | UTF-8                           |
| 认证    | Bearer Token（由 PowerX CoreX 注入） |
| 错误返回  | JSON 结构化格式                      |
| 日志规范  | 必须输出 trace_id / plugin_id       |
| 限流与超时 | CoreX 自动注入，可通过 manifest 调整      |

#### 示例：标准 REST 响应

```json
{
  "success": true,
  "data": {
    "items": [],
    "total": 0
  },
  "error": null,
  "trace_id": "px-2a40df..."
}
```

#### 示例：错误响应

```json
{
  "success": false,
  "error": {
    "code": "INVALID_ARGUMENT",
    "message": "Missing required parameter: source_id"
  },
  "trace_id": "px-abc..."
}
```

---

## 🔗 5. gRPC 接口规范（高级插件）

某些插件（如 AI 推理、Agent Tool、数据集服务）可通过 gRPC 暴露接口。

### 5.1 规范要求

- 必须使用 PowerX gRPC SDK（`github.com/PowerX/api/grpc/gen/go`）
- 禁止自定义 proto 编译路径（由 SDK 统一管理）
- 支持 **reflect** 调试模式，但发布时必须关闭

### 5.2 proto 示例

```proto
syntax = "proto3";

package powerx.plugins.dataforge.v1;

service DataSource {
  rpc ListSources (ListSourcesRequest) returns (ListSourcesResponse);
}

message ListSourcesRequest {
  string tenant_id = 1;
}

message ListSourcesResponse {
  repeated string sources = 1;
}
```

在 `plugin.yaml` 中注册：

```yaml
capabilities:
  provides:
    - name: data-source
      type: api
      protocol: grpc
      endpoint: powerx.plugins.dataforge.v1.DataSource
```

---

## 🧩 6. MCP / Agent 能力规范（AI 插件）

PowerX 允许插件通过 **MCP（Model Control Protocol）** 或 **Agent Tool** 暴露智能体能力。

### 6.1 MCP Server 模式

```yaml
capabilities:
  provides:
    - name: sentiment-analyzer
      type: agent
      protocol: mcp
      endpoint: /mcp/sentiment
      description: 提供文本情感分析的 LLM Agent 能力
```

MCP 请求示例：

```json
{
  "intent": "analyze_text",
  "input": {
    "text": "PowerX is awesome!"
  }
}
```

返回：

```json
{
  "output": {
    "sentiment": "positive",
    "confidence": 0.97
  }
}
```

### 6.2 Agent Tool 模式

插件可注册一个工具供 PowerX Agent 调用：

```yaml
capabilities:
  provides:
    - name: ai.ocr
      type: tool
      protocol: agent
      endpoint: /agent/ocr
      description: 提供 OCR 文本识别能力
```

> PowerX Agent Manager 会自动注册此能力到工具目录（Tool Registry），
> 可在 Agent Flow / Blueprint 中引用。

---

## 🧰 7. 能力依赖与编排（Consumes）

插件可以声明其依赖的其他插件或系统能力：

```yaml
capabilities:
  consumes:
    - name: media-storage
      type: api
      required: true
      version: ">=1.0.0"
    - name: crm-account
      type: api
      required: false
```

CoreX 启动时：

1. 检查依赖插件是否已启用；
2. 建立调用代理；
3. 若 required 能力缺失，则安装失败；
4. 若 optional 能力缺失，则仅记录 warning。

---

## 🧱 8. 能力版本与兼容性

| 策略         | 说明                                   |
| ---------- | ------------------------------------ |
| **SemVer** | 插件与能力版本均采用语义化版本号                     |
| **向下兼容要求** | `minor` 升级必须保持 API 兼容性               |
| **重大变更**   | `major` 版本需更新 Manifest 并重新审核         |
| **能力弃用**   | 使用 `deprecated: true` 标记，并在文档中说明替代方案 |

示例：

```yaml
capabilities:
  provides:
    - name: data-source
      type: api
      version: "2.0.0"
      deprecated: true
      replaced_by: data-connector
```

---

## 🧾 9. 插件 API 文档建议结构

在 `docs/API_Reference.md` 中建议包含以下章节：

```
# API Reference
- Overview
- Authentication
- Endpoints
  - /api/v1/...
- Request / Response Schema
- Error Codes
- Usage Examples
```

> 建议使用 OpenAPI 3.1 或 gRPC Reflection 自动生成接口文档。

---

## 🪶 10. 最佳实践

| 类别            | 建议                                              |
| ------------- | ----------------------------------------------- |
| **能力命名**      | 用 kebab-case，如 `media-storage`, `ai-translator` |
| **路径规范**      | 使用 `/api/v1/...` 版本前缀                           |
| **权限控制**      | 每个能力应对应 RBAC 权限资源                               |
| **日志审计**      | 输出 `tenant_id`, `plugin_id`, `trace_id`         |
| **安全隔离**      | 不得跨租户访问 PowerX 内核数据                             |
| **限流控制**      | 高频 API 必须通过 CoreX RateLimiter 注册                |
| **Schema 统一** | 数据模型统一使用 JSON Schema 1.0                        |

---

## 📘 11. 下一步阅读

- 👉 [Testing & Sandbox 测试与沙盒指南](./Testing_and_Sandbox.md)
- 👉 [Submission & Review 插件上架审核流程](../03_listing_and_lifecycle/Submission_and_Review.md)
- 👉 [PowerX Plugin Manifest 对接规范](../06_integration_with_powerx/PowerX_Plugin_Manifest.md)

---

> ✅ **总结一句话：**
> Capability 是 PowerX 插件的「能力声明接口」。
> 只有遵循统一协议、路径与权限规范的能力，才能被 CoreX 调用与多插件协作编排。
