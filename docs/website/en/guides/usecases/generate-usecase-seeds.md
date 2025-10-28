---
title: "Generate Usecase Seeds"
reviewStatus: InReview
partnerSlug: "/zh/guides/usecases/generate-usecase-seeds.md"
---

# Generate Usecase Seeds

Once a scenario (SCN) is ready, you can rely on the project script to batch-generate Usecase Seed skeletons, enrich the content, and push the result to downstream repositories or the documentation site. This page mirrors the repository guide and adds the `task.md` workflow for clarity.

## 1. Preflight

- Scenario markdown under `docs/scenarios/<domain>/SCN-*.md` is complete (no `TODO_*`) and has accurate frontmatter.
- `docs/_data/docmap.yaml` registers the target `scn_id`, plus `doc_id`, `scope`, `layer`, `domain`, and `optional` for each child usecase.
- `docs/_data/repos.yaml` lists destination repositories and default maintainers so scripts can auto-populate frontmatter.

## 2. Generate Seed Skeletons

```bash
node .specify/scripts/node/setup-usecase-seeds.mjs --scn-id SCN-PUBLISH-HUB-001
```

- Writes/updates Seed templates under `docs/usecases-seeds/<scope>/<layer>/<domain>/<doc_id>.md`.
- Helpful flags:
  - `--doc-id PX-DEV-HOTLOAD-001` (repeatable) — target specific Seeds.
  - `--scope powerx` / `--layer service` / `--domain publish` — filter by taxonomy.
  - `--force` — overwrite existing files.
  - `--dry-run` — preview without touching disk.

## 3. Generate the task checklist

- Run `node scripts/node/generate-seed-tasks.mjs --scn-id <SCN_ID>` to update the checklist. The script writes commands to `docs/scenarios/<domain>/task.md`, where `<domain>` equals the middle section of the SCN ID in lowercase (for example, `SCN-PUBLISH-HUB-001` → `docs/scenarios/publish/task.md`). The initial seed-generation prompt creates the file once; rerun this script whenever you add or reorder child usecases.
- Open the refreshed checklist and execute each command in order, e.g.:

```bash
.specify/templates/usecase-generate-template.md \
  docs/usecases-seeds/SCN-PUBLISH-HUB-001/PLG-DEV-HOTLOAD-001.md \
  --context docs/scenarios/publish/SCN-PUBLISH-HUB-001.md \
  --context docs/_data/docmap.yaml \
  --context docs/_data/repos.yaml
```

Process tasks in order to avoid missing Seeds.

## 4. Complete the Seed content

1. Replace placeholders (`TODO_*`, sample tables, pseudo-code) with final prose, diagrams, or contracts.
2. Ensure frontmatter fields (`doc_id`, `scope`, `layer`, `domain`, `optional`) stay aligned with `docmap.yaml`.
3. Add any supporting context (specs, API docs) via extra `--context` parameters or manual cross-links.

## 5. Sync the website (optional)

```bash
node scripts/site/sync-seed-pages.mjs \
  --scn-id SCN-PUBLISH-HUB-001 \
  --with-index \
  --force
```

- Copies Chinese sources to `docs/website/zh/scenarios/**`; creates “Pending Translation” placeholders with `partnerSlug` in the English tree.
- Drop `--with-index` to skip seed index regeneration; append `--locale zh` or `--locale en` for one language only.
- Run `npm run docs:dev` or `npm run docs:build` to confirm site rendering.

## 6. Before you submit

1. Update the seed index: `node .specify/scripts/node/generate-usecase-seed-index.mjs --scn-id <SCN_ID>`.
2. Validate structure/frontmatter: `npm run publish:usecases -- --scn-id <SCN_ID> --validate-only`.
3. Inspect `git status` to ensure the diff only contains the intended scenario/Seed artifacts.

## 7. Troubleshooting

| Symptom | Fix |
|---------|-----|
| `SCN_ID` not found | Register it in `docmap.yaml`; add missing children. |
| Seeds skipped | Existing files stay untouched unless `--force` is provided. |
| `TODO_*` placeholders remain | Supply additional scenario context or edit manually. |
| Site missing new Seeds | Run `sync-seed-pages.mjs` and commit `docs/website/**` copies. |
| `_from_hub` modified | Revert the change; downstream repos should maintain their own `docs/use_cases/**`. |

After content is ready, continue with the [Usecase Seeds publishing guide](/en/guides/usecases/publish-usecase-seeds) for dry runs and distribution.
