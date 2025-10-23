# 📊 Invoicing & Reports 发票、报表与财务对账规范

> 本文档定义 **PowerX Plugin Marketplace** 的发票生成、收益报表、对账接口与自动化财务导出机制。  
> 目标：为 Vendor、财务与审计人员提供**统一、可追踪、合规**的账务视图。

---

## 🧱 1. 设计目标

| 目标 | 说明 |
|------|------|
| **统一格式** | 所有结算与发票采用标准化数据结构 |
| **自动生成** | 平台自动周期生成报表，无需人工导出 |
| **多格式导出** | 支持 CSV / PDF / JSON |
| **可对账** | 每笔收入可追踪到订单与 License |
| **合规留存** | 符合税务留存与审计要求（≥7 年） |

---

## 🧩 2. 财务报表体系总览

```mermaid
flowchart TD
    A[Order Transaction] -->|生成| B[Revenue Record]
    B -->|聚合| C[Settlement Report]
    C -->|导出| D[Vendor Portal]
    D -->|下载/查询| E[Invoice & Tax Report]
````

| 报表类型                          | 说明         | 周期     |
| ----------------------------- | ---------- | ------ |
| **交易明细（Transaction Report）**  | 每笔订单级流水    | 实时     |
| **收益结算报表（Settlement Report）** | 月度/季度分润明细  | 每月 1 日 |
| **发票明细（Invoice Report）**      | 已开具发票信息    | 每月     |
| **税务报表（Tax Report）**          | 预扣税/VAT 汇总 | 每季度    |

---

## 📈 3. 报表文件结构定义

### 3.1 Settlement Report (`settlement_YYYY-MM.csv`)

| 字段                | 示例                     | 说明     |
| ----------------- | ---------------------- | ------ |
| `revenue_id`      | `rev_20251013_00092`   | 收益流水号  |
| `vendor_id`       | `vnd_0021`             | 厂商标识   |
| `plugin_id`       | `com.vendor.analytics` | 插件标识   |
| `order_id`        | `ord_9f3a2b`           | 对应订单号  |
| `gross_amount`    | `49.99`                | 含税金额   |
| `platform_fee`    | `4.99`                 | 平台分成   |
| `tax_withheld`    | `1.00`                 | 扣缴税额   |
| `net_revenue`     | `44.00`                | 实际入账金额 |
| `currency`        | `USD`                  | 币种     |
| `settlement_date` | `2025-10-13`           | 结算日期   |
| `status`          | `completed`            | 结算状态   |

### 3.2 Transaction Report (`transactions_YYYY-MM.csv`)

| 字段               | 示例                     | 说明    |
| ---------------- | ---------------------- | ----- |
| `transaction_id` | `txn_1023_9882`        | 交易流水号 |
| `plugin_id`      | `com.vendor.analytics` | 插件标识  |
| `tenant_id`      | `t-932b`               | 客户租户  |
| `license_type`   | `subscription`         | 授权类型  |
| `payment_method` | `stripe`               | 支付方式  |
| `amount`         | `29.99`                | 订单金额  |
| `timestamp`      | `2025-10-12T22:40:00Z` | 支付时间  |

---

## 🧾 4. 发票生成与下载（Invoice System）

### 4.1 发票生成逻辑

| 发票类型                | 触发时机    | 开具主体        | 收件方               |
| ------------------- | ------- | ----------- | ----------------- |
| **平台服务费发票**         | 每次分润结算时 | Marketplace | Vendor            |
| **客户购买发票**          | 每笔订单成功时 | Marketplace | Tenant            |
| **Vendor 自开发票（可选）** | 企业客户要求  | Vendor      | Enterprise Tenant |

### 4.2 发票生成接口

```
POST /api/v1/vendor/invoices/generate
```

**Request:**

```json
{
  "vendor_id": "vnd_0021",
  "period": "2025-09",
  "type": "settlement"
}
```

**Response:**

```json
{
  "invoice_id": "inv_202509_0012",
  "file_url": "https://marketplace.powerx.dev/storage/invoices/inv_202509_0012.pdf",
  "status": "issued"
}
```

> 系统自动在 1 日结算时批量生成 PDF 并上传至 Vendor Portal。

---

## 💼 5. 发票模板（Invoice Template）

```text
PowerX Marketplace Ltd.
Invoice #: INV-2025-09-0012
Date: 2025-10-01
Vendor: Shenzhen AI Cloud Ltd.
Country: CN
Currency: USD

------------------------------------------------------
Item                      Amount     Tax      Total
------------------------------------------------------
Subscription Revenue       49.99     5.00     54.99
Platform Fee (10%)         -4.99
Tax Withheld (CN, 6%)      -3.00
------------------------------------------------------
Net Payable                           →        47.00
------------------------------------------------------

