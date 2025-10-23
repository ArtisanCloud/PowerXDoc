# Marketplace 商业闭环指南

PowerX Plugin Base 已实现完整的 Marketplace 商业闭环流程，覆盖 **上架 → 购买 → 使用 → 分润**。本指南帮助团队在本地或沙盒环境里验证闭环能力。

---

## 1. 能力速览

| 能力 | 触发入口 | 说明 |
|------|----------|------|
| Listing 提交与审核 | `/_p/com.powerx.plugins.base/admin/integration/marketplace/listings.vue` | 支持草稿、审核、上架、暂停多状态流转，并记录 Checklist 结果。 |
| 价格与 License 配置 | `/_p/com.powerx.plugins.base/admin/integration/marketplace/plans.vue` | 维护 Subscription / Usage 计划、分级计费、默认计划。 |
| License 签发 & 离线策略 | `/api/v1/marketplace/licenses` | 结合 Billing / Tax / License Server 完成签发，支持 72 小时离线兜底。 |
| Usage 上报 & 聚合 | `/api/v1/marketplace/usage` | 幂等批量写入、时窗聚合、告警检测、Usage Metrics API。 |
| Usage & Revenue Dashboard | `/_p/com.powerx.plugins.base/admin/integration/marketplace/dashboard` | 展示调用趋势、剩余额度、异常告警与 Vendor 分润报表。 |
| 支持渠道与知识库管理 | `/_p/com.powerx.plugins.base/admin/operations/support` | 配置多渠道 Support Playbook、知识库及 Support Ready Checklist。 |
| Incident 生命周期中心 | `/_p/com.powerx.plugins.base/admin/operations/incidents` | 按 SEV 声明/跟进事故，维护时间线、Checklist，并写入审计/通知。 |
| SLA Dashboard & 公共 API | `/_p/com.powerx.plugins.base/admin/operations/sla` / `/api/v1/marketplace/sla/{plugin_id}` | 维护 SLA 目标、计算得分，自动激励/处罚并对外公开查询。 |
| 分润计算 & 导出 | `/api/v1/marketplace/revenue-share/reports` | 基于配置化比例生成 Vendor/Platform/Fee 拆分，支持导出。 |

---

## 2. 验证流程（沙盒）

1. **Listing 入驻**  
   - 上传 `.pxp` 包，完成 Checklist。  
   - 审核通过并确保推荐权重同步。

2. **定价配置**  
   - 在 “Pricing Plans” 页面创建 Subscription / Usage 计划，设置默认计划。  
   - 执行 `make migrate` → `make run` 验证计划写入数据库并可查询。

3. **购买 & License**  
  - 通过 Admin Console 触发购买流程或直接调用 `POST /marketplace/licenses`。  
  - 校验 Tax Provider 重试、License 缓存与离线期限。

4. **Usage 上报**  
  - 使用 SDK 批量推送 Usage Envelope（或模拟调用）。  
  - 观察 `powerx_marketplace_usage_ingest_total`、`usage_ingest_lag_seconds` 指标。

5. **Dashboard 观测**  
  - 打开 Usage & Revenue Dashboard，检查趋势、`usage_spike`/`quota_exceeded` 告警。  
  - 在浏览器控制台确认 `window.__pxMetrics.events` 记录 `dashboard_first_paint`。

6. **运维演练**  
  - 在 `/_p/com.powerx.plugins.base/admin/operations/support` 配置渠道、知识库，确认 Support Ready Checklist 全绿。  
  - 进入 `/_p/com.powerx.plugins.base/admin/operations/incidents` 声明 SEV 事故，追加时间线并核查 `operations_incident_updates`、审计日志及通知投递。  
  - 打开 `/_p/com.powerx.plugins.base/admin/operations/sla` 更新目标与实际表现，观察 `operations_sla_profiles`/`operations_sla_adjustments` 的激励或处罚记录，并通过 `/api/v1/marketplace/sla/{plugin_id}` 校验公共读数。  
  - 详尽步骤可参考《[Operations Runbook](../integration/07_support_and_operations/Operations_Runbook.md)》及 `specs/007-support-and-operations/quickstart.md`。

7. **分润报表**  
  - 通过 API 或 Admin Console 导出报表，核对 Vendor / Platform / Fees 拆分。  
  - 若需要重新计算，可清除 Usage 数据（GDPR）并重新上报。

---

## 3. 关键配置

`backend/etc/config.example.yaml` 中的 `marketplace` 与 `integration.billing.reconciliation` 节点已经包含默认配置：

- **税务供应商**：Stripe Tax / Avalara 凭据与超时重试策略。  
- **分润比例**：Vendor 80%，Platform 15%，Fee 5%。  
- **Usage 缓存**：Redis 幂等记录、License 缓存前缀。  
- **提醒渠道**：Email / In-App 离线提醒、Usage 告警事件。

复制样例到 `config.yaml` 后即可本地演示完整闭环。

---

## 4. 问题排查

- **Usage 未聚合**：检查 Redis 可用性、`usage_envelopes` 是否存在重复 `checksum`。  
- **Dashboard 无数据**：确认 License 与 Tenant ID 填写正确，并查看 `marketplace_usage_aggregates`。  
- **分润金额不准确**：核对 `integration.billing.reconciliation` 配置，或检查 Usage 数据是否重复。  
- **GDPR 清理**：调用 `PrivacyService.PurgeUsageData` 对指定 License 清理 Usage & Aggregates。

---

更多细节请参考 `specs/006-marketplace-business/` 设计文档及 `backend/internal/services/marketplace/` 实现。
