# Usecase Seed 生成指南

场景文档（SCN）就绪后，可通过项目脚本批量生成 Usecase Seed 骨架，随后补全正文并同步到站点/下游仓库。本文梳理完整流程与常见校验点。

## 前置检查

- `docs/scenarios/<domain>/SCN-*.md` 中的场景内容无 `TODO_*`，Frontmatter 信息准确。
- `docs/_data/docmap.yaml` 已登记目标 `scn_id`，并为每个子用例填写 `doc_id`、`scope`、`layer`、`domain`、`optional` 等字段。
- `docs/_data/repos.yaml` 配置了目标仓库及默认评审人，便于脚本写入 Frontmatter。

## 生成 Seed 骨架

```bash
node .specify/scripts/node/setup-usecase-seeds.mjs --scn-id SCN-PUBLISH-001
```

- 默认会为 `docmap.yaml` 中的所有子用例生成或更新 Seed 模板（位于 `docs/usecases-seeds/<scope>/<layer>/<domain>/<doc_id>.md`）。
- 常用参数：
  - `--doc-id PX-DEV-HOTLOAD-001`：仅生成指定子用例，可重复传入。
  - `--scope powerx` / `--layer service` / `--domain dev`：按维度筛选。
  - `--force`：覆盖已有 Seed。
  - `--dry-run`：仅预览计划生成的文件。

## 补全 Seed 正文

1. 打开模板中列出的各个任务（可执行 `node scripts/node/generate-seed-tasks.mjs --scn-id <SCN_ID>` 获取提示），逐步补全正文。
2. 协同 AI Prompt 时，可执行：
   ```bash
   [speckit.implement.md](.codex/prompts/speckit.implement.md) \
     docs/usecases-seeds/powerx-plugin/proto/dev/PLG-DEV-HOTLOAD-001.md \
     --context docs/scenarios/publish/SCN-DEV-HOTLOAD-001.md \
     --context docs/_data/docmap.yaml \
     --context docs/_data/repos.yaml
   ```
3. 校验 Frontmatter 信息与 `docmap.yaml` 一致，并清理全部占位符（如 `<层名称>`、`TODO_*`）。

## 同步站点内容（按需）

若需要在文档站点展示最新 Seed，可执行：

```bash
node scripts/site/sync-seed-pages.mjs --scn-id SCN-PUBLISH-001 --with-index --force
```

- `zh` 目录会拷贝中文原稿；`en` 目录生成“Pending Translation”占位并附带 `partnerSlug`，供译者补全。
- 仅同步 Seeds 可去掉 `--with-index`；指定语言时追加 `--locale zh` 或 `--locale en`。
- 执行 `npm run docs:build` 或 `npm run docs:dev`，确认站点展示正常。

## 提交前自检

- 使用 `node .specify/scripts/node/generate-usecase-seed-index.mjs --scn-id <SCN_ID>` 更新 Seed 索引。
- 运行 `npm run publish:usecases -- --scn-id <SCN_ID> --validate-only` 检查结构与 Frontmatter。
- 查看 `git status`，确保仅包含目标场景/Seed 的改动。

## 常见问题

| 情况 | 处理方式 |
|------|----------|
| 提示找不到 `SCN_ID` | 检查 `docmap.yaml` 是否登记，必要时补充 `children`。 |
| Seed 未生成或被跳过 | 默认不覆盖旧文件，需加 `--force`。 |
| Seed 中仍有 `TODO_*` | 说明资料不足或脚本未覆盖，需要补齐场景信息或手动编辑。 |
| 想只生成部分 Seed | 使用 `--doc-id`、`--scope`、`--layer`、`--domain` 缩小范围。 |

完成以上步骤后，可继续按照《[发布 Usecase Seeds 指南](/zh/guides/usecases/publish-usecase-seeds)》进行 Dry Run 与跨仓发布。
