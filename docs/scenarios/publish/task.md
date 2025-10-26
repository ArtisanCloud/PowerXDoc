# SCN-PUBLISH-HUB-001 Seed 撰写任务清单

以下命令可逐一触发 `speckit.implement`，将 Seed 模板写成完整文档。

```bash
# PLG-DEV-HOTLOAD-001
.codex/prompts/speckit.implement.md \
  docs/usecases-seeds/powerx-plugin/proto/dev/PLG-DEV-HOTLOAD-001.md \
  --context docs/scenarios/publish/SCN-PUBLISH-HUB-001.md \
  --context docs/_data/docmap.yaml \
  --context docs/_data/repos.yaml

# PX-DEV-HOTLOAD-001
.codex/prompts/speckit.implement.md \
  docs/usecases-seeds/powerx/service/dev/PX-DEV-HOTLOAD-001.md \
  --context docs/scenarios/publish/SCN-PUBLISH-HUB-001.md \
  --context docs/_data/docmap.yaml \
  --context docs/_data/repos.yaml

# PX-ADMIN-DEV-HOTLOAD-001
.codex/prompts/speckit.implement.md \
  docs/usecases-seeds/powerx/ui/dev/PX-ADMIN-DEV-HOTLOAD-001.md \
  --context docs/scenarios/publish/SCN-PUBLISH-HUB-001.md \
  --context docs/_data/docmap.yaml \
  --context docs/_data/repos.yaml

# PLG-PUBLISH-OFFLINE-001
.codex/prompts/speckit.implement.md \
  docs/usecases-seeds/powerx-plugin/proto/publish/PLG-PUBLISH-OFFLINE-001.md \
  --context docs/scenarios/publish/SCN-PUBLISH-HUB-001.md \
  --context docs/_data/docmap.yaml \
  --context docs/_data/repos.yaml

# MKP-PUBLISH-OFFLINE-001
.codex/prompts/speckit.implement.md \
  docs/usecases-seeds/powerx-marketplace/api/marketplace/MKP-PUBLISH-OFFLINE-001.md \
  --context docs/scenarios/publish/SCN-PUBLISH-HUB-001.md \
  --context docs/_data/docmap.yaml \
  --context docs/_data/repos.yaml

# PX-PUBLISH-OFFLINE-001
.codex/prompts/speckit.implement.md \
  docs/usecases-seeds/powerx/service/publish/PX-PUBLISH-OFFLINE-001.md \
  --context docs/scenarios/publish/SCN-PUBLISH-HUB-001.md \
  --context docs/_data/docmap.yaml \
  --context docs/_data/repos.yaml

# PX-ADMIN-PUBLISH-OFFLINE-001
.codex/prompts/speckit.implement.md \
  docs/usecases-seeds/powerx/ui/publish/PX-ADMIN-PUBLISH-OFFLINE-001.md \
  --context docs/scenarios/publish/SCN-PUBLISH-HUB-001.md \
  --context docs/_data/docmap.yaml \
  --context docs/_data/repos.yaml

# PLG-PUBLISH-ONLINE-001
.codex/prompts/speckit.implement.md \
  docs/usecases-seeds/powerx-plugin/proto/publish/PLG-PUBLISH-ONLINE-001.md \
  --context docs/scenarios/publish/SCN-PUBLISH-HUB-001.md \
  --context docs/_data/docmap.yaml \
  --context docs/_data/repos.yaml

# MKP-PUBLISH-ONLINE-001
.codex/prompts/speckit.implement.md \
  docs/usecases-seeds/powerx-marketplace/api/marketplace/MKP-PUBLISH-ONLINE-001.md \
  --context docs/scenarios/publish/SCN-PUBLISH-HUB-001.md \
  --context docs/_data/docmap.yaml \
  --context docs/_data/repos.yaml

# PX-PUBLISH-ONLINE-001
.codex/prompts/speckit.implement.md \
  docs/usecases-seeds/powerx/service/catalog/PX-PUBLISH-ONLINE-001.md \
  --context docs/scenarios/publish/SCN-PUBLISH-HUB-001.md \
  --context docs/_data/docmap.yaml \
  --context docs/_data/repos.yaml

# PX-ADMIN-PUBLISH-ONLINE-001
.codex/prompts/speckit.implement.md \
  docs/usecases-seeds/powerx/ui/marketplace/PX-ADMIN-PUBLISH-ONLINE-001.md \
  --context docs/scenarios/publish/SCN-PUBLISH-HUB-001.md \
  --context docs/_data/docmap.yaml \
  --context docs/_data/repos.yaml

```

> 完成全部 Seed 撰写后，可执行 `npm run publish:usecases -- --scn-id SCN-PUBLISH-HUB-001 --validate-only` 或 `node scripts/site/sync-scenario-pages.mjs --scn-id SCN-PUBLISH-HUB-001 --with-seeds --force` 进行校验与同步。