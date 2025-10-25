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

3. **填充 Seed 文档**
   - 对每个生成的 `docs/usecases-seeds/<scope>/<layer>/<domain>/<doc_id>.md`：
     - 审核并完善 Frontmatter（标题、owners、feature_flags、linked_requirements 等）。
     - 在正文各章节写入场景化内容：业务目标、上下文、实现拆解、契约接口、测试策略、可观测性、回滚方案与风险。
     - 删除或替换模板中保留的示例段落、`TODO` 文案或无关示例代码。
     - 如 docmap `optional: true`，在正文明确当前交付策略或风险告知。

4. **校验与总结**
   - 确认 Seed 中不存在残留 `PX-EXAMPLE-001`、`示例`、`TODO` 等占位符。
   - 检查 Frontmatter 与 docmap 字段完全一致，尤其是 `doc_id`、`scope`、`layer`、`domain`、`repo_key`。
   - 输出最终结果：生成/更新的 Seed 路径、涵盖的仓库与层域、特殊注意事项或后续 TODO。

## Output

- 列出已生成或更新的 Seed 文件（相对路径、状态、optional 与否）。
- 概述每个 Seed 重点补充的内容与仍待确认的风险或数据。
- 提醒后续动作（例如更新 docmap、运行 `npm run publish:usecases -- --dry-run`、同步相关标准等）。
