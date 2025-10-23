# Release Notes · v0.7.0 Dev Console Troubleshooting

发布日期：2025-10-24

## 新能力

- **故障排查工作台**：在 Admin Console 中加入 Job Run 历史、安全操作入口、Webhook 诊断与健康指标刷新。
- **安全操作审计链路**：所有安全操作会同步写入 `admin_console_job_runs` 表并关联审计事件，支持自动化导出。
- **Webhook Drill-down**：支持按租户、订阅、状态分页查看投递记录，并提供死信原因与响应码。

## 升级步骤

1. `make migrate`：应用 `2025Q4_admin_console.sql` 与 `2025Q4_integration_indexes.sql`。
2. `make build && make frontend-build && make release`：生成新的二进制与 Nuxt bundle。
3. 部署后执行 `docs/support/admin-console-troubleshooting.md` 中的 runbook 验收脚本，确认任务重试、仪表盘刷新与 webhook 查询均正常。

## 向后兼容性

- Job Run 新增字段（`action`, `scope_type`, `scope_ref`, `metadata` 等），旧版本服务不可识别，回滚时需确认不存在 pending 操作。
- Manifest 需升级至 0.7.0，RBAC 才包含 `operations.plugin.ops` 等资源。

## 已知问题

- 当 CSV 导出范围 > 31 天时，执行时间可能超过 5s。建议拆分时间窗口或使用 JSON 导出。
- 故障排查仪表盘依赖新的 Observability 指标，如未导入 Grafana 模板，将无法看到刷新延迟。
