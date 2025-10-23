# PowerXPluginBase 插件集成文档 · 概览（00_overview/README.md）

> 本文档为 **PowerX 插件开发者** 提供统一的集成与合规指引，确保所有插件在安装、运行、上架、合规、安全、运维等环节与 PowerX 主系统无缝衔接。

---

## 📘 文档目标与适用对象

**目标：**

- 定义 PowerX 插件开发、测试、部署、运行、下架的全生命周期规范。
- 指导开发者如何编写 `plugin.yaml` 清单、声明能力（Capability）、注册 Schema、使用 SDK。
- 建立与 PowerX 主系统在 gRPC、MCP、Agent、A2A 方向的交互契约。
- 统一 Marketplace 审核、品牌展示、版本发布与安全响应流程。

**适用对象：**

- 插件开发者（Backend/Frontend）
- 平台管理员与审核团队
- PowerX Marketplace 运营与合规人员
- DevOps / SRE 团队

---

## 🧩 插件生态在 PowerX 架构中的位置

PowerX 体系通过「**CoreX（内核） + PluginBase（插件基座） + PluginMarket（市场）」三层模型**实现业务扩展：

| 层级 | 组件 | 职责 | 示例 |
|------|------|------|------|
| CoreX | 内核服务 | 提供 IAM、RBAC、多租户、事件总线、媒资、Agent 等核心能力 | PowerX/Core |
| PluginBase | 插件基座 | 定义插件生命周期、schema、runtime 与安全标准 | com.powerx.plugin.base |
| Plugin | 业务插件 | 实现独立能力、业务逻辑或行业模块 | com.powerx.plugin.crm / com.powerx.plugin.ecommerce |
| Admin | 前端控制台 | 提供统一 UI（Nuxt 4 + Nuxt UI）与插件管理入口 | PowerXAdmin |

---

## 🏗️ 文档章节结构

| 章节 | 说明 | 样例文件 |
|------|------|-----------|
| **00_overview** | 基本概览与入驻流程 | README.md / Vendor_Onboarding.md |
| **01_plugin_lifecycle** | 插件创建、清单、版本、下架 | Create_and_Init_Project.md |
| **02_capabilities_and_schema** | 能力注册、Schema 校验、兼容策略 | Capability_Design_Guide.md |
| **03_runtime_and_ops** | 运行时环境、配额与日志追踪 | Runtime_Env_and_Ports.md |
| **04_security_and_compliance** | 插件安全、数据隐私、漏洞响应 | Plugin_Security_Checklist.md |
| **05_protocols_and_integrations** | 插件与 PowerX、第三方的交互 | A2A_Enablement_for_Plugin.md |
| **06_marketplace_and_business** | 上架、品牌、定价与报告 | Listing_and_Branding_Guide.md |
| **07_support_and_operations** | 运维与支持流程、SLA/SLO | Incident_Handling_for_Plugin.md |
| **08_dev_console_and_ui** | 插件控制台、审计与常见问题 | Plugin_Admin_Console_Guide.md |
| **99_appendix** | FAQ 与模板 | Templates/ |

---

## 🧠 关键术语

| 术语 | 含义 |
|------|------|
| **Plugin Manifest (`plugin.yaml`)** | 插件的元数据清单，包含名称、ID、依赖、能力、入口等信息。 |
| **Capability** | 插件暴露的能力接口，例如数据导出、事件消费、AI Agent 等。 |
| **Schema** | 插件的输入输出结构定义，用于 PowerX 校验兼容性。 |
| **MCP Session** | 插件通过 Model Context Protocol 与 PowerX 通信的标准会话。 |
| **ToolGrant** | PowerX 授权插件使用的工具或外部 API 范围（Scope）。 |
| **A2A** | Agent-to-Agent 通信，插件可注册自己的 Agent 工具供其他 Agent 使用。 |
| **Quotas & Costs** | 插件执行中资源配额与计费策略。 |

