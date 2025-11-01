---
doc_id: PLG-PUBLISH-OFFLINE-001
scn_id: SCN-PUBLISH-HUB-001
title: PLG-PUBLISH-OFFLINE-001 - proto/publish
status: Draft
version: v0.1.0
repo_key: powerx-plugin
scope: powerx-plugin
layer: proto
domain: publish
scenario_title: "PowerX Plugin Release Hub"
owners:
  - name: Michael Hu
    role: Tech Steward
    contact: tech@artisan-cloud.com
  - name: Matrix-X
    role: Docs Coordinator
    contact: dev@artisan-cloud.com
contributors:
  - name: Li Wei
    role: CLI Lead
    contact: li.wei@artisan-cloud.com
linked_requirements:
  - type: scenario
    ref: SCN-PUBLISH-HUB-001
  - type: scenario
    ref: SCN-PUBLISH-OFFLINE-001
code_refs:
  - component: cli_dist_orchestrator
    path: TBD (language and directory determined by the CLI implementation)
    description: Parse CLI parameters and orchestrate packaging, signing, and upload sub-tasks
  - component: offline_compiler
    path: TBD (depends on implementation language and layout)
    description: Aggregate backend/frontend artifacts and emit the manifest plus integrity list
  - component: offline_signer
    path: TBD (depends on implementation language and layout)
    description: Integrate with local PEM or external KMS to generate signatures and certificate chains
  - component: offline_verifier
    path: TBD (depends on implementation language and layout)
    description: Provide `dist --verify` to validate hashes, signatures, and certificate validity
feature_flags:
  - name: PX_OFFLINE_IMPORT
    description: Enable CLI offline bundle generation and metadata output
    default: false
    environments: [development, staging]
  - name: PX_CLI_SIGNING
    description: Enforce signature configuration (PEM/KMS) and block unsigned bundles
    default: true
    environments: [staging, production]
last_reviewed_at: 2025-10-28

---

# Positioning & Goals

- **Business Goal**: Generate secure and traceable `.pxp` offline bundles for plugin engineering and delivery teams. Each bundle must include the manifest, binaries, frontend assets, migration scripts, and signatures so the package can be consumed in environments without internet access.
- **Scenario Link**: Powers Stage 1 packaging in `SCN-PUBLISH-OFFLINE-001`, delivering compliant artifacts to Marketplace (`MKP-PUBLISH-OFFLINE-001`) and PowerX Core (`PX-PUBLISH-OFFLINE-001`).
- **Success Metrics**: `px-plugin dist --target offline` P95 ≤ 90 s; signature and hash validation pass rate 100%; Admin import success rate ≥ 98%; offline bundle size alerts < 5%.

The PowerXPlugin repository standardizes offline bundles through the CLI `dist` flow combined with signing, integrity verification, and audit logs, giving intranet customers and partners auditable and reversible plugin deliveries.

# Core Capabilities

- **Deterministic Packaging**: Gather cross-platform build outputs and resources to produce consistent `.pxp` artifacts.
- **Cryptographic Integrity**: Integrate with PEM/KMS signing pipelines to output signatures and certificate chains.
- **Integrity Reporting**: Emit `integrity.txt`, `report.json`, and `audit.log` to satisfy traceability and compliance audits.
- **Artifact Distribution Hooks**: Optionally upload bundles to object storage and return receipts/URLs to Marketplace/Core.
- **Verification Tooling**: Provide `dist --verify` for local/CI validation of artifact hashes and signatures to reduce import failures.

# Target Roles & Responsibilities

- **Plugin Developers**: Run `px-plugin dist`, address build/sign errors, and deliver the bundle prior to release.
- **CLI Steward / CLI Lead**: Maintain the packaging pipeline, signing adapters, and telemetry; guarantee cross-platform compatibility before release.
- **Marketplace Operators / Admins**: Receive and register offline bundles, review using provided reports and signatures.
- **Ops / Compliance Teams**: Monitor signing certificates, audit logs, and bundle storage policies.

# Concept & Scope

