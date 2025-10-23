# PowerX Plugin Lifecycle — Source Scaffold

This directory captures the canonical lifecycle standard for PowerX plugins from project bootstrap, through manifest governance and release packaging, to deprecation and sunset operations. Downstream integration docs are generated from this directory.

## Lifecycle Phases

1. **Bootstrap** — Repo fork/rename, required directory layout, environment preparation, and migration readiness. See [`bootstrap.md`](./bootstrap.md) and [`checklists/bootstrap-checklist.md`](./checklists/bootstrap-checklist.md).
2. **Manifest & Metadata** — Mapping `plugin.yaml` fields to release `manifest.yaml`, schema validation, and RBAC/config provenance. Refer to [`manifest-mapping.md`](./manifest-mapping.md) and JSON Schema in [`contracts/manifest.schema.json`](./contracts/manifest.schema.json).
3. **Packaging & Publishing** — Deterministic `.pxp` builds, hash + signature capture, Marketplace submission, and audit trails. Guidance stored in [`package.md`](./package.md).
4. **Deprecation & Sunset** — Lifecycle status machine, communication templates, and host visibility controls. Procedures live in [`deprecation.md`](./deprecation.md), notices, and runbooks.

### Bootstrap Timeline (M0 → M1)

```
Day 0   : Fork template → rename modules → initialise git remote
Day 1   : Ensure directory layout & copy config samples
Day 2   : Run make dev-setup + make migrate against local Postgres
Day 3   : Verify backend (/healthz) and admin UI shell via make run
Day 4   : Document bootstrap steps & checklists in docs/lifecycle/
Day 5   : Snapshot plugin.yaml, run make sync-lifecycle-docs, request review
```

> For a condensed walkthrough, see [`quickstart.md`](./quickstart.md); for validation, execute the [`bootstrap-checklist.md`](./checklists/bootstrap-checklist.md).

## Operational Workflow

- Author or update documents in `docs/lifecycle/`.
- Run `make sync-lifecycle-docs` to mirror curated copies into `docs/integration/01_plugin_lifecycle/` for reviewers and Marketplace operators.
- Commit both the lifecycle sources and synced outputs to keep history aligned.

## Build & Release Flow Snapshot

```
make run           ─┬─> backend/cmd/plugin (dev server with hot reload helpers)
                    └─> web-admin dev server via Nuxt CLI
make build         ─┬─> go build ./backend/cmd/plugin
                    └─> npm run build (Nuxt) with output under web-admin/.output/
make migrate       ─┬─> go run backend/cmd/database --action migrate
                    └─> applies Postgres migrations in backend/internal/db/migrations
make release       ─┬─> depends on make build + git metadata
                    └─> stages artefacts in build/pxp/ prior to signing
```

> Extension points: `make-files/build.mk` controls Go/Nuxt builds, `make-files/migrate.mk` wraps migrations, and `make-files/project.mk` centralises release metadata. Lifecycle automation hooks must slot into these files without duplicating logic.

## References

- Example metadata: [`examples/plugin.yaml`](./examples/plugin.yaml) and [`examples/manifest.yaml`](./examples/manifest.yaml)
- Communication templates: [`notices/`](./notices/)
- Operational runbooks: [`runbooks/`](./runbooks/)
- Automation inventory: [`tooling.md`](./tooling.md)

> 📌 **Note**: The lifecycle directory is authoritative. Do not edit the generated integration docs directly; instead, modify the sources here and re-run the sync task.
