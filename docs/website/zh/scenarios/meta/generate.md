# `.codex/prompts/speckit.scenario.md` 需求目的说明（含 Clarify 协同机制）

## 一、目标（Purpose）

`.codex/prompts/speckit.scenario.md` 的核心目标是：

> 为 AI 提供一套统一的「场景文档生成 Prompt」，
> 能够从 **自由描述文本** 或 **初步需求文档** 自动生成符合
> 《PowerX Documentation Constitution》 与 《PowerX Scenarios Documentation Standard》
> 要求的结构化场景文档（SCN）。

其输出应严格遵循 `docs/standards/scenarios/_template.md` 模板规范，
实现对模板变量的智能填充、章节结构映射、以及主从文档的自动关联。

---

## 二、输入类型（Input）

Prompt 的输入可以是三种类型之一：

1. **文件路径输入**

   * 指向一份初步设计稿或描述性文档，如：
     `docs/meta/scenarios/powerx/plugin-ecosystem/plugin-lifecycle/plugin-publish-and-release/primary.md`
   * 可选择是否自动拆分为多个子场景。

2. **现有场景文档输入**

   * 如：`docs/scenarios/publish/SCN-PUBLISH-001.md`
   * 用于重构或更新旧版本，自动分析缺口并补全。

3. **纯文本描述输入**

   * 自然语言自由描述，如：

     ```
     插件发布需要 PowerXPlugin、Marketplace、Backend、Admin 四个仓协作，
     目标是在5分钟内完成插件从上传、审核到启用的闭环。
     ```

   * Prompt 应能自动解析关键词、角色、流程、契约、目标等信息，
     并填充至模板中对应变量。

---

## 三、输出（Output）

生成的内容包含两类：

1. **主场景文档（Master Scenario）**

   * 命名规则：`docs/scenarios/<domain>/SCN-*.md`
   * 内容结构包括：

     * Frontmatter（元信息）
     * Executive Summary
     * Scope & Guardrails
     * Participants & Responsibilities
     * End-to-End Flow（含 mermaid 时序图骨架）
     * 子用例矩阵与仓库职责表
     * 契约引用（CLI / API / Event / Data Contract）
     * 验收标准与指标（Acceptance & Telemetry）
     * Open Issues

2. **子场景文档（Atomic Scenario）**

   * 当启用 `--split` 时，自动从主场景拆解生成多个子场景。
   * 每个子场景对应最小交付颗粒度，聚焦单一仓库或单一职责。
   * 子场景与主场景保持双向引用关系（Frontmatter `related_usecases` 字段）。

---

## 四、核心职责（Prompt 职能）

1. **从输入中识别关键信息字段**

   * 包括：`scn_id`、`title`、`status`、`version`、`owners`、`domains`、`layers`、`repos`、`related_usecases` 等。

2. **模板绑定（Template Binding）**

   * 基于 `docs/standards/scenarios/_template.md` 与 `.specify/templates/scenario-generate-template.md` 进行变量匹配；
   * 默认由 `/speckit.scenario <设计稿路径或文本>` 拉起模板骨架；
   * 未能自动生成的字段保留 `TODO_*` 占位符。

3. **Clarify 触发机制**

   * 当发现字段缺失或语义不完整时，自动调用
     **`.codex/prompts/speckit.scenario.clarify.md`** 进行澄清提问。
   * Clarify 模块负责：

     * 逐轮询问缺口字段（一次一问，最多 5 轮）；
     * 将回答转化为结构化变量；
     * 回写到生成上下文；
     * 确保最终文档的 Frontmatter 与正文均完整。

4. **输出验证与提示**

   * 对比模板，生成“待补项 Checklist”；
   * 若存在未解决的 TODO，明确标记来源与责任人；
   * 保证可直接进入 `docs/scenarios/**` 并通过构建。

---

## 五、Clarify 协同机制

### 1. 触发条件

生成场景文档后，若存在以下任一情况：

* 缺少必填元信息（例如 Owners、Domains、Repos）；
* 内容段落存在语义空白或 TODO 占位符；
* Clarify 标识字段（`clarify_required: true`）出现在 frontmatter 中；
  则自动触发 `.codex/prompts/speckit.scenario.clarify.md`。

### 2. 交互逻辑

Clarify Prompt 的职责：

* 读取生成文档；
* 识别未完成字段；
* 逐条生成明确、上下文相关的问题；
* 等待用户回答；
* 将回答结构化并更新原文档。

### 3. 输出与循环

* Clarify 结束后返回补全的场景文档；
* 若仍存在空缺，生成最终“待补项汇总列表”；
* 用户可重新运行 `/speckit.scenario` 指令覆盖旧稿；
* 形成“生成 → 澄清 → 完善”的闭环。

---

## 六、目标特征（Expected Behavior）

* ✅ 能从非结构化描述中生成完整 SCN 文档骨架；
* ✅ 兼容多源输入（文本 / 文件 / 旧稿）；
* ✅ 与 `_template.md` 严格对齐，保证结构一致；
* ✅ 自动调用 Clarify Prompt 进行补全与确认；
* ✅ 支持主从文档关联与最小颗粒拆解；
* ✅ 产出具备幂等性（相同输入与回答产出一致结果）；
* ✅ 输出包含差异提示与补充清单。

---

## 七、非目标（Non-Goals）

* 不实现文档的版本控制或 PR 提交流程；
* 不自动修改 `docmap.yaml` 或同步分发；
* 不负责生成或维护 `docs/standards/**` 内标准文档；
* 不参与 CI/CD 验证，仅生成规范化 Markdown 内容。

---

## 八、成功判定（Success Criteria）

| 指标              | 判定标准                                      |
| --------------- | ----------------------------------------- |
| **结构完整性**       | 输出文档符合 `_template.md` 结构要求，无缺失章节          |
| **Clarify 完整度** | 所有必填字段在 Clarify 流程中均被确认或标注                |
| **可读性**         | 文档语言自然、逻辑清晰、角色职责明确                        |
| **可关联性**        | 主文档与子文档间双向链接正确                            |
| **幂等性**         | 相同输入多次执行结果一致，无随机偏差                        |
| **合规性**         | 对齐 Constitution 与 Standard 要求，字段命名与格式符合规范 |

---

## 九、总体目标图示（逻辑闭环）

```mermaid
flowchart TD
    A[输入源: 描述文件/自由文本] --> B[.codex/prompts/speckit.scenario.md Prompt/]
    B --> C{解析与模板映射}
    C -->|变量齐全| D[生成主场景文档 SCN-Master]
    C -->|缺字段| E[.codex/prompts/speckit.scenario.clarify.md/]
    E --> F[用户回答 Clarify 问题]
    F --> G[补全结构化字段]
    G --> B
    D --> H[拆分子场景 SCN-Atomic (可选)]
    D --> I[输出差异与Checklist]
    H --> I
```

---

**一句话总结：**
`.codex/prompts/speckit.scenario.md` 是 AI 的“主生成器 Prompt”，负责从需求描述中自动产出结构化的 SCN 文档骨架；
`.codex/prompts/speckit.scenario.clarify.md` 是其“澄清协作器 Prompt”，负责在生成过程中发现缺口并提问补全，二者共同构成 PowerX 场景文档生成体系的核心闭环。
