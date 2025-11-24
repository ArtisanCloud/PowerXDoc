# SCN-CORE-RPA-ORCH-001 Seed 撰写任务

本任务文件按子用例列出撰写指引，所有命令均依赖 `.specify/templates/usecase-generate-template.md`，请在仓库根目录执行。

### PX-RPA-BID-001 · powerx/service/core-platform
完善该 Seed，补充流程、契约、验收指标与团队协作说明：

```bash
[usecase-generate-template.md](.specify/templates/usecase-generate-template.md) \
  docs/usecases-seeds/SCN-CORE-RPA-ORCH-001/PX-RPA-BID-001.md \
  --context docs/scenarios/core/SCN-CORE-RPA-ORCH-001.md \
  --context docs/_data/docmap.yaml \
  --context docs/_data/repos.yaml
```

### PX-RPA-OA-001 · powerx/service/core-platform
完善该 Seed，补充流程、契约、验收指标与团队协作说明：

```bash
[usecase-generate-template.md](.specify/templates/usecase-generate-template.md) \
  docs/usecases-seeds/SCN-CORE-RPA-ORCH-001/PX-RPA-OA-001.md \
  --context docs/scenarios/core/SCN-CORE-RPA-ORCH-001.md \
  --context docs/_data/docmap.yaml \
  --context docs/_data/repos.yaml
```

### PX-RPA-ORCH-001 · powerx/service/core-platform
完善该 Seed，补充流程、契约、验收指标与团队协作说明：

```bash
[usecase-generate-template.md](.specify/templates/usecase-generate-template.md) \
  docs/usecases-seeds/SCN-CORE-RPA-ORCH-001/PX-RPA-ORCH-001.md \
  --context docs/scenarios/core/SCN-CORE-RPA-ORCH-001.md \
  --context docs/_data/docmap.yaml \
  --context docs/_data/repos.yaml
```

### PX-RPA-RECON-001 · powerx/service/core-platform
完善该 Seed，补充流程、契约、验收指标与团队协作说明：

```bash
[usecase-generate-template.md](.specify/templates/usecase-generate-template.md) \
  docs/usecases-seeds/SCN-CORE-RPA-ORCH-001/PX-RPA-RECON-001.md \
  --context docs/scenarios/core/SCN-CORE-RPA-ORCH-001.md \
  --context docs/_data/docmap.yaml \
  --context docs/_data/repos.yaml
```

> 完成撰写后，可执行 `npm run publish:usecases -- --scn-id SCN-CORE-RPA-ORCH-001 --validate-only` 或 `node scripts/site/sync-scenario-pages.mjs --scn-id SCN-CORE-RPA-ORCH-001 --with-seeds --force` 校验结构并同步站点。
