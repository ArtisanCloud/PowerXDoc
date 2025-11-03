# SCRM 社交化客户关系管理场景文档

PowerX SCRM 覆盖社交触点、客群运营、智能分析等 14 个业务域，下方目录按照“业务域 → 主用例”罗列详细场景，点击即可查看完整流程、角色和指标。

## 业务类别

### 🛡️ 社交触点接入与账号治理（Social Channel Onboarding & Governance）

- **[企业微信账号与权限管理](./social_channel_governance/wecom_account_permission_management/primary.md)** - 统一账号体系、精细化权限、合规模块化
- **[多渠道统一接入](./social_channel_governance/unified_social_channel_access/primary.md)** - 快速接入、统一监控、数据归因

### 🔗 系统集成与数据流转（System Integration & Data Orchestration）

- **[CRM 与 SCRM 双向同步](./system_integration_data_orchestration/crm_scrm_bidirectional_sync/primary.md)** - 单一客户视图、实时协同、质量保障
- **[订单与履约事件推送](./system_integration_data_orchestration/order_fulfillment_event_relay/primary.md)** - 客户体验一致、内部协同顺畅、风险可控
- **[会员等级与权益同步](./system_integration_data_orchestration/membership_entitlement_sync/primary.md)** - 状态一致性、权益闭环、精准触达
- **[库存与推荐联动](./system_integration_data_orchestration/inventory_recommendation_orchestration/primary.md)** - 实时预警、高效消化库存、区域差异化

### 🎯 线索获取与智能分配（Lead Capture & Smart Assignment）

- **[社交线索捕获与去重](./lead_capture_smart_assignment/social_lead_capture_deduplication/primary.md)** - 多入口接入、精准去重、结构化归档
- **[线索分配与接待策略](./lead_capture_smart_assignment/lead_routing_reception_strategy/primary.md)** - 智能派单、SLA 管控、负载均衡

### 👥 社群与客户运营（Community & Customer Engagement）

- **[客户群运营与画像沉淀](./community_customer_engagement/customer_group_operations_profiling/primary.md)** - 高效建群、实时画像、活跃管理
- **[社交客户生命周期管理](./community_customer_engagement/social_customer_lifecycle_management/primary.md)** - 阶段识别、旅程编排、风险预警

### 🏷️ 智能标签与客户分群（Smart Tagging & Customer Segmentation）

- **[标签自动化运营](./smart_tagging_customer_segmentation/automated_tagging_scoring/primary.md)** - 自动打标、标签治理、评分体系
- **[智能分群与人群洞察](./smart_tagging_customer_segmentation/dynamic_segmentation_rfm_insights/primary.md)** - 动态分群、多场景应用、洞察分析
- **[标签冲突与权重治理](./smart_tagging_customer_segmentation/tag_conflict_weight_governance/primary.md)** - 冲突识别、优先级策略、审批与留痕
- **[标签驱动的业务应用](./smart_tagging_customer_segmentation/tag_driven_activation/primary.md)** - 精准触达、销售辅助、服务优先级

### 📣 内容分发与互动自动化（Content Distribution & Engagement Automation）

- **[企微素材中心与内容编排](./content_engagement_automation/wecom_content_hub_campaign_orchestration/primary.md)** - 素材统一管理、活动编排、自动执行
- **[机器人互动与消息自动化](./content_engagement_automation/chatbot_interaction_messaging_automation/primary.md)** - 自动响应、智能分流、营销辅助

### 🛒 社交交易与分销闭环（Social Commerce & Distribution）

- **[企微小程序商城下单](./social_commerce_distribution/wecom_mini_program_commerce/primary.md)** - 无缝下单、订单同步、佣金与激励
- **[群内支付与优惠核销](./social_commerce_distribution/group_payment_coupon_redemption/primary.md)** - 即时支付、优惠管理、进度透明
- **[私域个性化推荐](./social_commerce_distribution/personalized_social_commerce_recommendations/primary.md)** - 精准推荐、多触达形式、自动化执行
- **[社交分销与合伙人](./social_commerce_distribution/social_affiliate_partner_selling/primary.md)** - 合伙人管理、裂变追踪、激励结算

