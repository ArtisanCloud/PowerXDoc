# SCN-OPS-SYSTEM-MONITORING-001 Seed 撰写任务

本任务文件列出子用例 Seed 的撰写指引。所有命令均依赖 `.specify/templates/usecase-generate-template.md`，请在仓库根目录执行。

### UC-OPS-MONITORING-THROTTLE-001 · powerx/service/ops
完善该 Seed，补充流程、契约、验收指标与运维自动化说明：

```bash
[usecase-generate-template.md](.specify/templates/usecase-generate-template.md) \
  docs/usecases-seeds/SCN-OPS-SYSTEM-MONITORING-001/UC-OPS-MONITORING-THROTTLE-001.md \
  --context docs/scenarios/runtime-ops/SCN-OPS-SYSTEM-MONITORING-001.md \
  --context docs/meta/scenarios/powerx/core-platform/runtime-ops/system-monitoring-and-alerting/primary.md \
  --context docs/_data/docmap.yaml \
  --context docs/_data/repos.yaml
```

### UC-OPS-MONITORING-DASHBOARD-001 · powerx/ops/ops
完善该 Seed，覆盖指标可视化、权限治理与巡检报告落地：

```bash
[usecase-generate-template.md](.specify/templates/usecase-generate-template.md) \
  docs/usecases-seeds/SCN-OPS-SYSTEM-MONITORING-001/UC-OPS-MONITORING-DASHBOARD-001.md \
  --context docs/scenarios/runtime-ops/SCN-OPS-SYSTEM-MONITORING-001.md \
  --context docs/meta/scenarios/powerx/core-platform/runtime-ops/system-monitoring-and-alerting/primary.md \
  --context docs/_data/docmap.yaml \
  --context docs/_data/repos.yaml
```

### UC-OPS-MONITORING-WEBHOOK-001 · powerx/service/ops
完善该 Seed，补充日志规则、Webhook 编排与降级策略：

```bash
[usecase-generate-template.md](.specify/templates/usecase-generate-template.md) \
  docs/usecases-seeds/SCN-OPS-SYSTEM-MONITORING-001/UC-OPS-MONITORING-WEBHOOK-001.md \
  --context docs/scenarios/runtime-ops/SCN-OPS-SYSTEM-MONITORING-001.md \
  --context docs/meta/scenarios/powerx/core-platform/runtime-ops/system-monitoring-and-alerting/primary.md \
  --context docs/_data/docmap.yaml \
  --context docs/_data/repos.yaml
```

### UC-OPS-MONITORING-REMOTE-RESTART-001 · powerx/ops/ops
完善该 Seed，补充审批、自动化执行与回滚策略：

```bash
[usecase-generate-template.md](.specify/templates/usecase-generate-template.md) \
  docs/usecases-seeds/SCN-OPS-SYSTEM-MONITORING-001/UC-OPS-MONITORING-REMOTE-RESTART-001.md \
  --context docs/scenarios/runtime-ops/SCN-OPS-SYSTEM-MONITORING-001.md \
  --context docs/meta/scenarios/powerx/core-platform/runtime-ops/system-monitoring-and-alerting/primary.md \
  --context docs/_data/docmap.yaml \
  --context docs/_data/repos.yaml
```

> 完成撰写后，可执行 `npm run publish:usecases -- --scn-id SCN-OPS-SYSTEM-MONITORING-001 --validate-only` 或 `node scripts/site/sync-scenario-pages.mjs --scn-id SCN-OPS-SYSTEM-MONITORING-001 --with-seeds --force` 校验结构并同步站点。
