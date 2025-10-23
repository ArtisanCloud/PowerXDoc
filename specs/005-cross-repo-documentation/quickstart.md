# Quickstart — PowerXDocs Cross-Repo Documentation Hub

## Audience & Roles
- **Documentation Steward**: Authors SCN scenarios, maintains docmap registrations, ensures diagrams stay accurate.
- **Documentation Operations Engineer**: Runs distribution workflows for usecase templates and standards, monitors delivery reports.
- **Product Leadership**: Reviews `_collected` summaries to assess coverage; consumes generated reports.

## Prerequisites
- Node.js 18.x, npm, and Git CLI available on PATH.
- Authenticated SSH access to PowerXDocs plus downstream repositories defined in `docs/_data/repos.yaml`.
- GitHub personal access token with `repo` scope exported as `GITHUB_TOKEN` for PR automation.
- VitePress/Tailwind dependencies installed (`npm install`).

## 1. Validate & Publish a Scenario
1. Author the scenario draft under `docs/scenarios/SCN-<KEY>.md` using the standard template blocks.
2. Register or update the entry inside `docs/_data/docmap.yaml`, keeping taxonomy in sync with `docs/standards/taxonomy.md`.
3. Run validation (fails fast on duplicate IDs, missing sections, or absent diagrams):
   ```bash
   npm run lint
   node scripts/publish/publish-scenarios.mjs validate --scn-id SCN-PUBLISH-002
   ```
4. Render the scenario (generates `docs/website/scenarios/**` and updates `_collected` cache by default):
   ```bash
   node scripts/publish/publish-scenarios.mjs publish --scn-id SCN-PUBLISH-002 --locales zh-CN en-US
   ```
5. Commit rendered artifacts plus the generated delivery report in `reports/scenarios/<workflowId>.json`.
6. Update the architecture mermaid diagram in `docs/design/cross-repo-documentation.md` whenever the flow changes, then re-run the publish command to confirm visuals render.

## 2. Distribute Usecase Templates (Pure Push)
1. Confirm template updates live under `docs/usecases-seeds/<scope>/<layer>/<domain>/`.
2. Launch the distribution workflow (creates per-repo feature branches and PRs):
   ```bash
   node scripts/publish/push-usecases.mjs dispatch --scope powerx --scn-id SCN-PUBLISH-002
   ```
3. Monitor console output; details also land in `reports/usecases/<workflowId>.json`.
4. If any repo is unreachable, rerun with the retry token printed in the report:
   ```bash
   node scripts/publish/push-usecases.mjs retry --token <retryToken>
   ```
5. After 72 hours, send reminders for outstanding PRs:
   ```bash
   node scripts/workflows/notify-reviewers.mjs remind --workflow <workflowId>
   ```

## 3. Distribute Standards
1. Update governance documents under `docs/standards/**` following the style guide.
2. Execute the standards workflow (read-only downstream path enforcement):
   ```bash
   node scripts/publish/push-standards.mjs dispatch --scopes powerx powerx-admin powerx-plugin powerx-marketplace
   ```
3. Review generated PR URLs in the workflow report; escalate failures before marking the run complete.

## 4. Regenerate Leadership View
1. After docmap or repo metadata changes, rebuild collected stubs:
   ```bash
   node scripts/publish/generate-collected.mjs run --scopes powerx powerx-admin powerx-plugin powerx-marketplace
   ```
2. Inspect `_collected` markdown files, verifying optional badges render for `optional: true` entries.
3. Trigger a full site build to validate bilingual output:
   ```bash
   npm run docs:build
   ```

## 5. Test & Report
- Run workflow smoke tests before merging:
  ```bash
  node --test tests/workflows
  ```
- Publish summary and delivery reports with the feature branch to keep leadership informed.
- Ensure generated reports link back to upstream PRs for traceability.
