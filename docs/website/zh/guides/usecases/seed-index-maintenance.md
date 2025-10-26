# Usecase Seed 索引维护指南

Usecase Seed 索引用于集中展示某个场景下的所有子用例，确保项目经理与领导层能快速了解覆盖范围。该索引生成于 `docs/usecases-seeds/scenarios/SCN-*.md`，并可同步到 `docs/website/{en,zh}/scenarios/<SCN_ID>/index.md`。本文说明何时需要刷新索引以及操作要点。

## 适用场景

- `docmap.yaml` 新增或修改了子用例（`doc_id/scope/layer/domain/optional`）。
- Seed 正文被补全或状态更新，需让索引反映真实进度。
- 场景新增子用例，需要一份新的索引供管理者查阅。

## 操作流程

1. **确保 docmap 与 Seed 一致**  
   - 更新 `docs/_data/docmap.yaml` 的 `children` 列表。  
   - 运行 `node .specify/scripts/node/setup-usecase-seeds.mjs --scn-id <SCN_ID>`（可带 `--doc-id`）生成或更新 Seed。

2. **刷新场景索引**  
   ```bash
   node .specify/scripts/node/generate-usecase-seed-index.mjs --scn-id <SCN_ID>
   ```
   - 按 `scope` 聚合所有子用例，将结果写入 `docs/usecases-seeds/scenarios/<SCN_ID>.md`。  
   - 批量更新可用 `--all`，覆盖旧文件需加 `--force`。

3. **同步站点（如需）**  
   ```bash
   node scripts/site/sync-seed-pages.mjs --scn-id <SCN_ID> --with-index --force
   ```
   - `--with-index` 会复制索引到 `docs/website/{lang}/scenarios/<SCN_ID>/index.md`。  
   - 指定语言时使用 `--locale zh`/`--locale en`。

4. **提交前复查**  
   - `git diff docs/usecases-seeds/scenarios/<SCN_ID>.md`，确认表格内容准确。  
   - 如需领导视图，可运行 `npm run publish:collected -- --scn-id <SCN_ID>`。

## 校验清单

- [ ] `docmap.yaml` 内没有缺失或重复的 `doc_id`。  
- [ ] 表格中的 `Seed` 链接可打开对应文件。  
- [ ] `status` 与 Seed Frontmatter 中的状态一致。  
- [ ] 需要站点展示时，`docs/website/{lang}/scenarios/<SCN_ID>` 已同步。  
- [ ] `reports/usecases/` 最新 Dry Run 或发布报告没有漏掉子用例。

## 常见问题

| 现象 | 处理方式 |
|------|----------|
| 索引缺少子用例 | 确认 `docmap.yaml` 是否登记，并重新运行生成脚本。 |
| 表格状态不正确 | Ensure Seed Frontmatter 的 `status/optional` 已更新，再次生成索引。 |
| 站点仍显示旧内容 | 重跑 `node scripts/site/sync-seed-pages.mjs --scn-id <SCN_ID> --with-index --force`，并执行 `npm run docs:build` 预览。 |
| 需要批量更新 | 使用 `generate-usecase-seed-index.mjs --all` 或编写循环脚本。 |

遵循以上步骤即可保持索引与实际交付状态一致。
