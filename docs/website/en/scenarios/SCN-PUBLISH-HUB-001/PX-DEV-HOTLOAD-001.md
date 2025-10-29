---
doc_id: PX-DEV-HOTLOAD-001
scn_id: SCN-PUBLISH-HUB-001
title: PX-DEV-HOTLOAD-001 - service/dev
status: Draft
version: v0.1.0
repo_key: powerx
scope: powerx
layer: service
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
  - component: dev_hotload_handler
    path: backend/cmd/app/http/handlers/dev_hotload_handler.go
    description: REST entrypoint that maps register/reload/delete for Dev hotload APIs
  - component: dev_hotload_service
    path: backend/internal/devhotload/service.go
    description: Orchestrates sessions, sandbox scheduling, and rollback logic
  - component: dev_hotload_store
    path: backend/internal/devhotload/store/postgres.go
    description: Persists session state and artifact metadata
feature_flags:
  - name: PX_DEV_PLUGIN_HOTLOAD
    description: Enables the Dev environment hotload flow
    default: true
    environments: [development]
  - name: PX_DEV_SESSION_AUDIT
    description: Turns on session auditing and log forwarding
    default: true
    environments: [development, testing]
last_reviewed_at: 2025-10-28
last_generated_at: 2025-10-28

---

# Usecase Overview

- **Business Goal**: Deliver plugin hotload capabilities inside the PowerX Core backend so developers can load and test plugins quickly in local environments, shortening iteration loops.
- **Success Metrics**:
  - Hotload response time < 2 seconds
  - Development environment installation success rate ≥ 99%
  - Support live debugging and code-change detection
- **Scenario Link**: Powers Stage 1 (“submit candidate version”) of `SCN-PUBLISH-HUB-001` and works with `PLG-DEV-HOTLOAD-001` (powerx-plugin repo) to enable rapid validation during development.

PowerX Core handles runtime loading, permission isolation, event logging, and exposes install/rollback interfaces for Web Admin to ensure safe, controllable hotloading during development.

# Context & Assumptions

- **Prerequisites**
  - Feature flags `PX_DEV_PLUGIN_HOTLOAD=1`, `PX_DEV_SESSION_AUDIT=1`
  - Dev API host (`PX_DEV_API_BASE_URL`) points to `https://dev-api.powerx.local` or an equivalent environment
  - Developers hold the `plugin:dev` permission and completed mTLS or PAT configuration
  - `dev_hotload` sandbox images, resource quotas, and artifact buckets are provisioned
- **Inputs / Outputs**
  - Input: `register` payload (manifest, buildHash, entryPoints, tenantId), CLI-provided artifact URL or inline diff
  - Output: `sessionId`, `reloadToken`, sandbox entry, Admin SSE events, audit log records
- **Boundaries**
  - Covers Dev API session management and sandbox execution only; excludes plugin business logic or production release
  - CLI build/watch logic lives in `PLG-DEV-HOTLOAD-001` and is not duplicated here
  - Authentication/authorization is provided by IAM; this usecase consumes the result

# Solution Blueprint

## Architecture Breakdown

| Layer  | Scope | Component / Module | Responsibility                                                     | Entry Point / Host                                             |
|--------|-------|--------------------|--------------------------------------------------------------------|----------------------------------------------------------------|
| service| powerx| DevHotloadHandler  | Exposes `/internal/dev/plugins/*`, handles register/reload/delete  | `backend/cmd/app/http/handlers/dev_hotload_handler.go`         |
| service| powerx| DevHotloadService  | Orchestrates sandbox, validates manifest, manages session lifecycle| `backend/internal/devhotload/service.go`                       |
| service| powerx| DevSessionRegistry | Maintains session state, tokens, rollback hooks                    | `backend/internal/devhotload/registry.go`                      |
| infra  | powerx| DevHotloadStore    | Persist session & artifact metadata (Postgres/Redis)               | `backend/internal/devhotload/store/postgres.go`                |
| infra  | powerx| ArtifactStorage    | Sync build artifacts/static assets (S3/MinIO)                      | `backend/internal/devhotload/storage/s3.go`                    |
| infra  | powerx| SecurityValidator  | Performs signature validation, permission checks, sandbox isolation | `backend/internal/devhotload/security/policy.go`               |
| ops    | powerx| Dev Hotload API    | Unified host, default `https://dev-api.powerx.local`               | `https://dev-api.powerx.local/internal/dev/plugins/*`          |

## Flow & Timing

1. **Receive hotload request**: CLI calls `POST https://dev-api.powerx.local/internal/dev/plugins/register`; `DevHotloadHandler` validates the request and parses the manifest.
2. **Metadata & security checks**: `SecurityValidator` verifies signatures, permission declarations, and tenant isolation before artifact sync begins.
3. **Plugin load & initialization**: `DevHotloadService` boots the sandbox, `DevSessionRegistry` issues `sessionId`/`reloadToken`, and initializes lifecycle hooks.
4. **Event logging & feedback**: `DevHotloadStore` persists state, pushes `plugin.hotload.*` events to Admin/Telemetry, and returns session info to the CLI.

