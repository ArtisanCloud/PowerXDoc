---
title: 场景与用例导航
---

# 场景与用例导航

PowerX 采用“场景（SCN）+ 子用例（Usecase Seed）”的方式描述业务流程。场景文档聚焦端到端旅程，Usecase Seed 负责跨仓落地。此页面汇总常用入口，协助团队浏览、维护与交付。

## 场景入口说明 {#overview}

- 每个场景文件位于 `docs/scenarios/<domain>/SCN-*.md`，通过 `node scripts/site/sync-scenario-pages.mjs` 发布后，会分别复制到 `docs/website/zh/scenarios/` 与 `docs/website/en/scenarios/`，站点的 `zh/scenarios/` 与 `en/scenarios/` 页面均来源于此；若需从零编写或大幅补写场景，请先阅读《[场景文档生成指南](/zh/guides/scenarios/scenario-generation)》。
- 场景结构遵循《PowerX Documentation Constitution》，涵盖范围、参与者、流程、契约与验收；当场景准备交付或跨仓共享时，可结合《[标准文档分发指南](/zh/guides/publish/standards-distribution)》了解如何把内容同步给下游团队。
- 可在下方“场景列表”直接打开对应文档。

## docmap 维护指南 {#docmap}

- `docs/_data/docmap.yaml` 记录场景与子用例的映射关系，是 Seed 生成与分发的唯一权威。
- 更新流程：
  1. 新增/修改场景后补充 `docmap.yaml`；
  2. 运行 `node .specify/scripts/node/setup-usecase-seeds.mjs --scn-id <SCN_ID>` 生成 Seed；
  3. 使用 `generate-usecase-seed-index.mjs` 刷新场景索引页面；
  4. 按需执行 `npm run publish:usecases -- --scn-id <SCN_ID>` 分发到各仓。
- 更多细节可参考：《[场景文档生成指南](/zh/guides/scenarios/scenario-generation)》《[Usecase Seed 生成指南](/zh/guides/usecases/generate-usecase-seeds)》与《[发布 Usecase Seeds 指南](/zh/guides/usecases/publish-usecase-seeds)》。

## Usecase Seed 索引 {#seed-index}

- 运行 `node .specify/scripts/node/generate-usecase-seed-index.mjs --scn-id <SCN_ID>` 会在 `docs/usecases-seeds/scenarios/SCN-*.md` 生成索引文件，并在站点同步时复制到 `docs/website/{en,zh}/scenarios/<SCN_ID>/index.md`。
- 补全 Seed 正文或调整 `docmap.yaml` 后，务必重跑索引脚本，并使用 `node scripts/site/sync-seed-pages.mjs --scn-id <SCN_ID> --with-index --force` 让仓库与网站保持一致。
- 在提交前按照《[Usecase Seed 索引维护指南](/zh/guides/usecases/seed-index-maintenance)》中的检查清单核对 `doc_id/status/optional` 等字段，下方“Usecase Seed 工具”提供相关命令。

## Usecase Seed 工具 {#seed-tools}

- Seed 生成：`node .specify/scripts/node/setup-usecase-seeds.mjs --scn-id <SCN_ID>`
- Seed 索引：`node .specify/scripts/node/generate-usecase-seed-index.mjs --scn-id <SCN_ID>`
- Seed 发布：`npm run publish:usecases -- --scn-id <SCN_ID>`
- 汇总视图：`npm run publish:collected -- --scn-id <SCN_ID>`

## 用例场景流程 {#flow}

- 主流程涵盖“撰写场景 → 生成 Seed → 发布/同步”，下图可帮助新人快速理解协作节点。

```mermaid
flowchart LR
  A[撰写/更新场景\n`docs/scenarios/<domain>/SCN-*.md`] --> B[维护 docmap\n`docs/_data/docmap.yaml`]
  B --> C[生成 Usecase Seeds\n`setup-usecase-seeds.mjs`]
  C --> D[刷新 Seed 索引\n`generate-usecase-seed-index.mjs`]
  C --> E[跨仓发布\n`npm run publish:usecases`]
  C --> F[站点同步\n`docs/website/{en,zh}/scenarios/**`]
  E --> G[供下游仓库开发]
  F --> H[供网站浏览与评审]
```

## 常用链接 {#links}

- [场景标准模版](/docs/meta/scenarios/list.md)（repo 内源文件）
- [Docmap 维护记录](/docs/meta/cross-repo-documentation.md#docmap-流程说明)（repo 内源文件）
- [场景文档生成指南](/zh/guides/scenarios/scenario-generation)
- [Usecase Seed 生成指南](/zh/guides/usecases/generate-usecase-seeds)
- [发布 Usecase Seeds 指南](/zh/guides/usecases/publish-usecase-seeds)
- [Usecase Seed 索引维护指南](/zh/guides/usecases/seed-index-maintenance)
- [标准文档分发指南](/zh/guides/publish/standards-distribution)
