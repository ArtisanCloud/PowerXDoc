# SCN-AGENT-MODEL-HUB-001 Seed 撰写任务

所有指引依赖 `.specify/templates/usecase-generate-template.md`，请在仓库根目录执行。

### UC-AGENT-MODEL-PROVIDER-001 · powerx/service/agent-orchestration
Provider 注册、密钥托管、健康验证：

```bash
[usecase-generate-template.md](.specify/templates/usecase-generate-template.md) \
  docs/usecases-seeds/SCN-AGENT-MODEL-HUB-001/UC-AGENT-MODEL-PROVIDER-001.md \
  --context docs/scenarios/agent-orchestration/SCN-AGENT-MODEL-PROVIDER-001.md \
  --context docs/_data/docmap.yaml \
  --context docs/_data/repos.yaml
```

### UC-AGENT-MODEL-ROUTING-001 · powerx/integration/agent-orchestration
多模型路由策略、A/B、fallback：

```bash
[usecase-generate-template.md](.specify/templates/usecase-generate-template.md) \
  docs/usecases-seeds/SCN-AGENT-MODEL-HUB-001/UC-AGENT-MODEL-ROUTING-001.md \
  --context docs/scenarios/agent-orchestration/SCN-AGENT-MODEL-ROUTING-001.md \
  --context docs/_data/docmap.yaml \
  --context docs/_data/repos.yaml
```

### UC-AGENT-PLATFORM-COZE-001 · powerx/integration/agent-orchestration
Coze/n8n 平台连接器、上下文映射与回调：

```bash
[usecase-generate-template.md](.specify/templates/usecase-generate-template.md) \
  docs/usecases-seeds/SCN-AGENT-MODEL-HUB-001/UC-AGENT-PLATFORM-COZE-001.md \
  --context docs/scenarios/agent-orchestration/SCN-AGENT-PLATFORM-COZE-001.md \
  --context docs/_data/docmap.yaml \
  --context docs/_data/repos.yaml
```

### UC-AGENT-MODEL-GOV-001 · powerx/ops/agent-orchestration
成本、配额、告警与审计治理：

```bash
[usecase-generate-template.md](.specify/templates/usecase-generate-template.md) \
  docs/usecases-seeds/SCN-AGENT-MODEL-HUB-001/UC-AGENT-MODEL-GOV-001.md \
  --context docs/scenarios/agent-orchestration/SCN-AGENT-MODEL-GOV-001.md \
  --context docs/_data/docmap.yaml \
  --context docs/_data/repos.yaml
```

> 完成后运行 `npm run publish:usecases -- --scn-id SCN-AGENT-MODEL-HUB-001 --validate-only` 校验结构，再同步站点或下游仓库。
