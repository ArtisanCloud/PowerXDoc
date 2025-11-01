# SCN-DEV-PLUGIN-INIT-001 Seed 撰写任务

本任务文件列出每个子用例的撰写指引，所有命令均依赖 `.specify/templates/usecase-generate-template.md`，请在仓库根目录执行。

### UC-DEV-PLUGIN-CLI-INIT-001 · powerx-plugin/proto/dev
完善该 Seed，补充流程、契约、验收指标与团队协作说明：

```bash
[usecase-generate-template.md](.specify/templates/usecase-generate-template.md) \
  docs/usecases-seeds/SCN-DEV-PLUGIN-INIT-001/UC-DEV-PLUGIN-CLI-INIT-001.md \
  --context docs/scenarios/plugin-lifecycle/SCN-DEV-PLUGIN-INIT-001.md \
  --context docs/scenarios/plugin-lifecycle/SCN-DEV-PLUGIN-CLI-INIT-001.md \
  --context docs/_data/docmap.yaml \
  --context docs/_data/repos.yaml
```

### UC-DEV-PLUGIN-TEAM-CLONE-001 · powerx/service/dev
完善该 Seed，补充流程、契约、验收指标与团队协作说明：

```bash
[usecase-generate-template.md](.specify/templates/usecase-generate-template.md) \
  docs/usecases-seeds/SCN-DEV-PLUGIN-INIT-001/UC-DEV-PLUGIN-TEAM-CLONE-001.md \
  --context docs/scenarios/plugin-lifecycle/SCN-DEV-PLUGIN-INIT-001.md \
  --context docs/scenarios/plugin-lifecycle/SCN-DEV-PLUGIN-TEAM-CLONE-001.md \
  --context docs/_data/docmap.yaml \
  --context docs/_data/repos.yaml
```

### UC-DEV-PLUGIN-THIRD-PARTY-IMPORT-001 · powerx/security/dev
完善该 Seed，补充流程、契约、验收指标与团队协作说明：

```bash
[usecase-generate-template.md](.specify/templates/usecase-generate-template.md) \
  docs/usecases-seeds/SCN-DEV-PLUGIN-INIT-001/UC-DEV-PLUGIN-THIRD-PARTY-IMPORT-001.md \
  --context docs/scenarios/plugin-lifecycle/SCN-DEV-PLUGIN-INIT-001.md \
  --context docs/scenarios/plugin-lifecycle/SCN-DEV-PLUGIN-THIRD-PARTY-IMPORT-001.md \
  --context docs/_data/docmap.yaml \
  --context docs/_data/repos.yaml
```
