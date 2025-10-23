# 📚 Glossary 术语表（Vendor / Plugin / Marketplace / PowerX）

> 本文档定义 PowerX Plugin Marketplace 生态中的核心术语、缩写与角色关系。  
> 适用于所有 Vendor、Plugin 开发者、Marketplace 审核人员与 PowerX 管理员。  
> 通过统一的命名与定义，保证跨团队、跨服务、跨文档的语义一致性。

---

## 🧩 1. 核心角色与主体

| 名称 | 英文名 / 缩写 | 定义 |
|------|----------------|------|
| **Vendor** | Vendor | 插件开发者 / 供应商；在 Marketplace 注册、提交插件并维护支持服务。 |
| **Tenant** | Tenant | PowerX 平台的最终租户（企业/团队用户），安装与使用插件的主体。 |
| **User / Member** | User / Member | 属于 Tenant 的具体使用者，受 IAM & RBAC 控制。 |
| **PowerX CoreX** | CoreX | PowerX 的系统内核层，提供插件运行时、权限、安全、事件、租户隔离等基础服务。 |
| **PowerX Admin** | Admin | 平台运营与审计后台，用于管理 Vendor、Plugin、License 与 Marketplace 数据。 |
| **Marketplace** | PowerX Plugin Marketplace | 插件市场服务，负责插件上架、审核、结算、分成与合规治理。 |
| **Plugin** | Plugin | 由 Vendor 开发并注册至 Marketplace 的功能模块，可安装至 CoreX 并被 Tenant 使用。 |

---

## 🧠 2. 插件结构与元数据

| 名称 | 英文名 / 缩写 | 定义 |
|------|----------------|------|
| **Plugin Manifest** | `plugin.yaml` / Manifest | 插件的元数据定义文件，包含 ID、版本、依赖、能力、权限与 vendor_id 等。 |
| **Capability** | Capability | 插件对外暴露的功能能力，例如 API、事件、任务、Agent Tool 等。 |
| **Schema** | Schema | 插件在 CoreX 中定义的数据结构或数据库 Schema，用于多租户隔离。 |
| **Contract** | Contract | 插件间通信协议（gRPC / REST / MCP / Event），定义调用规则与输入输出模型。 |
| **Compatibility** | Compatibility | 插件与 PowerX 核心或其他插件之间的版本兼容性规则。 |

---

## ⚙️ 3. 运行时与生命周期

| 名称 | 英文名 / 缩写 | 定义 |
|------|----------------|------|
| **Plugin Runtime** | Runtime | 插件在 CoreX 宿主内的执行环境，包含初始化、加载、配置、调用周期。 |
| **Plugin Lifecycle** | Lifecycle | 插件的整个生命周期：开发 → 上架 → 安装 → 运行 → 更新 → 下架。 |
| **Plugin Sandbox** | Sandbox | 插件隔离执行的测试与调试环境，不影响生产租户。 |
| **Event Bus** | Event Bus | CoreX 内核的事件总线系统，用于插件间异步通信与订阅。 |
| **Flow Engine** | Flow | CoreX 内置的可编排工作流引擎，插件可注册节点参与执行链。 |
| **Audit Log** | Audit | 所有操作、调用与安全事件的统一审计日志系统。 |

---

## 🔐 4. 安全与授权

| 名称 | 英文名 / 缩写 | 定义 |
|------|----------------|------|
| **License** | License | 插件的使用授权凭证，决定租户是否可使用、使用范围与配额。 |
| **License Server** | License Server | 管理 License 颁发、验证与续期的服务，可内嵌 Marketplace 或独立部署。 |
| **License Validation** | License Verification | CoreX 与 Marketplace 的双向校验机制，确保授权合法。 |
| **Signature / Signing** | 签名 / 验签 | 插件或 License 通过非对称加密方式签名，保证来源与完整性。 |
| **RBAC** | Role-Based Access Control | 角色权限模型，控制插件访问 Tenant 数据的边界。 |
| **DataScope** | 数据作用域 | 限定不同角色在插件中可访问的数据范围。 |

---

## 💰 5. 商业化与财务结算

| 名称 | 英文名 / 缩写 | 定义 |
|------|----------------|------|
| **Pricing Plan** | Pricing / Plan | 插件定价模型，如按月订阅、按调用量计费、按功能模块增值。 |
| **Revenue Share** | Revenue Share | PowerX Marketplace 与 Vendor 之间的分成机制。 |
| **Payout** | Payout | Vendor 的收益提现与结算。 |
| **Invoice** | Invoice | Vendor 或租户的发票数据。 |
| **Tax Compliance** | 税务合规 | Vendor 必须遵守的国家或地区税务申报规范。 |
| **Usage Report** | Usage Report | 插件的使用量统计与计费依据。 |
| **Event API** | Usage & Event API | 插件向 Marketplace 上报调用与事件数据的接口。 |

