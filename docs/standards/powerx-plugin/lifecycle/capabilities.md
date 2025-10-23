# Capability Governance Guide

This playbook explains how plugin capabilities are authored, referenced in manifests, and packaged so the PowerX host can validate them during install.

## Directory Layout

- `contracts/capabilities/` – one YAML descriptor per capability (ID, version, RBAC mapping, schema references).
- `contracts/schema/input/` – JSON Schema draft-07 documents for inbound payloads.
- `contracts/schema/output/` – JSON Schema draft-07 documents for responses and events.

Keep the `$id` in each schema aligned with its file path (for example `schema/input/foo.bar.v1.json`) so tooling can resolve references.

## Authoring Workflow

1. Copy the tool or API semantics from `plugin.yaml` and create a descriptor:
   ```bash
   cp contracts/capabilities/base.template.create.yaml contracts/capabilities/<id>.yaml
   ```
   Update the `id`, `type`, `version`, `rbac` block, and attach schema references under `provides` / `consumes`.
2. Define or update the JSON Schemas referenced in the descriptor. The schemas should capture required fields, enums, and pagination metadata so Marketplace review can reason about payload compatibility.
3. Reference the descriptor from `plugin.yaml` (and release `manifest.yaml`) via the `capabilities.provides` or `capabilities.consumes` arrays. Only list ID, version, and descriptor path—the detailed definition stays in `contracts/`.
4. Run unit tests (`go test ./backend/internal/contracts/...`) so the capability catalog loader stays green. Upcoming automation will extend this with `make check-capability` and compatibility diff commands.
5. When packaging via `make package-pxp`, ensure the `contracts/` directory is staged so hosts can read the descriptors and schemas.

## Review Checklist

- Capability IDs follow `<domain>.<resource>.<action>`.
- RBAC mappings match entries declared in `plugin.yaml:rbac.resources`.
- Every referenced schema file exists and carries the expected `$id` / version.
- Descriptors include lifecycle metadata (`status`, `version`) for SemVer upgrades.

Consult `specs/002-title-plugin-capabilities/quickstart.md` for an end-to-end walk-through that combines descriptor authoring, manifest updates, and packaging.
