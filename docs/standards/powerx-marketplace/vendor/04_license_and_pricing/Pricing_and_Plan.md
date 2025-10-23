# 💰 Pricing & Plan 插件定价模型与套餐设计

> 本文档定义 **PowerX Plugin Marketplace** 中插件的定价模型、订阅方案、计费维度与展示规范。  
> 目标：帮助 Vendor 设计灵活、透明、可扩展的付费方案，  
> 满足多租户 SaaS 场景下的差异化需求。

---

## 🧱 1. 设计原则

| 原则 | 说明 |
|------|------|
| **灵活** | 支持订阅、分级、调用量、功能模块多种定价模式 |
| **透明** | 用户在购买前清晰看到价格与计费规则 |
| **自动化** | Marketplace 自动结算、自动续费 |
| **全球化** | 多币种支持（USD、CNY、JPY、EUR 等） |
| **可组合** | 主插件 + Add-on 组合定价 |
| **对齐 License** | 定价与授权类型一一对应 |

---

## 🧩 2. 定价模型总览

| 模型类型 | 英文名 | 收费周期 | 适用场景 |
|-----------|---------|-----------|-----------|
| 固定订阅价 | `flat_subscription` | 月 / 年 | 通用 SaaS 插件 |
| 分级套餐价 | `tiered_plan` | 月 / 年 | 功能分层或团队规模 |
| 按使用量计费 | `usage_based` | 实时计费 | AI / API / 算力插件 |
| 一次性付费 | `one_time` | 单次 | 工具类或离线功能 |
| 模块组合价 | `bundle` | 动态 | 多插件打包优惠 |
| 企业定制价 | `enterprise` | 合同价 | 白标 / 私有化部署 |

---

## 💳 3. 固定订阅价（Flat Subscription）

```yaml
pricing:
  model: flat_subscription
  plan: monthly
  price: 29.99
  currency: USD
  trial_days: 7
```

**特点：**

* 固定月费或年费；
* 自动续订；
* 最适合通用 SaaS 服务类插件；
* 支持免费试用期。

**示例：**

> `Data Forge Pro` — $29.99/月，含 5 个用户、20GB 存储。

---

## 🧱 4. 分级套餐价（Tiered Plan）

```yaml
pricing:
  model: tiered_plan
  tiers:
    - name: Starter
      price: 9.99
      limits:
        users: 3
        reports: 50
    - name: Growth
      price: 49.00
      limits:
        users: 20
        reports: 500
    - name: Enterprise
      price: 199.00
      limits:
        users: unlimited
        reports: unlimited
```

| 层级             | 示例价格   | 说明          |
| -------------- | ------ | ----------- |
| **Starter**    | 9.99/月 | 小团队入门       |
| **Growth**     | 49/月   | 成长型企业       |
| **Enterprise** | 199/月  | 高级用户，定制 SLA |

**优势：**

* 一份插件可服务不同规模客户；
* 可通过 API 动态调整价格；
* CoreX 自动识别当前 License Plan。

---

## ⚙️ 5. 按使用量计费（Usage-Based）

```yaml
pricing:
  model: usage_based
  metric: api_calls
  unit_price: 0.005
  free_quota: 10000
  billing_cycle: monthly
```

| 字段              | 说明                          |
| --------------- | --------------------------- |
| `metric`        | 计量维度，如：调用次数、token 数量、GB 存储量 |
| `unit_price`    | 单位计费价格                      |
| `free_quota`    | 免费额度                        |
| `billing_cycle` | 计费周期（月/年）                   |

> ✅ Marketplace 每日聚合使用数据 → 每月结算。
> CoreX 将调用事件上报至 `Usage_Report_API`（详见 `Usage_Report_and_Event_API.md`）。

---

## 💡 6. 一次性付费（One-Time Purchase）

```yaml
pricing:
  model: one_time
  price: 199.00
  updates_included_days: 365
```

**特点：**

* 一次付费终身使用；
* 可设置「含更新期」；
* 适用于单功能插件，如导出工具、模板包等。

---

## 🧩 7. 模块组合价（Bundle Pricing）

```yaml
pricing:
  model: bundle
  bundles:
    - name: "Analytics Suite"
      plugins:
        - com.vendor.analytics
        - com.vendor.visualizer
      discount_percent: 20
```

**说明：**

* 组合销售多个插件；
* 统一价格结算；
* Vendor 可定义折扣；
* Marketplace 自动拆分收益。

---

## 🏢 8. 企业定制价（Enterprise Contract）

