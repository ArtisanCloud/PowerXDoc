# Leadership Coverage Review

本文档帮助领导层与文档运营团队利用 PowerXDocs 自动化资产评估跨仓用例覆盖情况。

## 角色职责

- **Documentation Steward**：维护 `docmap.yaml` 与 usecase seeds，按需触发分发与 `_collected` 生成。
- **Operations Engineer**：监控分发状态与 PR 审核进度，在 72 小时未合并时发出提醒。
- **Leadership**：通过 `_collected` 占位与 Library 页面识别 coverage 缺口、可选项状态及重跑需求。

## 工作流概览

1. **生成 `_collected` 占位**
   ```bash
   npm run publish:collected -- --scn-id SCN-PUBLISH-001
   ```
   - 解析 `docmap.yaml`，依据 scope/layer/domain 写入 `docs/website/_collected/**`。
   - 生成报告 `reports/collected/collected_SCN-PUBLISH-001.json`，包含重跑 `resumeToken`。

2. **审阅 Library 视图**
   - 打开 `docs/website/library/`（或部署站点的 Library 页面）。
   - 可选项（optional: true）会标记为 “可选”，必要项显示 “Required”。
   - 若 `generated_at` 时间过旧或缺少 stub，通知 Steward 重新生成。

3. **跟进下游仓库**
   - `_collected` 文档提供上游仓库 PR 链接；如仍未合并，使用 `npm run publish:notify` 提醒维护者。
   - 对于新需求，先更新 docmap/taxonomy，再按步骤 1 重建占位。

## 重跑与追踪

- 所有工作流状态存于 `reports/_state/**`，相同指纹的重复执行会被拒绝。
- 如需继续未完成任务，可使用 `--resume-token <token>`，或修改 seed/docmap 以生成新指纹。

## 常见问题

| 问题 | 处理方案 |
|------|----------|
| Library 显示空目录 | 检查 docmap 中是否存在对应 scope/layer/domain；运行 `npm run publish:collected` 刷新。 |
| Stub 缺少 PR 链接 | 确认 usecase 分发工作流生成的 PR 已写入报告；必要时手动补充 `repo_url`。 |
| `_collected` 时间过旧 | 重新运行生成命令，报告将记录最新时间戳，方便审计。 |

保持 Library 的实时性，可以让领导层无需访问各下游仓库，即可掌握场景覆盖情况并快速发现缺口。
