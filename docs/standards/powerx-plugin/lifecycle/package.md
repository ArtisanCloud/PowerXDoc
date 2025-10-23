# Packaging & Publishing Workflow

Use this guide to turn a verified workspace into a `.pxp` package ready for Marketplace submission.

## Prerequisites

- `make build` and `make frontend-build` succeed (backend binaries + web-admin output available)
- `make verify-manifest` passes with matching `plugin.yaml` and `manifest.yaml`
- `make check-capability` and `make check-compat` emit no errors
- Lifecycle docs are synchronized (`make sync-lifecycle-docs`)

## Steps

1. **Validate Compatibility**
   ```bash
   npm install --prefix scripts
   make check-compat
   ```
   - Generates diff reports under `build/compat/`
   - Confirms JSON Schemas compile and highlights breaking capability changes

2. **Run Packaging**
   ```bash
   make package-pxp \
     MANIFEST_FILE=docs/lifecycle/examples/manifest.yaml \
     PACKAGE_STAGE_ROOT=build/pxp
   ```
   - Stages artefacts in `build/pxp/<version>/`
   - Copies backend binaries, manifest, plugin metadata, and admin UI bundle
   - Generates `hashes.txt`, `audit.log`, and `signature.json` (placeholder)

3. **Review Outputs**
   - Confirm `hashes.txt` includes every staged file
   - Check `audit.log` for timestamp, version, and source commit information
   - Update `signature.json` once the signing service returns a signature

4. **Archive for Marketplace**
   - Zip the directory if a single archive is required
   - Upload alongside release notes and manifest via the Marketplace API

5. **Post-Package Tasks**
   - Store hashes and audit logs with the release ticket
   - Attach signature evidence to compliance records
   - Update `docs/lifecycle/checklists/release-checklist.md` with completion date

## Files Generated

| File | Purpose |
|------|---------|
| `backend/` | Runtime binaries (`plugin`, optional `migrate`) |
| `web-admin/` | Production admin UI bundle |
| `meta/plugin.yaml` | Development metadata snapshot |
| `meta/manifest.yaml` | Release manifest used by Marketplace |
| `build/compat/report.json` | Summary of compatibility checks and diff artefacts |
| `hashes.txt` | SHA256 digests of all staged files |
| `audit.log` | Timestamped record linking artefacts to source state |
| `signature.json` | Placeholder for signing receipts |

Refer to [`docs/lifecycle/checklists/release-checklist.md`](./checklists/release-checklist.md) to ensure packaging, signing, and submission gates are complete.
