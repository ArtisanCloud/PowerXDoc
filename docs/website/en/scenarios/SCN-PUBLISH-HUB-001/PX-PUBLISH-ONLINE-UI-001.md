---
doc_id: PX-PUBLISH-ONLINE-UI-001
scn_id: SCN-PUBLISH-HUB-001
title: PX-PUBLISH-ONLINE-UI-001 - ui/marketplace
status: Draft
version: v0.1.0
repo_key: powerx
scope: powerx
layer: ui
domain: marketplace
scenario_title: "PowerX Plugin Release Hub"
owners:
  - name: Michael Hu
    role: Tech Steward
    contact: tech@artisan-cloud.com
  - name: Matrix-X
    role: Docs Coordinator
    contact: dev@artisan-cloud.com
contributors:
  - name: Chen Yao
    role: Admin UX Lead
    contact: chen.yao@artisan-cloud.com
  - name: Li Wei
    role: Frontend Engineer
    contact: li.wei@artisan-cloud.com
linked_requirements:
  - type: scenario
    ref: SCN-PUBLISH-HUB-001
  - type: scenario
    ref: SCN-PUBLISH-ONLINE-001
code_refs:
  - component: marketplace_dashboard_page
    path: web-admin/src/pages/plugins/marketplace/index.vue
    description: Shows the online plugin catalog, version details, and action panel
  - component: install_upgrade_drawer
    path: web-admin/src/components/plugins/marketplace/InstallUpgradeDrawer.vue
    description: Handles install/upgrade forms, policy selection, and confirmation flow
  - component: batch_execution_monitor
    path: web-admin/src/components/plugins/marketplace/BatchExecutionMonitor.vue
    description: Visualizes upgrade batches, progress, failures, and alerts
feature_flags:
  - name: PX_MARKETPLACE_UI
    description: Controls whether the Marketplace online publishing UI is available to admins
    default: false
    environments: [staging, production]
  - name: PX_AUTO_UPGRADE_UI
    description: Enables auto-upgrade strategy configuration and batch monitoring features
    default: false
    environments: [staging, production]
last_reviewed_at: 2025-10-28

---

# Usecase Overview

- **Business Goal**: Provide tenant administrators and platform ops with a unified UI for viewing, installing, upgrading, rolling back, and monitoring online plugins to improve release efficiency and observability.
- **Success Metrics**: Install/upgrade flow ≤ 4 steps; operation success rate ≥ 98%; key metric refresh ≤ 5 s; P95 first-contentful paint < 2 s.
- **Scenario Link**: Consumes versions listed by `MKP-PUBLISH-ONLINE-001` and service states from `PX-PUBLISH-ONLINE-001`, supporting Stage 3–4 interactions in the main scenario.

The Marketplace Admin UI consolidates Marketplace catalog data and Core installation capabilities into one control surface, offering filtering, risk indication, install/upgrade wizards, batch monitoring, and failure response.

# Context & Assumptions

- **Prerequisites**
  - Feature flags `PX_MARKETPLACE_UI=1` and `PX_AUTO_UPGRADE_UI` enabled in target environments.
  - Backend APIs (`GET /api/admin/plugins/versions`, `POST /install/url`, `GET /upgrade/batches`, etc.) implemented and stable.
  - Admin users have `admin.plugins.marketplace` and `admin.plugins.install` permissions.
  - Nuxt/Nitro environment configured with telemetry, notification, and IAM endpoints; internationalization and dark mode enabled.
- **Inputs**
  - Marketplace/Core metadata (version info, risk labels, install status).
  - User actions: filter, install, upgrade, pause batch, roll back.
  - Telemetry events, alerts, audit logs.
- **Outputs**
  - Visualized catalog, risk indicators, auto-upgrade strategies, batch execution status.
  - User feedback: toasts, modals, audit IDs, alert links.
  - Quick links to documentation and SOPs.
- **Boundaries**
  - Marketplace review/listing handled elsewhere.
  - Offline import flows belong to the offline UI usecase.
  - Core installation logic resides in service-layer usecases.

# Solution Blueprint

## Architecture Breakdown

| Module                 | Scope  | Responsibility                                           | Entry Point / Host                                             |
|------------------------|--------|----------------------------------------------------------|----------------------------------------------------------------|
| MarketplaceDashboardPage | powerx | Render catalog, filters, risk callouts                    | `web-admin/src/pages/plugins/marketplace/index.vue`            |
| VersionDetailPanel     | powerx | Show metadata, dependencies, changelog, risk badges      | `web-admin/src/components/plugins/marketplace/VersionDetailPanel.vue` |
| InstallUpgradeDrawer   | powerx | Install/upgrade wizard, policy selection, validation     | `web-admin/src/components/plugins/marketplace/InstallUpgradeDrawer.vue` |
| BatchExecutionMonitor  | powerx | Visualize auto-upgrade batches, progress, failure counts | `web-admin/src/components/plugins/marketplace/BatchExecutionMonitor.vue` |
| RiskBadge & Alerts     | powerx | Display risk levels, alert messages, rollback entry      | `web-admin/src/components/plugins/marketplace/RiskBadge.vue`   |
| MarketplaceStore       | powerx | Manage Vue state for versions, batches, installs, permissions | `web-admin/src/stores/marketplaceStore.ts`                |
| ApiClient              | powerx | Wrap Admin API calls with error handling & retries        | `web-admin/src/services/plugins/marketplaceApi.ts`             |

