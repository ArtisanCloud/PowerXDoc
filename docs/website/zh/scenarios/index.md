---
title: 场景与用例导航
---

# 场景与用例导航

PowerX 采用“场景（SCN）+ 子用例（Usecase Seed）”的方式描述业务流程。场景文档聚焦端到端旅程，Usecase Seed 负责跨仓落地。此页面汇总常用入口，协助团队浏览、维护与交付。

## 场景入口说明 {#overview}

- 每个场景文件位于 `docs/scenarios/<domain>/SCN-*.md`，发布后会同步到本站 `zh/scenarios/` 目录。
- 场景结构遵循《PowerX Documentation Constitution》，包含范围、参与者、流程、契约、验收等章节。
- 可在下方“场景列表”直接打开对应文档。

## docmap 维护指南 {#docmap}

- `docs/_data/docmap.yaml` 记录场景与子用例的映射关系，是 Seed 生成与分发的唯一权威。
- 更新流程：
  1. 新增/修改场景后补充 `docmap.yaml`；
  2. 运行 `node .specify/scripts/node/setup-usecase-seeds.mjs --scn-id <SCN_ID>` 生成 Seed；
  3. 使用 `generate-usecase-seed-index.mjs` 刷新场景索引页面；
  4. 按需执行 `npm run publish:usecases -- --scn-id <SCN_ID>` 分发到各仓。
- 更多细节见《Usecase Seed 生成指南》与《发布 Usecase Seeds 指南》。

## Usecase Seed 索引 {#seed-index}

- 每个场景的 Seed 列表会生成在 `docs/usecases-seeds/scenarios/SCN-*.md`。
- 建议在补全 Seed 正文后同步更新索引，以便项目经理与领导层统一查阅。
- 下方“Usecase Seed 工具”提供常用操作指引。

## Usecase Seed 工具 {#seed-tools}

- Seed 生成：`node .specify/scripts/node/setup-usecase-seeds.mjs --scn-id <SCN_ID>`
- Seed 索引：`node .specify/scripts/node/generate-usecase-seed-index.mjs --scn-id <SCN_ID>`
- Seed 发布：`npm run publish:usecases -- --scn-id <SCN_ID>`
- 汇总视图：`npm run publish:collected -- --scn-id <SCN_ID>`

## 常用链接 {#links}

- [场景标准模版](/docs/meta/scenarios/list.md)（repo 内源文件）
- [Docmap 维护记录](/docs/meta/cross-repo-documentation.md#docmap-流程说明)（repo 内源文件）
- Seed 撰写与发布的详细教程暂存于 `docs/guides/**`，后续将迁移至资源中心。
