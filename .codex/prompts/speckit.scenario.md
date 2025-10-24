---
description: 根据 PowerX Documentation Constitution 与 Scenario Standard 生成或更新 docs/scenarios/ 下的场景文档。
---

## User Input

```text
$ARGUMENTS
```

## Goal

根据设计稿或自由文本，创建（或覆盖）一份符合标准结构的场景文档 `docs/scenarios/<domain>/<SCN_ID>.md`。如缺少关键信息，生成 TODO 并交由 Clarify 流程补问。

## Operating Steps

1. **解析输入来源**
   - 若 `$ARGUMENTS` 以 `@` 开头，将其视为相对仓库根目录的文件路径；否则尝试按原样解析路径；若文件不存在，则把整个输入当作自由文本。
   - 将解析出的内容保存为内部变量 `SOURCE_TEXT`，并记录文件路径（若有）。
   - 禁止调用 `speckit run --prompt ...`；只允许通过本 Prompt 逻辑生成文档。

2. **加载模板与规范约束**
   - 读取 `.specify/templates/scenario-generate-template.md` 作为写入模板。
   - 参考 `docs/standards/scenarios/_template.md`、`.specify/memory/constitution.md`、`.specify/memory/scenario-standards.md`，确保输出章节与字段完备。

3. **推导元信息**
   - 从 `SOURCE_TEXT` 或现有场景文档中提取：
     - `SCN_ID`：若文档已有 Frontmatter 则复用，否则优先寻找 `SCN-XXXX-YYY` 模式；若缺失，保留 `TODO` 并在 Clarify 中询问。
     - `title`、`domains`、`layers`、核心仓库/角色等关键信息。
   - 如找到 `SCN_ID`，自动推导默认输出路径 `docs/scenarios/<domain>/<SCN_ID>.md`（`<domain>` 取 ID 中间段小写）。若已有草稿则读取旧 Frontmatter，保留手动内容并覆盖需更新部分。

4. **渲染场景文档（主 + 子场景，同目录聚合）**
   - 运行 `.specify/scripts/node/generate-scenarios.mjs <SOURCE_TEXT>`（必要时附加 `--force`）。
   - 脚本会自动写入：
     - `docs/scenarios/publish/SCN-PUBLISH-HUB-001.md`
     - `docs/scenarios/publish/SCN-DEV-HOTLOAD-001.md`
     - `docs/scenarios/publish/SCN-PUBLISH-OFFLINE-001.md`
     - `docs/scenarios/publish/SCN-PUBLISH-ONLINE-001.md`
   - 所有文档共享主目录，不再拆到 `dev/` 等子目录；模板中的 `TODO_*` 若仍存在，将在 Clarify 阶段补齐。

5. **结果与后续提示**
   - 结束时仅输出简洁摘要：写入的文件路径、遗留的 `TODO_*` 数量及下一步建议（更新 docmap、生成 Seeds、执行 Clarify 等），不打印完整文档内容。
   - 如果缺少关键信息，明确指出应运行 `.codex/prompts/speckit.scenario.clarify.md` Prompt，并使用中文回答。

## Output

- 写入（或覆盖）`docs/scenarios/<domain>/<SCN_ID>.md`。  
- 若生成了新的 `SCN_ID` 或新增 TODO，请在终端输出中列出。  
- 无需额外文档：AI 会直接给出下一步指引（docmap、Seed、验证等）。