### 🤝 社交销售助手与外勤协同（Social Selling Assistant & Field Collaboration）

- **[销售触达与跟进节奏](./social_selling_field_collab/social_selling_cadence/primary.md)** - 节奏模板、提醒闭环、绩效可视化
- **[客群裂变与活动执行](./social_selling_field_collab/social_referral_campaign_execution/primary.md)** - 高效策划、精准追踪、激励闭环

### 🛎️ 客户服务与协同闭环（Customer Service & Collaboration Loop）

- **[企微客服接待与工单同步](./customer_service_collaboration_loop/wecom_service_desk_ticket_sync/primary.md)** - 自动建单、协同闭环、知识沉淀
- **[客户成功与运营协作](./customer_service_collaboration_loop/cs_ops_collaboration/primary.md)** - 统一视图、协同任务、报告触达

### 📊 数据分析与洞察（Analytics & Insights）

- **[社交触点数据看板](./analytics_insights/social_touchpoint_dashboard/primary.md)** - 全局视角、实时预警、多维分析
- **[客户画像与行为洞察](./analytics_insights/customer_profile_behavioral_insights/primary.md)** - 全量画像、行为分析、洞察报告

### 📱 移动前线能力（Mobile Frontline Capabilities）

- **[拜访打卡与轨迹管理](./mobile_frontline_capabilities/location_checkin_visit_tracking/primary.md)** - 真实记录、任务协同、复盘改进
- **[语音转写与要点提炼](./mobile_frontline_capabilities/voice_to_text_insight_extraction/primary.md)** - 实时转写、要点提炼、知识沉淀
- **[离线消息与提醒](./mobile_frontline_capabilities/offline_messaging_alerts/primary.md)** - 消息可靠性、提醒机制、优先级管理
- **[移动审批与扫码作业](./mobile_frontline_capabilities/mobile_approval_code_operations/primary.md)** - 随时审批、扫码作业、流程透明

### 🤖 AIGC 与智能化应用（AIGC-driven Automation & Intelligence）

- **[智能触达推荐](./aigc_automation_intelligence/ai_driven_outreach_recommendation/primary.md)** - 智能策略、效率提升、持续学习
- **[智能对话质检](./aigc_automation_intelligence/ai_conversation_quality_assurance/primary.md)** - 高覆盖质检、多维评分、整改闭环
- **[AI 陪练与话术优化](./aigc_automation_intelligence/ai_coaching_playbook_enhancement/primary.md)** - 场景模拟、即时反馈、知识沉淀
- **[内容生成与素材提效](./aigc_automation_intelligence/generative_content_acceleration/primary.md)** - 快速生成、品牌一致、高效审批

### 🧩 平台生态与开放能力（Platform Ecosystem & Extensibility）

- **[开放平台与插件生态](./platform_ecosystem_extensibility/open_platform_plugin_marketplace/primary.md)** - 开放能力、安全审批、租户安装
- **[数据中台与 API 输出](./platform_ecosystem_extensibility/data_hub_external_apis/primary.md)** - 统一数据模型、灵活输出、权限与安全
- **[工作流编排与自动化](./platform_ecosystem_extensibility/workflow_orchestration_automation/primary.md)** - 低代码编排、跨系统协同、监控与补偿
- **[统一身份与私有化部署](./platform_ecosystem_extensibility/unified_sso_private_deployment/primary.md)** - 统一登录体验、安全增强、私有化控制

### ⚖️ 合规、安全与风控（Compliance, Security & Risk Control）

- **[聊天内容合规与留痕](./compliance_security_risk_control/conversation_compliance_archiving/primary.md)** - 实时监控、全量留痕、审计便捷
- **[账号安全与风控预警](./compliance_security_risk_control/account_security_risk_alerts/primary.md)** - 行为监控、风险预警、响应闭环

---

> 返回 [业务场景总览](/zh/scenarios/meta/) 或继续探索其他业务域。
