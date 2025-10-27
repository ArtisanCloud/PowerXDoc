---
description: Generate scenario-specific usecase seed files under docs/usecases-seeds using Spec Kit tooling.
---

## User Input

```text
$ARGUMENTS
```

Interpret the user input to extract 至少以下信息：
- `SCN_ID`（必填）
- 场景标题或摘要（若可解析）
- 可选：docmap 路径、repos 路径、模板路径、需要过滤的 `doc_id`/`scope`/`layer`/`domain`

若用户输入缺少 `SCN_ID`，先确认后再继续。

## Outline

1. **生成 Seed 框架**
   - 在仓库根目录执行 `.specify/scripts/bash/setup-usecase-guides.sh --json --scn-id <SCN_ID>`，必要时追加 `--doc-id`、`--scope`、`--layer`、`--domain`、`--dry-run`、`--force` 等参数。
   - 解析 JSON 响应，获取本轮生成/覆盖的 Seed 文件列表（`path`、`status`、`optional` 等）。

2. **拉取上下文**
   - 读取 `docs/_data/docmap.yaml` 中该场景的 `children` 配置，核对是否与脚本输出一致。
   - 查阅 `docs/_data/repos.yaml`，获取每个 repo 的默认维护者、usecase 路径等信息。
   - 打开 `docs/scenarios/**/<SCN_ID>.md`（如存在），提取场景摘要、关键交互、涉及仓库与 Feature Flag。
   - 根据 docmap 声明的 `path` 或相关标准，定位参考资料（例如 `docs/standards/**`）。

3. **自动撰写 Seed 正文**
   - 依序处理 `docs/usecases-seeds/<scope>/<layer>/<domain>/<doc_id>.md`：
     - 聚合上下文：主场景 `docs/scenarios/**/<SCN_ID>.md`、相关子场景（若存在）、`docs/_data/docmap.yaml` 的 child 配置、`docs/_data/repos.yaml` 中仓库职责、已登记的标准与接口说明（`docs/standards/**`）。
     - 针对每个 Seed 调用写作流程（直接在文件内让 AI 重写或使用子 Prompt），按章节输出定制化内容，覆盖：
       - **Usecase Overview**：该仓/层的业务价值、触发角色、关键指标。
       - **Context & Assumptions**：Feature Flag、输入输出、依赖服务、边界条件。
       - **Solution Blueprint**：组件拆分、构建/运行流程、关键时序（必要时写出 Mermaid sequenceDiagram）。
       - **Contracts & Interfaces / Implementation Checklist / Testing Strategy / Observability & Ops / Rollback & Failure Handling / Follow-ups & Risks**：结合仓库职责、协作接口、测试与运维要求给出详尽描述。
     - 避免保留 `<层名称>`、`TODO_*`、`示例` 等占位词，引用真实 API/CLI/指标，必要时补充示例命令或链接。
     - 若 docmap 标记 `optional: true`，在正文明确当前交付策略或风险说明。
     - 更新 Frontmatter：确保 `title`、`owners`、`linked_requirements`、`feature_flags` 等字段与撰写内容一致。

4. **校验与总结**
   - 确保 Seed 中不再残留 `<层名称>`、`TODO`、`示例` 等占位文本。
   - 校对 Frontmatter 与 docmap 的 `doc_id`、`scope`、`layer`、`domain`、`repo_key` 是否一致，必要时同步更新 docmap/seed。
   - 输出最终摘要：列出改写后的 Seed（含路径、状态、scope/layer/domain、optional 与否）以及仍需补充的风险或后续动作。

5. **生成 Seed 撰写任务清单**
   - 根据 `SCN_ID` 解析 domain（ID 中间段的小写），生成/更新 `docs/scenarios/<domain>/task.md`。
   - 任务文件需按子用例逐条展示：为每个 `doc_id` 输出单独的小节（建议使用 `### <doc_id>` 或类似格式），先给出一句话描述（可包含 scope/layer/仓库职责），随后附带单独的 fenced code block。
   - 命令示例使用 `.specify/templates/usecase-generate-template.md` + 目标 Seed 路径，保留 `--context docs/scenarios/...`、`--context docs/_data/docmap.yaml`、`--context docs/_data/repos.yaml` 等参数；如需要额外上下文，可在描述中说明。
   - 如场景包含子场景，可在描述或命令中引用对应 `docs/scenarios/**/<child_scn>.md`。

6. **（可选）同步站点展示**
   - 若需要将 Seed 实时呈现在 VitePress 站点，提醒执行 `node scripts/site/sync-scenario-pages.mjs --scn-id <SCN_ID> --with-seeds`（或相关发布命令）刷新 `docs/website/**`。

## Output

- 列出已生成或更新的 Seed 文件（相对路径、状态、optional 与否）。
- 概述每个 Seed 重点补充的内容与仍待确认的风险或数据。
- 提醒后续动作（例如更新 docmap、运行 `npm run publish:usecases -- --dry-run`、同步相关标准等）。
