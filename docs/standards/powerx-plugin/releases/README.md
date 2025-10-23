# Release Documentation

This directory stores published release notes and templates. Each plugin release should add a `v<version>.md` file derived from `release-template.md`, capturing lifecycle status, audit references, and Marketplace submission details.

Workflow:
1. Copy `release-template.md` → `v<version>.md`.
2. Fill in change log, verification, lifecycle status, and audit references.
3. Commit alongside packaging artefacts and lifecycle doc updates.
4. Sync lifecycle docs (`make sync-lifecycle-docs`) so integration consumers see the latest state.
