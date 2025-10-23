# Plugin Lifecycle Bootstrap Guide

This guide walks plugin engineers through standing up a PowerX plugin workspace that satisfies lifecycle governance requirements before any business code is written.

## 1. Fork & Rename

1. Fork the template repository (`com.powerx.plugin.base`) or copy the latest release tag.
2. Rename the folder and module paths to the target plugin namespace (`com.powerx.plugin.<slug>`).
3. Update `go.mod`, Nuxt package metadata, and CI identifiers to reflect the new plugin ID.

## 2. Enforce Directory Layout

Ensure the following directories exist (create missing ones):

```
backend/
  cmd/{database,plugin}/
  internal/
  plugin/
web-admin/
docs/
  lifecycle/
  integration/01_plugin_lifecycle/
build/pxp/
```

- Keep lifecycle source docs in `docs/lifecycle/`; do not edit integration copies directly.
- Stage packaging artefacts only inside `build/pxp/` to avoid polluting source directories.

## 3. Configure Environment & Tooling

1. Copy `backend/etc/config.example.yaml` to `backend/etc/config.yaml` and adjust local values.
2. Export required env vars for local runs (`POWERX_DB_DSN`, `POWERX_AUTH_JWTSECRET`, etc.).
3. Run `make dev-setup` to install Go modules, Node dependencies, and lint tooling.
4. Validate Go and Node versions match the repository prerequisites.

## 4. Prepare Database & Migrations

1. Start a local Postgres instance with a database dedicated to the plugin.
2. Update `backend/etc/config.yaml` (or env) with the DSN.
3. Execute `make migrate` to apply base migrations.
4. Confirm row-level security helpers exist by checking `backend/internal/db/migrations/`.

## 5. Verify Backend Runtime

1. Launch the backend via `make run`.
2. Hit `http://localhost:8086/healthz` to confirm readiness.
3. Inspect logs for tenant context middleware and RBAC guard wiring.

## 6. Verify Admin UI

1. From `web-admin/`, run `npm run dev` (or rely on `make run`).
2. Ensure runtime config exposes `NUXT_PUBLIC_API_BASE` pointing at the backend proxy.
3. Confirm the admin shell renders without 404s under `/_p/<plugin-id>/admin/`.

## 7. Initialize Lifecycle Documentation

1. Populate `docs/lifecycle/bootstrap.md` (this file) and related checklists with project-specific notes.
2. Run `make sync-lifecycle-docs` to update integration docs for reviewers.
3. Commit both lifecycle sources and synced outputs.

## 8. Record Baseline Metadata

1. Copy `backend/plugin/plugin.yaml` into `docs/lifecycle/examples/` for historical comparison.
2. If a release `manifest.yaml` exists, store its snapshot alongside.
3. Document any deviations in `docs/lifecycle/tooling.md` so reviewers understand bootstrap choices.

## 9. Self-Audit

Use the checklist in `docs/lifecycle/checklists/bootstrap-checklist.md` to verify compliance before moving to feature development.

> ✅ After completing these steps the workspace is ready for lifecycle-aware feature work, packaging automation, and Marketplace registration.
