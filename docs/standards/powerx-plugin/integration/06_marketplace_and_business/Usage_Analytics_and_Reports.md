# 使用分析与报表规范（06_marketplace_and_business/Usage_Analytics_and_Reports.md）

> 本文档定义 PowerX 插件在运行时如何**采集、上报、分析与可视化**使用数据，  
> 用于计费、监控、优化与 Marketplace 商业数据分析。  
>
> 它连接 License 计费系统、PowerX Analytics Pipeline 与 Vendor Dashboard。

---

## 🧭 一、目标与范围

- 提供标准化的插件使用数据结构；
- 实现宿主与插件间的数据上报协议；
- 支持实时与离线两类分析；
- 为 License 计量计费与 Marketplace Dashboard 提供输入；
- 确保数据安全、脱敏与租户隔离。

---

## 🧱 二、架构概览

```

┌───────────────────────────────┐
│ PowerX Plugin Instance        │
│ ├─ 采集 Metrics               │
│ ├─ 本地缓存与聚合             │
│ ├─ 调用 Usage Report API      │
└──────────────┬────────────────┘
│
▼
┌───────────────────────────────┐
│ PowerX Core Metrics Gateway   │
│ ├─ 验签与去重                 │
│ ├─ 写入 Message Queue         │
│ └─ 异步同步至 License Server  │
└──────────────┬────────────────┘
│
▼
┌───────────────────────────────┐
│ PowerX Marketplace Analytics  │
│ ├─ License 用量聚合           │
│ ├─ 订阅报表生成               │
│ ├─ Vendor Dashboard 展示       │
│ └─ 分润与结算分析             │
└───────────────────────────────┘

```

---

## 🧩 三、上报模型（Usage Envelope）

### 示例 JSON Payload

```json
{
  "plugin_id": "com.powerx.plugin.crm",
  "tenant_id": "tenant_abc",
  "license_id": "lic_123",
  "version": "1.3.2",
  "metrics": {
    "api.calls": 124,
    "contacts.created": 42,
    "emails.sent": 17
  },
  "period_start": "2025-10-13T00:00:00Z",
  "period_end": "2025-10-13T01:00:00Z",
  "trace_id": "c94aab8a-1a9b-4d4b",
  "signature": "ed25519:abcd123"
}
```

---

## ⚙️ 四、插件侧上报机制

PowerXPluginBase 提供标准 SDK：

```go
import "powerx.io/sdk/usage"

func recordUsage() {
  usage.Report(map[string]int{
      "api.calls": 1,
      "contacts.created": 0,
  })
}
```

SDK 内部特性：

- 自动缓存与批量上报；
- 断网时持久化至本地；
- 自动附带 license_id 与 tenant_id；
- 签名与 ToolGrant 认证。

---

## 🔄 五、上报接口（宿主侧）

```bash
POST /api/v1/usage/report
Content-Type: application/json
Authorization: Bearer <ToolGrant>

{
  "plugin_id": "...",
  "metrics": {...},
  "license_id": "...",
  "timestamp": "..."
}
```

宿主返回：

```json
{
  "status": "accepted",
  "trace_id": "c94aab8a..."
}
```

宿主会将数据：

- 写入 Metrics Queue；
- 异步同步至 License Server；
- 聚合后同步给 Marketplace。

---

## 📊 六、计量指标定义（Metrics Dictionary）

| 类别     | 指标名                  | 类型      | 说明                 |
| ------ | -------------------- | ------- | ------------------ |
| API 调用 | `api.calls`          | counter | 所有 API 请求次数        |
| 数据创建   | `contacts.created`   | counter | 创建记录数量             |
| AI 生成  | `ai.tasks.completed` | counter | 智能体任务完成数           |
| 存储使用   | `storage.bytes`      | gauge   | 使用的存储空间（字节）        |
| 带宽流量   | `network.bytes`      | gauge   | 外部调用带宽             |
| 活跃用户   | `active.users`       | gauge   | 最近 7 天活跃用户数        |
| 出站事件   | `events.sent`        | counter | Webhook 或 A2A 消息数量 |

> 每个插件可自定义 metrics，但需注册到 manifest：

```yaml
metrics:
  - key: api.calls
    type: counter
    description: "API 调用次数"
  - key: storage.bytes
    type: gauge
    description: "存储空间使用量"
```

---

## 🧮 七、聚合与分级分析

Marketplace 会按照以下维度聚合数据：

| 维度            | 示例                   |
| ------------- | -------------------- |
| 租户（tenant_id） | tenant_abc           |
| 插件版本          | 1.3.2                |
| 价格计划（plan_id） | pro                  |
| 时间窗口          | 每小时 / 每天 / 每月        |
| 区域（region）    | cn / ap-sg / us-east |
| License 状态    | active / expired     |

聚合结果会驱动：

- 计量计费（Usage-Based Billing）；
- 报表可视化；
- 功能优化建议。

---

## 📈 八、Vendor Dashboard 报表

PowerX Marketplace 为 Vendor 提供使用分析报表：

