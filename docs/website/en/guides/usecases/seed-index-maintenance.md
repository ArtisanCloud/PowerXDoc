---
title: "Maintain Usecase Seed Indexes"
reviewStatus: InReview
partnerSlug: "/zh/guides/usecases/seed-index-maintenance.md"
---

# Maintain Usecase Seed Indexes

Seed indexes provide a consolidated view of every usecase underneath a scenario so managers can track coverage and progress. Scripts generate the source at `docs/usecases-seeds/scenarios/SCN-*.md` and optionally copy it to `docs/website/{en,zh}/scenarios/<SCN_ID>/index.md`. This guide highlights when to refresh the index and the recommended workflow.

## When to Refresh

- `docmap.yaml` adds or updates child usecases (`doc_id`, `scope`, `layer`, `domain`, `optional`).
- Seed content or status changes and the index must reflect the updates.
- New Seeds are attached to a scenario and leadership needs an up-to-date roster.

## Step-by-step

1. **Align docmap and Seeds**  
   - Update the `children` block in `docs/_data/docmap.yaml`.  
   - Regenerate files with `node .specify/scripts/node/setup-usecase-seeds.mjs --scn-id <SCN_ID>` (add `--doc-id` for partial runs).

2. **Regenerate the index**  
   ```bash
   node .specify/scripts/node/generate-usecase-seed-index.mjs --scn-id <SCN_ID>
   ```
   - The command groups Seeds by `scope` and writes the output to `docs/usecases-seeds/scenarios/<SCN_ID>.md`.  
   - Use `--all` to rebuild every scenario; add `--force` to overwrite.

3. **Sync the website (optional)**  
   ```bash
   node scripts/site/sync-seed-pages.mjs --scn-id <SCN_ID> --with-index --force
   ```
   - `--with-index` pushes the index to `docs/website/{lang}/scenarios/<SCN_ID>/index.md`.  
   - Narrow locales via `--locale zh` or `--locale en`.

4. **Review before committing**  
   - Inspect `git diff docs/usecases-seeds/scenarios/<SCN_ID>.md` to confirm table accuracy.  
   - Run `npm run publish:collected -- --scn-id <SCN_ID>` if leadership reports need refreshing.

## QA Checklist

- [ ] No missing or duplicate `doc_id` entries in `docmap.yaml`.  
- [ ] Each table link opens the corresponding Seed file.  
- [ ] `status` values match the Seed frontmatter.  
- [ ] Website copies under `docs/website/{lang}/scenarios/<SCN_ID>` are current when needed.  
- [ ] Latest dry run or publish report in `reports/usecases/` lists every Seed.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| A Seed is missing | Confirm the entry exists in `docmap.yaml`, then rerun the generator. |
| Table fields are outdated | Update Seed frontmatter (`status`, `optional`) and regenerate the index. |
| Website still shows the old index | Re-run `node scripts/site/sync-seed-pages.mjs --scn-id <SCN_ID> --with-index --force` and preview with `npm run docs:build`. |
| Need everything at once | Execute `generate-usecase-seed-index.mjs --all` or loop through `scn_id` values. |

Keeping the index aligned prevents surprises during cross-team reviews and release checkpoints.
