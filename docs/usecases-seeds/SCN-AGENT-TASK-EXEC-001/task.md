# SCN-AGENT-TASK-EXEC-001 Seed 撰写任务

本任务文件按子用例列出撰写指引，所有命令均依赖 `.specify/templates/usecase-generate-template.md`，请在仓库根目录执行。

### UC-AGENT-EXEC-PLAN-001 · powerx/service/agent-orchestration
聚焦意图解析、插件匹配与计划生成链路：

```bash
[usecase-generate-template.md](.specify/templates/usecase-generate-template.md) \
  docs/usecases-seeds/SCN-AGENT-TASK-EXEC-001/UC-AGENT-EXEC-PLAN-001.md \
  --context docs/scenarios/agent-orchestration/SCN-AGENT-TASK-EXEC-001.md \
  --context docs/_data/docmap.yaml \
  --context docs/_data/repos.yaml
```

### UC-AGENT-EXEC-COORD-001 · powerx/integration/agent-orchestration
覆盖多 Agent 并行执行、状态协调与调度策略：

```bash
[usecase-generate-template.md](.specify/templates/usecase-generate-template.md) \
  docs/usecases-seeds/SCN-AGENT-TASK-EXEC-001/UC-AGENT-EXEC-COORD-001.md \
  --context docs/scenarios/agent-orchestration/SCN-AGENT-TASK-EXEC-001.md \
  --context docs/_data/docmap.yaml \
  --context docs/_data/repos.yaml
```

### UC-AGENT-EXEC-RECOVERY-001 · powerx/ops/agent-orchestration
描述失败重试、降级和 Copilot 工单接管：

```bash
[usecase-generate-template.md](.specify/templates/usecase-generate-template.md) \
  docs/usecases-seeds/SCN-AGENT-TASK-EXEC-001/UC-AGENT-EXEC-RECOVERY-001.md \
  --context docs/scenarios/agent-orchestration/SCN-AGENT-TASK-EXEC-001.md \
  --context docs/_data/docmap.yaml \
  --context docs/_data/repos.yaml
```

### UC-AGENT-EXEC-CLOSURE-001 · powerx/ops/agent-orchestration
强调插件工作流触发、闭环校验与交付物汇总：

```bash
[usecase-generate-template.md](.specify/templates/usecase-generate-template.md) \
  docs/usecases-seeds/SCN-AGENT-TASK-EXEC-001/UC-AGENT-EXEC-CLOSURE-001.md \
  --context docs/scenarios/agent-orchestration/SCN-AGENT-TASK-EXEC-001.md \
  --context docs/_data/docmap.yaml \
  --context docs/_data/repos.yaml
```

> 完成撰写后，可执行 `npm run publish:usecases -- --scn-id SCN-AGENT-TASK-EXEC-001 --validate-only` 或 `node scripts/site/sync-seed-pages.mjs --scn-id SCN-AGENT-TASK-EXEC-001 --with-index --force` 校验结构并同步站点。
