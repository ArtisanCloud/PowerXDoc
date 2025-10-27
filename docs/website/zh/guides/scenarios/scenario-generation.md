# 场景文档生成指南

本指南基于 `docs/guides/scenarios/README.md`，整理了从素材准备到 Clarify、验收的完整流程，方便在站点中快速查阅。

## 准备素材

- 先将业务流程整理成 Markdown，可放在 `docs/meta/scenarios/`（或任意临时文本）。  
- 若已存在历史 SCN，可直接保留于 `docs/scenarios/<domain>/`，生成脚本会覆盖同名文件（需要时使用 `--force`）。
- 生成前先**查阅** `docs/_data/docmap.yaml` 与 `docs/_data/repos.yaml`：确认是否已有同名 `scn_id`、了解既有领域/仓库命名，以便后续保持一致。真正的映射更新在场景定稿后再写入 docmap；准备阶段只需掌握现有结构，避免重复或命名冲突。

## 生成场景草稿

> 推荐通过 Codex Prompt 驱动，以便在生成前就完成 Clarify 输出。

```bash
[speckit.scenario.md](.codex/prompts/speckit.scenario.md) <@源文件路径或文本文件>
```

- Prompt 会读取源文档，对照 `docs/standards/scenarios/_template.md` 输出草稿。
- 当需要覆盖已有 SCN，可在对话中显式确认；保留历史内容请先手动备份。

## Clarify（按需）

```bash
[speckit.scenario.clarify.md](.codex/prompts/speckit.scenario.clarify.md)  docs/meta/scenarios/<domain>/<file>.md
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
