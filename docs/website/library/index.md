# Leadership Library

领导层可以通过该视图快速了解跨仓场景（SCN）的覆盖情况、缺口和可选项。

## 如何使用

1. 左侧导航按 `Scope / Layer / Domain` 组织 `_collected` 占位文档。
2. 进入任意文档可查看：
   - 场景名称及跳转链接
   - 关联 usecase stub 的仓库、路径与可选标记
   - 最新生成时间，确认数据是否需要刷新
3. 若发现缺口或可选项未实施，可直接跟进对应仓库 PR 链接（由分发流程生成）。

## 数据来源

- `docs/_data/docmap.yaml`：定义每个 SCN 与子用例的映射
- `npm run publish:collected`：基于 docmap 生成 `_collected` 占位
- `reports/collected/*.json`：记录生成报告与重跑 token

如需补充新的层/领域，请先更新 taxonomy 与 docmap，再运行 `publish:collected` 以刷新视图。
