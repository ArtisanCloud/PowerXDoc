
# 项目简介（Introduction）

> 本页目标：帮助你快速理解 **PowerX Plugin Base** 的设计初衷、定位与核心价值。  
> 读者对象：产品负责人 / 插件开发者 / 平台架构师。

---

## 一、项目定位

**PowerX Plugin Base** 是 PowerX 插件生态的**最小可运行模板工程（Minimal Viable Plugin Template）**。

它的目标是为所有 PowerX 插件（无论是官方还是第三方）提供一套：

- 🧱 **一致的结构规范**
- 🔄 **稳定的上下文协议**
- 🔐 **安全的多租户模型**
- 🤖 **与 Agent Hub 无缝集成的能力注册机制**

换言之，任何人只要复制本模板、替换业务模块，就能快速构建一个可上架的 PowerX 插件。

---

## 二、设计目标

| 维度 | 目标 | 实现机制 |
|------|------|----------|
| **多租户隔离** | 每个租户的数据隔离、安全可控 | Postgres Schema + RLS（Row Level Security） |
| **安全信任** | PowerX ↔ 插件之间安全传输 | HMAC/JWT 双模式签名上下文 |
| **生态统一** | 插件能力统一注册与展示 | Plugin Manager + Agent Hub |
| **零侵入集成** | 插件不依赖 PowerX 内核 | 独立 schema / 独立进程，PowerX 反代接入 |
| **前后端分离** | Web 管理端可选 | Nuxt 4 + PowerX 动态代理路径 |

---

## 三、系统边界与职责

| 模块 | 职责 |
|------|------|
| **PowerX Core** | 提供多租户、IAM、RBAC、反代、Agent Hub、Plugin Manager 等基础设施 |
| **PowerX Plugin Base** | 插件模板工程，负责实现业务逻辑、RBAC 上报、Agent 注册 |
| **Plugin Market** | 管理插件包版本、签名与分发 |
| **STS / JWKS** | 安全信任体系（短期凭据交换 / 公钥分发） |

---

## 四、主要特性

### 1. 租户与 Schema 双隔离

- 每个请求通过中间件提取租户上下文；
- 数据库侧强制 RLS 策略兜底；
- 插件复用宿主数据库实例，但使用独立 schema。

### 2. PowerX 安全上下文注入

- 支持两种签名模式：HMAC（开发期）与 JWT（生产期）；
- 宿主在启动插件时注入对应密钥或 JWKS URL；
- 插件通过中间件自动校验上下文合法性。

### 3. RBAC 与菜单自动上报

- 插件暴露 `/api/v1/admin/manifest` 与 `/api/v1/admin/rbac`；
- PowerX 拉取后与系统内建权限树合并；
- 插件无需实现角色管理界面。

### 4. Agent 能力注册

- 插件定义自身的 Agent、Tool、Workflow；
- 注册到平台统一的 Agent Hub；
- 可选在插件页面内嵌 `<AgentWidget />`。

### 5. 前端反代与统一路由

- PowerX 动态反代插件前后端：
  - `/_p/:id/admin/*` → 插件前端
  - `/_p/:id/api/*` → 插件后端
- 前端编译时自动识别该路径，确保生产一致性。

---

## 五、典型应用场景

| 场景 | 说明 |
|------|------|
| **CRM 插件** | 管理客户、联系人、线索、积分体系 |
| **E-commerce 插件** | 商品、订单、库存、结算模块 |
| **AI Agent 插件** | 调用自定义模型、注册工具、执行工作流 |
| **营销插件** | 生成活动计划、自动化投放、数据归因 |
| **内部扩展插件** | 内部系统对接、审批流、数据同步 |

---

## 层级结构版（逻辑更清晰）**

```text
┌────────────────────────────────────────────┐
│                PowerX 平台                 │
│────────────────────────────────────────────│
│                                            │
│  • PowerX Core        → 提供 IAM / RBAC / API / STS / JWKS              │
│  • Plugin Manager     → 扫描插件、反向代理、注入上下文                 │
│  • Agent Hub          → 统一注册 / 调度所有插件的智能体与工具          │
│                                            │
└──────────────┬─────────────────────────────┘
               │ 通过 JWT / HMAC 传递上下文（安全信任）
               ▼
┌────────────────────────────────────────────┐
│              PowerX Plugin（示例：Base）   │
│────────────────────────────────────────────│
│  • 独立进程（Gin + GORM + Postgres schema） │
│  • 暴露接口：                              │
│      - /api/v1/admin/manifest  → 菜单上报    │
│      - /api/v1/admin/rbac      → 权限上报    │
│      - /v1/...                  → 业务接口    │
│  • 可注册 Agent / Tools / Workflows          │
└────────────────────────────────────────────┘
```

> 流程概述：
>
> 1. Plugin Manager 发现插件并启动 → 注入上下文（JWT/HMAC）
> 2. PowerX 通过反代访问插件接口（`/_p/:id/api/...`）
> 3. 插件上报 manifest 与 rbac，合并到平台权限树
> 4. Agent Hub 统一呈现插件注册的智能体与工具

### 📘 推荐写法（用于替换文档中的那一段）

> **系统交互关系概览**
>
> ```text
> PowerX 平台
>   ├─ PowerX Core：IAM、RBAC、STS、JWKS、公钥管理
>   ├─ Plugin Manager：插件扫描、反代代理、上下文注入（JWT/HMAC）
>   └─ Agent Hub：统一注册与调度插件提供的 Agent/Tool/Workflow
>
> PowerX Plugin（Base 模板）
>   ├─ 独立运行进程（Gin + GORM）
>   ├─ 通过 Plugin Manager 接入宿主平台
>   ├─ 上报 manifest/rbac → 合并到宿主权限体系
>   └─ 注册 Agent 能力 → 在 Agent Hub 中展示与调用
> ```
>
> 数据流简述：
>
> 1. PowerX 启动时扫描插件 → 读取 `plugin.yaml` → 启动插件进程
> 2. PowerX 通过 JWT/HMAC 注入安全上下文（tenant、permissions、签名）
> 3. 插件暴露业务接口与管理接口
> 4. 插件主动/被动注册 RBAC、菜单、Agent 能力
> 5. Agent Hub 在平台端统一呈现所有插件智能体能力

---

## 七、文档导览

| 主题 | 内容 | 链接 |
|------|------|------|
| 快速运行插件 | 从环境到反代联调 | [Quick Start](./quick_start.md) |
| 架构总览 | 模块结构与交互流程 | [Architecture](./architecture.md) |
| 开发者指南 | 后端、前端、RLS 实现 | [Developer/Backend](../developer/backend.md) |
| 协议规范 | plugin.yaml、RBAC、Agent | [Contract/Plugin Spec](../contract/plugin_yaml_spec.md) |

---

## 下一步阅读

➡️ [系统架构总览](./architecture.md)
