# Integration Metrics Verification Checklist

Use this checklist before releasing integration changes.

1. **Metric Presence**
   - Run `scripts/ci/verify_integration_metrics.sh`; ensure all required metric names exist.
2. **Local Smoke**
   - Start backend (`make run`) and trigger `/api/v1/integration/dispatch` once。
   - Hit `/metrics` endpoint，确认下列指标返回：
     - `powerx_integration_envelopes_total`
     - `powerx_integration_webhook_attempts_total`
     - `powerx_integration_secrets_rotations_due`
3. **Dashboard Import**
   - 导入 `docs/observability/integration-dashboard.json`，检查面板渲染正确。
4. **Webhook Replay Drill**
   - 通过管理端 Webhooks 页面新增订阅、模拟失败并执行 replay，观察指标是否更新。
5. **Secrets Rotation Drill**
   - 触发 `POST /admin/integration/secrets/{id}/rotate` 并完成轮换，确认审计事件与 `due_now` 指标下降。
6. **Automation**
   - CI 运行 `scripts/ci/integration.sh` 成功，确保前后端构建、测试与指标校验均通过。
7. **Success Criteria Alignment**
   - SC-001：确认 `powerx_integration_envelopes_total` 在 5m 覆盖率 ≥95%，可结合 Grafana 面板“Envelope Throughput”。
   - SC-002：监控 `powerx_integration_webhook_attempts_total{status}`、`powerx_integration_webhook_delivery_seconds`，DLQ 面板应归零。
   - SC-003：`powerx_integration_secrets_rotations_due{window="due_24h"}` 在演练后下降。
   - SC-004：审计 `integration_change_approvals` 与指标波动，确认 replay/轮换后支持工单量下降（需配合运营报表）。
   - SC-005：`powerx_integration_idempotency_events_total{outcome="conflict"}` 与 RBAC 拒绝日志触发告警；验证 `integration-smoke` 目标输出无错误。
