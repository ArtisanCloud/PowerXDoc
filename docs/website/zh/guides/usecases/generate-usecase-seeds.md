# 生成 Usecase Seed 指南

场景文档（SCN）完成后，可通过仓库脚本批量生成 Usecase Seed 骨架，再逐条补齐正文并同步到站点/下游仓库。本文对齐仓库版指南，补充 task.md 与校验流程，方便日常复盘。

## 1. 前置检查

- `docs/scenarios/<domain>/SCN-*.md` 已通过 `speckit.scenario*.md` 填写完成，无关键 `TODO_*`。
- `docs/_data/docmap.yaml` 登记了目标 `scn_id`，每个 `child` 都包含 `doc_id`、`scope`、`layer`、`domain` 等字段。
- `docs/_data/repos.yaml` 配置了各仓默认维护人，Frontmatter 可自动补齐。

## 2. 生成 Seed 骨架

```bash
node .specify/scripts/node/setup-usecase-seeds.mjs --scn-id SCN-PUBLISH-HUB-001
```

- 默认会在 `docs/usecases-seeds/<scope>/<layer>/<domain>/<doc_id>.md` 下生成或更新所有子用例模板。
- 常用参数：
  - `--doc-id PX-DEV-HOTLOAD-001`（可多次出现）：仅生成指定 Seed。
  - `--scope powerx` / `--layer service` / `--domain publish`：按维度过滤。
  - `--force`：覆盖已有 Seed。
  - `--dry-run`：仅预览计划生成的文件。

## 3. 生成任务清单（task.md）

- 执行 `node scripts/node/generate-seed-tasks.mjs --scn-id <SCN_ID>`，脚本会根据 docmap 输出版块写入 `docs/usecases-seeds/<SCN_ID>/task.md`，与 Seed 位于同一目录，便于逐条跟踪。首次产 Seed 即会生成此文件；如需调整顺序或新增子用例，重复执行即可覆盖更新。
- 打开任务清单（`docs/usecases-seeds/<SCN_ID>/task.md`），按列出的命令逐项补写 Seed，例如：

```bash
[usecase-generate-template.md](.specify/templates/usecase-generate-template.md) \
  docs/usecases-seeds/SCN-PUBLISH-HUB-001/PLG-DEV-HOTLOAD-001.md \
  --context docs/scenarios/publish/SCN-PUBLISH-HUB-001.md \
  --context docs/scenarios/publish/SCN-DEV-HOTLOAD-001.md \
  --context docs/_data/docmap.yaml \
  --context docs/_data/repos.yaml
```

> 建议按照 task.md 顺序处理，减少遗漏。

## 4. 补全 Seed 正文

1. 打开生成的 Seed Markdown，替换所有占位符（`TODO_*`、示例表格、Mermaid 伪代码等）。
2. 校验 Frontmatter：`doc_id`、`scope`、`layer`、`domain`、`optional` 必须与 `docmap.yaml` 一致。
3. 若 Seed 需要引用其它上下文，请将路径纳入 `--context` 参数，便于 AI 或撰写者读取。

## 5. 同步站点副本（按需）

若需在站点查看断面，可执行：

```bash
node scripts/site/sync-seed-pages.mjs \
  --scn-id SCN-PUBLISH-HUB-001 \
  --with-index \
  --force
```

- `zh` 目录复制中文原稿；`en` 目录生成 “Pending Translation” 占位并写入 `partnerSlug`。
- 仅同步 Seed 时可移除 `--with-index`；指定语言使用 `--locale zh` / `--locale en`。
- 执行 `npm run docs:dev` 或 `npm run docs:build` 验证站点导航、Seed 页面是否更新。

## 6. 提交前自检

1. 生成索引：`node .specify/scripts/node/generate-usecase-seed-index.mjs --scn-id <SCN_ID>`。
2. 运行 `npm run publish:usecases -- --scn-id <SCN_ID> --validate-only` 检查结构、Frontmatter、必填字段。
3. 查看 `git status`，确保只包含目标场景及 Seed 的改动。

## 7. 常见问题

| 情况 | 排查方式 |
|------|----------|
| 提示 `SCN_ID` 不存在 | docmap 没有登记场景；补齐 `scenarios[].scn_id` 与 `children`。 |
| Seed 未生成/被跳过 | 默认不覆盖旧文件，需加 `--force`；或检查过滤条件。 |
| Seed 中仍有 `TODO_*` | 说明资料不足，补齐场景文档或手动填充细节。 |
| 站点不显示新 Seed | 是否执行 `sync-seed-pages.mjs` 并提交 `docs/website/**`。 |
| `_from_hub` 目录出现改动 | 需回滚并提醒下游仓维护自己的 `docs/use_cases/**`。 |

完成上述步骤后，即可进入《[发布 Usecase Seeds 指南](/zh/guides/usecases/publish-usecase-seeds)》中的 Dry Run 与分发流程。
