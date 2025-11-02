---
scn_id: SCN-DEV-PLUGIN-CLI-INIT-001
title: CLI Template Generation for Standard Plugin Project
status: Draft
version: v0.1.0
owners:
  - name: Michael Hu
    role: Plugin Tech Lead
    contact: tech@artisan-cloud.com
  - name: Grace Lin
    role: Security & Compliance Lead
    contact: compliance@artisan-cloud.com
domains: [dev]
layers: [proto, service, security]
repos:
  - key: powerx-plugin
    scope: plugin-ecosystem
    responsibility: CLI parameter wizard, template management, dependency locking & example code
  - key: powerx
    scope: core-platform
    responsibility: initialization validation, compliance scan API, Git registration & CI guidance
related_usecases:
  - doc_id: UC-DEV-PLUGIN-CLI-INIT-001
    layer: proto
    domain: dev
last_reviewed_at: 2025-11-20

---

# Executive Summary

This sub-scenario covers the end-to-end flow where developers use `powerx plugin init` on the command line to select a template, scaffold a standard project, install dependencies, and register the repository with Git. The workflow must finish within one minute, producing the directory structure, manifest, permission declarations, sample tests, and CI configuration while simultaneously triggering license and vulnerability scans. Once complete, the developer receives a ready-to-push project with unified lint/test tooling and audit traces.

# Scope & Guardrails

- **In Scope**: CLI version validation, template pulling, project skeleton generation, dependency installation, Git initialization with first commit, basic scan and report output.
- **Out of Scope**: subsequent feature development, team collaborative cloning, third-party source import, Marketplace publishing.
- **Environment & Flags**: `PX_PLUGIN_SCAFFOLD_V2`, `plugin-import-audit`; requires access to template registry, npm/pip mirror, compliance scan service and Git registration API.

# Participants & Responsibilities

| Scope | Repository | Layer | Responsibilities & Deliverables | Owners |
|-------|------------|-------|--------------------------------|--------|
| plugin-ecosystem | powerx-plugin | proto | CLI parameter parsing, template version management, dependency installation scripts, example code generation | Michael Hu (Plugin Tech Lead / tech@artisan-cloud.com) |
| core-platform | powerx | service | initialization validation, Git registration, CI template distribution, audit logs & telemetry | Michael Hu (Plugin Tech Lead / tech@artisan-cloud.com) |
| security | powerx | security | license & dependency scanning, risk report generation, exemption channel management | Grace Lin (Security & Compliance Lead / compliance@artisan-cloud.com) |

# End-to-End Flow

1. **Stage 1 – CLI Environment Validation**: The developer runs `powerx plugin init`; the CLI checks the local binary version, template index, and credential validity.
2. **Stage 2 – Template Selection & Project Generation**: The CLI fetches the template for the selected language and capability, generating the directory structure, configuration files, sample code, and helper scripts.
3. **Stage 3 – Dependency Installation & Scanning**: The CLI installs dependencies, triggers license/vulnerability scans, and surfaces the report with remediation guidance.
4. **Stage 4 – Git Registration & First Commit**: The CLI initializes a Git repository, creates the first commit, invokes the platform API to register the remote repository, and provisions CI configuration plus the initial branches.

```mermaid
sequenceDiagram
  participant Dev as Plugin Developer
  participant CLI as powerx-cli
  participant Template as Template Registry
  participant Scanner as Compliance Scanner
  participant Git as Git Service

  Dev->>CLI: powerx plugin init --template react-dashboard
  CLI->>Template: Pull template & dependency manifest
  Template-->>CLI: Return project skeleton & scripts
  CLI->>Scanner: Submit manifest & dependency list
  Scanner-->>CLI: Return scan report
  CLI->>Git: Create repository / push initial commit
  Git-->>Dev: Return repository URL & CI status
```

# Key Interactions & Contracts

- **APIs / Events**: `powerx plugin init <template>`, `powerx plugin init --check`, `POST /internal/plugins/bootstrap/validate`, `POST /internal/compliance/licensescan`, `POST /internal/git/register`.
- **Configs / Schemas**: `config/plugins/templates/index.yaml`, `docs/standards/powerx-plugin/lifecycle/manifest-mapping.md`, `.powerxci/pipeline.yaml`.
- **Security / Compliance**: CLI requires HMAC signature verification; scan blocks high-risk dependencies; Git registration enforces minimum privilege PAT; audit events written to `audit.plugin.bootstrap`.

# Usecase Links

- `UC-DEV-PLUGIN-CLI-INIT-001` — CLI initialization of standard project with Git registration completion.

# Acceptance Criteria

1. Project generation time ≤60 seconds, directory structure and manifest meet standard validation.
2. Dependency installation & basic test scripts execute successfully, scan report shows no high-risk items or exemptions issued.
3. After Git initialization, automatically create `main` and `develop` branches, CI pipeline in ready state.

# Telemetry & Ops

- **Metrics**: `cli.init.duration_ms`, `cli.init.failure_rate`, `cli.init.template_id`, `cli.init.scan_block_count`.
- **Alert Thresholds**: initialization failure rate >5% or scan block count for 3 consecutive times triggers alert; Git registration timeout >120 seconds escalates to P1.
- **Observability Sources**: CLI telemetry, `workflow-metrics.mjs` report, compliance scan dashboard, Git Webhook audit.

# Open Issues & Follow-ups

| Risk/Issue | Impact Scope | Owner | ETA |
|-----------|--------------|-------|-----|
| Template dependency mirror unstable in offline environment, initialization prone to failure | offline/restricted network | Michael Hu | 2025-12-08 |
| Scan exemption process not fully integrated with CLI, requires manual synchronization | compliance audit | Grace Lin | 2025-12-15 |

# Appendix

- `docs/meta/scenarios/powerx/plugin-ecosystem/plugin-lifecycle/plugin-create-and-init/primary.md#sub-scenario-a`
- `docs/standards/powerx-plugin/integration/08_dev_console_and_ui/Common_Tasks_and_Troubleshooting.md`
- `docs/standards/powerx-plugin/integration/04_security_and_compliance/Plugin_Security_Checklist.md`
