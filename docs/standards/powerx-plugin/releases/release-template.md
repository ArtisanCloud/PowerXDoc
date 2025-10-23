# Release Notes Template

| Field | Example | Notes |
|-------|---------|-------|
| Version | 0.2.0 | SemVer; aligns with `plugin.yaml` & manifest | 
| Channel | beta | stable / beta / alpha / dev |
| Release Date | 2025-12-01 | ISO 8601 |
| Highlight | Added CRM v2 migration helpers | Short summary |
| Manifest PR | https://github.com/.../pull/123 | Link to review |
| Package Hash | SHA256 from `hashes.txt` | Attach audit info |
| Capability Report | build/compat/report.json | Link to diff artefacts |
| Lifecycle Status | deprecated | active / deprecated / sunset |
| Sunset At | 2026-03-01 | Optional |
| Migration Guide | docs/lifecycle/runbooks/deprecation-runbook.md | |

## Change Log
- Feature: ...
- Fix: ...
- Security: ...

## Verification
- [ ] `make verify-manifest`
- [ ] `make check-capability`
- [ ] `make check-compat`
- [ ] `make package-pxp`
- [ ] Marketplace submission ID: _____