| 模块             | 指标         | 示例                        |
| -------------- | ---------- | ------------------------- |
| **概览**         | 总安装量、活跃租户数 | 3,421 租户                  |
| **调用分析**       | 每天调用量曲线    | 12.3k 调用/日                |
| **版本分布**       | 各版本占比      | v1.2 30%，v1.3 70%         |
| **地域分布**       | 租户区域       | CN 40%, SG 30%, EU 20%    |
| **License 收入** | 每计划收入趋势    | ¥12,980/月                 |
| **用量趋势**       | 按功能点统计     | `api.calls` vs `ai.tasks` |
| **异常预警**       | 超额/异常下降提醒  | usage deviation detected  |

可导出为：

- CSV / JSON；
- 自动推送日报（Email / Webhook）。

---

## 🧠 九、Tenant 端使用报表

Tenant（租户）也能查看自身插件使用统计：

| 模块         | 示例                       |
| ---------- | ------------------------ |
| License 状态 | Active / Trial / Expired |
| 计划         | Pro (¥1999/年)            |
| 调用量        | 12,492 API 调用/月          |
| 存储         | 482 MB 使用中               |
| 费用预估       | ¥249.20                  |
| 剩余额度       | 75%                      |
| 续费入口       | [立即续订]                   |

---

## 🧩 十、数据隐私与合规

所有上报与分析均需遵循 PowerX 安全与隐私规范：

| 控制点   | 要求               |
| ----- | ---------------- |
| 数据脱敏  | 不上报用户 PII        |
| 传输加密  | HTTPS / gRPC-TLS |
| 存储加密  | AES256 at rest   |
| 多租户隔离 | 按 tenant_id 分区   |
| 数据保留  | 默认 180 天         |
| 审计日志  | 记录所有上报事件         |
| 用户同意  | 租户同意后方可采集扩展指标    |

---

## 🧾 十一、异常与告警机制

宿主与 Marketplace 都会监测以下异常事件：

| 事件                       | 说明           |
| ------------------------ | ------------ |
| `usage.report.failed`    | 插件上报失败       |
| `usage.report.rejected`  | 签名或 Token 无效 |
| `usage.spike.detected`   | 使用量突增        |
| `usage.drop.detected`    | 使用量骤降        |
| `license.quota.exceeded` | 超出授权额度       |

事件将触发：

- Webhook 通知；
- Vendor Dashboard 告警；
- 自动暂停使用（严重情况）。

---

## 🧩 十二、插件侧最佳实践

| 建议         | 说明                         |
| ---------- | -------------------------- |
| 批量上报       | 将小量事件聚合后统一提交               |
| 定期上传       | 默认每小时一次                    |
| 避免敏感数据     | 不上报 PII 或明文内容              |
| 签名验证       | 使用 License Key 或 ToolGrant |
| 上报重试       | 遇到网络失败重试 3 次               |
| 缓冲模式       | 断网时临时缓存至本地                 |
| Metrics 版本 | 为每个指标定义 schema_version     |

---

## 🧮 十三、与 License 的关系

| 模型                | 说明                                  |
| ----------------- | ----------------------------------- |
| **License-Based** | Subscription / One-Time 模型，控制功能开关   |
| **Usage-Based**   | 根据上报 metrics 计费                     |
| **Hybrid**        | 结合 License + Usage，例如「基础订阅 + 额外调用量」 |

计量公式：

```
total_cost = base_price + (usage[metric] * price_per_unit)
```

---

## 📈 十四、报表输出与 API 接口

### Marketplace 报表接口

```bash
GET /api/v1/analytics/plugin/{plugin_id}?period=month
Authorization: Bearer <Vendor-Token>
```

响应：

```json
{
  "plugin_id": "com.powerx.plugin.crm",
  "period": "2025-09",
  "metrics": {
    "api.calls": 12342,
    "contacts.created": 4231
  },
  "revenue": 12980.00,
  "active_tenants": 3421
}
```

---

## 🧩 十五、自检清单（Usage Reporting Ready Checklist）

| 检查项                      | 状态 |
| ------------------------ | -- |
| manifest 注册了 metrics     | ✅  |
| 插件内集成 SDK 上报             | ✅  |
| 上报签名与 ToolGrant 验证       | ✅  |
| 宿主可接收并聚合 usage           | ✅  |
| License Server 可同步 usage | ✅  |
| Vendor Dashboard 可查看     | ✅  |
| 数据脱敏与合规检测通过              | ✅  |

---

## 📚 十六、延伸阅读

- [Pricing_and_Licensing.md](./Pricing_and_Licensing.md)
- [License_API_and_Verification.md](../05_finance_and_settlement/License_API_and_Verification.md)
- [Logs_Metrics_and_Tracing.md](../03_runtime_and_ops/Logs_Metrics_and_Tracing.md)
- [Vendor_Onboarding.md](../00_overview/Vendor_Onboarding.md)

---

> **文档版本：** v1.1.0
> **适用范围：** PowerX ≥ 0.9.0
> **维护团队：** PowerX Marketplace Analytics Team
> **最后更新：** 2025-10