Payment Method: Stripe
Settlement Date: 2025-10-03
```

> 所有金额均精确到两位小数；汇率以交易日为准。

---

## 📚 6. 财务 API（Vendor 自动化对接）

### 6.1 获取结算报表

```
GET /api/v1/vendor/settlements?month=2025-09
```

**Response:**

```json
{
  "vendor_id": "vnd_0021",
  "month": "2025-09",
  "currency": "USD",
  "total_gross": 1049.90,
  "total_fee": 104.99,
  "total_tax": 20.00,
  "total_net": 924.91,
  "items": [...]
}
```

### 6.2 获取发票文件

```
GET /api/v1/vendor/invoices/{invoice_id}
```

### 6.3 获取税务报表

```
GET /api/v1/vendor/tax/reports?quarter=Q3_2025
```

---

## 📈 7. 报表周期与自动化任务

| 报表类型               | 生成周期   | 存储路径                             | 可下载期限 |
| ------------------ | ------ | -------------------------------- | ----- |
| Settlement Report  | 每月 1 日 | `/storage/reports/settlement/`   | 7 年   |
| Transaction Report | 实时累积   | `/storage/reports/transactions/` | 3 年   |
| Invoice PDF        | 每月     | `/storage/invoices/`             | 永久    |
| Tax Report         | 每季度    | `/storage/reports/tax/`          | 7 年   |

---

## ⚙️ 8. 对账与异常检测（Reconciliation & Audit）

### 自动对账逻辑

1️⃣ 系统每日对比：

* Marketplace 订单记录；
* 第三方支付网关（Stripe / Alipay）；
* Revenue Record 表；
  2️⃣ 若金额或状态不一致 → 标记为 `reconcile_required`；
  3️⃣ 生成差异报告 `reconciliation_YYYY-MM.csv`。

**差异项示例：**

| Order ID   | 系统金额  | 网关金额    | 状态                 |
| ---------- | ----- | ------- | ------------------ |
| `ord_8823` | 49.99 | 49.00   | mismatch           |
| `ord_8832` | 19.99 | missing | missing_in_gateway |

---

## 🧮 9. 报表存储与保留策略

| 文件类型                         | 存储介质         | 加密方式           | 保留年限 |
| ---------------------------- | ------------ | -------------- | ---- |
| Settlement / Transaction CSV | S3 / OSS     | AES-256        | 7 年  |
| Invoice PDF                  | S3 / OSS     | AES-256        | 10 年 |
| Tax Report                   | Internal DB  | AES-256 + RBAC | 10 年 |
| Reconciliation Logs          | Cold Storage | ZIP + AES      | 7 年  |

---

## 🧰 10. Makefile 辅助命令（本地调试）

```makefile
# 下载月度结算报表
report-month:
 curl -s -o reports/settlement_$(MONTH).csv \
  "https://marketplace.powerx.dev/api/v1/vendor/settlements?month=$(MONTH)" \
  -H "Authorization: Bearer $(API_TOKEN)"

# 导出发票 PDF
invoice:
 curl -s -L -o invoices/invoice_$(MONTH).pdf \
  "https://marketplace.powerx.dev/api/v1/vendor/invoices/generate?month=$(MONTH)" \
  -H "Authorization: Bearer $(API_TOKEN)"
```

---

## 🔒 11. 安全与合规控制

| 项目         | 控制策略                     |
| ---------- | ------------------------ |
| **访问控制**   | 所有财务接口需 Vendor Token 鉴权  |
| **下载权限**   | 支持按角色分配（Owner / Finance） |
| **加密传输**   | 所有报表下载使用 HTTPS           |
| **敏感信息脱敏** | 发票仅显示 Vendor ID，不显示银行账号  |
| **审计日志**   | 所有下载与访问行为入审计表            |

---

## 🧠 12. 财务 Portal 展示视图（前端规范）

| 页面       | 功能                 | 数据源                      |
| -------- | ------------------ | ------------------------ |
| **收入总览** | 展示当前月收入、增长率、分成比例   | `/vendor/settlements`    |
| **发票管理** | 下载历史发票、导出 CSV      | `/vendor/invoices`       |
| **税务中心** | 查看 VAT / GST / 预扣税 | `/vendor/tax`            |
| **对账中心** | 查看支付通道状态与差异        | `/vendor/reconciliation` |

> 所有 Portal 页面通过 GraphQL Gateway 统一接入 API。

---

## 🧮 13. 报表与审计事件流（Event Bus）

PowerX Marketplace 将关键报表事件推送到事件总线：

| 事件名                           | 描述     |
| ----------------------------- | ------ |
| `finance.report.generated`    | 新报表生成  |
| `finance.invoice.issued`      | 发票已开具  |
| `finance.revenue.discrepancy` | 对账差异检测 |
| `finance.tax.reported`        | 税务申报完成 |
| `finance.audit.requested`     | 审计任务启动 |

> 这些事件可由内部审计或第三方 ERP 系统订阅。

---

## 🪶 14. 最佳实践

| 场景            | 建议                         |
| ------------- | -------------------------- |
| **跨国 Vendor** | 启用多币种汇率对账                  |
| **财务团队接入**    | 使用 API 自动化报表拉取             |
| **季度审计**      | 每季度导出全部 Settlement CSV     |
| **异常检测**      | 定期检查 Reconciliation Report |
| **发票归档**      | 保留本地副本 + 云备份               |
| **权限管理**      | 将报表访问限制于 Finance Role      |

---

## 📘 15. 关联文档

* 👉 [Revenue Share & Payouts 分成与结算机制](./Revenue_Share_and_Payouts.md)
* 👉 [Tax & Compliance 税务与合规政策](./Tax_and_Compliance.md)
* 👉 [Vendor Portal Profile 资料与控制台](../01_onboarding/Vendor_Profile_and_Portal.md)
* 👉 [License Validation & Refresh 授权续期与验证机制](../04_license_and_pricing/License_Validation_and_Refresh.md)

---

> ✅ **总结一句话：**
> PowerX Marketplace 的报表体系以 **标准化结构 + 自动化生成 + 多格式导出 + 审计留痕** 为核心，
> 让财务流转、税务合规与收益对账都做到「自动、透明、可验证」。
