---
doc_id: PX-PUBLISH-OFFLINE-UI-001
scn_id: SCN-PUBLISH-HUB-001
title: PX-PUBLISH-OFFLINE-UI-001 - ui/publish
status: Draft
version: v0.1.0
repo_key: powerx
scope: powerx
layer: ui
domain: publish
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
    ref: SCN-PUBLISH-HUB-001
  - type: scenario
    ref: SCN-PUBLISH-OFFLINE-001
code_refs:
  - component: offline_install_wizard
    path: web-admin/src/pages/plugins/offline/OfflineInstallWizard.vue
    description: Multi-step wizard for offline upload/validation and main interaction flow
  - component: offline_package_table
    path: web-admin/src/components/plugins/offline/OfflinePackageTable.vue
    description: Displays offline versions, status badges, and install/rollback actions
  - component: offline_audit_timeline
    path: web-admin/src/components/plugins/offline/OfflineAuditTimeline.vue
    description: Shows upload, review, install events and approval history
feature_flags:
  - name: PX_OFFLINE_INSTALL
    description: Controls whether the backend offline install API is available
    default: false
    environments: [staging, production]
  - name: PX_ADMIN_PLUGIN_OFFLINE
    description: Toggles visibility of the offline plugin page in Web Admin
    default: false
    environments: [staging, production]
last_reviewed_at: 2025-10-28

---

# Usecase Overview

- **Business Goal**: Provide tenant administrators with a trustworthy interface for uploading, validating, installing, and rolling back offline `.pxp` bundles—even in fully disconnected environments.
- **Success Metrics**: Offline upload success rate ≥ 99%; install wizard completion ≤ 4 minutes; error messaging accuracy 100%; audit events match backend records 100%.
- **Scenario Link**: Works with Stage 4 of `SCN-PUBLISH-OFFLINE-001`, bundles from `PLG-PUBLISH-OFFLINE-001`, Marketplace review (`MKP-PUBLISH-OFFLINE-001`), and the install engine (`PX-PUBLISH-OFFLINE-001`).

The offline install UI turns Marketplace-approved bundles into actionable workflows, covering upload, validation, installation, rollback, and audit retrieval so enterprises without internet access still receive a consistent release experience.

# Context & Assumptions

- **Prerequisites**
  - Feature flags `PX_ADMIN_PLUGIN_OFFLINE=1` and `PX_OFFLINE_INSTALL=1` approved through the release process.
  - Administrators hold `admin.plugins.offline` and `admin.plugins.install` permissions and passed compliance review.
  - Marketplace synchronized `.pxp`, `manifest.json`, `integrity.txt`, `manifest.signature` to the Publish Hub API.
  - Web Admin config sets `PX_OFFLINE_UPLOAD_SIZE_MB`, trusted CA list, and browser supports File Streams API.
- **Inputs / Outputs**
  - Inputs: `.pxp` uploads, version metadata, approval notes, rollback selections; Publish Hub returns version catalog, job events, audit IDs.
  - Outputs: Install/rollback results, validation reports, audit timelines, downloadable logs.
- **Boundaries**
  - UI does not create/modify `.pxp` bundles nor handle Marketplace review.
  - Online pathways remain the responsibility of `PX-PUBLISH-ONLINE-UI-001`.
  - Server-side handles scanning/signature validation; UI surfaces outcomes and guidance.

# Solution Blueprint

## Architecture Breakdown

| Layer | Scope  | Component / Module       | Responsibility                                              | Entry Point / Host                                         |
|-------|--------|--------------------------|-------------------------------------------------------------|------------------------------------------------------------|
| ui    | powerx | OfflineInstallWizardPage | Multi-step wizard for upload/validation/confirmation        | `web-admin/src/pages/plugins/offline/OfflineInstallWizard.vue` |
| ui    | powerx | OfflinePackageTable      | Offline version list with status badges and actions         | `web-admin/src/components/plugins/offline/OfflinePackageTable.vue` |
| ui    | powerx | OfflineAuditTimeline     | Timeline of upload, review, install, rollback events        | `web-admin/src/components/plugins/offline/OfflineAuditTimeline.vue` |
| ui    | powerx | OfflinePluginStore       | Manage UI state, cache catalog, coordinate SSE events       | `web-admin/src/stores/plugins/offlinePluginStore.ts`       |
| ui    | powerx | OfflinePluginApiClient   | Wrap GraphQL/REST/SSE calls with retry/backoff             | `web-admin/src/services/plugins/offlinePluginApi.ts`       |
| service | powerx | Admin GraphQL Gateway   | Provide catalog queries, review status, install job lookups | `https://admin-api.powerx.local/graphql`                   |
| service | powerx | Offline Install API     | Perform validation, install/rollback, emit audit/metric data | `POST /api/admin/plugins/install/local`                    |

## Flow & Timing

1. Admin navigates to `/admin/plugins/offline`; `RouteGuard` checks flags/permissions, loads catalog and recent audits.
2. User drags a `.pxp` bundle into the wizard; UI verifies file headers, size limits, shows manifest preview.
3. UI calls `POST /api/admin/plugins/offline/uploads` for a pre-signed URL, uploads chunks, and receives `upload.validated` via SSE.
4. Admin selects tenant/version/rollback strategy and submits `POST /api/admin/plugins/install/local`; UI creates a job card and shows progress.
5. UI subscribes to `GET /api/admin/plugins/install/stream` for `install.progress/completed/failed` events, updating status, logs, and alerts in real time.
6. Success yields audit ID, download links, and rollback entry; failure highlights the failing stage, remediation guidance, and retry/rollback actions.

