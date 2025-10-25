# 发布 Usecase Seeds 指南

当场景与 Seed 都准备完毕后，只需两条命令就能把 Seed 分发给各个仓库并生成领导视图。本指南专注流程，不再重复参数细节。

> 默认在仓库根目录执行以下命令，确保 `repos/**` 与 `docs/**` 工作区干净，否则发布脚本会中止。

## 快速步骤

1. **Dry Run**：检查会影响哪些仓库、哪些文件。  
2. **正式发布**：推送分支并创建 PR。  
3. **生成领导视图**（可选）：刷新 `_collected` 汇总。  
4. **跟进**：查看报告、通知负责人。

## 1. Dry Run

```bash
npm run publish:usecases -- --scn-id SCN-PUBLISH-HUB-001 --dry-run
```

- 不会写入任何仓库，只生成 `reports/usecases/usecases_SCN-PUBLISH-HUB-001.json`。  
- 报告里包含分发目标、文件清单和 `resumeToken`。
- 只想查看单个 Seed，可配合 `--doc-id`，例如：

  ```bash
  npm run publish:usecases \
    -- --scn-id SCN-PUBLISH-HUB-001 \
    --doc-id PX-DEV-HOTLOAD-001 \
    --dry-run
  ```

  Dry Run 输出会只包含该 Seed 所在仓库与路径，便于先确认差异。

## 2. 正式发布

```bash
npm run publish:usecases -- --scn-id SCN-PUBLISH-HUB-001
```

- 为每个下游仓库创建 `docs/hub/<SCN_ID>` 分支并提交 PR。  
- 默认评审人来自 `docs/_data/repos.yaml` 中的 `default_reviewers`。  
- 如需缩小范围，可追加 `--scope`、`--layer`、`--domain` 或 `--doc-id`。  
- 如果上一次执行失败，可用 `--resume-token <token>` 继续。
- 单个 Seed 的实发布示例：

  ```bash
  npm run publish:usecases \
    -- --scn-id SCN-PUBLISH-HUB-001 \
    --doc-id PX-DEV-HOTLOAD-001
  ```

  仅会推送包含 `PX-DEV-HOTLOAD-001` 的仓库与文件，其他 Seed 保持不动。

## 3. 生成领导视图（可选）

```bash
npm run publish:collected -- --scn-id SCN-PUBLISH-HUB-001
```

- 根据 `docmap.yaml` 生成 `_collected/<scope>/<layer>/<domain>/<doc_id>.md` 占位，用于领导层浏览覆盖情况。  
- 结果也会记录在 `reports/collected/`。

## 4. 通知与跟进（可选）

```bash
npm run publish:notify -- --scn-id SCN-PUBLISH-HUB-001
```

- 根据分发报告提醒未审 PR 的负责人。  
- 渠道和节奏由脚本内部配置（例如邮件、IM）。

## 常用过滤参数

| 参数 | 示例 | 作用 |
|------|------|------|
| `--doc-id` | `--doc-id PX-DEV-HOTLOAD-001` | 只发布指定子用例 Seed，可重复传入多个。 |
| `--scope` | `--scope powerx-backend` | 过滤到某个业务域（与 `docmap.yaml` 中一致）。 |
| `--layer` | `--layer service` | 只处理指定层级（proto/api/service/ui）。 |
| `--domain` | `--domain dev` | 聚焦到某个业务域（dev/publish 等）。 |
| `--repo` | `--repo powerx-backend` | 仅针对指定仓库运行脚本。 |
| `--resume-token` | `--resume-token <token>` | 失败后继续，避免重新生成 PR。 |

> 可以组合参数，例如一次性发布 Backend 的两个 Seed：  
> `npm run publish:usecases -- --scn-id SCN-PUBLISH-HUB-001 --scope powerx-backend --doc-id PX-DEV-HOTLOAD-001 --doc-id PX-PUBLISH-OFFLINE-001`

## 常见问题

| 现象 | 处理方式 |
|------|----------|
| Dry Run 没有输出 | 确认 Seed 是否更新；若无差异，则不会生成报告。 |
| PR 未创建 | 检查 `repos/<repo>` 工作区是否干净、是否有推送权限；必要时手动 `git push` 验证。 |
| `_collected` 未生成部分文件 | 确认 `docmap.yaml` 是否包含完整的 `scope/layer/domain` 信息。 |
| 想只影响单个仓库 | 在命令后追加 `--repo <key>`（来自 `repos.yaml`），或使用 `--scope` 等过滤参数。 |

执行完这些步骤，Seed 分发工作即告完成。后续请在 PR 合并后更新场景/Seed 状态，并在下一轮发布前复查 `_collected` 是否最新。
