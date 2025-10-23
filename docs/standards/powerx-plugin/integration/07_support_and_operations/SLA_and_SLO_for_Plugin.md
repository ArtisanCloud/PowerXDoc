# 插件服务等级协议与目标（07_support_and_operations/SLA_and_SLO_for_Plugin.md）

> 本文档定义 PowerX 插件在运行期的服务等级协议（SLA）与目标（SLO）。  
>
> 它约束 Vendor（插件开发者）应维持的可用性、性能、支持与数据可靠性标准，  
> 并规定 SLA 计算方式、补偿规则与 Marketplace 评级机制。

---

## 🧭 一、设计目标

- 量化插件运行与支持质量；
- 提供跨 Vendor 的统一 SLA 评分模型；
- 通过 SLO 监控与定期评估，推动持续改进；
- 让租户（Tenant）可清晰预期插件的服务水平；
- 建立与 Marketplace 挂钩的透明激励机制。

---

## 🧱 二、关键概念

| 概念 | 定义 |
|------|------|
| **SLA (Service Level Agreement)** | 插件对租户的正式承诺（合同级别） |
| **SLO (Service Level Objective)** | 可量化的目标指标（用于评估 SLA 达成） |
| **SLI (Service Level Indicator)** | 实际测得的服务指标数据 |
| **Uptime (%)** | 插件可用时间占比 |
| **MTTR (Mean Time To Recovery)** | 平均修复时间 |
| **FRT (First Response Time)** | 首次响应时长（支持层面） |

---

## ⚙️ 三、插件服务等级分层

PowerX Marketplace 将插件按运行属性分为三类：

| 插件类型 | 示例 | 建议 SLA | 核心指标 |
|-----------|--------|-----------|------------|
| **实时型 (Real-time)** | 聊天机器人、AI 助手、分析引擎 | 99.9% | 响应时间、可用性、速率限制 |
| **业务型 (Transactional)** | CRM、订单、库存插件 | 99.5% | 数据一致性、API 可用率 |
| **非实时型 (Utility)** | 报表、导出、同步器 | 99.0% | 延迟、任务完成率 |

---

## 🧩 四、主要 SLA 维度

| 分类 | 维度 | 描述 | 目标值 |
|------|------|------|--------|
| **可用性 (Availability)** | 插件可访问时间占比 | 插件服务应持续可用 | ≥ 99.5% |
| **性能 (Performance)** | 平均响应时间 | 核心 API 响应 < 800ms | ≥ 95% 请求满足 |
| **可靠性 (Reliability)** | 请求成功率 | 成功率 ≥ 99% | - |
| **支持响应 (Support FRT)** | 首次响应时间 | 工单 4 小时内回复 | ≥ 95% |
| **修复时间 (MTTR)** | 故障修复平均时间 | 严重问题 ≤ 8 小时 | - |
| **数据保留 (Retention)** | 历史日志保存时长 | 最少 180 天 | - |
| **隐私合规 (GDPR/PIPL)** | 个人数据访问与删除 | 48 小时内响应 | - |

---

## 🧮 五、SLA 计算公式

### 1️⃣ 可用性 (Uptime)

```

Uptime % = (Total Time - Downtime) / Total Time * 100

```

示例：

```

(30天 * 24h - 3h) / (30天 * 24h) = 99.58%

```

### 2️⃣ 平均修复时间 (MTTR)

```

MTTR = 所有事件修复耗时总和 / 事件数量

```

### 3️⃣ SLA 评分（Marketplace 用）

```

SLA Score = (0.4 * Uptime%) + (0.3 * Support%) + (0.3 * Reliability%)

```

---

## 🧠 六、监控与验证机制

PowerX 核心平台通过以下方式追踪插件 SLA：

| 维度 | 数据源 | 工具 |
|------|----------|------|
| Uptime | Ping / Healthcheck | PowerX Health Gateway |
| Response Time | API Trace Logs | PowerX APM (Application Perf Monitor) |
| Error Rate | Log & Metrics Pipeline | PowerX Observability Hub |
| Support SLA | Support Tickets | PowerX Support Hub |
| Incident Metrics | SEV 报告 | PowerX Incident Center |

Vendor 也可通过 SDK 上报指标：

```go
import "powerx.io/sdk/metrics"
metrics.Report("uptime.percent", 99.8)
```

---

## 🔁 七、补偿与处罚机制

