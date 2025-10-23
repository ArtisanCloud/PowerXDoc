# Finance Observability Reference

The Finance bounded context exposes metrics, logs, and alerting hooks for the
following domains:

| Component | Metric Prefix | Key Metrics | Default SLO |
|-----------|---------------|-------------|-------------|
| Reconciliation jobs | `finance.reconciliation.*` | `duration_seconds`, `ingest_total`, `error_total` | Complete within 60 min of daily cut-off |
| Payout orchestration | `finance.payout.*` | `duration_seconds`, `retry_backlog`, `failure_rate` | <5% failures auto-recover in 24h |
| Invoice workflows | `finance.invoice.*` | `under_review_gauge`, `tax_failure_total` | Backlog cleared within 1 business day |
| Audit exports | `finance.audit.*` | `bundle_generation_seconds`, `access_log_total` | 100% requests <15 min turnaround |
| Anomaly monitor | `finance.anomaly.*` | `detections_total`, `open_high_severity` | Zero unresolved critical anomalies >4h |

## Grafana Dashboards

1. **Finance / Reconciliation SLA**
   - Panels: job duration heatmap, ingest totals, error breakdown.
   - Alert: `finance.reconciliation.sla` (critical when p95 duration > 60 min).
2. **Finance / Payout Reliability**
   - Panels: retry backlog, failure rate by vendor, gateway error codes.
   - Alert: `finance.payout.failure_rate` (warning at 3%, critical at 5%).
3. **Finance / Invoice Backlog**
   - Panels: invoices by status, tax verification failure trend, reviewer load.
   - Alert: `finance.invoice.backlog` (warning when backlog > 50 for 2h).
4. **Finance / Audit Activity**
   - Panels: bundle generation count, access log volume, SLA histogram.
   - Alert: `finance.audit.export_latency` (warning when > 15 min).

Dashboards live in the shared Grafana folder: `Finance Operations`.

## Alertmanager Routes

```yaml
- match:
    alertname: finance.reconciliation.sla
  receiver: pagerduty-finance
- match:
    alertname: finance.payout.failure_rate
  receiver: pagerduty-finance
- match:
    alertname: finance.invoice.backlog
  receiver: finance-ops-slack
- match:
    alertname: finance.anomaly.detected
  receiver: compliance-standby
```

## OpenTelemetry Configuration

Add the following to `config.yaml` to enable OTLP exports:

```yaml
finance:
  telemetry:
    otlp:
      endpoint: "http://otel-collector:4317"
      insecure: true
      resource_attributes:
        service.name: "powerx-finance"
        service.version: "0.1.0"
```

## Log Tailing

Use the CLI helper to tail scoped logs:

```bash
px finance logs tail --component reconciliation --since 30m
px finance logs tail --component payouts --filter "level=error"
```

All finance logs include the fields: `vendor_id`, `batch_id`, `job_name`,
`correlation_id` to simplify investigations.

## Synthetic Checks

- Reconciliation synthetic runs nightly with sample data; results recorded under
  metric `finance.reconciliation.synthetic`.
- Audit bundle smoke test runs hourly to ensure storage permissions remain intact.

Keep this reference synchronous with the dashboards and update when new metrics
are added.
