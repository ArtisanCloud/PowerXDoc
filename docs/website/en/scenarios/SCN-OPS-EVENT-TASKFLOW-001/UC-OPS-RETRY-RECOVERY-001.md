doc_id: UC-OPS-RETRY-RECOVERY-001
scn_id: SCN-OPS-EVENT-TASKFLOW-001
title: Delay Queue Retry & Recovery Loop
status: Draft
version: v0.1.0
repo_key: powerx
scope: powerx
layer: ops
domain: ops
scenario_title: "PowerX Event & Taskflow Management"
owners:
  - name: Matrix Ops
    role: Platform Ops Lead
    contact: ops@artisan-cloud.com
  - name: Eva Zhang
    role: Automation Steward
    contact: automation@artisan-cloud.com
contributors: []
linked_requirements:
  - SCN-OPS-EVENT-TASKFLOW-001-D
code_refs:
  - repo: powerx
    path: internal/tasks/retry/delay_queue.go
    description: Delay queue enqueue/dequeue and scheduling implementation
  - repo: powerx
    path: internal/tasks/retry/policy_engine.go
    description: Retry policy engine, backoff algorithms, idempotency keys
  - repo: powerx
    path: internal/tasks/retry/dlq_handler.go
    description: Dead-letter processing and work-order generation
  - repo: powerx
    path: internal/tasks/monitoring/retry_metrics_collector.go
    description: Retry metrics collection and alert instrumentation
  - repo: powerx
    path: pkg/ops/recovery_runbook.go
    description: Automated recovery scripts and runbook entrypoints
feature_flags:
  - task-retry-queue
  - dlq-inspector
  - audit-streaming
optional: false
last_reviewed_at: 2025-10-31

---

# Usecase Overview

- **Business Goal**: Provide configurable delayed retries, dead-letter handling, and manual recovery so that critical tasks can be restored during failures with complete visibility and auditability.
- **Success Metrics**: Automatic retry success rate ≥ 90%; DLQ escalation produces work orders within 5 minutes; recovery work-order completion rate ≥ 95%; duplicate execution rate < 0.5%.
- **Scenario Alignment**: Supports Stage 4 of `SCN-OPS-EVENT-TASKFLOW-001`, consuming failed jobs from scheduling/Agent flows and closing the recovery loop.

> Delay queues, backoff strategies, and manual runbooks form a standardized “failure → retry → escalation → work order → recovery” pipeline.

# Context & Assumptions

- **Prerequisites**
  - Feature flags `task-retry-queue`, `dlq-inspector`, and `audit-streaming` are enabled.
  - Redis/Kafka support delayed queues; Ops console offers retry policy configuration.
  - Executors expose idempotent interfaces that honor `retry_token`.
  - PagerDuty/Slack alert channels are configured; work-order system supports API creation.
- **Inputs / Outputs**
  - Inputs: Task failure events (status, reason, context), retry policies (attempts, backoff, thresholds), manual recovery instructions.
  - Outputs: Retry task instances, logs, alerts, work orders, recovery results, audit records.
- **Boundaries**
  - Excludes cross-repo data repair or business-specific scripts (reuse existing runbooks).
  - Does not manage financial compensation; separate scenarios govern billing.
  - Hardware/infrastructure recovery is out of scope.

# Solution Blueprint

## Architecture Layers

| Layer | Key Modules | Responsibility | Code Entry |
|-------|-------------|----------------|------------|
| Delay Queue | `internal/tasks/retry/delay_queue.go` | Enqueue/dequeue, backoff computation, scheduling signals | `services/tasks/retry` |
| Policy Engine | `internal/tasks/retry/policy_engine.go` | Parse policies, enforce attempt limits, generate idempotency token | `services/tasks/retry` |
| Dead-letter Handling | `internal/tasks/retry/dlq_handler.go` | Persist DLQ items, trigger alerts, create work orders, support manual processing | `services/tasks/retry` |
| Observability Layer | `internal/tasks/monitoring/retry_metrics_collector.go` | Metrics, logging, dashboards, audit emission | `services/tasks/monitoring` |
| Runbook Layer | `pkg/ops/recovery_runbook.go` | Provide recovery scripts and manual intervention flows | `pkg/ops` |

## Flow & Sequence

