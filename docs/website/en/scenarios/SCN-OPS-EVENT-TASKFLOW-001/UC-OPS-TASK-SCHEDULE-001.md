doc_id: UC-OPS-TASK-SCHEDULE-001
scn_id: SCN-OPS-EVENT-TASKFLOW-001
title: Scheduler for Cron & Event-triggered Tasks
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
  - SCN-OPS-EVENT-TASKFLOW-001-B
code_refs:
  - repo: powerx
    path: internal/tasks/scheduler/cron_engine.go
    description: Cron parsing, trigger window calculation, jitter control
  - repo: powerx
    path: internal/tasks/scheduler/planner.go
    description: Task planning, resource validation, mutual-exclusion governance
  - repo: powerx
    path: internal/tasks/executor/runtime_client.go
    description: Execution requests, SLA enforcement, timeout handling
  - repo: powerx
    path: internal/tasks/monitoring/task_metrics_collector.go
    description: Scheduling/execution metrics collection and status events
  - repo: powerx
    path: pkg/ops/sla_notifier.go
    description: SLA breach detection, alerting, and work-order creation
feature_flags:
  - task-scheduler-v3
  - task-sla-monitor
  - task-retry-queue
optional: false
last_reviewed_at: 2025-10-31

---

# Usecase Overview

- **Business Goal**: Provide unified Cron and event-driven scheduling for plugins so tasks fire on schedule, stay traceable, and can be compensated, while flagging resource conflicts early.
- **Success Metrics**: On-time rate ≥ 98%; execution success rate ≥ 97%; trigger latency < 1 minute; resource conflict warning hit rate ≥ 90%.
- **Scenario Alignment**: Supports Stage 2 of `SCN-OPS-EVENT-TASKFLOW-001`, consuming event notifications and supplying task instances for recovery flows.

> A central scheduler links Cron plans, event triggers, resource pre-checks, execution callbacks, and SLA alerts into a measurable loop.

# Context & Assumptions

- **Prerequisites**
  - Feature flags `task-scheduler-v3`, `task-sla-monitor`, and `task-retry-queue` are enabled.
  - Scheduler runs as a high-availability cluster leveraging Redis/Etcd for plans and distributed locks.
  - Plugin runtimes support idempotent execution, SLA reporting, and log persistence.
  - Ops console has tenant quotas, mutual-exclusion rules, windows, and conflict templates configured.
- **Inputs / Outputs**
  - Inputs: Cron expressions, event triggers, task parameters, tenant quotas, mutual-exclusion policies.
  - Outputs: Task instance status (Pending/Running/Success/Failed), execution logs, metrics, alerts, retry plans, work orders.
- **Boundaries**
  - Excludes plugin business logic and infrastructure scaling; scheduler validates resource quotas only.
  - Cross-tenant shared tasks are handled by multi-tenant scenarios.
  - Manual work-order approvals are outside this usecase.

# Solution Blueprint

## Architecture Layers

| Layer | Key Modules | Responsibility | Code Entry |
|-------|-------------|----------------|------------|
| Scheduling Core | `internal/tasks/scheduler/cron_engine.go` | Parse Cron, maintain trigger windows, jitter and staggering | `services/tasks/scheduler` |
| Planner | `internal/tasks/scheduler/planner.go` | Resource validation, locks, conflict detection, queuing | `services/tasks/scheduler` |
| Execution Client | `internal/tasks/executor/runtime_client.go` | Invoke plugin runtime/Agent, manage timeout/retry, stream status | `services/tasks/executor` |
| Monitoring Layer | `internal/tasks/monitoring/task_metrics_collector.go` | Collect execution metrics, state changes, push to event/metrics systems | `services/tasks/monitoring` |
| SLA Alerting | `pkg/ops/sla_notifier.go` | Detect SLA breaches, raise alerts & work orders, coordinate compensation | `pkg/ops` |

## Flow & Sequence

1. **Step 1 – Task Registration**: Admin or API calls `registerTask` to store Cron/event rules and metadata.
2. **Step 2 – Pre-flight Planning**: Before trigger time, perform resource checks, mutual-exclusion validation, and jitter control; queue or warn as needed.
3. **Step 3 – Task Execution**: When triggered, invoke plugin runtime/Agent, attach trace info, and capture heartbeats.
4. **Step 4 – Status Tracking**: Execution results flow into the task store and metrics pipeline; failures hand off to retries or compensation.
5. **Step 5 – Retry & Compensation**: Failed tasks enqueue to retry queues or open work orders, linking to the Stage 4 recovery loop.

