# Changelog

> 仅记录与 PowerX Marketplace 商业闭环相关的可交付版本。更早的安全、协议迭代请参考 `docs/releases/` 历史记录。

## v0.7.0 · Dev Console Troubleshooting

发布日期：2025-10-24

- **故障排查控制台**：`/_p/com.powerx.plugins.base/admin/dev-console` 新增「故障排查」页签，集成任务历史、手动安全操作、健康/配额/Webhook 诊断面板。
- **安全操作审计**：安全操作、重试会写入 `admin_console_job_runs` 与 `admin_console_audit_events`，支持导出 CSV/JSON，并提供新的 Prometheus 指标。
- **Webhook Drill-down**：提供 `/webhooks/attempts` 与 `/webhooks/attempts/{id}` API，配合新增索引加速租户级筛选。
- **Runbook & Dashboard**：补充 [Admin Console Observability Guide](../observability/admin-console-dashboard.md)、[Troubleshooting Runbook](../support/admin-console-troubleshooting.md)，供值班与运维参照。

升级提示：

1. 执行 `make migrate` 应用 `2025Q4_admin_console.sql` 与 `2025Q4_integration_indexes.sql`，以获得新字段与索引。
2. 重新构建后端与前端：`make build && make frontend-build`，再执行 `make release` 生成 v0.7.0 包。
3. 更新 `plugin.yaml` 到 `0.7.0` 并确认 Manifest 中新增的 `operations.plugin.*` 权限条目。
4. 建议导入新的 Observability Dashboard，校验指标 `powerx_admin_console_safe_op_total` 与自动刷新延迟是否正常上报。

---

## v0.6.0 · Support & Operations Runbook

发布日期：2025-10-22

- **Support Playbook**：新增多渠道支持配置、知识库同步与 Support Ready Checklist，支持 webhook 验证与指标 `powerx_operations_support_ticket_total`。  
- **Incident Lifecycle**：提供 `/_p/.../operations/incidents` 管理 SEV 流程、时间线、就绪清单，并写入审计 `operations_incident_updates` / `operations_sla_adjustments`。  
- **SLA Transparency**：上线 SLA Dashboard、自动激励/处罚、公共 API `/api/v1/marketplace/sla/{plugin_id}`，并记录 `powerx_operations_sla_score` 指标。  
- **文档与 Runbook**：更新 [Marketplace 商业闭环指南](../overview/marketplace_business_loop.md)、`quickstart.md`，并新增 [Operations Runbook](../integration/07_support_and_operations/Operations_Runbook.md)。

升级提示：

1. 执行 `make migrate` 以创建 `operations_incidents`、`operations_incident_updates`、`operations_sla_profiles` 等新表。  
2. 在 `backend/etc/config.yaml` 内补充 `operations` 配置节点（支持渠道、Incident 通知、SLA cron）。  
3. 重新构建并打包：`make build && make frontend-build && make dist`，以生成新的 Operations UI 与后端逻辑。  
4. 若需复现运行手册，请参照 `specs/007-support-and-operations/quickstart.md` 与 Runbook 执行 Support/Incident/SLA 演练。

---

## v0.5.0 · Marketplace Analytics Loop

发布日期：2025-10-21

- **Usage 聚合与告警**：新增 `marketplace_usage_envelopes` / `marketplace_usage_aggregates` / `marketplace_notifications` 表，提供批量幂等上报、配额/Spike 告警以及 GDPR 删除链路。  
- **Revenue Share 报表**：自动计算 Vendor / Platform / Fee 分润，Expose `/marketplace/revenue-share/reports` API 与 Dashboard 导出。  
- **Admin Dashboard**：在 `/_p/com.powerx.plugins.base/admin/integration/marketplace/dashboard` 展示调用趋势、剩余额度、异常告警与分润结果，并上报首屏性能指标。  
- **文档更新**：补充 [Marketplace 商业闭环指南](../overview/marketplace_business_loop.md)，README 与 Quickstart 指引完整闭环演练。

升级提示：

1. 执行 `make migrate` 以创建新的 Usage/Revenue 表结构及 RLS 策略。  
2. 更新 `backend/etc/config.yaml` 中的 `integration.billing.reconciliation` 与 `marketplace` 节点，确认分润比例、提醒渠道与 Redis 配置。  
3. 重新构建后端与前端包：`make build && make frontend-build && make dist`。  
4. 若生产环境需要 Usage 历史迁移，请在升级前导出旧数据或利用 `PrivacyService.PurgeUsageData` 工具清理不需要的 Envelope。
