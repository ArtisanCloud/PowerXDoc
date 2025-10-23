# Admin Console Observability Guide

本指南描述 Dev Console 相关的核心指标与日志，便于在排查与性能回归时快速定位异常。

## 指标总览

| 指标 | 类型 | 维度 | 说明 |
|------|------|------|------|
| `powerx_admin_console_safe_op_total` | Counter | `action`, `outcome` | 统计安全操作的请求次数，`outcome` 包括 `scheduled`、`error`、`succeeded` 等 |
| `powerx_admin_console_audit_export_total` | Counter | `format` | 记录导出次数，跟踪 CSV/JSON 导出热度 |
| `powerx_admin_console_dashboard_refresh_seconds` | Gauge | `scope` | 最近一次故障排查面板刷新延迟（秒）。`scope=global` 或 `tenant:<id>` |

> **Dashboards**：Grafana 模板位于 `docs/observability/integration-dashboard.json`，导入后挂载到 `PowerX / Admin Console` 文件夹即可。模板已包含新的 Safe Ops 与 Dashboard Refresh 面板。

## 日志事件

- Job Run 成功 / 失败会在 `admin_console_job_runs` 表中记录，字段 `metadata` 保存安全操作上下文（scope、target、dry_run）。
- 安全操作失败、锁冲突时会写入 `powerx.admin.safeops` logger，日志中包含 `lock_key` 与 `actor`。

## 性能基线

- **审计导出**：使用 1,500 条事件数据抓样（PostgreSQL + JSON 导出）。CSV 和 JSON 导出均在 3.6s 内完成。性能依赖于索引 `idx_admin_console_audit_plugin_action_time` 与导出的批量分页实现。
- **Webhook Attempts 查询**：新增索引 `idx_integration_webhook_attempts_created`，使用 `tenant_id + status` 查询 10k 条数据时响应 < 2s。
- **Job Run 历史**：分页游标基于 `(created_at, id)`，建议页面请求 `limit <= 50`，可稳定支撑并发 20。

> 若在 staging/production 发现导出耗时 >5s，可先排查数据库统计信息是否过期（`ANALYZE admin_console_audit_events`），必要时启用只读副本执行导出。

## 告警建议

1. **Safe Ops 锁竞争**：当 5 分钟内 `powerx_admin_console_safe_op_total{outcome="error"}` 连续 ≥5 次时触发告警，提示可能存在并发冲突或后端不可用。
2. **Dashboard 失效**：若 `powerx_admin_console_dashboard_refresh_seconds` > 600，触发 `Warning` 告警，提醒检查运行时守护任务是否卡住。
3. **Webhook 失败率异常**：与运营团队共用现有 webhook 重试告警，但在告警消息中新增链接跳转到 Dev Console 对应租户。

---

> 需要新增指标或扩展日志字段？请在 `/specs/008-dev-console-admin-ui/tasks.md` 中创建新的 Phase 7 任务，或向 Observability 负责人提出 CR。
