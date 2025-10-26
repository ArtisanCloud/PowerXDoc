# Usecase Seed 索引维护指南

Usecase Seed 索引用于集中展示某个场景下的全部 Seed 列表与生成状态，源文件位于 `docs/usecases-seeds/scenarios/SCN-*.md`，同步站点后会复制到 `docs/website/{en,zh}/scenarios/SCN-*.md`。本文说明何时需要刷新索引，以及推荐的操作与校验步骤。

## 适用场景

- `docmap.yaml` 新增或调整了子用例信息（`doc_id/scope/layer/domain` 等字段）。
- Seed 正文被补全、重命名或调整 `status`/`optional` 属性。
- 场景新增了子用例，需生成最新的 Seed 列表提供给项目经理或领导层。

## 操作流程

1. **确认 docmap 与 Seed 一致**  
   - 更新 `docs/_data/docmap.yaml` 中的 `children` 列表，让每个子用例都包含 `doc_id/scope/layer/domain/optional`。  
   - 运行 `node .specify/scripts/node/setup-usecase-seeds.mjs --scn-id <SCN_ID>`（或带 `--doc-id`）确保 Seed 文件存在。

2. **刷新场景索引**  
   ```bash
   node .specify/scripts/node/generate-usecase-seed-index.mjs --scn-id <SCN_ID>
   ```
   - 该命令会按 `scope` 聚合所有子用例，写入 `docs/usecases-seeds/scenarios/<SCN_ID>.md`。  
   - 需要一次性刷新所有场景时，追加 `--all`。  
   - 若只想覆盖现有文件，额外添加 `--force`。

3. **同步站点**（按需）  
   ```bash
   node scripts/site/sync-seed-pages.mjs --scn-id <SCN_ID> --with-index --force
   ```
   - `--with-index` 会把索引复制到 `docs/website/{lang}/scenarios/SCN-*/index.md`。  
   - 站点默认输出中文原稿，英文目录会生成占位等待翻译；指定语言使用 `--locale zh` 或 `--locale en`。

4. **提交前检查**  
   - 对比 `git diff docs/usecases-seeds/scenarios/<SCN_ID>.md`，确认表格信息与最新 Seed 匹配。  
   - 如需向领导层汇报覆盖情况，可执行 `npm run publish:collected -- --scn-id <SCN_ID>` 产出 `_collected` 视图。

## 校验清单

- [ ] `docmap.yaml` 中不存在缺失或重复的 `doc_id`。  
- [ ] 索引表格中的 `Seed` 链接可打开对应的 `docs/usecases-seeds/<scope>/<layer>/<domain>/<doc_id>.md` 文件。  
- [ ] `status` 字段与 Seed Frontmatter 中的 `status` 保持一致。  
- [ ] 若需要站点展示，`docs/website/{lang}/scenarios/SCN-*` 下的索引已更新。  
- [ ] `reports/usecases/` 中的最新 Dry Run 或发布报告没有遗漏子用例。

## 常见问题

| 现象 | 处理方式 |
|------|----------|
| 索引里缺少子用例 | 确认 `docmap.yaml` 中 `children` 列表是否包含该 `doc_id`，并重新运行生成命令。 |
| 表格状态不对 | 检查 Seed Frontmatter 的 `status` 与 `optional` 字段，重新执行索引脚本以同步显示。 |
| 站点仍显示旧内容 | 运行 `node scripts/site/sync-seed-pages.mjs --scn-id <SCN_ID> --force`，再执行 `npm run docs:build` 预览。 |
| 需要批量更新 | 使用 `generate-usecase-seed-index.mjs --all`，或写脚本遍历 `scn_id` 执行命令。 |

通过以上步骤可以保证 Seed 索引始终反映真实交付状态，并在站点与领导视图中保持一致。
