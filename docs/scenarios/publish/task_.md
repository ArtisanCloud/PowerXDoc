# SCN-PUBLISH-HUB-001 Seed 撰写任务清单

以下命令可逐一触发 `speckit.implement`，建议按顺序逐条完成。

### PLG-DEV-HOTLOAD-001 · powerx-plugin/proto/dev
补齐插件 CLI 热加载 Seed（原型层）的实现细节：

```bash
.specify/templates/usecase-generate-template.md \
  docs/usecases-seeds/powerx-plugin/proto/dev/PLG-DEV-HOTLOAD-001.md \
  --context docs/scenarios/publish/SCN-PUBLISH-HUB-001.md \
  --context docs/_data/docmap.yaml \
  --context docs/_data/repos.yaml
```

### PX-DEV-HOTLOAD-001 · powerx/service/dev
完善 PowerX 服务层 Dev 热加载 Seed：

```bash
.specify/templates/usecase-generate-template.md \
  docs/usecases-seeds/powerx/service/dev/PX-DEV-HOTLOAD-001.md \
  --context docs/scenarios/publish/SCN-PUBLISH-HUB-001.md \
  --context docs/_data/docmap.yaml \
  --context docs/_data/repos.yaml
```

### PX-ADMIN-DEV-HOTLOAD-001 · powerx/ui/dev
撰写 Admin UI 热加载面板 Seed：

```bash
.specify/templates/usecase-generate-template.md \
  docs/usecases-seeds/powerx/ui/dev/PX-ADMIN-DEV-HOTLOAD-001.md \
  --context docs/scenarios/publish/SCN-PUBLISH-HUB-001.md \
  --context docs/_data/docmap.yaml \
  --context docs/_data/repos.yaml
```

### PLG-PUBLISH-OFFLINE-001 · powerx-plugin/proto/publish
补写插件 CLI 离线发布 Seed：

```bash
.specify/templates/usecase-generate-template.md \
  docs/usecases-seeds/powerx-plugin/proto/publish/PLG-PUBLISH-OFFLINE-001.md \
  --context docs/scenarios/publish/SCN-PUBLISH-HUB-001.md \
  --context docs/_data/docmap.yaml \
  --context docs/_data/repos.yaml
```

### MKP-PUBLISH-OFFLINE-001 · powerx-marketplace/api/marketplace
完善 Marketplace 离线上传 Seed：

```bash
.specify/templates/usecase-generate-template.md \
  docs/usecases-seeds/powerx-marketplace/api/marketplace/MKP-PUBLISH-OFFLINE-001.md \
  --context docs/scenarios/publish/SCN-PUBLISH-HUB-001.md \
  --context docs/_data/docmap.yaml \
  --context docs/_data/repos.yaml
```

### PX-PUBLISH-OFFLINE-001 · powerx/service/publish
撰写 PowerX 服务层离线安装/回滚 Seed：

```bash
.specify/templates/usecase-generate-template.md \
  docs/usecases-seeds/powerx/service/publish/PX-PUBLISH-OFFLINE-001.md \
  --context docs/scenarios/publish/SCN-PUBLISH-HUB-001.md \
  --context docs/_data/docmap.yaml \
  --context docs/_data/repos.yaml
```

### PX-ADMIN-PUBLISH-OFFLINE-001 · powerx/ui/publish
补齐 Admin UI 离线管理 Seed：

```bash
.specify/templates/usecase-generate-template.md \
  docs/usecases-seeds/powerx/ui/publish/PX-ADMIN-PUBLISH-OFFLINE-001.md \
  --context docs/scenarios/publish/SCN-PUBLISH-HUB-001.md \
  --context docs/_data/docmap.yaml \
  --context docs/_data/repos.yaml
```

### PLG-PUBLISH-ONLINE-001 · powerx-plugin/proto/publish
完善插件 CLI 在线发布 Seed：

```bash
.specify/templates/usecase-generate-template.md \
  docs/usecases-seeds/powerx-plugin/proto/publish/PLG-PUBLISH-ONLINE-001.md \
  --context docs/scenarios/publish/SCN-PUBLISH-HUB-001.md \
  --context docs/_data/docmap.yaml \
  --context docs/_data/repos.yaml
```

### MKP-PUBLISH-ONLINE-001 · powerx-marketplace/api/marketplace
补写 Marketplace 在线审核 Seed：

```bash
.specify/templates/usecase-generate-template.md \
  docs/usecases-seeds/powerx-marketplace/api/marketplace/MKP-PUBLISH-ONLINE-001.md \
  --context docs/scenarios/publish/SCN-PUBLISH-HUB-001.md \
  --context docs/_data/docmap.yaml \
  --context docs/_data/repos.yaml
```

### PX-PUBLISH-ONLINE-001 · powerx/service/catalog
撰写 PowerX 服务层在线分发 Seed：

```bash
.specify/templates/usecase-generate-template.md \
  docs/usecases-seeds/powerx/service/catalog/PX-PUBLISH-ONLINE-001.md \
  --context docs/scenarios/publish/SCN-PUBLISH-HUB-001.md \
  --context docs/_data/docmap.yaml \
  --context docs/_data/repos.yaml
```

### PX-ADMIN-PUBLISH-ONLINE-001 · powerx/ui/marketplace
补齐 Admin UI 在线安装 Seed：

```bash
.specify/templates/usecase-generate-template.md \
  docs/usecases-seeds/powerx/ui/marketplace/PX-ADMIN-PUBLISH-ONLINE-001.md \
  --context docs/scenarios/publish/SCN-PUBLISH-HUB-001.md \
  --context docs/_data/docmap.yaml \
  --context docs/_data/repos.yaml
```

> 完成全部 Seed 撰写后，可执行 `npm run publish:usecases -- --scn-id SCN-PUBLISH-HUB-001 --validate-only` 或 `node scripts/site/sync-scenario-pages.mjs --scn-id SCN-PUBLISH-HUB-001 --with-seeds --force` 进行校验与同步。
