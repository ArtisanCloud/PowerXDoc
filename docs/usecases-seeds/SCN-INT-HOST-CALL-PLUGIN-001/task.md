# SCN-INT-HOST-CALL-PLUGIN-001 Seed 撰写任务

本任务文件按子用例列出撰写指引，所有命令均依赖 `.specify/templates/usecase-generate-template.md`，请在仓库根目录执行。

### UC-INT-HOST-CALL-ASYNC-001 · powerx/service/integration
完善该 Seed，补充流程、契约、验收指标与团队协作说明：

```bash
[usecase-generate-template.md](.specify/templates/usecase-generate-template.md) \
  docs/usecases-seeds/SCN-INT-HOST-CALL-PLUGIN-001/UC-INT-HOST-CALL-ASYNC-001.md \
  --context docs/scenarios/int/SCN-INT-HOST-CALL-PLUGIN-001.md \
  --context docs/scenarios/integration/SCN-INT-HOST-CALL-ASYNC-001.md \
  --context docs/_data/docmap.yaml \
  --context docs/_data/repos.yaml
```

### UC-INT-HOST-CALL-ENTRY-001 · powerx/service/integration
完善该 Seed，补充流程、契约、验收指标与团队协作说明：

```bash
[usecase-generate-template.md](.specify/templates/usecase-generate-template.md) \
  docs/usecases-seeds/SCN-INT-HOST-CALL-PLUGIN-001/UC-INT-HOST-CALL-ENTRY-001.md \
  --context docs/scenarios/int/SCN-INT-HOST-CALL-PLUGIN-001.md \
  --context docs/scenarios/integration/SCN-INT-HOST-CALL-ENTRY-001.md \
  --context docs/_data/docmap.yaml \
  --context docs/_data/repos.yaml
```

### UC-INT-HOST-CALL-RESILIENCE-001 · powerx/ops/integration
完善该 Seed，补充流程、契约、验收指标与团队协作说明：

```bash
[usecase-generate-template.md](.specify/templates/usecase-generate-template.md) \
  docs/usecases-seeds/SCN-INT-HOST-CALL-PLUGIN-001/UC-INT-HOST-CALL-RESILIENCE-001.md \
  --context docs/scenarios/int/SCN-INT-HOST-CALL-PLUGIN-001.md \
  --context docs/scenarios/integration/SCN-INT-HOST-CALL-RESILIENCE-001.md \
  --context docs/_data/docmap.yaml \
  --context docs/_data/repos.yaml
```

### UC-INT-HOST-CALL-TENANT-001 · powerx/security/integration
完善该 Seed，补充流程、契约、验收指标与团队协作说明：

```bash
[usecase-generate-template.md](.specify/templates/usecase-generate-template.md) \
  docs/usecases-seeds/SCN-INT-HOST-CALL-PLUGIN-001/UC-INT-HOST-CALL-TENANT-001.md \
  --context docs/scenarios/int/SCN-INT-HOST-CALL-PLUGIN-001.md \
  --context docs/scenarios/integration/SCN-INT-HOST-CALL-TENANT-001.md \
  --context docs/_data/docmap.yaml \
  --context docs/_data/repos.yaml
```

> 完成撰写后，可执行 `npm run publish:usecases -- --scn-id SCN-INT-HOST-CALL-PLUGIN-001 --validate-only` 或 `node scripts/site/sync-scenario-pages.mjs --scn-id SCN-INT-HOST-CALL-PLUGIN-001 --with-seeds --force` 校验结构并同步站点。
