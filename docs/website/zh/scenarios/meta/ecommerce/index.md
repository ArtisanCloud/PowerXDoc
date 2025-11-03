# 电商业务场景文档

本文档集合展示了电商平台的完整业务场景，采用「类别 → 主用例 → 子用例」的三层结构。

## 业务类别

### 🛒 购物车与结算 (Cart & Checkout)

- **[购物车管理](./cart_checkout/cart_management/primary.md)** - 商品添加、修改、数量调整
- **[结算与支付准备](./cart_checkout/checkout_payment_preparation/primary.md)** - 地址选择、优惠券、支付方式

### 📦 订单履约 (Order Fulfillment)

- **[订单创建与跟踪](./order_fulfillment/order_creation_tracking/primary.md)** - 订单号生成、支付链接、状态跟踪
- **[配送与物流](./order_fulfillment/shipping_logistics/primary.md)** - 物流选择、配送跟踪
- **[门店自提与本地配送](./order_fulfillment/store_pickup_local_delivery/primary.md)** - O2O 场景

### 💰 定价与促销 (Pricing & Promotion)

- **[价格策略](./pricing_promotion/price_strategy/primary.md)** - 动态定价、阶梯价格
- **[活动折扣](./pricing_promotion/campaign_discount/primary.md)** - 限时折扣、满减活动
- **[订阅计费](./pricing_promotion/subscription_billing/primary.md)** - 定期付费、续费管理

### 📚 商品与内容 (Catalog & Content)

- **[实物商品](./catalog_and_content/physical_goods/primary.md)** - SKU 管理、库存展示
- **[数字订阅商品](./catalog_and_content/digital_subscription_goods/primary.md)** - 在线服务、会员权益
- **[内容资产管理](./catalog_and_content/content_assets_management/primary.md)** - 图片、视频、文档
- **[捆绑商品](./catalog_and_content/bundled_goods/primary.md)** - 套餐销售、组合优惠

### 📊 数据分析 (Data Analytics)

- **[运营仪表盘](./data_analytics/operational_dashboard/primary.md)** - 销售数据、用户行为
- **[用户与商品分析](./data_analytics/user_product_analytics/primary.md)** - 个性化推荐、用户画像

### 🏪 渠道与门店 (Channels & Stores)

- **[全渠道体验](./channels_stores/omni_channel_experience/primary.md)** - 线上线下融合
- **[多渠道同步](./channels_stores/multi_channel_sync/primary.md)** - 库存同步、订单统一
- **[门店履约与自提](./channels_stores/store_fulfillment_pickup/primary.md)** - 门店操作

### 🎯 会员与营销 (Membership & Marketing)

- **[会员成长与权益](./membership_marketing/membership_growth_benefits/primary.md)** - 会员等级、积分体系
- **[营销自动化](./membership_marketing/marketing_automation/primary.md)** - 精准推送、自动化运营
- **[积分商城与价值](./membership_marketing/points_store_value/primary.md)** - 积分兑换、虚拟商品

### 💳 支付与账单 (Payment & Billing)

- **[多支付渠道](./payment_billing/multi_payment_channels/primary.md)** - 支付宝、微信、银行卡
- **[订阅账单与发票](./payment_billing/subscription_billing_invoices/primary.md)** - 定期扣费、电子发票

### 🏭 库存与仓储 (Inventory & Warehouse)

- **[库存管理](./inventory_warehouse/inventory_management/primary.md)** - 库存监控、补货提醒
- **[盘点与调拨](./inventory_warehouse/stocktaking_transfer/primary.md)** - 库存盘点、仓库调拨

### 💼 财务结算 (Finance Settlement)

- **[对账](./finance_settlement/reconciliation/primary.md)** - 自动对账、异常处理
- **[开票与税务](./finance_settlement/invoicing_tax/primary.md)** - 发票管理、税务合规

### ⚙️ 平台运营 (Platform Ops)

- **[配置与权限](./platform_ops/config_permissions/primary.md)** - 平台配置、用户权限
- **[日志与调度](./platform_ops/logging_scheduling/primary.md)** - 任务调度、日志监控

### 🚨 风险与合规 (Risk & Compliance)

- **[交易风险](./risk_compliance/transaction_risk/primary.md)** - 欺诈检测、风险控制
- **[隐私合规](./risk_compliance/privacy_compliance/primary.md)** - 数据保护、GDPR 合规

### 🛎️ 售后服务 (After Sales & Customer Service)

- **[支持工单处理](./after_sales_customer_service/support_ticket_handling/primary.md)** - 客服系统、工单流转
- **[RMA 退换货](./after_sales_customer_service/rma_returns_refunds/primary.md)** - 退货流程、退款处理
- **[数字订阅退订与权利恢复](./after_sales_customer_service/digital_unsubscribe_rights_recovery/primary.md)** - 订阅取消、权益回收
