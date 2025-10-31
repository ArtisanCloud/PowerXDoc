# SCN-OPS-EVENT-TASKFLOW-001 Seed 撰写任务

本任务文件按子用例列出撰写指引，所有命令均依赖 `.specify/templates/usecase-generate-template.md`，请在仓库根目录执行。

### UC-OPS-AGENT-ORCHESTRATION-001 · powerx/service/ops
完善该 Seed，补充流程、契约、验收指标与团队协作说明：

```bash
[usecase-generate-template.md](.specify/templates/usecase-generate-template.md) \
  docs/usecases-seeds/SCN-OPS-EVENT-TASKFLOW-001/UC-OPS-AGENT-ORCHESTRATION-001.md \
  --context docs/scenarios/ops/SCN-OPS-EVENT-TASKFLOW-001.md \
  --context docs/scenarios/runtime-ops/SCN-OPS-AGENT-ORCHESTRATION-001.md \
  --context docs/_data/docmap.yaml \
  --context docs/_data/repos.yaml
```

### UC-OPS-EVENT-NOTIFY-001 · powerx/service/ops
完善该 Seed，补充流程、契约、验收指标与团队协作说明：

```bash
[usecase-generate-template.md](.specify/templates/usecase-generate-template.md) \
  docs/usecases-seeds/SCN-OPS-EVENT-TASKFLOW-001/UC-OPS-EVENT-NOTIFY-001.md \
  --context docs/scenarios/ops/SCN-OPS-EVENT-TASKFLOW-001.md \
  --context docs/scenarios/runtime-ops/SCN-OPS-EVENT-NOTIFY-001.md \
  --context docs/_data/docmap.yaml \
  --context docs/_data/repos.yaml
```

### UC-OPS-RETRY-RECOVERY-001 · powerx/ops/ops
完善该 Seed，补充流程、契约、验收指标与团队协作说明：

```bash
[usecase-generate-template.md](.specify/templates/usecase-generate-template.md) \
  docs/usecases-seeds/SCN-OPS-EVENT-TASKFLOW-001/UC-OPS-RETRY-RECOVERY-001.md \
  --context docs/scenarios/ops/SCN-OPS-EVENT-TASKFLOW-001.md \
  --context docs/scenarios/runtime-ops/SCN-OPS-RETRY-RECOVERY-001.md \
  --context docs/_data/docmap.yaml \
  --context docs/_data/repos.yaml
```

### UC-OPS-TASK-SCHEDULE-001 · powerx/ops/ops
完善该 Seed，补充流程、契约、验收指标与团队协作说明：

```bash
[usecase-generate-template.md](.specify/templates/usecase-generate-template.md) \
  docs/usecases-seeds/SCN-OPS-EVENT-TASKFLOW-001/UC-OPS-TASK-SCHEDULE-001.md \
  --context docs/scenarios/ops/SCN-OPS-EVENT-TASKFLOW-001.md \
  --context docs/scenarios/runtime-ops/SCN-OPS-TASK-SCHEDULE-001.md \
  --context docs/_data/docmap.yaml \
  --context docs/_data/repos.yaml
```

> 完成撰写后，可执行 `npm run publish:usecases -- --scn-id SCN-OPS-EVENT-TASKFLOW-001 --validate-only` 或 `node scripts/site/sync-scenario-pages.mjs --scn-id SCN-OPS-EVENT-TASKFLOW-001 --with-seeds --force` 校验结构并同步站点。