---

## ⚙️ 插件结构总览

典型插件目录（遵循 PowerXPluginBase 标准）：

```

com.powerx.plugin.example/
├── plugin.yaml                  # 插件清单（Manifest）
├── backend/
│   ├── main.go                  # 插件主服务入口
│   ├── go.mod / go.sum
│   └── internal/...
├── frontend/
│   └── dist/                    # 前端打包输出（Nuxt 4 / Nuxt UI）
├── migrations/
│   └── *.sql                    # 数据库迁移文件（每插件独立 schema）
├── docs/
│   └── integration/             # 当前文档体系
└── tests/
└── integration_test.go

````

---

## 🔗 与 PowerX 核心的关系

| 方向 | 调用方式 | 使用规范 |
|------|-----------|-----------|
| 插件 → PowerX | gRPC SDK (`PowerX/api/grpc/gen/go`) | 插件通过 PowerX 提供的 SDK 调用核心服务 |
| PowerX → 插件 | HTTP/gRPC/MCP | 内核动态注册并调用插件暴露的能力 |
| 插件 ↔ 插件 | EventBus / MCP | 通过注册的 Capability 或 Topic 进行事件分发与协作 |
| 插件 ↔ Admin | HTTP Static + Proxy | `/__up/_p/<plugin_id>/admin/` 路由代理插件前端界面 |

---

## ✅ 快速入门指引

1. **安装 PowerXPluginBase SDK**

   ```bash
   go get github.com/ArtisanCloud/PowerXPluginBase

````

2. **初始化插件**

   ```bash
   powerx plugin init com.powerx.plugin.example
   ```

3. **编辑 Manifest**

   ```yaml
   id: com.powerx.plugin.example
   name: Example Plugin
   version: 0.1.0
   provides:
     - data_export
   consumes:
     - crm.contact
   schema:
     db: example_schema
   ```

4. **启动本地调试**

   ```bash
   go run backend/main.go
   ```

5. **在 PowerX 主系统注册**

   ```bash
   powerxctl plugin register --manifest ./plugin.yaml
   ```

---

## 🔒 基本合规与安全要求（摘要）

* 每个插件必须运行在独立 Schema / Role 下。
* 禁止访问宿主文件系统路径（`/var/www/html/PowerX` 及子目录）。
* Redis / S3 访问需通过 PowerX 授权凭证 (`ToolGrant` 机制)。
* 前端入口仅允许通过代理路径暴露，不可直接部署在宿主域名根路径。
* 版本发布前需完成 `Plugin_Security_Checklist.md` 中所有检查项。

---

## 📚 延伸阅读

* [01_plugin_lifecycle/Create_and_Init_Project.md](../01_plugin_lifecycle/Create_and_Init_Project.md)
* [04_security_and_compliance/Plugin_Security_Checklist.md](../04_security_and_compliance/Plugin_Security_Checklist.md)
* [05_a2a_and_integrations/A2A_Enablement_for_Plugin.md](../05_a2a_and_integrations/A2A_Enablement_for_Plugin.md)
* [08_dev_console_and_ui/Plugin_Admin_Console_Guide.md](../08_dev_console_and_ui/Plugin_Admin_Console_Guide.md)

---

## 🧩 附录：文档维护

| 责任角色           | 内容                           |
| -------------- | ---------------------------- |
| 插件开发负责人        | 编写与更新对应章节内容                  |
| PowerX 内核团队    | 审核集成兼容性、Schema 变更、MCP 协议更新   |
| Marketplace 团队 | 审核品牌与上架文案                    |
| 安全与合规组         | 检查 Plugin Checklist 与数据隐私合规性 |

---

> **文档版本：** v1.0.0
> **适用内核版本：** PowerX ≥ 0.9.0
> **维护仓库：** `github.com/ArtisanCloud/PowerXPluginBase/docs/integration`
