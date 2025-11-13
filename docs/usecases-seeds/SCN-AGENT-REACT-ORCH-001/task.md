# SCN-AGENT-REACT-ORCH-001 Usecase Seed 指引

本任务列出 ReAct 智能体编排四个子用例的撰写建议。所有命令均依赖 `.specify/templates/usecase-generate-template.md`，请在仓库根目录执行。

### UC-AGENT-REACT-THOUGHT-001 · powerx/service/agent-orchestration
补充 Thought Engine、混合检索策略与审计链路：

```bash
[usecase-generate-template.md](.specify/templates/usecase-generate-template.md) \
  docs/usecases-seeds/SCN-AGENT-REACT-ORCH-001/UC-AGENT-REACT-THOUGHT-001.md \
  --context docs/scenarios/agent-orchestration/SCN-AGENT-REACT-ORCH-001.md \
  --context docs/scenarios/agent-orchestration/SCN-AGENT-REACT-THOUGHT-001.md \
  --context docs/_data/docmap.yaml \
  --context docs/_data/repos.yaml
```

### UC-AGENT-REACT-ACTION-001 · powerx/integration/agent-orchestration
聚焦 Action Router、风险控制与插件调用：

```bash
[usecase-generate-template.md](.specify/templates/usecase-generate-template.md) \
  docs/usecases-seeds/SCN-AGENT-REACT-ORCH-001/UC-AGENT-REACT-ACTION-001.md \
  --context docs/scenarios/agent-orchestration/SCN-AGENT-REACT-ORCH-001.md \
  --context docs/scenarios/agent-orchestration/SCN-AGENT-REACT-ACTION-001.md \
  --context docs/_data/docmap.yaml \
  --context docs/_data/repos.yaml
```

### UC-AGENT-REACT-MEMORY-001 · powerx/service/agent-orchestration
完善 Observation 解析、记忆写回与循环治理：

```bash
[usecase-generate-template.md](.specify/templates/usecase-generate-template.md) \
  docs/usecases-seeds/SCN-AGENT-REACT-ORCH-001/UC-AGENT-REACT-MEMORY-001.md \
  --context docs/scenarios/agent-orchestration/SCN-AGENT-REACT-ORCH-001.md \
  --context docs/scenarios/agent-orchestration/SCN-AGENT-REACT-MEMORY-001.md \
  --context docs/_data/docmap.yaml \
  --context docs/_data/repos.yaml
```

### UC-AGENT-REACT-AUDIT-001 · powerx/ops/agent-orchestration
沉淀闭环交付、回放、审计与反馈策略：

```bash
[usecase-generate-template.md](.specify/templates/usecase-generate-template.md) \
  docs/usecases-seeds/SCN-AGENT-REACT-ORCH-001/UC-AGENT-REACT-AUDIT-001.md \
  --context docs/scenarios/agent-orchestration/SCN-AGENT-REACT-ORCH-001.md \
  --context docs/scenarios/agent-orchestration/SCN-AGENT-REACT-AUDIT-001.md \
  --context docs/_data/docmap.yaml \
  --context docs/_data/repos.yaml
```

> 完成后执行 `npm run publish:usecases -- --scn-id SCN-AGENT-REACT-ORCH-001 --validate-only` 校验结构，并视需要同步站点或下游仓库。
