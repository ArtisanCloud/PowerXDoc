# Automation & Extension Points

This note inventories the existing build and release automation so lifecycle tasks can hook into the right entry points without duplication.

## Make Targets

| Target | Source File | Purpose | Lifecycle Hook |
|--------|-------------|---------|----------------|
| `make run` | `make-files/dev.mk` | Starts backend (`backend/cmd/plugin`) and exposes Nuxt dev server helpers. | Reference when documenting local bootstrap flow. |
| `make build` | `make-files/build.mk` | Compiles Go binaries and runs `npm run build` for the admin UI. Outputs to `backend/bin/` and `web-admin/.output/`. | Packaging relies on these artefacts; do not rebuild inside `make package-pxp`. |
| `make migrate` | `make-files/migrate.mk` | Runs Go-based migrations (`backend/cmd/database`). | Ensure migration readiness checks appear in bootstrap checklist. |
| `make release` | `make-files/project.mk` | Aggregates build artefacts and tags release metadata. | Lifecycle packaging steps will extend this via `make package-pxp`. |
| `make package-pxp` | `make-files/release.mk` | Stages `.pxp` artefacts, produces hashes/audit log, prepares signature placeholder. | Run before Marketplace submission; upload staged directory for signing. |
| `make check-capability` | `make-files/manifest.mk` | Loads capability descriptors, verifies schema paths, and enforces RBAC parity. | Run after updating `contracts/` to keep manifest + capability metadata in sync. |
| `make test` | `make-files/test.mk` | Executes backend Go tests. | Include in validation stage before promotions. |

## Key Files & Directories

- `backend/plugin/plugin.yaml` — development manifest; must stay aligned with release `manifest.yaml`.
- `build/pxp/` — staging area for packaged artefacts; lifecycle tasks should cleanly populate this directory prior to signing.
- `docs/lifecycle/` — single source for lifecycle documentation; sync via `make sync-lifecycle-docs` after updates.

## Extension Guidance

1. **Hook via make-files**: add new lifecycle automation (e.g., `sync-lifecycle-docs`, `package-pxp`) as dedicated `.mk` files and include them in the root `Makefile` to stay consistent with existing modular structure.
2. **Avoid duplicate builds**: reuse `make build` outputs; packaging steps should verify hashes rather than recompile.
3. **Log everything**: lifecycle automation must emit audit-friendly logs (artefact hashes, signature receipts) to simplify compliance reviews.
4. **Keep parity checks fast**: schema validation and metadata comparisons should complete under 30 seconds locally to fit within the packaging experience.
