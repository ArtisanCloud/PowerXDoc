# Lifecycle Integration Docs

This directory contains the published version of the plugin lifecycle standard that Marketplace operators and host integrators consume. The authoritative sources live in `docs/lifecycle/`.

## Update Workflow

1. Edit lifecycle content under `docs/lifecycle/` (overview, checklists, notices, etc.).
2. Run `make sync-lifecycle-docs` to mirror the updated files into this directory.
3. Review the diff here plus the original sources, then commit both sets of changes.

> Do not edit files in this folder manually; they will be overwritten on the next sync.

For detailed release notes templates, see `docs/releases/` in the repository.
