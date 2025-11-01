# SCN-PUBLISH-HUB-001 Seed 撰写任务清单

以下命令可逐一触发 `usecase-generate-template.md`，建议按顺序逐条完成。

### PLG-DEV-HOTLOAD-001 · powerx-plugin/proto/dev

完善该 Seed，覆盖 powerx-plugin/proto/dev 职责，补充流程、契约与验收细节：
$$
```bash
.specify/templates/usecase-generate-template.md \
  docs/usecases-seeds/SCN-PUBLISH-HUB-001/PLG-DEV-HOTLOAD-001.md \
  --context docs/scenarios/publish/SCN-PUBLISH-HUB-001.md \
  --context docs/_data/docmap.yaml \
  --context docs/_data/repos.yaml
```

### PX-DEV-HOTLOAD-001 · powerx/service/dev
完善该 Seed，覆盖 powerx/service/dev 职责，补充流程、契约与验收细节：

```bash
.specify/templates/usecase-generate-template.md \
  docs/usecases-seeds/SCN-PUBLISH-HUB-001/PX-DEV-HOTLOAD-001.md \
  --context docs/scenarios/publish/SCN-PUBLISH-HUB-001.md \
  --context docs/_data/docmap.yaml \
  --context docs/_data/repos.yaml
```

### PX-DEV-HOTLOAD-UI-001 · powerx/ui/dev
完善该 Seed，覆盖 powerx/ui/dev 职责，补充流程、契约与验收细节：

```bash
.specify/templates/usecase-generate-template.md \
  docs/usecases-seeds/SCN-PUBLISH-HUB-001/PX-DEV-HOTLOAD-UI-001.md \
  --context docs/scenarios/publish/SCN-PUBLISH-HUB-001.md \
  --context docs/_data/docmap.yaml \
  --context docs/_data/repos.yaml
```

### PLG-PUBLISH-OFFLINE-001 · powerx-plugin/proto/publish
完善该 Seed，覆盖 powerx-plugin/proto/publish 职责，补充流程、契约与验收细节：

```bash
.specify/templates/usecase-generate-template.md \
  docs/usecases-seeds/SCN-PUBLISH-HUB-001/PLG-PUBLISH-OFFLINE-001.md \
  --context docs/scenarios/publish/SCN-PUBLISH-HUB-001.md \
  --context docs/_data/docmap.yaml \
  --context docs/_data/repos.yaml
```

### MKP-PUBLISH-OFFLINE-001 · powerx-marketplace/api/marketplace
完善该 Seed，覆盖 powerx-marketplace/api/marketplace 职责，补充流程、契约与验收细节：

```bash
.specify/templates/usecase-generate-template.md \
  docs/usecases-seeds/SCN-PUBLISH-HUB-001/MKP-PUBLISH-OFFLINE-001.md \
  --context docs/scenarios/publish/SCN-PUBLISH-HUB-001.md \
  --context docs/_data/docmap.yaml \
  --context docs/_data/repos.yaml
```

### PX-PUBLISH-OFFLINE-001 · powerx/service/publish
完善该 Seed，覆盖 powerx/service/publish 职责，补充流程、契约与验收细节：

```bash
.specify/templates/usecase-generate-template.md \
  docs/usecases-seeds/SCN-PUBLISH-HUB-001/PX-PUBLISH-OFFLINE-001.md \
  --context docs/scenarios/publish/SCN-PUBLISH-HUB-001.md \
  --context docs/_data/docmap.yaml \
  --context docs/_data/repos.yaml
```

### PX-PUBLISH-OFFLINE-UI-001 · powerx/ui/publish
完善该 Seed，覆盖 powerx/ui/publish 职责，补充流程、契约与验收细节：

```bash
.specify/templates/usecase-generate-template.md \
  docs/usecases-seeds/SCN-PUBLISH-HUB-001/PX-PUBLISH-OFFLINE-UI-001.md \
  --context docs/scenarios/publish/SCN-PUBLISH-HUB-001.md \
  --context docs/_data/docmap.yaml \
  --context docs/_data/repos.yaml
```

### PLG-PUBLISH-ONLINE-001 · powerx-plugin/proto/publish
完善该 Seed，覆盖 powerx-plugin/proto/publish 职责，补充流程、契约与验收细节：

```bash
.specify/templates/usecase-generate-template.md \
  docs/usecases-seeds/SCN-PUBLISH-HUB-001/PLG-PUBLISH-ONLINE-001.md \
  --context docs/scenarios/publish/SCN-PUBLISH-HUB-001.md \
  --context docs/_data/docmap.yaml \
  --context docs/_data/repos.yaml
```

### MKP-PUBLISH-ONLINE-001 · powerx-marketplace/api/marketplace
完善该 Seed，覆盖 powerx-marketplace/api/marketplace 职责，补充流程、契约与验收细节：

```bash
.specify/templates/usecase-generate-template.md \
  docs/usecases-seeds/SCN-PUBLISH-HUB-001/MKP-PUBLISH-ONLINE-001.md \
  --context docs/scenarios/publish/SCN-PUBLISH-HUB-001.md \
  --context docs/_data/docmap.yaml \
  --context docs/_data/repos.yaml
```

### PX-PUBLISH-ONLINE-001 · powerx/service/catalog
完善该 Seed，覆盖 powerx/service/catalog 职责，补充流程、契约与验收细节：

```bash
.specify/templates/usecase-generate-template.md \
  docs/usecases-seeds/SCN-PUBLISH-HUB-001/PX-PUBLISH-ONLINE-001.md \
  --context docs/scenarios/publish/SCN-PUBLISH-HUB-001.md \
  --context docs/_data/docmap.yaml \
  --context docs/_data/repos.yaml
```

### PX-PUBLISH-ONLINE-UI-001 · powerx/ui/marketplace
完善该 Seed，覆盖 powerx/ui/marketplace 职责，补充流程、契约与验收细节：

```bash
.specify/templates/usecase-generate-template.md \
  docs/usecases-seeds/SCN-PUBLISH-HUB-001/PX-PUBLISH-ONLINE-UI-001.md \
  --context docs/scenarios/publish/SCN-PUBLISH-HUB-001.md \
  --context docs/_data/docmap.yaml \
  --context docs/_data/repos.yaml
```

> 完成全部 Seed 撰写后，可执行 `npm run publish:usecases -- --scn-id SCN-PUBLISH-HUB-001 --validate-only` 或 `node scripts/site/sync-scenario-pages.mjs --scn-id SCN-PUBLISH-HUB-001 --with-seeds --force` 进行校验与同步。
