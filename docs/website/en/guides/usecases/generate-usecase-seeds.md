---
title: "Generate Usecase Seeds"
reviewStatus: InReview
partnerSlug: "/zh/guides/usecases/generate-usecase-seeds.md"
---

# Generate Usecase Seeds

Once a scenario (SCN) is ready, you can batch-generate Usecase Seed skeletons, complete the content, and publish to downstream repositories or the documentation site. This guide walks through the entire workflow.

## Preflight

- Scenario markdown under `docs/scenarios/<domain>/SCN-*.md` is free of `TODO_*`, and the frontmatter is accurate.
- `docs/_data/docmap.yaml` registers the target `scn_id` and includes `doc_id`, `scope`, `layer`, `domain`, and `optional` for every child usecase.
- `docs/_data/repos.yaml` lists the destination repositories and default reviewers so scripts can enrich the frontmatter.

## Generate Seed Skeletons

```bash
node .specify/scripts/node/setup-usecase-seeds.mjs --scn-id SCN-PUBLISH-001
```

- By default the script creates or updates all Seed templates referenced in `docmap.yaml` (stored at `docs/usecases-seeds/<scope>/<layer>/<domain>/<doc_id>.md`).
- Handy flags:
  - `--doc-id PX-DEV-HOTLOAD-001` — limit to a specific Seed (repeatable).
  - `--scope powerx-backend` / `--layer service` / `--domain dev` — filter by dimension.
  - `--force` — overwrite existing files.
  - `--dry-run` — preview without writing to disk.

## Complete the Content

1. Follow the tasks listed in each template (generate hints with `node scripts/node/generate-seed-tasks.mjs --scn-id <SCN_ID>` if needed).
2. When pairing with prompt workflows:
   ```bash
   [speckit.implement.md](.codex/prompts/speckit.implement.md) \
     docs/usecases-seeds/powerx-plugin/proto/dev/PLG-DEV-HOTLOAD-001.md \
     --context docs/scenarios/publish/SCN-DEV-HOTLOAD-001.md \
     --context docs/_data/docmap.yaml \
     --context docs/_data/repos.yaml
   ```
3. Verify that frontmatter matches `docmap.yaml` and remove every placeholder such as `<Layer>` or `TODO_*`.

## Sync the Website (Optional)

```bash
node scripts/site/sync-seed-pages.mjs --scn-id SCN-PUBLISH-001 --with-index --force
```

- The `zh` directory copies the Chinese source; the `en` directory creates “Pending Translation” placeholders with a `partnerSlug` for translators.
- Drop `--with-index` when you only need Seed pages. Add `--locale zh` or `--locale en` to target a single language.
- Run `npm run docs:build` or `npm run docs:dev` to preview the site.

## Pre-submit Checklist

- Regenerate the Seed index: `node .specify/scripts/node/generate-usecase-seed-index.mjs --scn-id <SCN_ID>`.
- Run `npm run publish:usecases -- --scn-id <SCN_ID> --validate-only` to lint structure and frontmatter.
- Inspect `git status` to ensure the change set only includes the intended scenario/Seed assets.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `SCN_ID` not found | Confirm it is registered in `docmap.yaml`; add missing children. |
| Seeds were skipped | Existing files are preserved unless you pass `--force`. |
| `TODO_*` placeholders remain | Provide additional scenario context or edit manually. |
| Need a subset only | Combine `--doc-id`, `--scope`, `--layer`, and `--domain` to narrow the output. |

Continue with the publishing workflow described in the [Usecase Seeds publishing guide](/en/guides/usecases/publish-usecase-seeds) after the content is ready.