1. **Step 1 – Failure Enqueue**: Failed tasks enter the delay queue with failure reason and idempotency token.
2. **Step 2 – Delayed Retry**: When the timer expires, the task is retried and the token is forwarded to the executor.
3. **Step 3 – Status Update**: Successful retries close alerts and update status; failures increment attempts and re-enqueue or escalate.
4. **Step 4 – Dead-letter Escalation**: After max attempts, the task moves to the DLQ, triggering PagerDuty/Slack alerts and auto work orders.
5. **Step 5 – Manual Recovery**: Operators execute runbooks or scripts, document recovery results, and sync audit records.

# Contracts & Interfaces

- **Inbound APIs / Events**
  - `EVENT task.execution.failed` — Includes error code, retryable flag, idempotency key.
  - `POST /internal/tasks/retry` — Manual retry trigger or policy override.
- **Outbound Calls**
  - `POST /plugin/runtime/{pluginId}/execute` — Retry execution request.
  - `POST /ops/workorders` — Create work order with failure context.
  - `POST /notifications/retry-alert` — Send alerts to PagerDuty/Slack.
- **Configs & Scripts**
  - `config/tasks/retry-policies.yaml` — Default retry policy definitions.
  - `scripts/ops/retry-inspect.mjs` — Inspect delay and DLQ queues.
  - `scripts/ops/recovery-runbook.mjs` — Automated recovery script entrypoint.

# Implementation Checklist

| Item | Description | Status | Owner |
|------|-------------|--------|-------|
| Delay queue implementation | Support backoff, idempotency keys, capacity management | [ ] | Matrix Ops |
| Policy configuration | Console templates, APIs, access control | [ ] | Eva Zhang |
| Dead-letter governance | Alerts, work-order automation, runbook integration | [ ] | Matrix Ops |
| Observability | Metrics, logs, reporting, audit events | [ ] | Eva Zhang |
| Historical migration | Plan for legacy failure data migration | [ ] | Matrix Ops |

# Testing Strategy

- **Unit**: Backoff algorithms, idempotency tokens, policy parsing, DLQ storage, runbook invocation.
- **Integration**: Run Usecase D-1 for successful delayed retry; Usecase D-2 for escalation after max attempts; simulate policy updates.
- **End-to-End**: Trigger failures in sandbox tenants, monitor retries, alerts, work orders, Ops console state; verify recovery script execution.
- **Non-functional**: Stress delayed queue throughput; inject Kafka/Redis outages to validate degradation; replay large DLQ batches.

# Observability & Ops

- **Metrics**: `task.retry.scheduled_total`, `task.retry.success_total`, `task.retry.failure_total`, `task.retry.dlq_total`, `task.retry.escalated_total`.
- **Logging**: Capture `task_id`, `retry_token`, `attempt`, `reason`, `next_retry_at`, `dlq_flag`, `workorder_id`.
- **Alerts**: Retry failure rate > 15% over 10 minutes, DLQ length beyond threshold, work-order creation failures (PagerDuty/Slack).
- **Dashboards**: Grafana `Runtime Ops / Retry & Recovery`, Datadog `task.retry.*`, Ops console recovery panel.

# Rollback & Failure Handling

- **Rollback Steps**: Revert retry service, disable new feature flags, migrate queued items to legacy pipeline.
- **Mitigations**: Execute runbooks manually, replay DLQ batches, reconfigure policies, notify affected tenants.
- **Data Repair**: Run consistency checks on `task_retry_queue`, remove duplicates; `retry-inspect.mjs --reconcile` to sync states.

# Follow-ups & Risks

| Risk / Item | Impact | Mitigation | Owner | ETA |
|-------------|--------|------------|-------|-----|
| No automated DLQ cleanup | Work-order backlog, delayed recovery | Implement `dlq-inspector`, add reminders | Matrix Ops | 2025-11-07 |
| Retry strategy not aligned with business SLA | Recovery may arrive too late | Introduce SLA-aware policies and console hints | Eva Zhang | 2025-11-14 |

# References & Links

- Scenario: `docs/scenarios/runtime-ops/SCN-OPS-EVENT-TASKFLOW-001.md`
- Child Scenario: `docs/scenarios/runtime-ops/SCN-OPS-RETRY-RECOVERY-001.md`
- Background: `docs/meta/scenarios/powerx/core-platform/runtime-ops/event-and-taskflow-management/primary.md`
- Runbooks: `scripts/ops/retry-inspect.mjs`, `scripts/ops/recovery-runbook.mjs`
