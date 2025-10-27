description: 根据 PowerX Documentation Constitution 与 Scenario Standard 生成或更新 docs/scenarios/ 下的场景文档。
---

## 使用说明

- 本 Prompt 由 **当前助理** 在 Codex/Speckit 环境中执行。用户只需提供输入（文件路径或文本），你必须按照以下步骤亲自完成解析、生成与写入。
- 不要要求用户再运行任何命令；所有读取与写入操作均由本 Prompt 内的逻辑完成。
- 输出时只需给出写入的路径、TODO 数量和后续动作提示，不要把完整文档粘贴在终端里。

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Goal

根据设计稿或自由文本，创建（或覆盖）一份符合标准结构的场景文档 `docs/scenarios/<domain>/<SCN_ID>.md`。如缺少关键信息，生成 TODO 并交由 Clarify 流程补问。

## Operating Steps

1. **解析输入来源**
   - 若 `$ARGUMENTS` 以 `@` 开头，将其视为相对仓库根目录的文件路径；否则尝试按原样解析路径；若文件不存在，则把整个输入当作自由文本。
   - 将解析出的内容保存为内部变量 `SOURCE_TEXT`，并记录文件路径（若有）。
   - **本 Prompt 内不得再次调用 `speckit run --prompt ...`**，避免嵌套执行；后续写入由本逻辑独立完成。

2. **加载模板与规范约束**
   - 读取 `.specify/templates/scenario-generate-template.md` 作为写入模板。
   - 参考 `docs/standards/scenarios/_template.md`、`.specify/memory/constitution.md`、`.specify/memory/scenario-standards.md`，确保输出章节与字段完备。

3. **推导元信息**
   - 从 `SOURCE_TEXT` 或现有场景文档中提取：
     - `SCN_ID`：若文档已有 Frontmatter 则复用，否则优先寻找 `SCN-XXXX-YYY` 模式；若缺失，保留 `TODO` 并在 Clarify 中询问。
     - `title`、`domains`、`layers`、核心仓库/角色等关键信息。
     - `owners`：若缺失则默认填入 `Michael Hu / Product Manager / matrix-x@artisan-cloud.com`，并在 Clarify 中确认是否需要调整。
   - 当 `SOURCE_TEXT` 描述了一个主场景与多个子用例时：
     - 先解析主场景 `SCN_ID`；
     - 若 `docs/_data/docmap.yaml` 中存在该 `SCN_ID` 的 `child_scenarios` / `children` 列表，则以其中的 `scn_id` / `doc_id` 作为子场景编号；
     - 若 docmap 缺少条目，则根据源文本中的章节（如 “1️⃣ xxx”、“### 子场景”等）推导子场景 ID，并在输出中用 `TODO` 标记待确认；
     - 为每个子场景准备独立的元信息（标题、范围、参与者等）。
   - 对于每个识别出的场景（主 + 子），推导目标路径 `docs/scenarios/<domain>/<SCN_ID>.md`（`<domain>` 取 ID 中间段小写）。若已有草稿则读取旧 Frontmatter，保留手动内容并覆盖需更新部分。

4. **渲染并写入场景文档**
   - 为主场景及每一个子场景分别生成 Markdown：
     - 使用模板填充结构，缺失信息以 `TODO_*` 标记；
     - 若对应文件已存在，先读取旧内容以合并人工修改。
   - 使用 `write_file`（或等效能力）把每个场景写入自己的目标路径，确保所有文件都落盘。
   - 在写入前后记录成功处理的 `SCN_ID` 列表，便于输出摘要。

5. **结果与后续提示**
   - 结束时仅输出简洁摘要：列出写入的所有文件路径、各自遗留的 `TODO_*` 数量及下一步建议（更新 docmap、生成 Seeds、执行 Clarify 等），不打印完整文档内容。
   - 如果缺少关键信息，明确指出应运行 `.codex/prompts/speckit.scenario.clarify.md` Prompt，并使用中文回答。

## Output

- 写入（或覆盖）`docs/scenarios/<domain>/<SCN_ID>.md`。  
- 若生成了新的 `SCN_ID` 或新增 TODO，请在终端输出中列出。  
- 无需额外文档：AI 会直接给出下一步指引（docmap、Seed、验证等）。
