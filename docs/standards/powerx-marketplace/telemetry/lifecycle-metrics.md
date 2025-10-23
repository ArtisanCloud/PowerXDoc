# Lifecycle Telemetry Playbook

本文档描述插件生命周期关键指标的目的、采集方式以及推荐的监控告警阈值。所有指标均由 `backend/internal/telemetry/plugins/lifecycle_metrics.go` 导出，通过 OpenTelemetry Exporter 推送至 Prometheus/Grafana。

## 1. 指标清单

| 指标 ID | 类型 | 标签 | 说明 | 默认告警 |
|---------|------|------|------|---------|
| `plugin_submission_validation_seconds` | Histogram | `outcome` (`success`/`failure`) | 提交校验耗时，含同步字段规则与去重校验 | `p95 > 0.5s` 持续 5min |
| `plugin_review_sla_seconds` | Histogram | `stage` (`first_feedback`) | 审核阶段耗时，追踪首次反馈是否达标 | `avg > 172800s (48h)` |
| `plugin_release_guardrail_evaluations_total` | Counter | `outcome` (`pass`/`halt`/`rollback`) | 守护巡检结果，衡量灰度稳定性 | `rollback` 连续 2 次触发 |
| `plugin_sunset_notification_failures_total` | Counter | `channel` (`sunset:<channel>`) | 日落通知失败次数，来自 `NotificationWorker` | 任意渠道连续 3 次失败 |

### 自定义标签

- `tenant_id` / `listing_id`：通过 Resource Attributes 注入，用于细分商业影响范围。  
- `environment`：区分 `dev` / `staging` / `prod`，便于在 Grafana 中筛选。

## 2. 仪表盘建议

1. **Submission Intake**  
   - p50/p95 验证耗时热图  
   - 每小时失败计数（堆叠 `missing_manifest`, `duplicate_version` 等错误码）
2. **Review SLA**  
   - 48 小时 SLA 趋势线，超出阈值自动 @ Reviewer Lead  
   - 在 Grafana 中与 `ops_queue` 队列长度叠加
3. **Release Guardrail**  
   - 守护评估 Result Table（窗口 ID、指标值、动作）  
   - `rollback` 触发后自动展示关联的事件日志链接
4. **Sunset Notifications**  
   - 渠道失败 Top N，配合 Notification Center 延迟指标  
   - `fallback_channel_used` 的比例，用于评估兜底策略有效性

## 3. 告警策略

| 告警名称 | 条件 | 处理人 |
|----------|------|--------|
| Submission Validation Degraded | `plugin_submission_validation_seconds{quantile="0.95"} > 0.7` 持续 10 分钟 | Intake On-call |
| Review SLA Risk | `plugin_review_sla_seconds` 滚动平均 > 43 小时 | Review Lead |
| Guardrail Rollback Storm | `plugin_release_guardrail_evaluations_total{outcome="rollback"} >= 2` in 30 分钟 | Ops + Vendor |
| Sunset Notification Failure | `plugin_sunset_notification_failures_total{channel="sunset:email"} 增量 >=3` in 15 分钟 | Ops On-call |

所有告警需在 On-call 记录中注明处理时长及根因，回溯链接保存到 `docs/marketplace/lifecycle-operations.md` 所述的事后模板。

## 4. 仪表盘维护流程

1. 调整指标或标签时，先更新本文件并在 PR 描述中附带仪表盘截图。  
2. 使用 `make dashboards-export`（计划项）导出最新 JSON 并存档到内部监控库。  
3. 变更上线后 24 小时内确认告警触发逻辑正常（可在 `dev` 环境压测产生样例数据）。

## 5. 数据保留与归档

- Prometheus 保留 30 天指标；关键指标每周通过 Thanos/OSS 导出长期存储。  
- 告警事件同步到 PagerDuty 与 Slack `#marketplace-ops` 频道，便于回溯。  
- 对于回滚或通知失败事件，请在运维周志中附上对应的指标截图及时间线。
