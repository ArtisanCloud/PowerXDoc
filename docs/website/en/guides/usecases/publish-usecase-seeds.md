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
- To reuse the same batch, grab the `resumeToken` from `reports/_state/usecases:SCN-PUBLISH-HUB-001.json` (or the dry-run report) and rerun with it:

  ```bash
  npm run publish:usecases \
    -- --scn-id SCN-PUBLISH-HUB-001 \
    --dry-run \
    --resume-token <token>
  ```

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
  - `--repo powerx` — run against a single repository.
  - `--resume-token <token>` — resume a previous partial run.
- To commit straight to the default branch (for example `dev/docs`) instead of opening a PR branch, add `--use-default-branch`. The script will checkout the configured `default_branch`, run `git pull --ff-only`, commit, and push directly.
- Reuse the dry-run results by passing the same token during the real publish:

  ```bash
  npm run publish:usecases \
    -- --scn-id SCN-PUBLISH-HUB-001 \
    --resume-token <token>
  ```

### Direct-commit mode

- To bypass PR branches and push straight to the repository’s default branch (for example `dev/docs`), add `--use-default-branch`:

  ```bash
  npm run publish:usecases \
    -- --scn-id SCN-PUBLISH-HUB-001 \
    --use-default-branch
  ```

- For each downstream repo the script runs `git fetch` → `git checkout <default_branch>` → `git pull --ff-only origin <default_branch>` → copies Seeds → `git commit` (when changes exist) → `git push origin <default_branch>`.
- You can combine dry run and direct commit:

  ```bash
  npm run publish:usecases \
    -- --scn-id SCN-PUBLISH-HUB-001 \
    --dry-run \
    --use-default-branch \
    --resume-token <token>
  ```

- To double-check remote state afterwards, run the helper script to issue `git push` for every checkout:

  ```bash
  node scripts/setup/push-downstreams.mjs
  ```

- If older runs left local `docs/hub/<SCN_ID>-***` branches, clean them up with `git branch -D docs/hub/<SCN_ID>-***` inside each repo.

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
| `--scope` | `--scope powerx` | Target a business scope. |
| `--layer` | `--layer service` | Limit to a layer. |
| `--domain` | `--domain dev` | Focus on a domain. |
| `--repo` | `--repo powerx` | Operate on a single repository. |
| `--resume-token` | `--resume-token <token>` | Continue after a failed attempt. |
| `--use-default-branch` | `--use-default-branch` | Commit/push on the repository’s `default_branch` instead of creating a PR branch. |

Combine filters as needed:

```bash
npm run publish:usecases \
  -- --scn-id SCN-PUBLISH-HUB-001 \
  --scope powerx \
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
