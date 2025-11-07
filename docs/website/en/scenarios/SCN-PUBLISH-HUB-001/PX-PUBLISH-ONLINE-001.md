---
doc_id: PX-PUBLISH-ONLINE-001
scn_id: SCN-PUBLISH-HUB-001
title: PX-PUBLISH-ONLINE-001 - service/catalog
status: Draft
version: v0.1.0
repo_key: powerx
scope: powerx
layer: service
domain: catalog
scenario_title: "PowerX Plugin Release Hub"
owners:
  - name: Michael Hu
    role: Tech Steward
    contact: tech@artisan-cloud.com
  - name: Matrix-X
    role: Docs Coordinator
    contact: dev@artisan-cloud.com
contributors:
  - name: Zheng Ning
    role: Ops Lead
    contact: ops@artisan-cloud.com
  - name: Carol Wang
    role: Platform PM
    contact: carol@artisan-cloud.com
linked_requirements:
  - type: scenario
    ref: SCN-PUBLISH-HUB-001
  - type: scenario
    ref: SCN-PUBLISH-ONLINE-001
code_refs:
  - component: online_install_service
    path: backend/internal/plugins/online/install_service.go
    description: Manage remote bundle download, verification, and install state machine
  - component: upgrade_scheduler
    path: backend/internal/plugins/online/upgrade_scheduler.go
    description: Schedule auto-upgrade windows and batches based on tenant policy
  - component: marketplace_catalog_sync
    path: backend/internal/plugins/catalog/catalog_syncer.go
    description: Sync Marketplace version metadata into the local catalog cache
feature_flags:
  - name: PX_ONLINE_INSTALL
    description: "Controls the availability of the `install/url` API and allowed source domains"
    default: true
    environments: [staging, production]
  - name: PX_ONLINE_AUTO_UPGRADE
    description: Enables auto-upgrade scheduling and rollback protection
    default: false
    environments: [staging, production]
last_reviewed_at: 2025-10-28

---

# Usecase Overview

- **Business Goal**: Provide secure remote installation and upgrade for online environments—pulling approved Marketplace versions and distributing them across tenants according to policy.
- **Success Metrics**: Online install success rate ≥ 98%; release-to-tenant visibility ≤ 15 minutes; auto-upgrade rollback rate ≤ 2%; install API P95 latency ≤ 3 s.
- **Scenario Link**: Consumes publish receipts from `PLG-PUBLISH-ONLINE-001` and approvals from `MKP-PUBLISH-ONLINE-001`, exposing APIs/status to `PX-PUBLISH-ONLINE-UI-001`.

PowerX Core downloads approved Marketplace versions, verifies signatures, deploys plugins, handles auto-upgrades/rollbacks, and surfaces observability data to Admin and telemetry pipelines.

# Context & Assumptions

- **Prerequisites**
  - `PX_ONLINE_INSTALL=1` enabled with allowed Marketplace domains/CDNs configured.
  - Marketplace provides accessible artifact URLs, signatures, and integrity metadata.
  - Core has object storage or local cache directories for temporary bundles.
  - Tenant-level auto-upgrade policies (batches, allow/deny lists, windows) are persisted in configuration.
  - Audit and monitoring pipelines can receive install events, metrics, alerts.
- **Inputs**
  - Admin/CLI requests (`install/url`, `upgrade/schedule`) containing tenant, version, strategy.
  - Marketplace catalog metadata (version, dependencies, compatibility, risk).
  - Scheduler events that trigger auto-upgrade batches.
- **Outputs**
  - Install/upgrade results (success/failure/rollback) with runtime status, audit logs, metrics.
  - Updated plugin catalog cache and tenant-visible version lists.
  - Notifications (webhook/Slack/email) and telemetry events.
- **Boundaries**
  - Marketplace review/publish handled elsewhere.
  - Admin UI interface managed by `PX-PUBLISH-ONLINE-UI-001`.
  - Offline imports belong to `PX-PUBLISH-OFFLINE-001`.

# Architecture & Workflow

| Module                 | Responsibility                                              | Entry Point / Host                                                     |
|------------------------|-------------------------------------------------------------|------------------------------------------------------------------------|
| MarketplaceCatalogSyncer | Subscribe to Marketplace events, keep local catalog updated | `backend/internal/plugins/catalog/catalog_syncer.go`                  |
| OnlineInstallService   | Manage remote download, verification, deployment, state     | `backend/internal/plugins/online/install_service.go`                  |
| PackageFetcher         | Handle CDN/object storage download, resume, cache eviction | `backend/internal/plugins/online/package_fetcher.go`                  |
| UpgradeScheduler       | Generate auto-upgrade tasks, batch plans, rollback windows  | `backend/internal/plugins/online/upgrade_scheduler.go`                |
| TenantUpgradeExecutor  | Execute upgrades per tenant, monitor outcomes, rollback failures | `backend/internal/plugins/online/upgrade_executor.go`               |
| ObservabilityEmitter   | Emit install/upgrade metrics, logs, audit events            | `backend/internal/plugins/telemetry/emitter.go`                       |
| AdminInstallHandler    | Expose `POST /admin/plugins/install/url`, validate permissions, trigger service layer | `backend/cmd/app/http/handlers/plugins/install_url_handler.go` |

## Flow