## Flow & Timing

1. Admin opens `/plugins/marketplace`; guard validates flags/permissions; store fetches `GET /api/admin/plugins/versions`.
2. Dashboard renders list/cards; details panel displays version metadata and risk indicators.
3. Install/upgrade drawer guides the admin through strategy selection, summary, confirmation; posts to `POST /api/admin/plugins/install/url`.
4. Batch monitor polls/SSE `GET /api/admin/plugins/upgrade/batches` to visualize execution, allow pause/resume/rollback.
5. Alerts and risk badges surface errors/escalations; Admin can download install logs or follow runbook links.

# Contracts & Interfaces

- `GET /api/admin/plugins/versions` — Catalog, compatibility, risk, tenant visibility.
- `POST /api/admin/plugins/install/url` — Installation request with tenant, version, strategy, notes.
- `GET /api/admin/plugins/upgrade/batches` — Auto-upgrade batches with status.
- `POST /api/admin/plugins/upgrade/rollback` — Manual rollback entry point.
- `GET /api/admin/plugins/install/logs` — Fetch install logs and audit entries.
- Config/scripts: `PX_MARKETPLACE_UI_ALLOWED_ROLES`, `PX_MARKETPLACE_UI_METRICS_REFRESH_MS`, `PX_MARKETPLACE_UI_MAX_STREAM_ITEMS`, `scripts/plugins/marketplace/export-batch-report.ts`.

# Implementation Checklist

| Item            | Description                                                  | Status | Owner                     |
|-----------------|--------------------------------------------------------------|--------|---------------------------|
| Page skeleton   | Responsive layout for catalog, details, actions              | [ ]    | Frontend Team             |
| Install wizard  | Strategy configuration, validation, confirmation, permissions| [ ]    | Frontend Team             |
| Batch monitor   | Progress visualization, failure stats, pause/rollback        | [ ]    | Frontend Team             |
| State management| Coordinate versions, batches, install status, permissions    | [ ]    | Frontend Team             |
| Alerts & feedback | Risk reminders, notification entries, log viewer, rollback tips | [ ]    | Ops UX Team               |
| Documentation   | Update admin handbook, FAQ, alert handling procedures        | [ ]    | Docs Steward Team         |

# Testing Strategy

- **Unit Tests**: `MarketplaceDashboard.spec.ts`, `InstallUpgradeDrawer.spec.ts`, `BatchExecutionMonitor.spec.ts`.
- **Integration Tests**: Cypress/Vitest with mock APIs (`pnpm test:ui --filter marketplace-install`).
- **End-to-End**: Full admin workflow from selection to upgrade/rollback against sandbox or staging.
- **Non-functional**: Weak-network retries, bulk notification load, WCAG AA accessibility, dark/light mode QA, internationalization coverage.

# Observability & Ops

- **Metrics**: `ui.marketplace.page_load_ms`, `ui.marketplace.install.click_through_rate`, `ui.marketplace.batch.success_rate`, `ui.marketplace.alert.dismiss_rate`.
- **Logs**: Frontend analytics capturing `action`, `versionId`, `tenantScope`, `result`, `duration`; Sentry for errors.
- **Alerts**: Installation triggered but no result within 5 minutes, unresolved auto-upgrade failures, batches paused beyond SLA (in-app + `#powerx-admin-alerts`).
- **Dashboards**: Frontend performance board, admin action funnel, batch execution heatmap, alert handling overview.

# Rollback & Failure Handling

- **Rollback**: Hide Marketplace UI via feature flag; roll back web-admin release; clear caches and force refresh.
- **Remediation**: Provide CLI instructions (`px plugins install --tenant <id> --version <id>`), export install requests, offer contact entries; embed runbook links.
- **Data Repair**: Force refresh API when UI state diverges; if batch data corrupt, call backend rebuild or manual DB adjustment and surface status to UI.

# Risks & Mitigations

| Risk / Item                         | Impact                       | Mitigation                                      | Owner                 | ETA        |
|------------------------------------|------------------------------|-------------------------------------------------|-----------------------|------------|
| Batch visualization out of sync    | Admin misreads progress      | Use SSE + polling fallback, manual refresh link, align metrics | Frontend Team          | 2025-02-01 |
| Risk prompts ignored               | Increased rollout risk       | Mandatory confirmation dialogs, approval routing, prominent badges | Admin UX Lead         | 2025-01-25 |
| Weak network causes action failure | Lower install success rate   | Add retries, offline messaging, auto-save drafts | Frontend Team          | 2025-02-10 |
| Alert fatigue                      | Ops desensitization          | Alert tiers, bulk acknowledge, configurable thresholds | Ops UX Team            | 2025-02-05 |

# References & Links

- Scenario document: `docs/scenarios/publish/SCN-PUBLISH-ONLINE-001.md`
- Backend service: `docs/usecases-seeds/SCN-PUBLISH-HUB-001/PX-PUBLISH-ONLINE-001.md`
- Marketplace review: `docs/usecases-seeds/SCN-PUBLISH-HUB-001/MKP-PUBLISH-ONLINE-001.md`
- Admin handbook: `docs/guides/publish/online.md`

> After updating the seed, run `npm run publish:usecases -- --scn-id SCN-PUBLISH-HUB-001 --validate-only` and schedule an admin walkthrough to confirm the UI flow end-to-end.
