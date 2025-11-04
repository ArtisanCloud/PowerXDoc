---
title: Tooling & Quality Practices
---

# Tooling & Quality Practices

PowerX plugin engineering spans multiple repositories and automation entry points. Use this checklist to keep tooling, quality gates, and documentation in sync across teams.

## CLI & automation surface

- `./bin/px-plugin` – scaffolds projects, packages builds, and (in future phases) publishes bundles. Source of truth: `tools/cli/`.
- `px-admin`, `px-market` – admin-side utilities for tenant provisioning and marketplace operations. Document usage in the relevant scenario seeds.
- Publishing scripts (`npm run publish:usecases`, `npm run publish:standards`, `npm run publish:collected`) – drive multi-repo documentation sync. Run them from the PowerXDocs workspace before generating release notes.
- Localization helpers live under `docs/scripts/localization/*.mjs`. Integrate them into plugin docs when you need bilingual content.

> Keep command output under version control only when it affects reproducibility (for example, regenerated schemas). Never commit transient logs from local experiments.

## Testing strategy

- **Unit & integration** – Mirror skeleton structure (`internal/entity`, `internal/services`, `internal/transport`) and cover happy-path plus negative cases. Align naming with the CLI scaffolds so generated projects inherit the same layout.
- **End-to-end** – Exercise the standalone skeleton through the admin frontend or scripted HTTP requests. Capture latency targets (sub-second CRUD) and compare against `docs/research` baselines.
- **Workflow QA** – Invoke `node scripts/qa/workflow-metrics.mjs` or `npm run test:workflows` to validate complex scenarios that span plugins and host capabilities.
- Seed documents (under `docs/meta/**` and `docs/website/**/scenarios/**`) must record the “Testing Strategy” section, expected metrics, and rollback plans after every significant change.

## Telemetry & reporting

- `reports/_state/**` holds machine-readable status for automation dashboards. Update them when you extend QA coverage or add new scripts.
- Embed instrumentation hooks in the skeleton first, then expose aggregated metrics via the framework so downstream plugins inherit consistent dashboards.
- When investigating defects, attach structured traces/log bundles to scenario reports. This keeps `SCN-DEV-PLUGIN-*` playbooks actionable for newcomers.

## Release checklist

1. Run lint, tests, and template sync (`npm run sync:templates -- --check`) with a clean working tree.
2. Generate or refresh contract artifacts (OpenAPI/JSON Schema) if you modified APIs.
3. Update both English and Chinese docs; note any gaps that still exist in the upstream `PowerXPlugin/docs/guide` or `docs/plan` and file TODOs.
4. Push regenerated documentation via the publish scripts before tagging a release.

Following these steps ensures partner developers can consume the ecosystem with predictable tooling, while automation keeps the multi-repo surface area manageable.