1. Catalog syncer receives Marketplace updates and refreshes the local cache.
2. Admin/CLI submits an install request; handler validates permissions and forwards to the service.
3. Service fetches the bundle via PackageFetcher, verifies signatures/hashes.
4. InstallOrchestrator deploys the plugin, runs migrations/hooks, records state.
5. ObservabilityEmitter logs metrics/events; Admin UI reflects progress.
6. UpgradeScheduler schedules auto-upgrade batches; executor runs per tenant, handling rollback on failure.

# Contracts & Interfaces

- **Inbound APIs**
  - `POST /api/admin/plugins/install/url`: body includes `tenantId`, `versionId`, `source`, `strategy`, `notes`; response returns `installJobId`, `status`, `auditId`, `nextCheckAt`.
  - `POST /api/admin/plugins/upgrade/schedule`: configure batches, windows, allow/deny lists.
  - `GET /api/admin/plugins/versions`: tenant-facing catalog metadata, risk levels, strategies.
- **Outbound Interactions**
  - Marketplace catalog events / polling for metadata.
  - Package storage (S3/OSS/CDN) with pre-signed URLs and resume support.
  - Telemetry API `POST /telemetry/powerx/plugins/install` for latency/success/failure reasons.
  - Notification service for ops/tenant alerts (webhook/Slack/email).
- **Configuration**
  - `PX_ONLINE_ALLOWED_HOSTS`, `PX_ONLINE_CACHE_TTL`, `PX_UPGRADE_MAX_BATCH`, `PX_UPGRADE_ROLLBACK_POLICY`.

# Implementation Checklist

| Item             | Description                                                  | Status | Owner                      |
|------------------|--------------------------------------------------------------|--------|----------------------------|
| Catalog sync     | Subscribe to Marketplace events, maintain cache              | [ ]    | Platform Services Team     |
| Download & cache | Support CDN/OSS download, resume, hash check, cache lifecycle | [ ]    | Platform Services Team     |
| Install state machine | Manage install phases, retries, idempotency, rollback        | [ ]    | Plugin Runtime Team        |
| Auto-upgrade scheduling | Batch planning, allow/deny lists, pause/resume windows | [ ]    | Ops Automation Team        |
| Audit & metrics  | Emit install/upgrade metrics, audit logs, alert hooks        | [ ]    | Observability Team         |
| Documentation    | Update runbooks, troubleshooting, rollback procedures, Admin guide | [ ]    | Docs Steward Team          |

# Testing Strategy

- **Unit Tests**: `install_service_test.go`, `upgrade_scheduler_test.go`, `catalog_syncer_test.go`.
- **Integration Tests**: Mock Marketplace/Storage/Telemetry via `make test-online-install`.
- **End-to-End**: Drill “publish → sync → install → auto-upgrade → rollback” with Marketplace/Admin UI, recording audit IDs.
- **Non-functional**: Large bundle downloads (>500 MB), weak-network resilience, ≥20 tenant concurrent installs, auto-upgrade load tests, SLA validation.

# Observability & Ops

- **Metrics**: `plugins.online_install.success_rate`, `plugins.online_install.duration_ms`, `plugins.auto_upgrade.batch_latency`, `plugins.online_install.rollback_count`.
- **Logs**: Structured entries with `tenantId`, `versionId`, `installJobId`, `phase`, `duration`, `result`, `errorCode` (sensitive data redacted).
- **Alerts**: Install failures beyond threshold, auto-upgrade failure rate > 5%, download timeouts, abnormal rollback frequency (PagerDuty + Slack).
- **Dashboards**: Grafana “Plugins Online Install”, Telemetry publish funnel, operations batch tracker, audit review dashboard.

# Rollback & Failure Handling

- **Rollback Steps**: Pause auto-upgrade (`PX_ONLINE_AUTO_UPGRADE=0`), call `POST /api/admin/plugins/upgrade/rollback`, clear cache, refresh tenant status.
- **Remediation**: Offer `px plugins install --resume <installJobId>` CLI flow, retain failed bundles/logs, escalate repeated tenant failures with manual SOP.
- **Data Repair**: Reconcile catalog vs. actual state, re-sync Marketplace metadata, fix audit gaps, run migration rollback when installations corrupt data.

# Risks & Mitigations

| Risk / Item                        | Impact                       | Mitigation                                           | Owner                     | ETA        |
|------------------------------------|------------------------------|------------------------------------------------------|---------------------------|------------|
| CDN download failures/latency      | Install timeout, poor UX     | Multi-source download, resume support, retries, cache fallback | Platform Services Team     | 2025-02-10 |
| Auto-upgrade batch overshoot       | Widespread outage            | Pause controls, dynamic thresholds, fast rollback    | Ops Automation Team       | 2025-01-28 |
| Dependency incompatibility        | Install/runtime failure      | Pre-install dependency matrix checks, block risky versions, notify Marketplace | Plugin Runtime Team        | 2025-02-05 |
| Missing audit records              | Compliance risk              | Enforce audit writes, block installs on failure, provide audit repair scripts | Observability Team         | 2025-01-20 |

# References & Links

- Scenario document: `docs/scenarios/publish/SCN-PUBLISH-ONLINE-001.md`
- Marketplace review: `docs/usecases-seeds/SCN-PUBLISH-HUB-001/MKP-PUBLISH-ONLINE-001.md`
- CLI publishing: `docs/usecases-seeds/SCN-PUBLISH-HUB-001/PLG-PUBLISH-ONLINE-001.md`
- Operations guide: `docs/guides/publish/online.md`

> After updating the seed, run `npm run publish:usecases -- --scn-id SCN-PUBLISH-HUB-001 --validate-only` and rehearse “publish → install → upgrade” across teams.
