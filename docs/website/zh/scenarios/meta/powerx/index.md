# PowerX 平台场景文档

本文档集合展示了 PowerX 智能体平台的完整业务场景，涵盖智能体编排、插件生态、核心平台等核心能力。

## 平台模块

### 🤖 智能体与自动化 (Agent & Automation)

#### 知识与推理 (Knowledge & Reasoning)
- **[知识空间构建](./agent-and-automation/knowledge-and-reasoning/knowledge-space-build/primary.md)** - 知识库创建、知识图谱构建
- **[知识更新与反馈](./agent-and-automation/knowledge-and-reasoning/knowledge-update-and-feedback/primary.md)** - 持续学习、反馈优化
- **[智能问答与推理](./agent-and-automation/knowledge-and-reasoning/intelligent-qa-and-reasoning/primary.md)** - AI 问答、逻辑推理

#### 智能体编排 (Agent Orchestration)
- **[智能体注册与管理](./agent-and-automation/agent-orchestration/agent-registration-and-management/primary.md)** - 智能体生命周期管理
- **[智能体任务执行](./agent-and-automation/agent-orchestration/agent-task-execution/primary.md)** - 任务分发、执行监控
- **[React 智能体编排](./agent-and-automation/agent-orchestration/react-agent-orchestration/primary.md)** - 动态编排、反应式执行
- **[工作流编排](./agent-and-automation/agent-orchestration/workflow-orchestration/primary.md)** - 复杂流程自动化

### 🔧 核心平台 (Core Platform)

#### 身份认证与权限 (IAM & RBAC)
- **[登录与认证](./core-platform/iam-rbac/login-and-auth/primary.md)** - SSO、MFA、Token 认证
- **[多租户与组织](./core-platform/iam-rbac/mul-tenant-and-org/primary.md)** - 组织架构、租户隔离
- **[用户与角色](./core-platform/iam-rbac/user-and-role/primary.md)** - 角色管理、权限控制

#### 系统运行与运维 (Runtime & Ops)
- **[插件安装与运维](./core-platform/runtime-ops/plugin-install-and-ops/primary.md)** - 插件启停、生命周期管理
- **[系统监控与告警](./core-platform/runtime-ops/system-monitoring-and-alerting/primary.md)** - 性能监控、告警通知
- **[事件与任务流管理](./core-platform/runtime-ops/event-and-taskflow-management/primary.md)** - 事件驱动、任务编排

### 🛒 市场与业务 (Marketplace & Business)

#### 市场运营 (Marketplace Operations)
- **[计费与结算](./marketplace-and-business/marketplace-operations/billing-and-settlement/primary.md)** - 交易计费、财务结算
- **[插件上架与销售](./marketplace-and-business/marketplace-operations/plugin-listing-and-sales/primary.md)** - 插件发布、销售管理
- **[商家入驻与审核](./marketplace-and-business/marketplace-operations/vendor-onboarding-and-review/primary.md)** - 商家入驻、资质审核

### 🔌 插件生态 (Plugin Ecosystem)

#### 集成与连接 (Integration & Connectivity)
- **[插件调用宿主](./plugin-ecosystem/integration-and-connectivity/plugin-call-host/primary.md)** - 插件向宿主发起调用
- **[宿主调用插件](./plugin-ecosystem/integration-and-connectivity/host-call-plugin/primary.md)** - 宿主向插件发起调用
- **[插件间通信](./plugin-ecosystem/integration-and-connectivity/plugin-to-plugin-communication/primary.md)** - 插件互调机制
- **[插件能力注册与暴露](./plugin-ecosystem/integration-and-connectivity/plugin-capability-registration-and-exposure/primary.md)** - 能力治理与暴露

#### 安全与合规 (Security & Compliance)
- **[插件签名与验证](./plugin-ecosystem/security-and-compliance/plugin-signing-and-verification/primary.md)** - 数字签名、安全验证
- **[许可管理](./plugin-ecosystem/security-and-compliance/license-management/primary.md)** - 许可证管理、授权控制
- **[权限与访问控制](./plugin-ecosystem/security-and-compliance/permission-and-access-control/primary.md)** - 细粒度权限控制

#### 插件生命周期 (Plugin Lifecycle)
- **[插件创建与初始化](./plugin-ecosystem/plugin-lifecycle/plugin-create-and-init/primary.md)** - 插件工程初始化
- **[插件版本与兼容性](./plugin-ecosystem/plugin-lifecycle/plugin-version-and-compatibility/primary.md)** - 版本管理、兼容性检测
- **[插件开发与调试](./plugin-ecosystem/plugin-lifecycle/plugin-dev-and-debug/primary.md)** - 本地调试、错误诊断
- **[插件发布与上架](./plugin-ecosystem/plugin-lifecycle/plugin-publish-and-release/primary.md)** - 发布流程、Marketplace 上架

### 🎯 Web 管理与小程序 (Admin Web & MiniApp)

#### Web 管理后台 (Web Admin)
- **[管理导航与权限控制](./admin-web-miniapp/web-admin/admin-navigation-and-permission-control/primary.md)** - 管理员导航、权限隔离
- **[开发者调试与工具](./admin-web-miniapp/web-admin/developer-debugging-and-tools/primary.md)** - 调试工具、性能分析

#### Web 小程序 (Web MiniApp)
- **[业务插件前端交互](./admin-web-miniapp/web-miniapp/business-plugin-frontend-interaction/primary.md)** - 前端插件交互
- **[用户与会话中心](./admin-web-miniapp/web-miniapp/user-and-session-center/primary.md)** - 用户管理、会话控制
- **[智能体交互界面](./admin-web-miniapp/web-miniapp/agent-interaction-interface/primary.md)** - 智能体 UI 交互
