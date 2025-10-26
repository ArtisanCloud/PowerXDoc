---
title: "Standards Distribution Guide"
reviewStatus: InReview
partnerSlug: "/zh/guides/publish/standards-distribution.md"
---

# Standards Distribution Guide

This page condenses `docs/guides/publish/README.md` to explain how `npm run publish:standards` syncs `docs/standards/**` into downstream repositories.

## Pre-flight Checklist

1. **Source of truth** — Only sync files from `PowerXDocs/docs/standards/` (e.g., `docs/standards/powerx-marketplace/init-ui.md`). When scenarios or Seeds change in parallel, update templates, `docmap.yaml`, and related assets accordingly.
2. **Quality gates** — Run `npm run lint`, `npm run docs:build`, and review terminology/frontmatter against `.specify/memory/constitution.md`.
3. **Local clones** — Create `repos/` at the repo root and keep downstream worktrees clean. `node scripts/setup/downstreams.mjs` can clone and checkout branches defined in `docs/_data/repos.yaml`.
4. **Understand the defaults** — `docs/_data/standards-map.yaml` drives `defaults/include` entries per scope. When no `--include` is passed, the CLI relies on this mapping.

## Standard Flow

```text
1. Run a dry run
2. Inspect reports/standards/**
3. Execute the real run (without --dry-run)
4. Review downstream PRs and notify owners
```

### Dry Run

```bash
npm run publish:standards -- \
  --repo powerx-marketplace \
  --dry-run
```

- Copies changes to `repos/<repo>/docs/standards/` without committing or pushing.  
- Produces `reports/standards/*.json` with `filesChanged` and a `resumeToken`.

### Real Run

```bash
npm run publish:standards -- --repo powerx-marketplace
```

- Creates `docs/hub/standards-<timestamp>` branches, commits, and pushes automatically.  
- Uses `default_reviewers` in `repos.yaml` to suggest PR reviewers.  
- Reuse dry-run fingerprints with `--resume-token <token>`.

## Handy Combinations

| Scenario | Command |
|----------|---------|
| Sync by scope | `npm run publish:standards -- --scope powerx,powerx-marketplace` |
| Copy everything | `npm run publish:standards -- --repo powerx-marketplace --include '**'` |
| Single file | `npm run publish:standards -- --repo powerx-marketplace --include powerx-marketplace/init-ui.md` |
| Multiple directories | `npm run publish:standards -- --include _shared/security/** --include powerx-plugin/guide.md` |
| Exclude specific paths | `npm run publish:standards -- --repo powerx-marketplace --exclude _shared/drafts/**` |
| Custom map file | `npm run publish:standards -- --standards-map docs/_data/standards-map.custom.yaml` |

> When `--include` is present, it overrides the default map—remember to add `_shared/**` or other shared folders explicitly.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Dry run shows no changes | Save the file or verify it isn’t excluded by the map. |
| PR diff includes unexpected files | Adjust `--include/--exclude` or the standards-map configuration. |
| Branch creation failed | Ensure `repos/<repo>` is clean and the base branch exists. |
| Push failed | Validate `git_url`, credentials, and network; push manually if needed. |
| Need to roll back | Use `--resume-token` or delete the downstream branch before rerunning. |

## References

- `docs/meta/cross-repo-documentation.md` — Multi-repo documentation architecture  
- `docs/standards/_shared/downstream-readonly-setup.md` — Downstream read-only governance  
- `.specify/memory/constitution.md` — PowerX documentation constitution  
- `scripts/publish/push-standards.mjs` — CLI implementation
