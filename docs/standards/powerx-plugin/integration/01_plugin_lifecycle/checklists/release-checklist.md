# Release & Packaging Checklist

**Purpose**: Ensure each plugin release is packaged, signed, and submitted with full traceability.

## Pre-Packaging

- [ ] `make verify-manifest` succeeds with current `plugin.yaml` and release `manifest.yaml`
- [ ] Channel and lifecycle status updated appropriately in `manifest.yaml`
- [ ] Release notes drafted (features, fixes, migration notes)

## Packaging

- [ ] `make build` and `make frontend-build` produce artefacts without warnings
- [ ] `make package-pxp` completes and creates `build/pxp/<version>/`
- [ ] `hashes.txt` contains entries for backend binaries, manifest, plugin metadata, and web assets
- [ ] `audit.log` captures `created_at`, `plugin_version`, `source_commit`, `staged_dir`
- [ ] `signature.json` generated (status `pending` until signing service confirms)

## Signing & Validation

- [ ] Package uploaded to signing service; `signature.json` updated with signer + timestamp
- [ ] Signed hashes verified against `hashes.txt`
- [ ] Marketplace preflight (`make verify-manifest` and manual review) completed

## Submission

- [ ] Package (`.pxp` or zipped directory) uploaded via Marketplace API
- [ ] Manifest channel + version registered and confirmed unique
- [ ] Release notes and audit artefacts attached to change request / ticket

## Post-Release

- [ ] Documentation synced (`make sync-lifecycle-docs`) and reviewers notified
- [ ] Monitoring/alerting updated for the new version where applicable
- [ ] Rollback plan documented including previous stable package location

Reviewer: ____________________      Date: ____________________

## Deprecation / Sunset

- [ ] manifest `lifecycle.status`/`sunset_at` 与 Marketplace 状态一致
- [ ] 通知模板（邮件 & In-App）已发送/安排
- [ ] 新安装防护验证完成（sunset 后阻止安装，返回明确错误）
- [ ] 数据迁移/导出方案完成演练并记录在 runbook

