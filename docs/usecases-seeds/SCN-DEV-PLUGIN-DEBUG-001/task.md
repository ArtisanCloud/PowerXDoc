# SCN-DEV-PLUGIN-DEBUG-001 Seed 撰写任务

本任务文件列出子用例撰写指引，所有命令均依赖 `.specify/templates/usecase-generate-template.md`，请在仓库根目录执行。

### UC-DEV-PLUGIN-HOT-RELOAD-001 · powerx-plugin/proto/dev
完善该 Seed，补充流程、契约、验收指标与团队协作说明：

```bash
[usecase-generate-template.md](.specify/templates/usecase-generate-template.md) \
  docs/usecases-seeds/SCN-DEV-PLUGIN-DEBUG-001/UC-DEV-PLUGIN-HOT-RELOAD-001.md \
  --context docs/scenarios/plugin-lifecycle/SCN-DEV-PLUGIN-DEBUG-001.md \
  --context docs/scenarios/plugin-lifecycle/SCN-DEV-PLUGIN-HOT-RELOAD-001.md \
  --context docs/_data/docmap.yaml \
  --context docs/_data/repos.yaml
```

### UC-DEV-PLUGIN-SANDBOX-VALIDATION-001 · powerx/service/dev
完善该 Seed，补充流程、契约、验收指标与团队协作说明：

```bash
[usecase-generate-template.md](.specify/templates/usecase-generate-template.md) \
  docs/usecases-seeds/SCN-DEV-PLUGIN-DEBUG-001/UC-DEV-PLUGIN-SANDBOX-VALIDATION-001.md \
  --context docs/scenarios/plugin-lifecycle/SCN-DEV-PLUGIN-DEBUG-001.md \
  --context docs/scenarios/plugin-lifecycle/SCN-DEV-PLUGIN-SANDBOX-VALIDATION-001.md \
  --context docs/_data/docmap.yaml \
  --context docs/_data/repos.yaml
```

### UC-DEV-PLUGIN-ERROR-DIAGNOSTICS-001 · powerx/ops/dev
完善该 Seed，补充流程、契约、验收指标与团队协作说明：

```bash
[usecase-generate-template.md](.specify/templates/usecase-generate-template.md) \
  docs/usecases-seeds/SCN-DEV-PLUGIN-DEBUG-001/UC-DEV-PLUGIN-ERROR-DIAGNOSTICS-001.md \
  --context docs/scenarios/plugin-lifecycle/SCN-DEV-PLUGIN-DEBUG-001.md \
  --context docs/scenarios/plugin-lifecycle/SCN-DEV-PLUGIN-ERROR-DIAGNOSTICS-001.md \
  --context docs/_data/docmap.yaml \
  --context docs/_data/repos.yaml
```
