# Lifecycle Glossary

| Term | Definition | Where It Applies |
|------|------------|------------------|
| Plugin Package (`.pxp`) | Immutable bundle containing backend binaries, admin UI output, migrations, contracts, and manifest metadata. | Release automation (`make release`, CI distributors) |
| Lifecycle Manifest | Release-time `manifest.yaml` describing identity, SemVer, compatibility, runtime assets, lifecycle status, and cryptographic evidence. | Marketplace review, host installation, rollback analysis |
| Release Channel Record | Marketplace entry that maps a version to a distribution channel (`stable`, `beta`, `alpha`, `dev`) and records validation state. | Marketplace APIs, tenant catalog curation |
| Lifecycle Status Ledger | Append-only history of status transitions (active → deprecated → sunset) with effective dates, replacement versions, and notice links. | Compliance audits, tenant communication tracking |
| Manifest Parity Check | Validation routine keeping development `plugin.yaml` aligned with shipping `manifest.yaml` using JSON Schema. | `make verify-manifest`, pre-release CI |
| Packaging Audit Log | Structured log produced during `.pxp` packaging that lists hashes, signatures, and artefact locations for traceability. | `make package-pxp`, attach to release notes |
| Sync Lifecycle Docs | Mirroring `docs/lifecycle/` source content into `docs/integration/01_plugin_lifecycle/` for external reviewers. | `make sync-lifecycle-docs`, mandatory in Phase 6 |
