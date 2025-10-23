# Plugin Lifecycle Documentation

> Source-of-truth documentation for PowerX plugin lifecycle governance. Files under this directory are synchronized into `docs/integration/01_plugin_lifecycle/` via `make sync-lifecycle-docs`.

## Contents

- [overview.md](./overview.md) — end-to-end lifecycle narrative and entry points
- [deprecation.md](./deprecation.md) — deprecation & sunset playbook
- [checklists/](./checklists/) — bootstrap, release, and deprecation checklists
- [manifest-mapping.md](./manifest-mapping.md) — field-by-field parity reference between plugin.yaml and manifest.yaml
- [package.md](./package.md) — detailed packaging and publishing flow
- [examples/](./examples/) — canonical metadata snapshots (`plugin.yaml`, `manifest.yaml`)
- [glossary.md](./glossary.md) — shared terminology across lifecycle docs
- [contracts/](./contracts/) — machine-readable schemas and Marketplace API definitions
- [notices/](./notices/) — communication templates for tenants and marketplace operators
- [runbooks/](./runbooks/) — operational procedures for lifecycle events
- [tooling.md](./tooling.md) — inventory of automation and Makefile extension points

Keep edits in this directory; run `make sync-lifecycle-docs` to publish curated copies into integration docs.
