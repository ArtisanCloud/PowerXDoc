---
title: 场景与用例导航
---

# 场景与用例导航

PowerX 采用“场景（SCN）+ Usecase Seed”的组合，将业务意图沉淀为可执行的规范，再驱动实现与交付。

## 概述 {#overview}

- **规范驱动**：遵循 GitHub Spec Kit 提出的 [Specification-Driven Development (SDD)](https://github.com/github/spec-kit/blob/main/spec-driven.md)。规范是唯一事实来源，代码、测试与运维脚本都从规范派生。
- **场景讲故事**：场景文档描绘端到端旅程，统一参与者、前置条件、流程节点与验收标准。
- **Usecase Seed 落地**：Seed 把场景拆解成最小交付单元，便于跨团队协作与复用。
- **docmap 统筹**：`docs/_data/docmap.yaml` 维护场景与 Seeds 的映射，是生成、索引与发布的唯一真相源。
- **延伸阅读**：详细操作步骤见《[场景使用流程](/zh/scenarios/usage)》，配合《[场景文档生成指南](/zh/guides/scenarios/scenario-generation)》与《[Usecase Seed 生成指南](/zh/guides/usecases/generate-usecase-seeds)》一起使用。

## 场景列表 {#catalog}

侧边栏会自动列出 docmap 中登记的全部场景，并按 `SCN_ID` 分类；每个条目下还包含子场景与 Usecase Seeds，方便直接跳转。维护建议：

- 优先在 `docs/scenarios/**` 更新源文件，再由脚本同步到 `docs/website/**`，避免人工拷贝造成偏差。
- 新增场景时，同时补充 docmap、生成 Seeds 与索引，确保列表与内容一致。
- 常用参考：
  - [场景使用流程](/zh/scenarios/usage)
  - [场景标准模版](/docs/meta/scenarios/list.md)
  - [Usecase Seed 索引维护指南](/zh/guides/usecases/seed-index-maintenance)
  - [标准文档分发指南](/zh/guides/publish/standards-distribution)
