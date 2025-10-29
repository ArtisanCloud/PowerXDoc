# SCN-IAM-MULTI-TENANT-001 Seed 撰写任务

本任务文件按子用例列出撰写指引，所有命令均依赖 `.specify/templates/usecase-generate-template.md`，请在仓库根目录执行。

### UC-IAM-MULTI-TENANT-ONBOARD-001
租户开通流程（powerx / service / iam）。负责企业管理员租户向导、资质/计费校验、默认管理员与欢迎通知。

```bash
[usecase-generate-template.md](.specify/templates/usecase-generate-template.md) \
  docs/usecases-seeds/SCN-IAM-MULTI-TENANT-001/UC-IAM-MULTI-TENANT-ONBOARD-001.md \
  --context docs/scenarios/iam/SCN-IAM-MULTI-TENANT-001.md \
  --context docs/scenarios/iam/SCN-IAM-MULTI-TENANT-ONBOARD-001.md \
  --context docs/_data/docmap.yaml \
  --context docs/_data/repos.yaml
```

### UC-IAM-MULTI-TENANT-ORG-MODELING-001
租户组织建模（powerx / service / iam）。覆盖组织结构导入、协作组配置、权限同步与审批。

```bash
[usecase-generate-template.md](.specify/templates/usecase-generate-template.md) \
  docs/usecases-seeds/SCN-IAM-MULTI-TENANT-001/UC-IAM-MULTI-TENANT-ORG-MODELING-001.md \
  --context docs/scenarios/iam/SCN-IAM-MULTI-TENANT-001.md \
  --context docs/scenarios/iam/SCN-IAM-MULTI-TENANT-ORG-MODELING-001.md \
  --context docs/_data/docmap.yaml \
  --context docs/_data/repos.yaml
```

### UC-IAM-MULTI-TENANT-CROSS-SHARE-001
跨租户数据共享（powerx / service / iam）。定义共享策略、合规校验、ACL 落地与自动撤销。

```bash
[usecase-generate-template.md](.specify/templates/usecase-generate-template.md) \
  docs/usecases-seeds/SCN-IAM-MULTI-TENANT-001/UC-IAM-MULTI-TENANT-CROSS-SHARE-001.md \
  --context docs/scenarios/iam/SCN-IAM-MULTI-TENANT-001.md \
  --context docs/scenarios/iam/SCN-IAM-MULTI-TENANT-CROSS-SHARE-001.md \
  --context docs/_data/docmap.yaml \
  --context docs/_data/repos.yaml
```

### UC-IAM-MULTI-TENANT-RENEWAL-FREEZE-001
租户续约与冻结治理（powerx-billing / service / iam）。涵盖续约提醒、冻结执行、宽限期与归档。

```bash
[usecase-generate-template.md](.specify/templates/usecase-generate-template.md) \
  docs/usecases-seeds/SCN-IAM-MULTI-TENANT-001/UC-IAM-MULTI-TENANT-RENEWAL-FREEZE-001.md \
  --context docs/scenarios/iam/SCN-IAM-MULTI-TENANT-001.md \
  --context docs/scenarios/iam/SCN-IAM-MULTI-TENANT-RENEWAL-FREEZE-001.md \
  --context docs/_data/docmap.yaml \
  --context docs/_data/repos.yaml
```

> 完成撰写后，可运行 `npm run publish:scenarios -- --scn-id SCN-IAM-MULTI-TENANT-001 --validate-only` 校验结构，再视情况执行 Seed 分发流程。
