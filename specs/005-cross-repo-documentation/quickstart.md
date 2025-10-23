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
3. Run validation（静态检查 + CLI 校验）：
   ```bash
   npm run lint
   npm run publish:scenarios -- --scn-id SCN-PUBLISH-002 --validate-only
   ```
4. 渲染场景并生成报告（建议先 `--dry-run` 预览）：
   ```bash
   npm run publish:scenarios -- \
     --scn-id SCN-PUBLISH-002 \
     --dry-run
   ```
   去掉 `--dry-run` 后执行正式发布，产出的 `docs/website/scenarios/**` 与 `reports/scenarios/*.json` 一并提交。
5. 架构图若有更新，记得同步 `docs/design/cross-repo-documentation.md` 后重新运行发布命令确认渲染正常。

## 2. Distribute Usecase Templates (Pure Push)
1. Confirm template updates live under `docs/usecases-seeds/<scope>/<layer>/<domain>/`.
2. 启动分发（推荐以 `--dry-run` 预览）：
   ```bash
   npm run publish:usecases -- \
     --scn-id SCN-PUBLISH-002 \
     --scope powerx \
     --dry-run
   ```
   预览无误后去掉 `--dry-run` 执行正式分发。
3. CLI 会为每个仓生成分支与 PR URL，详见 `reports/usecases/usecases_SCN-PUBLISH-002.json`。
4. 若有仓库失败，可利用报告中的 `resumeToken` 重试：
   ```bash
   npm run publish:usecases -- --scn-id SCN-PUBLISH-002 --resume-token <token>
   ```
5. 针对 72 小时未合并的 PR，发送提醒：
   ```bash
   npm run publish:notify -- --workflow usecases
   ```

## 3. Distribute Standards
1. Update governance documents under `docs/standards/**` following the style guide.
2. 执行分发（可用 `--dry-run` 预览）：
   ```bash
   npm run publish:standards -- --dry-run
   ```
   去掉 `--dry-run` 后将同步 `docs/standards/**` 至各仓 `standards_root`。
3. PR 与状态记录在 `reports/standards/standards_distribution.json`，请确认全部成功后再结束流程。

## 4. Regenerate Leadership View
1. docmap 或仓库元信息发生变更后，重新生成 `_collected` 占位：
   ```bash
   npm run publish:collected -- --scn-id SCN-PUBLISH-001
   ```
2. Inspect `_collected` markdown files, verifying optional badges render for `optional: true` entries.
3. Trigger a full site build to validate bilingual output:
   ```bash
   npm run docs:build
   ```

## 5. Test & Report
- Run workflow smoke tests before merging:
  ```bash
  npm run test:workflows
  ```
- 统计最近运行时长与成功率：
  ```bash
  node scripts/qa/workflow-metrics.mjs
  ```
- Publish summary and delivery reports with the feature branch to keep leadership informed.
- Ensure generated reports link back to upstream PRs for traceability.