# Contracts & Interfaces

- **REST APIs**
  - `POST /internal/dev/plugins/register`: Accepts manifest metadata, bundle references, and returns session information.
  - `POST /internal/dev/plugins/reload`: Applies delta bundles and updates sandboxes; responds with status and diagnostics.
  - `DELETE /internal/dev/plugins/register/{sessionId}`: Terminates sessions and cleans sandbox state.
- **Configuration / Scripts**
  - Feature flags `PX_DEV_PLUGIN_HOTLOAD`, `PX_DEV_SESSION_AUDIT`
  - `config/dev_hotload.yaml`: Sandbox image, timeout, resource quota, artifact bucket settings
  - `scripts/devhotload/cleanup.sh`: Force-clean script used by CLI and ops teams

# Implementation Checklist

| Item           | Description                                                       | Status | Owner                    |
|----------------|-------------------------------------------------------------------|--------|--------------------------|
| Data model     | Design `dev_plugin_sessions`, `dev_plugin_artifacts` tables + migrations | [ ]    | PowerX Core Data Team    |
| Business logic | Implement `DevHotloadService` & `DevSessionRegistry` state machines and rollback | [ ]    | PowerX Core Runtime Team |
| Access control | Complete mTLS validation, tenant isolation, sandbox security policy | [ ]    | PowerX Core Security Team|
| Configuration  | Configure `config/dev_hotload.yaml`, flags, default quotas        | [ ]    | Platform Ops Team        |
| Documentation  | Update `docs/standards/powerx/backend/plugins/dev_hotload_api.md` and Admin guides | [ ]    | Docs Steward Team        |

# Testing Strategy

- **Unit Tests**: Cover loader, state machine transitions, security checks; mock signature failures.
- **Integration Tests**: Simulate the full flow (CLI → API → load → verify → event logging); validate DB operations and external dependencies.
- **End-to-End**: Use test plugin bundles to exercise load, debug, and uninstall; run `npm run test:e2e:plugin-hotload`.
- **Non-functional**: Validate response < 2 s, 10 concurrent loads without memory leaks, tenant isolation effectiveness.

# Observability & Ops

- **Metrics**:
  - `dev.hotload.core_register_latency_ms` (target P95 ≤ 500 ms)
  - `dev.hotload.core_reload_duration_ms` (target P95 ≤ 2 000 ms)
  - `dev.hotload.core_active_sessions`
  - `dev.hotload.core_failure_total`
- **Logs**: Structured JSON with `sessionId`, `pluginId`, `tenantId`, `event`, `duration`, `errorCode`, `sandboxHost`; stored in Loki/ELK and `reports/dev-hotload.ndjson`.
- **Alerts**: Trigger PagerDuty on three failures within five minutes; performance alert if P95 register latency > 800 ms for 10 minutes.
- **Dashboards**: Grafana “PowerX / Dev Hotload / Core” for latency, success rate, active sessions, failure distribution.

# Rollback & Failure Handling

- **Rollback Steps**
  1. Disable hotload (`PX_DEV_PLUGIN_HOTLOAD=0`)
  2. Issue `DELETE` for all active sessions
  3. Purge sandbox temp directories/cache (`/var/lib/powerx/dev-hotload/*`)
  4. Roll back migrations for `dev_plugin_sessions` / `dev_plugin_artifacts` if needed
- **Remediation**
  - On load failure: auto retry 3 times, raise error log + alert
  - Access violations: reject with detailed message
  - Signature validation failure: stop load and quarantine bundle
- **Data Repair**: Run `scripts/devhotload/cleanup.sh --force` to remove stale sessions and records; requires Platform Ops privileges.

# Follow-ups & Risks

| Risk / Item                           | Impact                     | Mitigation                                              | Owner                     | ETA        |
|---------------------------------------|----------------------------|---------------------------------------------------------|---------------------------|------------|
| Hotload performance bottlenecks       | Longer dev iterations      | Introduce incremental cache, async reload pipeline, continuous load testing | PowerX Core Runtime Team  | 2025-02-15 |
| Incomplete isolation policy           | Security exposure          | Harden sandbox policy, rotate certificates regularly, publish audit reports | PowerX Core Security Team | 2025-01-31 |
| CLI / Core protocol drift             | Compatibility issues       | Maintain protocol versioning, add CI integration matrix | PowerX Plugin CLI Team    | 2025-02-28 |

# References & Links

- Scenario document: `docs/scenarios/publish/SCN-PUBLISH-HUB-001.md`
- Related standards: `docs/standards/powerx/backend/plugins/dev_hotload_api.md`, `docs/standards/powerx/security/plugin-security.md`
- Code PRs: `https://github.com/ArtisanCloud/PowerX/pull/TBD`
- Design assets: Figma whiteboard (link TBD)

> After completion, update `docs/_data/docmap.yaml` if fields change, and run `npm run publish:usecases -- --scn-id SCN-PUBLISH-HUB-001 --validate-only`.