| 场景                | 触发条件                   | 措施                 |
| ----------------- | ---------------------- | ------------------ |
| **SLA 未达标（连续两期）** | <99.0% 可用性 或 >10% 工单超时 | 插件评级下降、暂停上架        |
| **严重 SLA 违规**     | SEV-0 未按时通报或修复         | 临时下架、冻结收入          |
| **主动 SLA 改进计划提交** | 自主上报改进方案               | 评分豁免一期             |
| **超额达标奖励**        | 连续 3 期 SLA ≥ 99.9%     | Marketplace 推荐加权展示 |

---

## 📈 八、Marketplace SLA 评级展示

Marketplace 将在插件详情页公开 SLA 状态：

| 项目                | 示例展示                |
| ----------------- | ------------------- |
| **当前 SLA 等级**     | 🟢 Platinum (99.9%) |
| **近 30 天 Uptime** | 99.94%              |
| **平均响应时间**        | 0.62 秒              |
| **支持满意度**         | 4.8 / 5             |
| **事件历史**          | 1 起 SEV-2，已修复       |
| **上次复盘时间**        | 2025-10-01          |

---

## 🧩 九、SLO 示例定义（插件内）

```yaml
slo:
  availability:
    target: 99.5
    measurement: "uptime.percent"
  response_time:
    target: 800
    unit: "ms"
  error_rate:
    target: 1.0
    unit: "%"
  support_frt:
    target: 4
    unit: "hours"
```

PowerXPluginBase 可在启动时自动注册插件 SLO 信息到宿主。

---

## 🔐 十、SLA 与 License / Pricing 的关系

| 领域                    | 关系说明                         |
| --------------------- | ---------------------------- |
| **License Plan**      | SLA 不同计划可差异化（如 Pro 版 SLA 更高） |
| **Pricing**           | 高 SLA 插件可享更高佣金比例             |
| **Usage Analytics**   | SLA 不达标时会反映在留存数据中            |
| **Incident Handling** | SEV-1/0 事件会影响 SLA 得分         |

---

## 🧩 十一、数据存储与报告

所有 SLA 指标将：

- 每日采样；
- 按月汇总；
- 在 PowerX Marketplace Analytics 中展示；
- 可导出为 JSON/CSV；
- 可通过 API 查询：

```bash
GET /api/v1/marketplace/sla/{plugin_id}
```

返回：

```json
{
  "plugin_id": "com.powerx.plugin.crm",
  "period": "2025-09",
  "uptime_percent": 99.92,
  "response_time_avg": 710,
  "support_sla": 97.8,
  "sla_score": 98.4
}
```

---

## 🧠 十二、最佳实践建议（Vendor 指南）

| 类别        | 建议               |
| --------- | ---------------- |
| **监控**    | 启用健康检查与错误追踪      |
| **告警**    | 设置自动报警（>1% 错误率）  |
| **支持**    | 工单分级响应自动化        |
| **容量规划**  | 根据租户增长动态扩容       |
| **回滚策略**  | 预留一键回滚机制         |
| **透明度**   | 主动发布状态公告与 RCA 报告 |
| **预防性维护** | 定期压力测试、漏洞扫描      |

---

## 🧩 十三、自检清单（SLA Ready Checklist）

| 检查项                        | 状态 |
| -------------------------- | -- |
| 插件已定义 SLA/SLO 目标           | ✅  |
| 已在 manifest.yaml 注册 SLA 信息 | ✅  |
| 已接入 Metrics/Health 检测      | ✅  |
| Support Hub 已追踪响应时间        | ✅  |
| SLA 指标可导出 / 查询             | ✅  |
| 违规补偿机制已配置                  | ✅  |
| 复盘与改进流程形成制度                | ✅  |

---

## 📚 十四、延伸阅读

- [Customer_Support_Playbook.md](./Customer_Support_Playbook.md)
- [Incident_Handling_for_Plugin.md](./Incident_Handling_for_Plugin.md)
- [Logs_Metrics_and_Tracing.md](../03_runtime_and_ops/Logs_Metrics_and_Tracing.md)
- [Pricing_and_Licensing.md](../06_marketplace_and_business/Pricing_and_Licensing.md)

---

> **文档版本：** v1.1.0
> **适用范围：** PowerX ≥ 0.9.0
> **维护团队：** PowerX Reliability & Marketplace Quality Team
> **最后更新：** 2025-10
