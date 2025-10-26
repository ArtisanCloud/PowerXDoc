---
title: "Publish Usecase Seeds"
reviewStatus: InReview
partnerSlug: "/zh/guides/usecases/publish-usecase-seeds.md"
---

# Publish Usecase Seeds

With scenarios and Seeds finalized, two commands will distribute updates to downstream repositories and refresh the executive overview. This playbook focuses on the operational steps.

> Run the scripts from the repository root and ensure both `repos/**` and `docs/**` worktrees are clean. The publisher aborts when it detects local changes.

## Workflow Snapshot

1. **Dry run** — inspect impacted repositories and files.
2. **Publish** — push branches and open PRs.
3. **Collected view (optional)** — rebuild `_collected` reports for leadership.
4. **Notify (optional)** — alert reviewers and track PR status.

## 1. Dry Run

```bash
npm run publish:usecases -- --scn-id SCN-PUBLISH-HUB-001 --dry-run
```

- Generates `reports/usecases/usecases_SCN-PUBLISH-HUB-001.json` without touching any repository.
- The report lists target repos, files, and the `resumeToken`.
- Scope to a single Seed with `--doc-id`:

  ```bash
  npm run publish:usecases \
    -- --scn-id SCN-PUBLISH-HUB-001 \
    --doc-id PX-DEV-HOTLOAD-001 \
    --dry-run
  ```

## 2. Publish

```bash
npm run publish:usecases -- --scn-id SCN-PUBLISH-HUB-001
```

- Creates `docs/hub/<SCN_ID>` branches per downstream repository and opens PRs.
- Default reviewers come from `docs/_data/repos.yaml` (`default_reviewers`).
- Helpful flags:
  - `--scope` / `--layer` / `--domain` — narrow the blast radius.
  - `--doc-id PX-DEV-HOTLOAD-001` — publish specific Seeds (repeatable).
  - `--repo powerx-backend` — run against a single repository.
  - `--resume-token <token>` — resume a previous partial run.

## 3. Collected View (Optional)

```bash
npm run publish:collected -- --scn-id SCN-PUBLISH-HUB-001
```

- Builds `_collected/<scope>/<layer>/<domain>/<doc_id>.md` summaries based on `docmap.yaml`.
- Outputs artifacts under `reports/collected/`.

## 4. Notify & Follow-up (Optional)

```bash
npm run publish:notify -- --scn-id SCN-PUBLISH-HUB-001
```

- Reminds repository owners listed in the distribution report.
- Actual channels (IM, email, etc.) are configured inside the script.

## Common Filters

| Flag | Example | Purpose |
|------|---------|---------|
| `--doc-id` | `--doc-id PX-DEV-HOTLOAD-001` | Publish specific Seeds; repeatable. |
| `--scope` | `--scope powerx-backend` | Target a business scope. |
| `--layer` | `--layer service` | Limit to a layer. |
| `--domain` | `--domain dev` | Focus on a domain. |
| `--repo` | `--repo powerx-backend` | Operate on a single repository. |
| `--resume-token` | `--resume-token <token>` | Continue after a failed attempt. |

Combine filters as needed:

```bash
npm run publish:usecases \
  -- --scn-id SCN-PUBLISH-HUB-001 \
  --scope powerx-backend \
  --doc-id PX-DEV-HOTLOAD-001 \
  --doc-id PX-PUBLISH-OFFLINE-001
```

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Dry run produced no report | The Seeds have no changes; update content before rerunning. |
| PRs were not created | Verify `repos/<repo>` is clean and that your credentials can push; try a manual `git push`. |
| `_collected` files missing | Ensure `docmap.yaml` has complete `scope/layer/domain` metadata. |
| Need single-repo impact | Use `--repo` or combine with `--scope` / `--layer` / `--domain`. |

After publishing, update scenario/Seed status once PRs merge and re-run `_collected` before the next release window.
