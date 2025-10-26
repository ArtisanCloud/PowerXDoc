# 场景文档生成指南

本指南基于 `docs/guides/scenarios/README.md`，整理了从素材准备到 Clarify、验收的完整流程，方便在站点中快速查阅。

## 准备素材

- 先将业务流程整理成 Markdown，可放在 `docs/meta/scenarios/`（或任意临时文本）。  
- 若已存在历史 SCN，可直接保留于 `docs/scenarios/<domain>/`，生成脚本会覆盖同名文件（需要时使用 `--force`）。
- 确保 `docs/_data/docmap.yaml` 与 `docs/_data/repos.yaml` 中的基础信息完善，Clarify 阶段即可引用。

## 生成场景草稿

```bash
node .specify/scripts/node/generate-scenarios.mjs <源文件路径或文本文件> [--force]
```

- 命令会根据模板输出到 `docs/scenarios/<domain>/SCN-*.md`。  
- 当命令无法覆盖现有文件时，追加 `--force`。
- 也可以使用 Codex Prompt：

```bash
[speckit.scenario.md](.codex/prompts/speckit.scenario.md) <@源文件路径或文本文件>
```

## Clarify（按需）

```bash
.codex/prompts/speckit.scenario.clarify.md docs/meta/scenarios/<domain>/<file>.md
```

- Clarify 会针对缺口提问（最多 5 个），请用中文回答。  
- 每个问题附带 AI 建议，可直接采纳或自行补充。  
- 如无缺口，可跳过此步骤。

## 完成后检查

- 清除所有 `TODO_*` 占位符。
- Frontmatter 字段需完整：`scn_id`、`owners`、`domains`、`layers`、`related_usecases` 等。
- 将新的 `scn_id` 与子用例写入 `docs/_data/docmap.yaml`。
- 运行 `/speckit.usecase-seed-generate <SCN_ID>` 进入 Seed 生成流程。
- 使用 `npm run publish:scenarios -- --scn-id <SCN_ID> --validate-only` 快速校验结构是否一致。

## 常见问题

| 现象 | 处理方式 |
|------|----------|
| Prompt 提示找不到文件 | 确认路径拼写正确并在仓库根执行命令。 |
| Clarify 一直询问同一问题 | 表示资料确实缺失，需要补充源文档或手动写入。 |
| 想拆分多个子场景 | 可拆分素材后分别运行生成命令，或在 Clarify 时说明拆分方案。 |
| 需要保留旧稿 | 运行脚本前先备份或切分支；覆盖逻辑对同名文件使用 `--force`。 |

完成以上步骤后即可进入 Usecase Seed 生成与跨仓分发流程。