# Contracts & Interfaces

- **APIs**
  - `GET /api/admin/plugins/offline/packages` — List offline packages with review status and last audit event.
  - `POST /api/admin/plugins/offline/uploads` — Create upload sessions and return pre-signed URLs; enforces flags and permissions.
  - `POST /api/admin/plugins/install/local` — Trigger install job (tenant, version, strategy, upload session).
  - `POST /api/admin/plugins/offline/rollback` — Manually roll back to prior snapshot.
  - `GET /api/admin/plugins/install/stream` — SSE stream for upload/install/rollback events.
- **Configuration & Scripts**
  - `PX_OFFLINE_UPLOAD_SIZE_MB`, `PX_OFFLINE_ALLOWED_EXTENSIONS`, `PX_ADMIN_SSE_RETRY_MS`, `PX_OFFLINE_TIMEOUTS`.
  - Script `scripts/plugins/offline/generate-report.ts` to prepare offline install reports.

# Implementation Checklist

| Item              | Description                                                 | Status | Owner                        |
|-------------------|-------------------------------------------------------------|--------|------------------------------|
| Offline wizard    | Multi-step form, state sync, retry workflow, audit prompts  | [ ]    | PowerX Admin Frontend Team   |
| Upload validation | Client-side file checks, chunk upload, failure recovery     | [ ]    | PowerX Admin Frontend Team   |
| Progress monitor  | SSE subscription, progress bars, log/alert rendering        | [ ]    | PowerX Admin Frontend Team   |
| Permissions & flags | Route guard, button visibility, global messaging            | [ ]    | IAM & Security Team          |
| Metrics & audit   | Emit tracking events, expose audit IDs, integrate Workflow Metrics | [ ]    | Workflow Telemetry Steward   |
| Docs & training   | Update `docs/guides/admin/offline-install.md`, FAQ, training material | [ ]    | Docs Steward Team            |

# Testing Strategy

- **Unit Tests**: `OfflineInstallWizard.spec.ts`, `OfflineAuditTimeline.spec.ts`, `offlinePluginStore.spec.ts`.
- **Integration Tests**: MSW/Cypress component tests simulating upload sessions and SSE events (`pnpm test:integration --filter offline-plugin`).
- **End-to-End**: Cypress scenario `admin-offline-install.cy.ts` covering upload → install → rollback; use `px-plugin pack` to supply bundles.
- **Non-functional**: Large bundle (>1 GB) upload, offline retry UX, low-end device FPS ≥ 50, WCAG AA compliance.

# Observability & Ops

- **Metrics**: `admin.offline_upload.success_rate`, `admin.offline_install.duration_ms`, `admin.offline_install.error_count`, `admin.offline_install.rollback_rate`.
- **Logs**: Frontend events `offline_install_action` with `tenantId`, `packageDigest`, `phase`, `result`; Sentry for client errors; backend audit ID mapping.
- **Alerts**: Three consecutive install failures trigger PagerDuty; SSE disconnect > 60 s raises in-app and `workflow-metrics` alerts; upload success rate < 95% pings `#powerx-ops`.
- **Dashboards**: Grafana `PowerX/Admin Offline Publish`, Data Studio audit reports, Sentry release health.

# Rollback & Failure Handling

- **Rollback**: Hide the UI via `PX_ADMIN_PLUGIN_OFFLINE=0`, roll back web-admin release tag, purge CDN cache.
- **Remediation**: Provide CLI manual install guide, highlight failing stage, allow retry/rollback, expose support runbooks.
- **Data Repair**: Run `scripts/plugins/offline/cleanup-upload-session.ts` for stale sessions; coordinate with Core to restore audit/installation state.

# Follow-ups & Risks

| Risk / Item                             | Impact                        | Mitigation                                     | Owner                           | ETA        |
|----------------------------------------|-------------------------------|------------------------------------------------|----------------------------------|------------|
| Large bundles overload the browser     | UI freeze and failed uploads  | Streamed reading, chunk uploads, size warnings | PowerX Admin Frontend Team      | 2025-02-05 |
| Audit timeline mismatch with backend   | Compliance gaps               | Align audit ID mapping, backend⇔frontend validation | Workflow Telemetry Steward | 2025-01-25 |
| Misconfigured multi-tenant permissions | Unauthorized installs/blocks  | Strengthen IAM policy testing, automated verification prior to go-live | IAM & Security Team             | 2025-02-10 |

# References & Links

- Scenario document: `docs/scenarios/publish/SCN-PUBLISH-OFFLINE-001.md`
- Backend usecase: `docs/usecases-seeds/SCN-PUBLISH-HUB-001/PX-PUBLISH-OFFLINE-001.md`
- Docmap entry: `docs/_data/docmap.yaml`
- Design assets: Figma “Admin Offline Plugin Install Wizard”

> After updating the seed, run `npm run publish:usecases -- --scn-id SCN-PUBLISH-HUB-001 --validate-only` to verify structure and schedule an admin walkthrough rehearsal.
