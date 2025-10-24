# 场景文档生成指南

场景流程与 Usecase 保持同一套命令：

1. `node .specify/scripts/node/generate-scenarios.mjs <设计稿路径或文本> [--force]`
2. 若仍有缺口，再运行 `.codex/prompts/speckit.scenario.md <同样输入>` 或 `.codex/prompts/speckit.scenario.clarify.md <同样输入>`

补完后即可进入 Seed 生成与分发步骤。

## 1. 准备素材

- 将场景描述写成 Markdown（建议放在 `docs/meta/scenarios/`），也可以直接使用一段文本。
- 若已有历史 SCN，保留在 `docs/scenarios/<domain>/` 中即可，命令会自动覆盖。
- `docmap.yaml` / `repos.yaml` 若已配置，脚本会自动引用；缺少的部分 Clarify 会提醒。

## 2. 生成场景草稿

```bash
node .specify/scripts/node/generate-scenarios.mjs <源文件路径或文本文件> [--force]

或

[speckit.scenario.md](.codex/prompts/speckit.scenario.md) <@源文件路径或文本文件>


```

- `<源文件路径或文本文件>` 可以是任意设计稿 Markdown，也可以是临时保存的文本；示例：`docs/meta/scenarios/plugin/publish.md`
- 脚本按模板写入对应场景文档（若文件存在需覆盖则添加 `--force`）。
- 生成后如还有 `TODO_*`，继续执行 Clarify 补齐缺失信息。

## 3. Clarify（按需）

```bash
.codex/prompts/speckit.scenario.clarify.md docs/meta/scenarios/plugin/publish.md
```

- Clarify 会一次抛出一个高优先级问题（最多 5 个），**请用中文回答**；每个问题都会附带 AI 推荐选项，方便直接采纳。  
- 若无缺口，可以跳过此步。

## 4. 完成后检查

- 清除场景文档中残留的 `TODO_*`。  
- 确认 Frontmatter（`scn_id`、`owners`、`domains`、`layers`、`related_usecases` 等）准确。  
- 将新的 `scn_id` 和子用例关系写入 `docs/_data/docmap.yaml`。  
- 运行 `/speckit.usecase-guides <SCN_ID>` 进入 Seed 生成流程。  
- 使用 `npm run publish:scenarios -- --scn-id <SCN_ID> --validate-only` 快速校验 docmap 与 Seed 一致性。

## 常见问题

| 情况 | 处理方式 |
|------|----------|
| `.codex/prompts/speckit.scenario.md` 提示找不到 prompt | 确认路径拼写正确，且在仓库根目录执行。 |
| Clarify 多次询问相同问题 | 说明资料确实缺失，需要补充源文档或手动填写。 |
| 想拆分多个子场景 | 将设计稿拆成多份分别运行，或在 Clarify 回答时说明拆分方案后再补写子场景。 |
| 需要保留旧稿 | 生成前请先备份或使用 Git 分支管理，命令会覆盖同名文件。 |

完成这些，就可以继续执行 Usecase Seed 生成与跨仓分发。EOF
