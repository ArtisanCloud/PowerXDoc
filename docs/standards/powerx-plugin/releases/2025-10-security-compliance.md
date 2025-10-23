# Release Notes — Security & Compliance Enablement (2025.10)

## Summary

- Delivered tenant-scoped privacy enforcement (consent tokens, lifecycle evidence, masking pipeline).
- Added automated security baseline audits with SARIF/export artefacts and packaging integration.
- Implemented ToolGrant lifecycle governance, revocation history, and observability hooks.
- Built vulnerability advisory registry with signed distribution bundles and admin UI workflows.

## Manifest & Packaging Updates

- `plugin.yaml` now declares `security_baseline_version: "2025.10"` and `data_usage` entries for consent, ToolGrant, and advisory handling.
- `make package-pxp` stages binaries, frontend assets, and `build/security/advisories` into `dist/security/<version>/`.
- After packaging, capture hashes with `python scripts/hash_package.py build/pxp/$VERSION hashes.txt` and attach signature receipts.

## Validation

| Check | Result | Notes |
|-------|--------|-------|
| `make test` | ⚠️ Blocked | Sandbox cannot download Go 1.24 toolchain (`https://proxy.golang.org` unreachable). Run locally with Go 1.24 installed. |
| `make security-audit` | ⚠️ Blocked | Same Go toolchain restriction prevents `golangci-lint`/`govulncheck` execution. Re-run once Go 1.24 binaries available. |
| `npm run build` | ✅ | Nuxt production build succeeds (see `web-admin/.output/`). |
| `make package-pxp` | ⏳ Pending | Requires Go 1.24-built backend binary; execute after resolving toolchain downloads. |

## Outstanding Actions

1. Install Go 1.24 toolchain (or enable proxy access) and re-run `make test` + `make security-audit`.
2. Execute `make package-pxp` and store generated advisory bundles under `dist/security/<version>/`.
3. Upload audit exports (`scripts/security/audit_export.sh`) and signed advisories to the release ticket.
