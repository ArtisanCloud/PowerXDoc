# SCN-KNOWLEDGE-UPDATE-001 Seed 撰写任务

本任务文件按子用例列出撰写指引，所有命令均依赖 `.specify/templates/usecase-generate-template.md`，请在仓库根目录执行。

### UC-KNOWLEDGE-UPDATE-DECAY-001 · powerx/ops/knowledge
完善该 Seed，补充流程、契约、验收指标与团队协作说明：

```bash
[usecase-generate-template.md](.specify/templates/usecase-generate-template.md) \
  docs/usecases-seeds/SCN-KNOWLEDGE-UPDATE-001/UC-KNOWLEDGE-UPDATE-DECAY-001.md \
  --context docs/scenarios/knowledge/SCN-KNOWLEDGE-UPDATE-001.md \
  --context docs/scenarios/knowledge/SCN-KNOWLEDGE-UPDATE-DECAY-001.md \
  --context docs/_data/docmap.yaml \
  --context docs/_data/repos.yaml
```

### UC-KNOWLEDGE-UPDATE-EVENT-001 · powerx/service/knowledge
完善该 Seed，补充流程、契约、验收指标与团队协作说明：

```bash
[usecase-generate-template.md](.specify/templates/usecase-generate-template.md) \
  docs/usecases-seeds/SCN-KNOWLEDGE-UPDATE-001/UC-KNOWLEDGE-UPDATE-EVENT-001.md \
  --context docs/scenarios/knowledge/SCN-KNOWLEDGE-UPDATE-001.md \
  --context docs/scenarios/knowledge/SCN-KNOWLEDGE-UPDATE-EVENT-001.md \
  --context docs/_data/docmap.yaml \
  --context docs/_data/repos.yaml
```

### UC-KNOWLEDGE-UPDATE-FEEDBACK-001 · powerx/data/knowledge
完善该 Seed，补充流程、契约、验收指标与团队协作说明：

```bash
[usecase-generate-template.md](.specify/templates/usecase-generate-template.md) \
  docs/usecases-seeds/SCN-KNOWLEDGE-UPDATE-001/UC-KNOWLEDGE-UPDATE-FEEDBACK-001.md \
  --context docs/scenarios/knowledge/SCN-KNOWLEDGE-UPDATE-001.md \
  --context docs/scenarios/knowledge/SCN-KNOWLEDGE-UPDATE-FEEDBACK-001.md \
  --context docs/_data/docmap.yaml \
  --context docs/_data/repos.yaml
```

### UC-KNOWLEDGE-UPDATE-SYNC-001 · powerx/service/knowledge
完善该 Seed，补充流程、契约、验收指标与团队协作说明：

```bash
[usecase-generate-template.md](.specify/templates/usecase-generate-template.md) \
  docs/usecases-seeds/SCN-KNOWLEDGE-UPDATE-001/UC-KNOWLEDGE-UPDATE-SYNC-001.md \
  --context docs/scenarios/knowledge/SCN-KNOWLEDGE-UPDATE-001.md \
  --context docs/scenarios/knowledge/SCN-KNOWLEDGE-UPDATE-SYNC-001.md \
  --context docs/_data/docmap.yaml \
  --context docs/_data/repos.yaml
```

### UC-KNOWLEDGE-UPDATE-TENANT-001 · powerx/ops/knowledge
完善该 Seed，补充流程、契约、验收指标与团队协作说明：

```bash
[usecase-generate-template.md](.specify/templates/usecase-generate-template.md) \
  docs/usecases-seeds/SCN-KNOWLEDGE-UPDATE-001/UC-KNOWLEDGE-UPDATE-TENANT-001.md \
  --context docs/scenarios/knowledge/SCN-KNOWLEDGE-UPDATE-001.md \
  --context docs/scenarios/knowledge/SCN-KNOWLEDGE-UPDATE-TENANT-001.md \
  --context docs/_data/docmap.yaml \
  --context docs/_data/repos.yaml
```

> 完成撰写后，可执行 `npm run publish:usecases -- --scn-id SCN-KNOWLEDGE-UPDATE-001 --validate-only` 或 `node scripts/site/sync-scenario-pages.mjs --scn-id SCN-KNOWLEDGE-UPDATE-001 --with-seeds --force` 校验结构并同步站点。
