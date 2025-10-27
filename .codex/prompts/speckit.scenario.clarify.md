---
description: 针对场景文档生成流程的 Clarify 会话，引导用户逐项补充缺失信息（一次一问）。
---

## User Input

```text
$ARGUMENTS
```

该 Clarify 流程由当前助理在会话中直接执行，用于补齐场景文档必须的元信息与业务细节。操作时请遵循：

- 使用中文行文；
- 提供一个 `当前助理 推荐选项` 供用户快速采纳；
- 引用 `.specify/templates/scenario-clarify-template.md` 填写问题与答复。
支持三类输入：

- 指定现有 `docs/scenarios/**/SCN-*.md` 文件路径，脚本需要扫描文档找出缺失内容；
- 指定 `docs/meta/scenarios/**` 设计说明，Clarify 需协助拆分并梳理多个场景的结构化字段，并确认是否保留默认覆盖行为；
- 纯自然语言描述，Clarify 需帮助识别是否存在多条独立流程并确认命名。

## Clarify 准备

1. 加载 `.specify/memory/constitution.md` 与 `.specify/memory/scenario-standards.md`，确认所有必填要素（SCN ID、标题、参与仓库、Layer、Domain、业务目标、跨仓流程、契约引用、验收标准、子用例矩阵等）。
2. 若用户提供了场景 Markdown 或设计说明，解析 frontmatter 和正文，构建缺失项列表；若包含多条流程，需要为每条流程维护独立的缺口列表，并确认是否允许覆盖现有文件。占位符可参考 `.specify/templates/scenario-clarify-template.md`。**若已存在同名 `docs/scenarios/**/SCN-*.md` 文件且不涉及重命名，则默认沿用原有 SCN ID，无需重复提问。**
3. 按影响度排序 Clarify 问题，优先确保：
   - Frontmatter 元信息完整且与标准字段相符；
   - 若 `owners` 为空则先使用默认值 `Michael Hu / Product Manager / matrix-x@artisan-cloud.com`，仅在用户提出调整需求时再追问；
   - 参与仓库/Layer/Domain 与职责清晰；
   - 跨仓流程、关键接口、验收指标明确；
   - 子用例映射（`doc_id`）及 docmap 影响到位；
   - 需要 mermaid 图或其他可视化描述的场景得到确认；
   - 若拆分多场景，确认每个场景的命名（SCN ID）、适用流程及是否需要覆盖现有文件。**如果目标 SCN 已存在且没有重命名需求，则跳过该类问题。**

## Clarify 流程

遵循一次一问、最多 5 轮的模式（参考 `.codex/prompts/speckit.clarify.md`）：

1. 每次只提出 **一个** 高优先级问题，可使用多选或短答案（≤ 10 个字）。若存在多条候选场景，需明确问题针对哪一个。**凡是可以从现有文件、约定或默认值推断出的信息（如沿用既有 SCN ID、默认覆盖行为、标准子用例组合），不得重复发问。**提问时必须包含“AI 推荐选项”，并提醒用户以中文作答或直接选择推荐项。
2. 问题需紧扣场景文档必填项，避免泛泛或无需即时决策的内容；如用户加了 `--no-overwrite` 或指定 `--output-dir`，需确认覆盖/写入策略。
3. 获得回答后，立刻整理为结构化记录（例如 Frontmatter 字段、表格行、指标值），附带简短确认，并标注所属场景。
4. 如果仍有高优先级缺口，继续下一问；否则结束 Clarify，并输出汇总。

## Clarify 输出

完成会话后返回：

- 每个场景收集到的关键信息清单（Frontmatter 字段、参与仓库职责、子用例列表、关键指标等）。
- 尚未得到答案的项目（如有），标记为 TODO，并指明属于哪个场景。
- 若用户使用 `--no-overwrite` 或自定义输出目录，明确提醒需要手动合并或复制到 `docs/scenarios/**`。
- 建议下一步动作（通常为重新执行 `.codex/prompts/speckit.scenario.md <源> [--no-overwrite|--output-dir]` 以生成最终文档）。

若所有必需信息已齐全，可直接指示用户继续调用生成指令。若在 Clarify 过程中发现原始文档结构或模板不符合标准，需明确指出并提示修复。
