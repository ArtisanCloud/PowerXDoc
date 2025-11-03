# CRM 客户关系管理场景文档

本文档展示 PowerX CRM 插件的完整业务场景，采用「类别 → 主用例 → 子用例」的三层结构。

## 业务类别

### 👤 客户与线索管理（Customer & Lead Management）

#### 线索与档案
- **[线索捕获与去重](./customer-management/lead-capture-deduplication/primary.md)** - Web表单收集、重复校验、智能合并
- **[客户档案与分层](./customer-management/customer-profile-segmentation/primary.md)** - 企业信息管理、客户等级、画像标签
- **[客户生命周期管理](./customer-management/customer-lifecycle-management/primary.md)** - 状态跟踪、跃迁管理、预流失预警

### 💼 销售流程与商机（Sales Pipeline & Opportunity）

#### 商机管理
- **[商机创建与推进](./sales-process/opportunity-creation-progression/primary.md)** - 线索转化、跟进计划、概率评估
- **[报价与合同管理](./sales-process/quoting-contract-management/primary.md)** - 产品报价、折扣计算、合同审批
- **[销售活动与节奏](./sales-process/sales-activities-cadence/primary.md)** - 拜访计划、节奏协同、部门协作

### 💬 沟通与协同（Communication & Collaboration）

#### 全渠道沟通
- **[全渠道沟通记录](./communication-collaboration/omnichannel-communication-logging/primary.md)** - 通话录音、邮件同步、纪要结构化
- **[任务与节奏协同](./communication-collaboration/task-cadence-collaboration/primary.md)** - 任务分配、跨部门协作、提醒机制
- **[渠道与伙伴协作](./communication-collaboration/channel-partner-collaboration/primary.md)** - 伙伴门户、业绩报表、培训支持

### 🎯 客户服务与成功（Customer Service & Success）

#### 客户成功管理
- **[工单处理与 SLA](./customer-success/case-management-sla/primary.md)** - 工单流转、响应时限、知识库复用
- **[客户成功与续约](./customer-success/customer-success-renewal/primary.md)** - 健康度仪表板、续约管理、Upsell机会
- **[服务交付与项目协同](./customer-success/service-delivery-project-coordination/primary.md)** - 项目管理、里程碑、客户确认

### 🎁 会员与忠诚度（Membership & Loyalty）

#### 会员运营
- **[会员权益与会籍](./membership-loyalty/membership-tiers-entitlements/primary.md)** - 等级门槛、权益包、升级通知
- **[积分运营与激励](./membership-loyalty/loyalty-points-incentives/primary.md)** - 积分累计、余额校验、有效期管理
- **[会员营销与关怀](./membership-loyalty/membership-engagement-nurture/primary.md)** - 定向活动、节日关怀、专属方案

### 🚀 营销自动化（Marketing Automation）

#### 营销引擎
- **[线索培育](./marketing-automation/lead-nurturing/primary.md)** - 多阶段培育旅程、动态触点、自动化流程
- **[营销活动编排](./marketing-automation/campaign-orchestration-management/primary.md)** - 可视化编排、跨渠道活动、预算控制
- **[内容与渠道触达](./marketing-automation/content-channel-outreach/primary.md)** - 邮件模板、社交媒体、排程发布
- **[线索评分与分配](./marketing-automation/lead-scoring-assignment/primary.md)** - 热度分计算、自动指派、权重调整
- **[测试与转化优化](./marketing-automation/testing-conversion-optimization/primary.md)** - A/B测试、流量分流、显著性计算

### 📊 数据洞察与营收预测（Analytics & Revenue Intelligence）

#### 智能分析
- **[销售预测与目标管理](./analytics-revenue-intelligence/sales-forecasting-target-management/primary.md)** - 目标拆解、预测曲线、偏差调整
- **[客户价值与流失分析](./analytics-revenue-intelligence/customer-value-churn-analysis/primary.md)** - 客户分层、早期预警、改进计划
- **[绩效与激励结算](./analytics-revenue-intelligence/performance-incentive-settlement/primary.md)** - 业绩统计、佣金计算、排行榜

### ⚙️ 系统配置与生态集成（Admin & Integration）

#### 平台管理
- **[权限与合规控制](./admin-integration/access-control-compliance/primary.md)** - 临时账号、数据脱敏、审计日志
- **[流程与自动化编排](./admin-integration/workflow-automation-orchestration/primary.md)** - 可视化编排器、审批流程、重试机制
- **[生态系统与数据同步](./admin-integration/ecosystem-data-synchronization/primary.md)** - 标签同步、ERP对接、API网关
