# PowerX Plugin Marketplace

PowerX Plugin Marketplace 是 PowerX 生态的插件流通与商业化中枢，负责聚合插件供给、控制上下架流程、签发授权与收益结算，为 PowerX 底座（CoreX）与运营控制台（PowerX Admin）提供可信的插件目录与服务能力。

> 核心使命：让开发者专注构建插件，市场负责发布、分发、授权、计费与合规。

---

## 产品概览

- **供给端（Marketplace）**：为 Vendor 提供注册、插件上架、版本管理、定价与结算能力。
- **运行端（PowerX CoreX）**：负责插件运行、租户隔离、安全校验，并通过 Marketplace 获取合法插件与许可证。
- **运营端（PowerX Admin）**：提供安装、启停、License 管理与运营视图，面向平台运营人员。

三者协同形成插件发布 → 分发 → 安装 → 用量回报 → 收益结算的闭环。Marketplace 对外暴露标准化 API，同时维护 Vendor 资质、插件元数据、下载与 License 生命周期。

---

## 生命周期与角色

1. **Vendor 入驻**：在 Marketplace 完成注册、KYC 与结算账户绑定，获得 `vendor_id` 与开发者控制台。
2. **插件开发与打包**：遵循 `plugin.yaml`、Manifest 与 API 规范（参见 `docs/vendor/02_plugin_development`）。
3. **上架审核与发布**：提交版本、渠道（stable/beta 等）、发布说明；通过审核后进入公共目录。
4. **宿主安装与更新**：PowerX CoreX 拉取目录、申请签名下载链接、校验 SHA256 与 License，再在租户中启用。
5. **用量回传与结算**：宿主上报事件与计费数据，Marketplace 聚合后向 Vendor 清算（参见 `docs/vendor/05_finance_and_settlement`）。
6. **支持与合规**：通过政策体系管理停权、售后与安全事件（参见 `docs/vendor/07_support_and_policies`）。

---

## 系统组件

| 组件 | 说明 |
| ---- | ---- |
| `backend/` | Go 编写的 API-only 服务（`marketd`），提供插件目录、版本登记、签名下载、许可证签发等能力。详见 `backend/README.md`。 |
| `docs/` | 文档中心，包含 Vendor 指南、流程规范与设计背景（重点：`docs/vendor` 目录）。 |
| `web-admin/` | 预留的前端管理端目录，未来承载开发者门户及运营后台。 |

后端依赖 PostgreSQL（存储插件、版本、许可证、下载记录）与对象存储（S3/MinIO）托管 `.pxp` 包，并通过 RS256 JWT 许可证向宿主提供授权校验所需的公钥与 CRL。

---

## 关键能力

- **插件目录与版本管理**：按 `plugin_id`、渠道检索插件元信息，支持多版本并存与发布说明。
- **受控下载**：通过 `POST /v1/downloads` 发放短期签名 URL，保护对象存储资源不被直链访问。
- **License 生命周期**：签发 RS256 JWT 许可证，支持 CRL 吊销与离线授权；宿主在安装与巡检时强制校验。
- **License 模板/定价**：通过 `px license template|plan|instance` CLI 与 `/internal/licensing/*` API 管理模板、定价计划与许可证，支持开发者/教育渠道、续订提醒与对账导出。
- **Vendor 管理与合规**：KYC、资质审核、权限分层以及停权政策（见 `docs/vendor/01_onboarding` 与 `docs/vendor/07_support_and_policies`）。
- **计费与结算**：支持分成、对账、税务与多支付渠道扩展（详见 `docs/vendor/04_license_and_pricing` 与 `docs/vendor/05_finance_and_settlement`）。
- **PowerX 集成**：与 CoreX/CLI 对接 `marketplace://` 安装协议、兼容性校验、事件上报（参见 `docs/vendor/06_integration_with_powerx`）。

---

## 本地开发指引

1. **准备环境**

   ```bash
   cd backend
   cp .env.example .env
   docker compose up -d
   ```

   默认会启动 Postgres 与 MinIO，环境变量在 `.env` 中配置。

2. **数据库迁移**

   ```bash
   # 依据项目中的 goose / sql 脚本初始化数据库
   goose postgres "$DB_DSN" up
   ```

3. **启动服务**

   ```bash
   make run   # 或 go run ./cmd/marketd
   ```

   服务默认监听 `:8080`，OpenAPI 契约位于 `backend/api/`。

---

## 文档地图

- `docs/vendor/00_overview/README.md`：生态架构、角色职责与信任模型。
- `docs/vendor/01_onboarding/`：注册、KYC、Vendor Portal 与合规要求。
- `docs/vendor/02_plugin_development/`：插件结构、Capability、API、安全与测试指南。
- `docs/vendor/03_listing_and_lifecycle/`：上架流程、版本策略、灰度发布与下架操作。
- `docs/vendor/04_license_and_pricing/`：授权模型、计费方式、订阅与试用。
- `docs/vendor/05_finance_and_settlement/`：收益分配、结算周期、对账报表。
- `docs/vendor/06_integration_with_powerx/`：PowerX 宿主对接流程与 Manifest 规范。
- `docs/vendor/07_support_and_policies/`：售后、停权、申诉与客服体系。
- `docs/vendor/99_appendix/`：术语表、接口索引、变更日志。

如需了解插件打包格式，可参考 `docs/pxp插件压缩包.md`；发布与下载实操流程详见 `docs/发布和下载插件流程.md`。

---

## 路线图与延伸

- 开发者门户与市场运营后台（`web-admin/`）构建中，将提供图形化的上传、统计与推广工具。
- 支付集成与自动化 License 签发将连接 Stripe/支付宝等渠道，支撑多币种结算。
- 宿主 CLI (`px market`) 与灰度渠道（beta/canary）将逐步完善，实现滚动更新与兼容性检查。
- 审计、遥测与安全策略持续加强，确保跨租户访问与商业数据可追踪。

---

## 快速摘要

PowerX Plugin Marketplace 将 Marketplace（供给端）、PowerX CoreX（运行端）和 PowerX Admin（运营端）串联成可扩展、可审计的插件商业生态：开发者通过标准化流程上架插件，宿主安全地安装与校验，用量与收益回流，帮助 PowerX 平台实现规模化扩展与生态繁荣。
