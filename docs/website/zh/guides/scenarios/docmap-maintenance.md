---
title: Docmap 维护记录
description: 在 PowerXDocs 中维护 docmap.yaml 的完整流程与校验要点。
---

# Docmap 维护记录

> 适用范围：`docs/_data/docmap.yaml`、`docs/scenarios/**`、`docs/usecases-seeds/**`、`docs/website/{zh,en}/scenarios/**`

docmap 是 PowerX 场景（SCN）与 Usecase Seed 的唯一映射表，决定站点导航、Seed 生成与跨仓分发内容是否一致。本文整理维护步骤和常见检查项，便于在日常迭代中快速对齐。

## 1. 维护流程

### 步骤 A：更新场景源文档

- 位置：`docs/scenarios/<domain>/SCN-*.md`
- 检查 Frontmatter：`scn_id`、`title`、`owners`、`related_usecases`。
- 修改完成后运行 `node scripts/site/sync-scenario-pages.mjs --scn-id <SCN_ID>` 验证渲染效果。

### 步骤 B：更新 docmap

- 真相源：`docs/_data/docmap.yaml`
- 内容要素：
  - `scenarios[].scn_id` 与场景文件一致。
  - `child_scenarios`（如有）列出子场景文件路径。
  - `children` 记录 Usecase Seeds：`doc_id`、`scope`、`layer`、`domain`、`optional`、`repo`、`path`。
- 提交前运行 `node scripts/qa/workflow-metrics.mjs --check docmap`（如启用）校验结构。

### 步骤 C：生成 / 刷新 Seeds

| 操作 | 命令 | 说明 |
| --- | --- | --- |
| 生成 Seed 草稿 | `node .specify/scripts/node/setup-usecase-seeds.mjs --scn-id <SCN_ID>` | 在 `docs/usecases-seeds/**` 下生成最新模板。 |
| 刷新 Seed 索引 | `node .specify/scripts/node/generate-usecase-seed-index.mjs --scn-id <SCN_ID>` | 更新站点与分发使用的索引文件。 |
| 同步站点副本 | `node scripts/site/sync-seed-pages.mjs --scn-id <SCN_ID> --with-index` | 将场景与 Seed 拷贝到 `docs/website/{zh,en}/scenarios/`。 |

### 步骤 D：发布与验证

- 单场景发布：`npm run publish:usecases -- --scn-id <SCN_ID>`
- 汇总视图：`npm run publish:collected -- --scn-id <SCN_ID>`
- 标准同步：`npm run publish:standards`
- 验证：确认 `_from_hub` 目录只读、站点导航更新、种子索引显示正确。

## 2. 常见检查项

| 问题 | 处理建议 |
| --- | --- |
| 场景或 Seed 在站点缺失 | 是否重新同步 `docs/website/**` 副本并提交。 |
| 子用例顺序异常 | 检查 `docmap.yaml` 中 `children` 的排序并重新生成索引。 |
| 可选项未标记 | 若种子非强制，请将 `optional: true` 写入 docmap 并检查站点标记。 |
| 下游仓未收到模板 | 重新执行 `publish:usecases` 并确认凭证/目标分支。 |
| `_from_hub` 目录被直接修改 | 在 PR 中回滚该变更，并提醒对应仓库维护者更新自有用例目录。 |

## 3. 参考资料

- `docs/meta/cross-repo-documentation.md` — 多仓文档整体方案与历史决策。
- `docs/guides/scenarios/scenario-generation.md` — 场景文档结构规范。
- `docs/guides/usecases/generate-usecase-seeds.md` — Seed 生成与填充指南。
- `docs/guides/usecases/publish-usecase-seeds.md` — Seed 发布流程。
