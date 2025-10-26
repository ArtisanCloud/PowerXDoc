---
title: "Scenario Authoring Guide"
reviewStatus: InReview
partnerSlug: "/zh/guides/scenarios/scenario-generation.md"
---

# Scenario Authoring Guide

This page summarizes the scenario authoring workflow from `docs/guides/scenarios/README.md`, making it easier to reference from the site.

## Prepare Source Material

- Draft the business journey in Markdown (recommended under `docs/meta/scenarios/`) or provide temporary text.  
- Existing scenarios remain under `docs/scenarios/<domain>/`; reruns overwrite the same file when `--force` is set.  
- Ensure baseline data inside `docs/_data/docmap.yaml` and `docs/_data/repos.yaml` is populated so follow-up steps succeed.

## Generate the Scenario Draft

```bash
node .specify/scripts/node/generate-scenarios.mjs <source-path-or-text> [--force]
```

- Writes to `docs/scenarios/<domain>/SCN-*.md` following the standard template.  
- Use `--force` if the target file already exists.  
- Prompt-powered option:

```bash
[speckit.scenario.md](.codex/prompts/speckit.scenario.md) <@source-path-or-text>
```

## Clarify (Optional)

```bash
.codex/prompts/speckit.scenario.clarify.md docs/meta/scenarios/<domain>/<file>.md
```

- Raises up to five high-priority questions; respond in Chinese to keep records aligned.  
- Each question ships with AI suggestions you can accept or edit.  
- Skip when the draft already covers the required details.

## Final Checks

- Remove all `TODO_*` placeholders.  
- Complete frontmatter fields such as `scn_id`, `owners`, `domains`, `layers`, and `related_usecases`.  
- Record the scenario and its children inside `docs/_data/docmap.yaml`.  
- Run `/speckit.usecase-seed-generate <SCN_ID>` to bootstrap Seeds.  
- Validate structure quickly with `npm run publish:scenarios -- --scn-id <SCN_ID> --validate-only`.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Prompt cannot find the file | Double-check the path and run the command at the repo root. |
| Clarify repeats questions | Add more context to the source material; the gaps still exist. |
| Need multiple child scenarios | Split the source file and run the generator separately or capture the split plan during Clarify. |
| Preserve the old draft | Back up or branch before rerunning; only use `--force` when intentional. |

After these steps you can proceed with Usecase Seed generation and cross-repo publishing.