# Contracts & Interfaces

- **Inbound APIs / Events**
  - `POST /internal/tasks/register` — Register tasks, validating tenant, Cron, mutual-exclusion.
  - `PUT /internal/tasks/{id}/pause`, `PUT /internal/tasks/{id}/resume` — Control task lifecycle.
  - `EVENT task.execution.updated` — Report progress, outcomes, error codes.
- **Outbound Calls**
  - `POST /plugin/runtime/{pluginId}/execute` — Trigger plugin runtime with task parameters and trace context.
  - `POST /ops/capacity/reserve` — Reserve resources and adjust quotas.
  - `POST /notifications/sla-breach` — Notify SLA breaches and create work orders.
- **Configs & Scripts**
  - `config/tasks/default_policy.yaml` — Default retry, conflict, and SLA policies.
  - `scripts/ops/task-dryrun.mjs` — Pre-flight validation and mutual-exclusion checks.
  - `scripts/ops/task-sla-report.mjs` — SLA reporting and inspection.

# Implementation Checklist

| Item | Description | Status | Owner |
|------|-------------|--------|-------|
| Cron engine | Enhance parsing, jitter, staggering with unit tests | [ ] | Matrix Ops |
| Resource pre-check | Integrate quotas, mutual exclusion, conflict detection, error messaging | [ ] | Eva Zhang |
| Execution pipeline | Improve runtime client, timeout/retry handling, trace injection | [ ] | Matrix Ops |
| Observability | Extend metrics, logging, Ops console panels | [ ] | Eva Zhang |
| Runbook | Update scheduling runbooks and alert SOPs | [ ] | Matrix Ops |

# Testing Strategy

- **Unit**: Cron parsing, staggering algorithms, quota/conflict validation, task state machine.
- **Integration**: Usecase B-1 (on-time trigger with sufficient quota), Usecase B-2 (queueing and warning on resource shortage), simulate event-driven tasks.
- **End-to-End**: Configure sandbox workloads, monitor on-time rate, execution logs, console visuals; validate retries on failure.
- **Non-functional**: Stress test 10k concurrent scheduled jobs; inject Redis/Etcd failures for lock degradation; evaluate long-running tasks against SLA.

# Observability & Ops

- **Metrics**: `task.scheduler.on_time_rate`, `task.scheduler.missed_total`, `task.execution.success_total`, `task.execution.retry_total`, `task.sla.breach_total`.
- **Logging**: Capture `task_id`, `tenant_id`, `trigger_time`, `actual_start`, `duration_ms`, `status`, `retry_count`, `error_code`.
- **Alerts**: Scheduling failure rate > 5% over 5 minutes, three consecutive SLA breaches, lock contention > 70%.
- **Dashboards**: Grafana `Runtime Ops / Scheduler Overview`, Datadog `task.scheduler.*`, Ops console timeline.

# Rollback & Failure Handling

- **Rollback Steps**: Restore previous Scheduler/Planner build, revert configs, disable new flags, redeploy Cron tables.
- **Mitigations**: Run `task-dryrun.mjs` to inspect pending tasks, manually trigger critical workloads or notify tenants, adjust quotas/mutual-exclusion rules.
- **Data Repair**: Update statuses via SQL, recompute next run times; run `task-sla-report.mjs --rebuild` to fix metrics.

# Follow-ups & Risks

| Risk / Item | Impact | Mitigation | Owner | ETA |
|-------------|--------|------------|-------|-----|
| Scheduler autoscaling not automated | SLA breaches during peak load | Implement auto-scaling scripts and proactive metrics | Matrix Ops | 2025-11-08 |
| Complex mutual-exclusion configuration | Tasks blocked or skipped unintentionally | Provide console templates, validation scripts, approval hints | Eva Zhang | 2025-11-15 |

# References & Links

- Scenario: `docs/scenarios/runtime-ops/SCN-OPS-EVENT-TASKFLOW-001.md`
- Child Scenario: `docs/scenarios/runtime-ops/SCN-OPS-TASK-SCHEDULE-001.md`
- Background: `docs/meta/scenarios/powerx/core-platform/runtime-ops/event-and-taskflow-management/primary.md`
- Tooling: `scripts/ops/task-dryrun.mjs`, `scripts/ops/task-sla-report.mjs`
