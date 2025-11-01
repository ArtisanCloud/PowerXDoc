---
doc_id: PX-DEV-HOTLOAD-UI-001
scn_id: SCN-PUBLISH-HUB-001
title: PX-DEV-HOTLOAD-UI-001 - ui/dev
status: Draft
version: v0.1.0
repo_key: powerx
scope: powerx
layer: ui
domain: dev
scenario_title: "PowerX Plugin Release Hub"
owners:
  - name: Michael Hu
    role: Tech Steward
    contact: tech@artisan-cloud.com
  - name: Matrix-X
    role: Docs Coordinator
    contact: dev@artisan-cloud.com
contributors: []
linked_requirements:
  - type: scenario
    ref: SCN-DEV-HOTLOAD-001
  - type: scenario
    ref: SCN-PUBLISH-HUB-001
code_refs:
  - component: session_dashboard
    path: web-admin/src/pages/dev-hotload/SessionDashboard.vue
    description: Main session dashboard page with real-time list and actions
  - component: log_stream_panel
    path: web-admin/src/components/dev-hotload/SessionLogs.vue
    description: SSE log stream viewer with filtering and export
  - component: dev_hotload_api_client
    path: web-admin/src/services/devHotloadApi.ts
    description: GraphQL/SSE/REST client for the Dev API gateway
feature_flags:
  - name: PX_ADMIN_DEV_MODE
    description: Controls visibility of the Admin Dev panel
    default: false
    environments: [development, testing]
  - name: PX_DEV_PLUGIN_HOTLOAD
    description: Backend Dev API toggle that must stay in sync with the Admin panel
    default: true
    environments: [development]
last_reviewed_at: 2025-10-28

---

# Usecase Overview

- **Business Goal**: Provide a Dev Hotload control center in PowerX Admin so plugin engineers and platform ops can monitor session lifecycle, logs, and alerts in real time, with one-click terminate/reload to speed up troubleshooting and rollback.
- **Success Metrics**: SSE log rendering latency ≤ 1 s; terminate/refresh success rate ≥ 99%; panel interaction latency ≤ 200 ms; critical alerts delivered within 5 s.
- **Scenario Link**: Completes the loop with `PX-DEV-HOTLOAD-001` (Dev API), gives CLI (`PLG-DEV-HOTLOAD-001`) visual feedback, and supports candidate version validation in Stage 1 of `SCN-PUBLISH-HUB-001`.

The PowerX Admin Dev Hotload panel aggregates session events, metrics, and logs from the Dev API, providing a unified console for safe, transparent, and controllable hotloading.

# Context & Assumptions

- **Prerequisites**
  - Feature flags `PX_ADMIN_DEV_MODE=1` and backend `PX_DEV_PLUGIN_HOTLOAD=1` are enabled.
  - Admin users have `admin.devHotload.manage` permission to view the panel and issue terminate actions.
  - `PX_DEV_API_BASE_URL` points to `https://dev-api.powerx.local` (or equivalent) with SSE/GraphQL/REST support.
  - Web Admin config includes the `dev-hotload` route guard and Nuxt runtime env vars (SSE endpoint, Grafana base URL, etc.).
- **Inputs / Outputs**
  - Inputs: Dev API GraphQL queries, SSE `dev.session.*` events, Workflow Metrics aggregates, user-triggered terminate/reload commands.
  - Outputs: Live session table, log/metric widgets, user feedback (toasts, modals), generated audit record IDs.
- **Boundaries**
  - Does not run CLI build or sandbox orchestration; only surfaces backend state and actions.
  - Does not impact Marketplace releases or production plugin management—Dev environment only.
  - AuthN/AuthZ handled by IAM and backend APIs; UI consumes authorized results.

# Solution Blueprint

## Architecture Breakdown

| Layer | Scope  | Component / Module       | Responsibility                                            | Entry Point / Host                                      |
|-------|--------|--------------------------|-----------------------------------------------------------|---------------------------------------------------------|
| ui    | powerx | SessionDashboardPage     | Render Dev Hotload overview, coordinate widgets/actions   | `web-admin/src/pages/dev-hotload/SessionDashboard.vue`  |
| ui    | powerx | LogStreamPanel           | Display SSE logs with filtering/virtual scrolling/export  | `web-admin/src/components/dev-hotload/SessionLogs.vue`  |
| ui    | powerx | MetricsWidgets           | Show core metrics, trends, alert badges                   | `web-admin/src/components/dev-hotload/HotloadMetrics.vue` |
| ui    | powerx | DevHotloadApiClient      | Encapsulate GraphQL/SSE/REST calls with retry logic       | `web-admin/src/services/devHotloadApi.ts`               |
| ui    | powerx | DevHotloadRouterGuard    | Gate panel access based on permissions and flags          | `web-admin/src/router/guards/devHotloadGuard.ts`        |
| service | powerx | Admin GraphQL Gateway  | Expose `devHotloadSessions` queries/mutations             | `https://dev-api.powerx.local/internal/admin/graphql`   |
| service | powerx | Dev Hotload API (Core) | Stream SSE, handle terminate requests, sync CLI status    | `https://dev-api.powerx.local/internal/dev/plugins/*`   |

## Flow & Timing

