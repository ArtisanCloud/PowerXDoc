# 发布 Usecase Seeds 指南

当场景与 Seed 均已补全，可通过两条命令将 Seed 分发到各个仓库并生成领导层视图。本指南聚焦实际操作，参数细节与脚本约束在说明中补充。

> 请在仓库根目录运行脚本，并确保 `repos/**` 与 `docs/**` 工作区干净，否则发布流程会因脏状态中止。

## 前置准备

- **拉取下游仓库**：根据 `docs/_data/repos.yaml` 的 `scope` 或 `key` 执行：

  ```bash
  node scripts/setup/downstreams.mjs --scope powerx,powerx-plugin,powerx-marketplace
  # 或
  node scripts/setup/downstreams.mjs --repo powerx --repo powerx-plugin
  ```

  脚本会在 `repos/` 下克隆或更新目标仓库，并尝试切换到 `default_branch`。发布前请确认这些仓库保持干净。

## 快速步骤

1. **Dry Run**：确认将影响的仓库与文件。
2. **正式发布**：推送分支并创建 PR。
3. **生成领导视图（可选）**：刷新 `_collected` 汇总。
4. **通知与跟进（可选）**：查看报告、提醒负责人。

## 1. Dry Run

```bash
npm run publish:usecases -- --scn-id SCN-PUBLISH-HUB-001 --dry-run
```

- 仅生成 `reports/usecases/usecases_SCN-PUBLISH-HUB-001.json`，不会写入任何仓库。
- 报告包含分发目标、文件清单及 `resumeToken`。
- 若需延续同一批 Seed，可从 `reports/_state/usecases:SCN-PUBLISH-HUB-001.json`（或 Dry Run 报告）读取 `resumeToken` 并复用：

  ```bash
  npm run publish:usecases \
    -- --scn-id SCN-PUBLISH-HUB-001 \
    --dry-run \
    --resume-token <token>
  ```
- 若只检查单个 Seed，可加 `--doc-id`：

  ```bash
  npm run publish:usecases \
    -- --scn-id SCN-PUBLISH-HUB-001 \
    --doc-id PX-DEV-HOTLOAD-001 \
    --dry-run
  ```

## 2. 正式发布

```bash
npm run publish:usecases -- --scn-id SCN-PUBLISH-HUB-001
```

- 为每个目标仓库创建 `docs/hub/<SCN_ID>` 分支并提交 PR。
- 默认评审人与仓库映射来自 `docs/_data/repos.yaml` 的 `default_reviewers`。
- 常用参数：
  - `--scope` / `--layer` / `--domain`：缩小分发范围。
  - `--doc-id PX-DEV-HOTLOAD-001`：只处理指定 Seed，可重复传参。
  - `--repo powerx`：限定单个仓库。
  - `--resume-token <token>`：失败后续跑。
- 可以在正式发布时沿用 Dry Run 结果，只需传入相同的 `resumeToken`：

  ```bash
  npm run publish:usecases \
    -- --scn-id SCN-PUBLISH-HUB-001 \
    --resume-token <token>
  ```

## 3. 生成领导视图（可选）

```bash
npm run publish:collected -- --scn-id SCN-PUBLISH-HUB-001
```

- 根据 `docmap.yaml` 衍生 `_collected/<scope>/<layer>/<domain>/<doc_id>.md`，供领导层查看覆盖状态。
- 结果同时写入 `reports/collected/`。

## 4. 通知与跟进（可选）

```bash
npm run publish:notify -- --scn-id SCN-PUBLISH-HUB-001
```

- 根据分发报告提醒未审 PR 的负责人。
- 通知渠道与节奏依据脚本内部配置（如 IM、邮件）。

## 常用过滤参数

| 参数 | 示例 | 说明 |
|------|------|------|
| `--doc-id` | `--doc-id PX-DEV-HOTLOAD-001` | 只发布指定 Seed，可重复传多个。 |
| `--scope` | `--scope powerx` | 按业务域过滤。 |
| `--layer` | `--layer service` | 只发布指定层级。 |
| `--domain` | `--domain dev` | 聚焦某个业务域。 |
| `--repo` | `--repo powerx` | 限定单个仓库。 |
| `--resume-token` | `--resume-token <token>` | 失败后继续，无需重建 PR。 |
| `--use-default-branch` | `--use-default-branch` | 直接在仓库 `default_branch` 上提交/推送，不创建 PR 分支。 |

可组合参数，例如：

```bash
npm run publish:usecases \
  -- --scn-id SCN-PUBLISH-HUB-001 \
  --scope powerx \
  --doc-id PX-DEV-HOTLOAD-001 \
  --doc-id PX-PUBLISH-OFFLINE-001
```

## 常见问题

| 现象 | 处理方式 |
|------|----------|
| Dry Run 无输出 | 确认 Seed 是否有改动；无差异时不会生成报告。 |
| PR 未创建 | 检查 `repos/<repo>` 是否干净、账号是否具备推送权限，可手动 `git push` 验证。 |
| `_collected` 缺文件 | 核对 `docmap.yaml` 是否包含完整 `scope/layer/domain`。 |
| 只想影响单仓库 | 使用 `--repo` 或配合 `--scope`/`--layer`/`--domain`。 |

发布完成后，请在 PR 合并后更新场景/Seed 状态，并在下一轮发布前复查 `_collected` 是否为最新版本。
