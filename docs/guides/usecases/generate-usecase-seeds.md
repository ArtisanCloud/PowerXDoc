# 生成 Usecase Seed 指南

场景就绪后（通过 `.codex/prompts/speckit.scenario*.md` 产出），按以下步骤生成并撰写 Seed：

1. **生成 Seed 骨架**

```bash
[speckit.usecase-seed-generate.md](.codex/prompts/speckit.usecase-seed-generate.md)  SCN-PUBLISH-001
```

命令会读取 `docmap.yaml`、`repos.yaml` 与场景文档，自动在 `docs/usecases-seeds/<scope>/<layer>/<domain>/<doc_id>.md` 下生成或更新 Seed 模板。其余步骤与 Usecase 发布指南保持一致。

## 前置检查

- `docs/scenarios/**/SCN-*.md` 已通过 `/speckit.scenario` + `/speckit.scenario.clarify` 输出，没有关键缺口。
- `docs/_data/docmap.yaml` 中存在对应 `scn_id`，每个 `child` 均包含 `doc_id/scope/layer/domain`。
- `docs/_data/repos.yaml` 配置了目标仓库和默认维护者，便于自动填充 Seed Frontmatter。

## 执行命令

```bash

❯ node .specify/scripts/node/setup-usecase-seeds.mjs --scn-id SCN-PUBLISH-HUB-001

```

- 默认生成或更新所有子用例。若文件已存在且未加 `--force`，输出会显示 `skipped`。  
- 常用附加参数：
  - `--force`：强制覆盖已有 Seed。  
  - `--doc-id PX-PUBLISH-001`：只生成指定子用例，可重复传入。  
  - `--dry-run`：仅查看计划生成的文件。

## 生成后动作（撰写与同步）

1. 打开 `docs/scenarios/<domain>/task.md`（或运行 `node scripts/node/generate-seed-tasks.mjs --scn-id <SCN_ID>` 生成），按任务列表逐条执行写作命令，例如：  

   ```
   [speckit.implement.md](.codex/prompts/speckit.implement.md) \
     docs/usecases-seeds/powerx-plugin/proto/dev/PLG-DEV-HOTLOAD-001.md \
     --context docs/scenarios/publish/SCN-DEV-HOTLOAD-001.md \
     --context docs/_data/docmap.yaml \
     --context docs/_data/repos.yaml
   ```

2. **校验 Seed 源文件**  
   - Frontmatter 中的 `doc_id/scope/layer/domain/optional` 等字段需与 `docmap.yaml` 保持一致。  
   - 模板占位符（例如 `<层名称>`、`TODO_*`）必须被替换成正式内容，Mermaid/表格/流程均需完善。  
   - 建议在 `git status` 中确认只包含目标 Seed 的改动。

3. **同步到站点 (`docs/website/{lang}/scenarios/**`)**  
   - 推荐使用场景级命令，一次刷新场景索引、子场景和 Seed：  

     ```bash
     node scripts/site/sync-scenario-pages.mjs \
       --scn-id SCN-PUBLISH-HUB-001 \
       --with-seeds \
       --force
     ```

     - `zh` 目录会复制中文原文；`en` 目录会自动生成 “Pending Translation” 占位并附上 `partnerSlug`，方便后续翻译。  
     - 若只需更新 Seed，可改用 `node scripts/site/sync-seed-pages.mjs --scn-id <SCN_ID> --force`。  
     - 需要局部语言时加 `--locale zh` 或 `--locale en`。  
   - 同步后译者可在 `docs/website/en/scenarios/<SCN_ID>/<DOC_ID>.md` 内替换正文，同时保留 frontmatter（尤其 `partnerSlug`）。  
   - 运行 `npm run docs:build` 或 `npm run docs:dev` 预览中英文页面是否一致。

4. **自检并准备分发**  
   - 执行 `npm run publish:usecases -- --scn-id <SCN_ID> --validate-only` 检查结构与 Frontmatter。  
   - 后续按《发布 Usecase Seeds 指南》继续 Dry Run / 正式发布。

## 自动生成场景索引（推荐）

为便于集中浏览，可在 Seed 更新后执行：

```bash
node .specify/scripts/node/generate-usecase-seed-index.mjs --scn-id SCN-PUBLISH-001
```

- 输出会写入（或更新）`docs/usecases-seeds/scenarios/<SCN_ID>.md`，按 `scope` 分类列出所有子用例及 Seed 状态。
- 如需批量刷新全部场景索引，可改用 `--all`。

## 后续建议

1. 视需要补写 Seed 正文并清理模板占位内容，确保交付完整。
2. 更新 `docmap.yaml` 后重跑 Seed 生成命令与索引脚本，保持两者同步。
3. 准备验收时执行 `npm run publish:usecases -- --scn-id <SCN_ID> --validate-only` 快速自检。

## 常见问题

| 情况 | 处理方式 |
|------|----------|
| 提示 `SCN_ID` 不存在 | 检查 `docmap.yaml` 是否登记场景；若缺失，先更新 docmap。 |
| Seed 未生成或被跳过 | 默认不覆盖旧文件，需要 `--force`。 |
| 想只生成部分 Seed | 使用 `--doc-id`、`--scope`、`--layer` 或 `--domain` 参数缩小范围。 |
| Seed 中仍有 `TODO_*` | 说明信息不足；补齐场景文档或手动填入细节。 |

完成后即可执行 `npm run publish:usecases` 将 Seed 分发到下游仓库。EOF
