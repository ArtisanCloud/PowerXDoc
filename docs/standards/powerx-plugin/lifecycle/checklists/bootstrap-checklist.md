# Bootstrap Compliance Checklist

**Purpose**: Verify a newly initialized plugin repository conforms to the PowerX lifecycle baseline before feature work begins.

- [ ] Repo has been renamed to `com.powerx.plugin.<slug>` (Go module, Nuxt metadata, CI IDs updated)
- [ ] Required directories exist: `backend/`, `web-admin/`, `docs/`, `docs/lifecycle/`, `build/pxp/`
- [ ] `backend/etc/config.yaml` copied from example and environment variables documented
- [ ] `make dev-setup` executed successfully (Go modules + Node deps installed)
- [ ] `make migrate` applied base migrations against the configured Postgres database
- [ ] Backend health endpoint (`/healthz`) responds with HTTP 200 while `make run` is active
- [ ] Admin UI shell renders under `/_p/<plugin-id>/admin/` with correct runtime config
- [ ] Lifecycle docs (`docs/lifecycle/…`) updated with project-specific bootstrap notes
- [ ] `make sync-lifecycle-docs` executed to mirror lifecycle docs into integration directory
- [ ] `docs/lifecycle/examples/plugin.yaml` refreshed with the current metadata snapshot
- [ ] All checklist items reviewed by a second engineer prior to feature development
