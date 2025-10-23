# Finance Operations Runbook

This runbook captures the day-to-day workflows for the Finance & Settlement
module, aligning with the new CLI and HTTP endpoints delivered in stories US1–US4.

## Daily Checklist

1. **Verify ingestion** – confirm gateway events are flowing:
   ```bash
   px finance metrics show --component reconciliation --metric finance.reconciliation.ingest_total
   ```
2. **Run reconciliation (if automation paused)**:
   ```bash
   px finance reconciliation run --date $(date -u -v-1d +%F)
   ```
3. **Inspect generated reports**:
   ```bash
   px finance reconciliation list --page 1 --size 5
   px finance reconciliation download --report-id <uuid> --out ./reports/
   ```
4. **Evaluate payouts** – review pending batches and trigger manual runs when required:
   ```bash
   px finance payout list --status pending
   px finance payout trigger --batch <batch-id> --reason "manual-release"
   ```
5. **Monitor retries / failures** – payouts should auto-retry, but Ops must watch backlog metrics (`finance.payout.retry_lag_seconds`, `finance.payout.failure_rate`).
6. **Invoice processing** – clear the under-review queue daily:
   ```bash
   px finance invoice list --status under_review
   px finance invoice approve --invoice <invoice-id>
   px finance invoice reject --invoice <invoice-id> --notes "Tax ID mismatch"
   ```
7. **Audit exports** – respond to auditor requests with scoped bundles:
   ```bash
   px finance audit export --from 2025-10-01 --to 2025-10-31 --vendor <vendor-id> --out audit_bundle.zip
   ```

## Alert Playbooks

| Alert ID | Trigger | Immediate Response | Escalation |
|----------|---------|--------------------|------------|
| `finance.reconciliation.sla` | Reconciliation duration > 60 min | Check worker logs (`px finance logs tail --component reconciliation`), rerun job | Escalate to SRE if rerun fails twice |
| `finance.payout.failure_rate` | Payout failure ratio > 5% | Inspect retry queue (`px finance payout list --status failed`), confirm gateway availability | Notify payment gateway contact and mark affected vendors |
| `finance.invoice.backlog` | Invoices under review > 50 for 2 hours | Rebalance reviewers; sample reject reasons for systemic issues | Escalate to compliance lead if backlog persists 4h |
| `finance.anomaly.detected` | Anomaly monitor flags reconciliation delta or tax failure | Retrieve anomaly log (`px finance anomaly list --severity high`) and attach to JIRA ticket | Trigger manual freeze if >3 vendors affected |

## Runbook Links

- Telemetry dashboards: `/docs/telemetry/finance-observability.md`
- Quickstart (end-to-end validation): `/specs/005-finance-and-settlement/quickstart.md`
- Security controls review: `/docs/security/finance-controls.md` (see T044 deliverable)

Keep this runbook adjacent to the Finance Ops PagerDuty service and update when
new workflows are introduced.