1. User visits `/dev-hotload`; `DevHotloadRouterGuard` validates permissions/flags, then loads the page and issues GraphQL queries.
2. `DevHotloadApiClient` calls `devHotloadSessions` to retrieve sessions, metrics, and recent alerts; dashboard renders list and cards.
3. The page opens an SSE connection (`GET https://dev-api.powerx.local/internal/dev/plugins/stream`) to receive `SessionUpdated`, log entries, and alert events.
4. When the user triggers terminate/reload, the UI calls `POST https://dev-api.powerx.local/internal/dev/plugins/register/{sessionId}/terminate|reload`, updates state, and surfaces feedback.

# Contracts & Interfaces

- `GET /api/admin/dev-hotload/sessions` (graphQL query) — list sessions, includes pagination, filter, metrics.
- `POST /api/admin/dev-hotload/sessions/{sessionId}/terminate` — terminate a session with confirmation modal.
- `POST /api/admin/dev-hotload/sessions/{sessionId}/reload` — trigger manual reload (rare fallback from CLI).
- SSE endpoint `GET /internal/dev/plugins/stream` — streams session updates, log events, alerts.
- Configuration: `PX_ADMIN_DEV_MODE`, `PX_DEV_PLUGIN_HOTLOAD`, `PX_DEV_METRICS_REFRESH_MS`, `PX_DEV_LOG_RETENTION_LIMIT`.

# Implementation Checklist

| Item          | Description                                                  | Status | Owner                        |
|---------------|--------------------------------------------------------------|--------|------------------------------|
| UI layout     | Design responsive layout for session list, logs, metrics     | [ ]    | PowerX Admin UX Team         |
| SSE client    | Implement reconnect logic, batched rendering, optional IndexedDB caching | [ ]    | PowerX Admin Frontend Team   |
| Action guard  | Hook up permissions, button visibility, confirmations, audit logging | [ ]    | PowerX Admin Frontend Team   |
| Metrics integration | Embed Grafana/ECharts widgets, support threshold badges | [ ]    | Workflow Telemetry Steward   |
| Documentation | Update `docs/standards/powerx/web-admin/plugins/dev_hotload_panel.md` and operations guide | [ ]    | Docs Steward Team            |

# Testing Strategy

- **Unit Tests**: `SessionDashboard.spec.ts` for state rendering/pagination; `SessionLogs.spec.ts` for high-frequency log simulation; `devHotloadApi.spec.ts` for SSE reconnect/error handling.
- **Integration Tests**: `pnpm test:integration --filter admin-dev-hotload` with mock server to verify GraphQL + SSE cooperation.
- **End-to-End**: Cypress scenario `admin-dev-hotload.cy.ts` to simulate CLI register/reload/terminate and assert UI feedback.
- **Non-functional**: Maintain ≥55 FPS with 100 log events/sec; memory usage < 250 MB; action buttons succeed 99% of the time.

# Observability & Ops

- **Metrics**: `admin.dev_hotload.active_sessions`, `admin.dev_hotload.log_throughput`, `admin.dev_hotload.terminate_latency_ms`.
- **Logs**: Frontend breadcrumbs recording `action`, `sessionId`, `result`, `duration`, `errorCode` (forwarded to Sentry); backend audit entries in `admin_dev_hotload_audit`.
- **Alerts**: SSE disconnected > 60 s displays in-app alert and notifies `#powerx-admin-alerts`; three consecutive terminate failures escalate to PagerDuty L2.
- **Dashboards**: Grafana `PowerX/Admin Dev Hotload`, plus Sentry release health/perf dashboards.

# Rollback & Failure Handling

- **Rollback**: Disable the panel via `PX_ADMIN_DEV_MODE=0`; roll back the web-admin release tag; clear browser cache and reload.
- **Remediation**: Provide `scripts/devhotload/export-logs.ts` for log export; if SSE unavailable, guide ops to call Dev API directly; surface runbook links automatically.
- **Data Repair**: Run `scripts/devhotload/cleanup-local-cache.ts` to clear IndexedDB/LocalStorage; refresh GraphQL cache when session state becomes inconsistent.

# Follow-ups & Risks

| Risk / Item                         | Impact                           | Mitigation                                              | Owner                           | ETA        |
|------------------------------------|----------------------------------|---------------------------------------------------------|----------------------------------|------------|
| Large log volume slows the browser | Poor developer experience        | Virtualize log list, segment by session, apply rate limits | PowerX Admin Frontend Team       | 2025-02-05 |
| Misconfigured permissions expose sensitive data | Security & compliance issue | Audit role policies, mask logs, add download auditing   | PowerX IAM & Security Team       | 2025-01-31 |
| SSE disconnect causes stale state  | Ops unable to rely on status     | Use `last-event-id` replay, provide manual refresh and disconnect banners | PowerX Admin Frontend Team       | 2025-02-08 |

# References & Links

- Scenario document: `docs/scenarios/publish/SCN-PUBLISH-HUB-001.md`
- Related standards: `docs/standards/powerx/web-admin/plugins/dev_hotload_panel.md`, `docs/standards/powerx/backend/plugins/dev_hotload_api.md`
- Design assets: Figma “Admin Dev Hotload Dashboard”
- Sample PRs: <https://github.com/ArtisanCloud/PowerX/pulls?q=dev+hotload+admin>

> After updating the seed, sync `docs/_data/docmap.yaml` if any fields changed and run `npm run publish:usecases -- --scn-id SCN-PUBLISH-HUB-001 --validate-only`.
