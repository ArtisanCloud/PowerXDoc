# 生成 Usecase Seed 指南

场景就绪后（可先运行 `node .specify/scripts/node/generate-scenarios.mjs`），只需一个命令即可生成所有子用例 Seed：

```bash
.codex/prompts/speckit.usecase-guides.md SCN-PUBLISH-001
```

命令会读取 `docmap.yaml`、`repos.yaml` 与场景文档，自动在 `docs/usecases-seeds/<scope>/<layer>/<domain>/<doc_id>.md` 下生成或更新 Seed 模板。其余步骤与 Usecase 发布指南保持一致。

## 前置检查

- `docs/scenarios/**/SCN-*.md` 已通过 `/speckit.scenario` + `/speckit.scenario.clarify` 输出，没有关键缺口。
- `docs/_data/docmap.yaml` 中存在对应 `scn_id`，每个 `child` 均包含 `doc_id/scope/layer/domain`。
- `docs/_data/repos.yaml` 配置了目标仓库和默认维护者，便于自动填充 Seed Frontmatter。

## 执行命令

```bash
.codex/prompts/speckit.usecase-guides.md SCN-PUBLISH-001
```

- 默认生成或更新所有子用例。若文件已存在且未加 `--force`，输出会显示 `skipped`。  
- 常用附加参数：
  - `--force`：强制覆盖已有 Seed。  
  - `--doc-id PX-PUBLISH-001`：只生成指定子用例，可重复传入。  
  - `--dry-run`：仅查看计划生成的文件。

## 生成后动作

1. 打开 `docs/usecases-seeds/<scope>/<layer>/<domain>/<doc_id>.md`，补齐正文，清除 `TODO_*`。  
2. 确认 Frontmatter 与 `docmap.yaml` 一致（含 `optional` 标记）。  
3. 按需要添加接口详述、测试计划、运维策略等条目。  
4. 准备进入分发阶段（参见《发布 Usecase Seeds 指南》）。

## 常见问题

| 情况 | 处理方式 |
|------|----------|
| 提示 `SCN_ID` 不存在 | 检查 `docmap.yaml` 是否登记场景；若缺失，先更新 docmap。 |
| Seed 未生成或被跳过 | 默认不覆盖旧文件，需要 `--force`。 |
| 想只生成部分 Seed | 使用 `--doc-id`、`--scope`、`--layer` 或 `--domain` 参数缩小范围。 |
| Seed 中仍有 `TODO_*` | 说明信息不足；补齐场景文档或手动填入细节。 |

完成后即可执行 `npm run publish:usecases` 将 Seed 分发到下游仓库。EOF