---

## 🧩 6. 审核、合规与支持

| 名称 | 英文名 / 缩写 | 定义 |
|------|----------------|------|
| **Review Process** | 审核流程 | 插件上架前的技术与合规性评审。 |
| **Compliance Log** | 合规日志 | 记录违规、停权、申诉等事件的审计数据库。 |
| **Suspension** | 停权 | 插件被暂时禁止运行或上架的状态。 |
| **Ban / Blacklist** | 封禁 / 黑名单 | 永久禁止的插件或 Vendor ID。 |
| **Appeal** | Appeal | Vendor 对处罚或停权结果发起的申诉流程。 |
| **Reinstatement** | 恢复 | 插件或 Vendor 通过复审后重新上架与激活。 |
| **Ticketing System** | 工单系统 | 统一的技术支持与问题追踪通道。 |
| **SLA** | Service Level Agreement | 服务等级协议，约定响应与修复时间。 |

---

## 🧠 7. 开发与集成

| 名称 | 英文名 / 缩写 | 定义 |
|------|----------------|------|
| **PowerX SDK** | SDK | 插件开发套件，封装 API、事件、License 与配置工具。 |
| **Makefile Tools** | Makefile | 标准化 CLI 命令模板，用于构建、调试、测试与发布。 |
| **CI/CD Pipeline** | CI/CD | 插件持续集成与自动化部署流程。 |
| **Plugin API Gateway** | API Gateway | CoreX 为插件暴露的统一 API 入口。 |
| **Capability Contract** | 能力契约 | 插件声明的接口规范，供 Marketplace 校验与文档生成。 |
| **Testing Sandbox** | Sandbox Env | 独立测试环境，模拟真实租户调用。 |

---

## 🧭 8. 数据与事件模型

| 名称 | 英文名 / 缩写 | 定义 |
|------|----------------|------|
| **Tenant ID** | 租户标识 | CoreX 多租户系统中的唯一识别码。 |
| **Vendor ID** | 开发者标识 | Marketplace 中 Vendor 的唯一识别符。 |
| **Plugin ID** | 插件标识 | 通常为反向域名，如 `com.vendor.analytics`。 |
| **License ID** | 授权标识 | 每个租户的唯一授权凭证。 |
| **Event ID** | 事件标识 | 记录 Marketplace 或 CoreX 中的事件编号。 |
| **Trace ID** | 调用追踪 ID | 调试与审计中用于关联日志。 |
| **Usage Metric** | 使用指标 | 调用次数、Token 数、存储量等度量值。 |

---

## 🧾 9. 常见文件与配置约定

| 文件 | 定义 |
|------|------|
| `plugin.yaml` | 插件元数据定义文件（Manifest） |
| `Makefile` | 插件构建与测试命令集 |
| `.env` | 环境变量配置文件 |
| `Dockerfile` | 插件容器镜像定义 |
| `manifest.lock` | 插件依赖与版本锁定文件 |
| `README.md` | 插件说明文档 |
| `LICENSE` | 授权协议文本 |
| `CHANGELOG.md` | 插件更新日志 |

---

## 🧩 10. 缩写索引

| 缩写 | 含义 |
|------|------|
| API | Application Programming Interface |
| SDK | Software Development Kit |
| RBAC | Role-Based Access Control |
| SLA | Service Level Agreement |
| CI/CD | Continuous Integration / Continuous Deployment |
| IAM | Identity and Access Management |
| MCP | Model Context Protocol |
| gRPC | Google Remote Procedure Call |
| YAML | Yet Another Markup Language |
| JSON | JavaScript Object Notation |

---

## 🪶 11. 延伸阅读

- 👉 [PowerX Plugin Manifest 结构规范](../06_integration_with_powerx/PowerX_Plugin_Manifest.md)
- 👉 [License API & Verification 授权验证机制](../06_integration_with_powerx/License_API_and_Verification.md)
- 👉 [Policy Suspension & Ban 停权机制](../07_support_and_policies/Policy_Suspension_and_Ban.md)
- 👉 [Security & Validation 安全审查机制](../02_plugin_development/Security_and_Validation.md)
- 👉 [Usage Report & Event API 使用与事件上报接口](../06_integration_with_powerx/Usage_Report_and_Event_API.md)

---

> ✅ **总结一句话：**  
> PowerX Marketplace 的生态体系通过统一术语、统一契约、统一审计，  
> 确保「平台、开发者、租户」三方在同一语义层协作与信任。

```