- **Prerequisites**
  - The repository has completed `make build` (backend binaries) and `npm run build` (Admin UI output).
  - Feature flag `PX_OFFLINE_IMPORT=1` is active so the CLI can read offline configuration.
  - Signing materials are configured: local PEM (`--sign`, `--key`) or KMS (`--kms-key-id`, `--kms-region`).
  - `px-plugin.config.ts` defines artifact sources, ignore lists, versioning strategy, and upload targets.
  - For object storage or shared NAS, credentials are injected through `PX_ARTIFACT_STORE_*` variables.
- **Inputs / Outputs**
  - Inputs: `plugin.yaml`, `manifest.json`, compiled `backend/bin/**`, `web-admin/.output/**`, `docs/contracts/**`, optional `extensions/**`.
  - Outputs: `<plugin>-<version>-<os>-<arch>.pxp`, `integrity.txt` (SHA-256 list), `manifest.signature`, `dist/report.json`, `dist/audit.log`.
- **Boundaries**
  - Excludes Marketplace review/distribution, PowerX Core installation, or Admin UI workflows.
  - Does not cover certificate provisioning or KMS configuration—only consumes existing signing services.
  - Does not handle the online publish command (`px-plugin publish`), which belongs to the online usecase.

# Architecture & Workflow

## Module Breakdown

| Module              | Scope           | Responsibility                                         | Notes / Implementation Details                     |
|---------------------|-----------------|--------------------------------------------------------|----------------------------------------------------|
| CLI Orchestrator    | powerx-plugin   | Parse arguments, load config, orchestrate build/sign/upload | Implementation language/directory TBD, must follow CLI guidelines |
| Offline Compiler    | powerx-plugin   | Aggregate artifacts, produce manifest & integrity list | Implementation TBD                                  |
| Offline Signer      | powerx-plugin   | Connect to PEM/KMS to create signatures & chain        | Implementation TBD                                  |
| Offline Verifier    | powerx-plugin   | Provide `dist --verify` to check hashes & signatures   | Implementation TBD                                  |
| Artifact Uploader   | powerx-plugin   | Stream uploads to S3/OSS with retries & progress       | Implementation TBD                                  |
| Telemetry Adapter   | powerx-plugin   | Emit build metrics to Workflow Metrics/Kafka           | Implementation TBD                                  |

## Flow & Timing

1. Developer runs `px-plugin dist --target offline`.
2. CLI orchestrator loads config, validates signing profile, and triggers compilers.
3. Offline Compiler builds binaries/assets, produces the manifest, and writes integrity files.
4. Offline Signer generates CMS signatures via PEM/KMS.
5. Optional uploader pushes artifacts to object storage and records the receipt.
6. CLI emits reports (`report.json`, `audit.log`) and telemetry events; output bundle stored in `dist/`.

# Contracts & Interfaces

- **CLI Commands**
  - `px-plugin dist --target offline [--os linux] [--arch amd64] [--sign path/to/pem]`
  - `px-plugin dist --verify ./dist/<pkg>.pxp --signature ./dist/manifest.signature`
- **Configuration**
  - `px-plugin.config.ts`: `offline.targets[]` specify `os/arch`, `entry`, `assets`, `ignore` lists; `artifactStore` config for S3/OSS; `signer` node for PEM/KMS fields.
  - Environment variables: `PX_ARTIFACT_STORE_ENDPOINT`, `PX_ARTIFACT_STORE_ACCESS_KEY`, `PX_ARTIFACT_STORE_SECRET`, `PX_SIGNING_ENDPOINT`.
- **Output Structure**
  - `dist/<plugin>/<version>/<os>-<arch>/package.pxp`: tar+gzip bundle.
  - `dist/.../integrity.txt`: SHA-256 hashes with relative paths.
  - `dist/.../manifest.signature`: CMS detached signature (base64).
  - `dist/.../report.json`: hash values, size, signing policy, storage URL, telemetry ID.
- **External Interactions**
  - `PUT <signed-url>` / S3 multipart upload for bundle and signature, with retries/chunking.
  - Optional `POST /telemetry/offline-dist` to push build metrics to Workflow Metrics.

# Implementation Checklist

