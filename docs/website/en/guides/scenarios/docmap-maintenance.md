---
title: Docmap Maintenance Playbook
description: Step-by-step workflow for keeping docmap.yaml, scenarios, and Seeds in sync.
---

# Docmap Maintenance Playbook

> Scope: `docs/_data/docmap.yaml`, `docs/scenarios/**`, `docs/usecases-seeds/**`, `docs/website/{zh,en}/scenarios/**`

`docmap.yaml` is the single source of truth that connects scenario documents (SCN) with Usecase Seeds. The site navigation, seed generation scripts, and downstream publishing jobs all rely on it. This guide summarizes the maintenance routine and the checks you should run before submitting changes.

## 1. Maintenance Workflow

### Step A – Update the Scenario Source

- Location: `docs/scenarios/<domain>/SCN-*.md`
- Verify frontmatter: `scn_id`, `title`, `owners`, `related_usecases`.
- Preview the rendered page via `node scripts/site/sync-scenario-pages.mjs --scn-id <SCN_ID>`.

### Step B – Edit docmap.yaml

- Source file: `docs/_data/docmap.yaml`
- Required fields:
  - `scenarios[].scn_id` must match the scenario file.
  - `child_scenarios` (optional) points to nested scenario docs.
  - `children` lists Usecase Seeds with `doc_id`, `scope`, `layer`, `domain`, `optional`, `repo`, `path`.
- Run `node scripts/qa/workflow-metrics.mjs --check docmap` (if enabled) to validate structure.

### Step C – Regenerate Seeds and Indexes

| Action | Command | Notes |
| --- | --- | --- |
| Generate seed drafts | `node .specify/scripts/node/setup-usecase-seeds.mjs --scn-id <SCN_ID>` | Writes latest seed templates under `docs/usecases-seeds/**`. |
| Refresh seed index | `node .specify/scripts/node/generate-usecase-seed-index.mjs --scn-id <SCN_ID>` | Updates aggregated seed listings consumed by the site and release scripts. |
| Sync site copies | `node scripts/site/sync-seed-pages.mjs --scn-id <SCN_ID> --with-index` | Copies scenarios and Seeds to `docs/website/{zh,en}/scenarios/`. |

### Step D – Publish and Verify

- Publish Seeds: `npm run publish:usecases -- --scn-id <SCN_ID>`
- Build collected view: `npm run publish:collected -- --scn-id <SCN_ID>`
- Distribute standards: `npm run publish:standards`
- Sanity checks: `_from_hub` folders remain read-only, nav lists update, seed index shows expected entries.

## 2. Checklist & Troubleshooting

| Symptom | What to check |
| --- | --- |
| Scenario/Seed missing on site | Sync `docs/website/**` copies and commit the changes. |
| Seed order incorrect | Adjust `children` order in `docmap.yaml` and regenerate the index. |
| Optional flag ignored | Ensure `optional: true` is set in docmap and rerun sync scripts. |
| Downstream repos didn’t receive templates | Re-run `publish:usecases` and confirm credentials / target branch. |
| `_from_hub` was edited manually | Revert the change in the PR and remind repo owners to edit their own directories. |

## 3. Related References

- `docs/meta/cross-repo-documentation.md` — full multi-repo documentation architecture.
- `docs/guides/scenarios/scenario-generation.md` — Scenario authoring standard.
- `docs/guides/usecases/generate-usecase-seeds.md` — Seed generation steps.
- `docs/guides/usecases/publish-usecase-seeds.md` — Publishing checklist.
