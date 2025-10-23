# Lifecycle Quickstart

Need a condensed reference? Follow this high-level sequence before writing business code:

1. **Clone & Rename** — Fork the template, rename to `com.powerx.plugin.<slug>`, update module references.
2. **Install Tooling** — Copy `backend/etc/config.example.yaml`, export env vars, run `make dev-setup`.
3. **Apply Migrations** — Start Postgres and execute `make migrate` to seed the schema.
4. **Smoke the Stack** — Use `make run` to bring up backend + admin UI, confirm `/healthz` and admin shell work.
5. **Document** — Capture decisions in `docs/lifecycle/bootstrap.md` and tick off the checklist.
6. **Snapshot Metadata** — Refresh `docs/lifecycle/examples/plugin.yaml` and any manifest snapshots.
7. **Sync Docs** — Run `make sync-lifecycle-docs` so reviewers see the latest lifecycle guidance.

> The quickstart complements the detailed [Bootstrap Guide](./bootstrap.md) and [Checklist](./checklists/bootstrap-checklist.md). Treat it as a reminder for experienced engineers.
