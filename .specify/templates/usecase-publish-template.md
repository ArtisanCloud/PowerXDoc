---
scn_id: "{{SCN_ID}}"
scenario_name: "{{SCENARIO_NAME}}"
slug: "{{SCENARIO_SLUG}}"
primary_scope: "{{PRIMARY_SCOPE}}"
primary_layer: "{{PRIMARY_LAYER}}"
primary_domain: "{{PRIMARY_DOMAIN}}"
primary_repo: "{{PRIMARY_REPO_KEY}}"
doc_owner: "{{DOC_OWNER}}"
last_generated_at: "{{GENERATED_AT}}"
---

# 发布 {{SCENARIO_NAME}} Usecase Seeds 指南

> 场景摘要：{{SCENARIO_SUMMARY}}

本文档讲解如何使用 PowerXDocs 的发布脚本，把已经完善的 usecase seeds 分发到各下游仓库，并生成领导力审阅所需的汇总视图。根据实际情况补充所有 `{{PLACEHOLDER}}` 字段。

## 涉及脚本

- `npm run publish:usecases`：按场景分发 Seed 到下游仓库、创建分支/PR，并记录报告。
- `npm run publish:collected`：基于 docmap 生成 `docs/website/_collected/**` 汇总 stub，便于领导层检视覆盖面。
- `npm run publish:notify`（可选）：针对逾期未审的 PR 发送提醒通知。
- {{ADDITIONAL_SCRIPTS}}

## 发布前准备

- 确认目标场景的 Seed 已按《{{SCENARIO_NAME}} Usecase Seed 生成指南》完成，并通过 `npm run docs:build` 构建无误。
- `docs/_data/docmap.yaml`、`docs/_data/repos.yaml` 已提交最新配置。
- 本地 `repos/` 目录包含所有下游仓库的 Git 克隆（可参考 repos.yaml 的 `checkout` 字段），并保持干净工作区。
- 已配置 GitHub 凭据（SSH 或 HTTPS）及必要的 GraphQL/API Token，供脚本创建分支和 PR。
- {{PREP_NOTES}}

## 分发步骤

1. **Dry Run 检查**

   ```bash
   npm run publish:usecases -- --scn-id {{SCN_ID}} --dry-run{{DRY_RUN_FLAGS}}
   ```

   - 不会提交/推送，但会复制 Seed 文件到各仓库对应目录。
   - 输出日志与 `reports/usecases/usecases_{{SCN_ID}}.json` 报告可验证目标仓库、文件列表与 resume token。
   - {{DRY_RUN_NOTES}}

2. **正式分发**

   ```bash
   npm run publish:usecases -- --scn-id {{SCN_ID}}{{PUBLISH_FLAGS}}
   ```

   - 默认针对所有 child 节点创建 `docs/hub/{{SCN_ID}}` 分支，提交消息为 `docs: sync usecase seeds for {{SCN_ID}}`。
   - 自动发起 PR（标题与主体为预设模板），默认评审人取自 `repos.yaml` 的 `default_reviewers`。
   - 可用 `--scope`、`--layer`、`--domain` 过滤子节点；`--resume-token` 则用于继续之前失败的工作流。
   - {{PUBLISH_NOTES}}

3. **结果核验**

   - 发布成功后，终端会输出 PR 地址；详细信息记录在 `reports/usecases/usecases_{{SCN_ID}}.json` 中。
   - 如某个仓库失败，报告里会标记 `status: Failed` 与错误信息，可修复后使用 `--resume-token` 继续。
   - {{VERIFY_NOTES}}

## 生成领导力汇总

```bash
npm run publish:collected -- --scn-id {{SCN_ID}}{{COLLECTED_FLAGS}}
```

- 将 docmap 对应的所有子用例生成 Markdown stub，写入 `docs/website/_collected/{{PRIMARY_SCOPE}}/{{PRIMARY_LAYER}}/{{PRIMARY_DOMAIN}}/{{PRIMARY_DOC_ID}}.md`。
- 报告位于 `reports/collected/collected_{{SCN_ID}}.json`，包含 `resumeToken`、处理结果与时间戳。
- `_collected` 内容会在站点 Library 页面展示，帮助识别覆盖缺口或可选项状态。
- {{COLLECTED_NOTES}}

## 通知与跟进（可选）

```bash
npm run publish:notify -- --scn-id {{SCN_ID}}{{NOTIFY_FLAGS}}
```

- 根据 `reports/usecases` 与 PR 状态，向 `repos.yaml` 中注册的联系人发送提醒（渠道由脚本实现决定）。
- 可结合内部流程设定 SLA，例如 72 小时未审需要再次提醒。
- {{NOTIFY_NOTES}}

## 常见问题

| 现象 | 处理方式 |
|------|----------|
| 脚本提示 DuplicateWorkflowRunError | 说明相同场景 + Seed 指纹已分发，可在报告中找到 `resumeToken` 使用 `--resume-token` 继续，或更新 Seed 后重试。 |
| 未生成 PR | 检查本地仓库是否干净、是否具备推送权限；必要时在仓库中手动 `git push` 分支验证。 |
| `_collected` 缺少 stub | 确认 docmap children 是否携带 `scope/layer/domain`，并重新运行 `publish:collected`。 |
| 仅想测试单个仓库 | 结合 `--scope` / `--layer` / `--domain` / `--repo`（在 repos.yaml 中声明的 key）缩小范围。 |
| {{FAQ_ITEM}} | {{FAQ_RESOLUTION}} |

完成上述流程后，即告完成场景的跨仓分发。建议在 PR 合并后更新场景文档的状态，并在下一轮 release 前重复 `npm run publish:collected`，确保领导视图始终最新。
