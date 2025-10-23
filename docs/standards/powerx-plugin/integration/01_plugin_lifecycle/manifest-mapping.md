# Manifest & Plugin Metadata Mapping

This reference shows how development-time metadata (`plugin.yaml`) aligns with the release-time `manifest.yaml`. The goal is to keep both files synchronized so packaging, Marketplace review, and runtime behavior remain consistent.

| plugin.yaml Path | manifest.yaml Path | Notes |
|------------------|--------------------|-------|
| `id` | `id` | Must match exactly; serves as the canonical plugin identifier. |
| `name` | `name` | Keep display name consistent across development and release artefacts. |
| `version` | `version` | SemVer string; bump both files together during releases. |
| `runtime.entry` | `runtime.backend.entrypoint` | Manifest entrypoint must point to the same binary launched in development. |
| `runtime.env` | `runtime.backend.env` | Declarative environment block; ensure required keys (JWT issuer, audience, etc.) are mirrored. |
| `frontend.admin.static_dir` | `frontends[*].path` | Map the admin bundle location into the manifest `frontends` array. |
| `frontend.admin.health.http` | `frontends[*].health.http` | Keep health check endpoints synchronized. |
| `menus` | `contracts.api` / `frontends[*]` metadata | Menu definitions originate from `plugin.yaml`; manifest should reference menu resources via API contracts. |
| `routes.adminManifest` | `contracts.api` (admin manifest endpoint) | Manifest must list admin contract locations that PowerX calls at install time. |
| `rbac.resources` | `rbac` | Ensure every RBAC resource/action pair defined for dev is listed in the manifest RBAC matrix. |
| `agents` / `tools` | `contracts` / `build` metadata | Document agent capabilities and supporting contracts so Marketplace reviewers can trace versions. |
| `migrations` (in release manifest) | `migrations` | Keep migration IDs and checksums aligned with the compiled binaries shipped in `.pxp`. |
| — | `channel` | Manifest-only field that records release channel (`stable`, `beta`, `alpha`, `dev`). |
| — | `lifecycle.status` | Manifest-only field defining lifecycle state (`active`, `deprecated`, `sunset`). |
| — | `signature` | Added during packaging/signing; references hashes from staging outputs. |
| — | `build` | Capture git commit, builder identity, and timestamp linking release artefacts to source history. |

## Recommended Workflow

1. Update `plugin.yaml` with new metadata, menus, or RBAC changes.
2. Mirror changes into the working `manifest.yaml` (typically `docs/lifecycle/examples/manifest.yaml` before packaging).
3. Run `make verify-manifest` to confirm parity.
4. Proceed to `make package-pxp` which copies both files into the staging bundle.

See [`docs/lifecycle/package.md`](./package.md) for the full packaging flow and [`docs/lifecycle/contracts/manifest.schema.json`](./contracts/manifest.schema.json) for machine-readable validation rules.