| Item            | Description                                                         | Status | Owner        |
|-----------------|---------------------------------------------------------------------|--------|-------------|
| Packaging build | Support Linux/Windows/macOS, incremental cache, source map output   | [ ]    | Li Wei      |
| Signing adapters| Support PEM, KMS, external services with readable errors             | [ ]    | Michael Hu  |
| Verification pipeline | Integrate `dist --verify` and CI scripts                           | [ ]    | Li Wei      |
| Upload integration | Multipart upload, retry, progress logging for S3/OSS               | [ ]    | Matrix-X    |
| Reporting & audit| Produce `report.json`, `audit.log`, link telemetry IDs              | [ ]    | Matrix-X    |
| Documentation   | Update `docs/guides/offline-dist.md`, CLI help text                  | [ ]    | Docs Steward Team |

# Quality Assurance Strategy

- **Unit Tests**: `compiler.spec.ts` for artifact filtering & hash generation; `signer.spec.ts` for PEM/KMS validation and error messaging; `verifier.spec.ts` for success/failure branches of verification.
- **Integration Tests**: CI pipeline runs `px-plugin dist --target offline`, exercises mock KMS and S3, verifies multipart upload, `report.json`, telemetry output.
- **End-to-End**: Joint drill with PowerX Core/Marketplace covering “pack → offline upload → Admin import → rollback”, recording runbooks and audit data.
- **Non-functional**: Performance of large bundles (>200 MB), concurrent uploads, Windows/WSL path compatibility, graceful degradation when signing service is unavailable.

# Observability & Telemetry

- **Metrics**: `offline.dist.duration_ms` (P95 ≤ 90 s), `offline.dist.size_bytes`, `offline.dist.failures_total`, `offline.dist.upload.retry_count`.
- **Logs**: Structured CLI log `dist.log` containing `pluginId`, `version`, `target`, `hash`, `signer`, `artifactStore`; failures capture stack traces and KMS request IDs.
- **Alerts**: Trigger Slack `#powerx-plugin-alerts` + PagerDuty L2 for signature failures, KMS timeouts, bundle oversize; escalate after three consecutive build failures.
- **Dashboards**: Workflow Metrics “Offline Dist” dashboard; Grafana bundle size trends; S3 upload success panels.

# Rollback & Recovery

- **Rollback Steps**: If the CLI introduces defects, use npm dist-tags to revert and roll back related PRs; temporarily disable `PX_CLI_SIGNING` (with duty approval) for hotfix bundles.
- **Remediation**: Retain `dist/.tmp` for forensic analysis; provide `px-plugin dist --resume` for interrupted builds; run `scripts/offline/cleanup-staging.ts` to purge caches when needed.
- **Data Repair**: Rebuild and upload corrected artifacts; revoke compromised certificates immediately and alert Marketplace to refresh trust lists.

# Risks & Mitigations

| Risk / Item                          | Impact                        | Mitigation                                      | Owner       | ETA        |
|--------------------------------------|-------------------------------|-------------------------------------------------|-------------|------------|
| Oversized bundles hinder transfers   | Longer release window, failures| Enable differential assets, prompt compression, use chunked uploads | Li Wei      | 2025-02-18 |
| Signing certificates or KMS keys expire | Offline imports fail         | CLI warns 14 days ahead, automation renews certificates, fall back to PEM | Michael Hu | 2025-02-01 |
| Cross-platform path/permission issues | Windows/WSL build failures    | Maintain compatibility matrix, normalize paths, improve docs        | Docs Steward Team | 2025-01-30 |
| Upload credentials leak              | Security compromise           | Support temporary credentials, audit uploads, auto-rotate secrets  | Matrix-X   | 2025-02-10 |

# References & Links

- Scenario document: `docs/scenarios/publish/SCN-PUBLISH-OFFLINE-001.md`
- Related standards: `docs/standards/powerx-plugin/integration/01_plugin_lifecycle/package.md`, `docs/standards/powerx-marketplace/pxp插件压缩包.md`
- Sample PRs: <https://github.com/ArtisanCloud/PowerXPlugin/pulls?q=offline+dist>
- Checklists: `docs/standards/powerx-plugin/lifecycle/checklists/release-checklist.md`

> After packaging and documentation updates, run `npm run publish:usecases -- --scn-id SCN-PUBLISH-HUB-001 --validate-only` and rehearse the offline import flow with Marketplace/Core.