```yaml
pricing:
  model: enterprise
  contact: sales@vendor.dev
  features:
    - Custom SLA
    - White-label branding
    - Private cloud deployment
```

**特点：**

* 不公开展示价格；
* 通过合约线下签署；
* 支持 Seat / API / Storage 限制；
* Marketplace 仅做 License 分发，不处理支付。

---

## 📦 9. 免费 + 增值混合模式（Freemium）

| 模块   | 功能                      | 授权           |
| ---- | ----------------------- | ------------ |
| 核心功能 | 基础分析、图表                 | Free         |
| 高级功能 | AI 报表、团队协作              | Subscription |
| 附加模块 | Data Sync、Report Export | Add-on       |

```yaml
pricing:
  model: freemium
  base: free
  addons:
    - name: AI Analytics
      price: 9.99
    - name: Team Collaboration
      price: 19.99
```

---

## 🧾 10. 显示与营销规范（Marketplace 展示）

Marketplace 会自动展示以下字段：

| 字段           | 显示位置      | 示例          |
| ------------ | --------- | ----------- |
| `price`      | 插件卡片      | `$29.99/月`  |
| `model`      | 插件详情页     | `订阅制（按月）`   |
| `trial_days` | 安装页提示     | `含 7 天试用`   |
| `currency`   | 价格标识      | `USD / CNY` |
| `discount`   | Banner 标识 | `限时 20% 优惠` |

> 🛒 所有价格均含 Marketplace 手续费；
> Vendor 实际收益在结算阶段计算（详见 `Revenue_Share_and_Payouts.md`）。

---

## 📈 11. 动态定价与多币种支持

Vendor 可通过 API 设置多币种价格：

```json
{
  "plugin_id": "com.vendor.analytics",
  "prices": [
    {"currency": "USD", "monthly": 29.99},
    {"currency": "CNY", "monthly": 198.00},
    {"currency": "JPY", "monthly": 3200}
  ]
}
```

Marketplace 自动根据用户地区显示本地化价格。

---

## ⚙️ 12. 试用与转化（Trial & Conversion）

| 阶段              | 说明          | 系统行为               |
| --------------- | ----------- | ------------------ |
| **Trial Start** | 用户点击安装（试用中） | CoreX 激活试用 License |
| **Trial End**   | 超过试用天数      | 插件锁定高级功能           |
| **Conversion**  | 用户订阅付费      | License 更新为正式版     |

> 推荐试用期 ≤ 14 天，防止滥用。

---

## 🧠 13. Marketplace 侧自动化规则

| 动作         | 说明                              |
| ---------- | ------------------------------- |
| License 到期 | 自动续费或发出邮件提醒                     |
| 汇率波动       | 每日更新多币种汇率                       |
| 折扣活动       | 支持时间段促销与优惠码                     |
| 版本升级       | 定价变更需重新审核                       |
| 收费接口       | Stripe / Alipay / Bank Transfer |

---

## 🧰 14. plugin.yaml 中的 pricing 定义

```yaml
pricing:
  model: tiered_plan
  currency: USD
  tiers:
    - name: Starter
      price: 9.99
      limits: {users: 3}
    - name: Growth
      price: 49.00
      limits: {users: 20}
```

Marketplace 将解析 `pricing` 节点生成展示卡片。

---

## 🪶 15. 最佳实践

| 场景             | 建议                     |
| -------------- | ---------------------- |
| **通用 SaaS 插件** | 使用 `flat_subscription` |
| **多功能模块**      | 使用 `tiered_plan`       |
| **AI/算力类插件**   | 使用 `usage_based`       |
| **工具类插件**      | 使用 `one_time`          |
| **组合销售**       | 使用 `bundle`            |
| **企业客户**       | 使用 `enterprise` 模型     |
| **早期推广**       | 提供 7–14 天免费试用          |
| **促销活动**       | 在 Marketplace 使用优惠码功能  |

---

## 📘 16. 关联文档

* 👉 [License Types 授权类型定义](./License_Types.md)
* 👉 [License Validation & Refresh 授权验证与续期机制](./License_Validation_and_Refresh.md)
* 👉 [Revenue Share & Payouts 收益分成与结算](../05_finance_and_settlement/Revenue_Share_and_Payouts.md)
* 👉 [Usage Report & Event API 使用事件上报接口](../06_integration_with_powerx/Usage_Report_and_Event_API.md)

---

> ✅ **总结一句话：**
> PowerX 的定价系统以 **灵活组合、自动续费、多币种支持、可编排套餐** 为核心，
> 帮助 Vendor 在 Marketplace 中实现真正的「插件即服务」商业化闭环。
