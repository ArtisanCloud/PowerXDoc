# PowerXDocs 标准文档分发指南

本文基于 `docs/guides/publish/README.md`，整理如何使用 `npm run publish:standards` 将 `docs/standards/` 内容同步至下游仓库的核心流程与命令示例。

## 发布前 Checklist

1. **确认修改来源**：所有文档需来自 `PowerXDocs/docs/standards/`，如 `docs/standards/powerx-marketplace/init-ui.md`。若同时调整场景或 Usecase，请同步更新模板、`docmap.yaml` 等。
2. **质量校验**：运行 `npm run lint`、`npm run docs:build` 等；检查 Frontmatter、内链、术语是否符合 `.specify/memory/constitution.md`。
3. **本地仓库准备**：在仓库根创建 `repos/` 并确保目标仓库工作区干净，可使用 `node scripts/setup/downstreams.mjs` 批量 clone。脚本会校准 remote 并依据 `repos.yaml` 切换基线分支。
4. **理解默认同步范围**：`docs/_data/standards-map.yaml` 定义 `defaults/include` 与各 scope 的目录映射。若命令未显式传 `--include`，将使用该映射。

## 标准流程

```text
1. Dry Run 预检
2. 审查 reports/standards/** 报告
3. 正式执行（去掉 --dry-run）
4. 审核下游 PR 并通知
```

### Dry Run

```bash
npm run publish:standards -- \
  --repo powerx-marketplace \
  --dry-run
```

- 读取 `repos.yaml` 与 `standards-map.yaml`，将变更复制到 `repos/<repo>/docs/standards/`，仅生成报告，不推送。
- 输出 `reports/standards/*.json`，其中包含 `filesChanged` 与 `resumeToken`。

### 正式发布

```bash
npm run publish:standards -- --repo powerx-marketplace
```

- 在目标仓创建 `docs/hub/standards-<timestamp>` 分支、提交差异并 `git push`。
- 若 `repos.yaml` 定义了 `default_reviewers`，报告会给出 compare 链接便于创建 PR。
- 需要重用 Dry Run 结果，可追加 `--resume-token <token>`。

## 常用命令组合

| 场景 | 示例 |
|------|------|
| 按 scope 批量同步 | `npm run publish:standards -- --scope powerx,powerx-admin` |
| 全量复制 `docs/standards/**` | `npm run publish:standards -- --repo powerx-marketplace --include '**'` |
| 单文件同步 | `npm run publish:standards -- --repo powerx-marketplace --include powerx-marketplace/init-ui.md` |
| 多目录组合 | `npm run publish:standards -- --include _shared/security/** --include powerx-plugin/guide.md` |
| 在默认基础上排除 | `npm run publish:standards -- --repo powerx-marketplace --exclude _shared/drafts/**` |
| 自定义映射文件 | `npm run publish:standards -- --standards-map docs/_data/standards-map.custom.yaml` |

> 提醒：只要指定了 `--include`，默认映射会被覆盖，需要手动添加 `_shared/**` 等公共目录。

## 常见问题

| 问题 | 处理方式 |
|------|----------|
| Dry Run 无输出 | 确认文件已保存，或检查 `standards-map` 是否排除该目录。 |
| PR diff 包含意外文件 | 检查 `--include/--exclude` 参数及映射配置。 |
| 分支创建失败 | 确认 `repos/<repo>` 工作区干净、基线分支存在。 |
| 自动推送失败 | 核对 `git_url`、权限或网络设置，必要时手动推送。 |
| 想回滚 | 使用 `--resume-token` 再次运行，或删除下游分支后重新执行。 |

## 参考资料

- `docs/meta/cross-repo-documentation.md` — 多仓文档体系说明  
- `docs/standards/_shared/downstream-readonly-setup.md` — 下游仓只读治理方案  
- `.specify/memory/constitution.md` — PowerX 文档宪章  
- `scripts/publish/push-standards.mjs` — 分发脚本实现
