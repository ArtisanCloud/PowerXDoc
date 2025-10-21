# docs/website/_mount

Optional staging area for AI发布建议复制入站点前的文件。

- 仅放置允许对外展示的内容快照。
- 发布流程会从这里挑选并复制到正式目录。

## AI 发布建议与人工确认流程

1. 运行 `node scripts/publish/generate-suggestions.mjs --input approved.json` 生成 `publish-suggestions.json`。
2. 使用 `node scripts/publish/review-suggestions.mjs --file docs/website/_mount/publish-suggestions.json` 逐条确认、驳回或手动编辑建议。
3. 对高风险/低信心建议选择手动模式，并指定复制目标。
4. 审核完毕后执行 `node scripts/publish/apply-suggestions.mjs --session docs/website/_mount/publish-suggestions.json` 将内容复制进 docs/website/ 并输出审计日志。
