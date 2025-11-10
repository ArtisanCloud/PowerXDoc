# SCN-AGENT-REG-MGMT-001 Seed 撰写任务

本任务文件按子用例列出撰写指引，所有命令均依赖 `.specify/templates/usecase-generate-template.md`，请在仓库根目录执行。

### UC-AGENT-REG-AUTO-001 · powerx/integration/agent-orchestration
完善该 Seed，补充流程、契约、验收指标与团队协作说明：

```bash
[usecase-generate-template.md](.specify/templates/usecase-generate-template.md) \
  docs/usecases-seeds/SCN-AGENT-REG-MGMT-001/UC-AGENT-REG-AUTO-001.md \
  --context docs/scenarios/agent/SCN-AGENT-REG-MGMT-001.md \
  --context docs/scenarios/agent-orchestration/SCN-AGENT-REG-AUTO-001.md \
  --context docs/_data/docmap.yaml \
  --context docs/_data/repos.yaml
```

### UC-AGENT-REG-LIFECYCLE-001 · powerx/ops/agent-orchestration
完善该 Seed，补充流程、契约、验收指标与团队协作说明：

```bash
[usecase-generate-template.md](.specify/templates/usecase-generate-template.md) \
  docs/usecases-seeds/SCN-AGENT-REG-MGMT-001/UC-AGENT-REG-LIFECYCLE-001.md \
  --context docs/scenarios/agent/SCN-AGENT-REG-MGMT-001.md \
  --context docs/scenarios/agent-orchestration/SCN-AGENT-REG-LIFECYCLE-001.md \
  --context docs/_data/docmap.yaml \
  --context docs/_data/repos.yaml
```

### UC-AGENT-REG-SHARE-001 · powerx/integration/agent-orchestration
完善该 Seed，补充流程、契约、验收指标与团队协作说明：

```bash
[usecase-generate-template.md](.specify/templates/usecase-generate-template.md) \
  docs/usecases-seeds/SCN-AGENT-REG-MGMT-001/UC-AGENT-REG-SHARE-001.md \
  --context docs/scenarios/agent/SCN-AGENT-REG-MGMT-001.md \
  --context docs/scenarios/agent-orchestration/SCN-AGENT-REG-SHARE-001.md \
  --context docs/_data/docmap.yaml \
  --context docs/_data/repos.yaml
```

### UC-AGENT-REG-TENANT-001 · powerx/service/agent-orchestration
完善该 Seed，补充流程、契约、验收指标与团队协作说明：

```bash
[usecase-generate-template.md](.specify/templates/usecase-generate-template.md) \
  docs/usecases-seeds/SCN-AGENT-REG-MGMT-001/UC-AGENT-REG-TENANT-001.md \
  --context docs/scenarios/agent/SCN-AGENT-REG-MGMT-001.md \
  --context docs/scenarios/agent-orchestration/SCN-AGENT-REG-TENANT-001.md \
  --context docs/_data/docmap.yaml \
  --context docs/_data/repos.yaml
```

> 完成撰写后，可执行 `npm run publish:usecases -- --scn-id SCN-AGENT-REG-MGMT-001 --validate-only` 或 `node scripts/site/sync-scenario-pages.mjs --scn-id SCN-AGENT-REG-MGMT-001 --with-seeds --force` 校验结构并同步站点。
