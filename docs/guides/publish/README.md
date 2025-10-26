# PowerXDocs 标准文档分发指南

本文档讲解如何使用 `npm run publish:standards` 将 `docs/standards/` 下的内容同步到各业务仓库，并阐明不同同步场景（全量、单文件、目录组合、排除等）的具体命令。所有示例均基于默认配置文件：

- `docs/_data/repos.yaml`：定义下游仓库及其 checkout 目录、默认分支、审阅者等。
- `docs/_data/standards-map.yaml`：定义各仓库或 scope 获得的文档范围。

---

## 1. 发布前 checklist

1. **确认修改来源**  
   - 所有文档必须来自 `PowerXDocs/docs/standards/`，例如：`docs/standards/powerx-marketplace/init-ui.md`。  
   - 若本次变更同时调整了场景或用例，请同步更新：
     - 模板：`docs/standards/scenarios/_template.md`
     - 主场景：`docs/scenarios/<domain>/SCN-*.md`
     - `docmap`：`docs/_data/docmap.yaml`
     - Usecase 模板：`docs/usecases-seeds/<scope>/<layer>/<domain>/`

2. **质量校验**  
   - 运行 `npm run lint`、`npm run docs:build` 或其他必要检查。  
   - 审核 Frontmatter、内链、术语是否符合 `.specify/memory/constitution.md`。

3. **本地 checkout 准备**
   - 在仓库根目录建立 `repos/`（已列入 `.gitignore`），并保证其中的下游仓库工作区干净：  

     ```
     PowerXDocs/
       repos/
         powerx-marketplace/   # 与 repos.yaml 中 checkout 字段一致
     ```

   - 为目标仓拉取并切换到基线分支（如 `main` 或自定义的 `dev/docs`）。
   - 分发脚本会在运行时校正 `origin` remote，使其与 `repos.yaml` 中的 `git_url` 保持一致；若目录不存在则会报错提醒先完成 clone。
   - 可通过 `node scripts/setup/downstreams.mjs` 一次性把 `docs/_data/repos.yaml` 中列出的仓库 clone 到 `repos/` 下，并切换到指定基线分支。
   - 若下游仓需要强制只读，可参照 `docs/standards/_shared/downstream-readonly-setup.md` 配置 CODEOWNERS、分支保护、CI 校验。

4. **了解默认同步范围**
   - `docs/_data/standards-map.yaml` 控制默认同步目录；示例：

     ```yaml
     defaults:
      include:
        - '*.md'
        - _shared/**
      scopes:
        powerx:
          include:
            - powerx/**
        powerx-marketplace:
          include:
            - powerx-marketplace/**

     ```

   - 上例中，`powerx-marketplace` 仓库默认会收到：
     - 顶层 `*.md`（如 `README.md`）  
     - `_shared/**` 公共规范  
     - `powerx-marketplace/**` 范围内的专属文档
   - CLI 若未传入 `--include`，将自动使用上述映射；可通过 `--standards-map <path>` 指定自定义配置文件。
   - `--repo <key>` 可显式限制目标仓库；若省略、且使用 `--include` 选择具体文件/目录，脚本会根据映射自动定位到相关仓库。

---

## 2. 总体流程

```text
1. Dry Run 预检
2. 检查 reports/standards/** 报告
3. 正式执行（去掉 --dry-run）
4. 审核下游 PR → 记录/通知
```

### 2.1 Dry Run

```bash
npm run publish:standards -- \
  --repo powerx-marketplace \
  --dry-run
```

- 读取 `repos.yaml` + `standards-map.yaml`，将选中的文件复制到 `repos/powerx-marketplace/docs/standards/`。  
- 不提交、不推送；生成 `reports/standards/*.json`。  
- `filesChanged` 字段列出实际复制的文件（相对于仓库根目录）。

### 2.2 报告审查

打开 `reports/standards/standards_distribution.json` 或运行日志，确认：

- `status` 为 `Completed`
- `filesChanged` 缩写是否符合预期
- Dry run 会登记一次工作流指纹。若之后要在同一内容基础上执行正式分发，请使用报告中的 `resumeToken`：

  ```bash
  npm run publish:standards -- \
    --repo powerx-marketplace \
    --resume-token <token>
  ```

  Dry run 结束时，CLI 会在输出中打印 `resumeToken`，也可以在上述报告文件中查找。

### 2.3 正式推送

```bash
npm run publish:standards -- \
  --repo powerx-marketplace
```

- 在目标仓库创建/切换到 `docs/hub/standards-<timestamp>` 分支、复制文件、提交，并自动执行 `git push origin <branch>`。  
- 若 `repos.yaml` 配置了 `default_reviewers`，报告会给出 compare 链接，便于创建或审批 PR。
- 如需仅推送已生成的分支，可使用辅助命令：

  ```bash
  node scripts/publish/push-standards-push.mjs --repo powerx-marketplace --branch docs/hub/standards/<name>
  ```

### 2.4 发布后

- 审查 PR，只保留 `docs/standards/` 的变更多余文件不应出现。  
- 在 PR 描述中注明更新重点或相关需求链接。  
- 如有结构调整，同步更新 `docs/meta/cross-repo-documentation.md`、场景文档等。  
- 根据需要执行 `publish:usecases`、`publish:scenarios` 以保持多仓一致。

---

## 3. 同步场景与命令示例

| 场景 | 说明 | 示例命令 |
|------|------|---------|
| **默认同步单仓** | 使用 `standards-map` 中的 `defaults + scope + repo` 配置。仅 `_shared` + 该 scope 专属目录 + 顶层 `*.md`。 | `npm run publish:standards -- --repo powerx-marketplace` |
| **多仓/按 scope** | 同时同步多个 scope 的仓库。 | `npm run publish:standards -- --scope powerx,powerx-marketplace` |
| **全量复制整棵树** | 忽略映射，复制 `docs/standards/**` 所有文件。 | `npm run publish:standards -- --repo powerx-marketplace --include '**'` |
| **单文件** | 只同步指定文件。路径相对 `docs/standards/`。 | `npm run publish:standards -- --repo powerx-marketplace --include powerx-marketplace/init-ui.md` |
| **单目录（含所有子目录）** | | `npm run publish:standards -- --repo powerx-marketplace --include powerx-marketplace/**` |
| **多个文件/目录组合** | 可多次传 `--include` 或用逗号分隔。 | `npm run publish:standards -- --repo powerx-marketplace --include _shared/security/**,powerx-marketplace/init-ui.md` |
| **自动路由到多个仓库** | 仅指定文件/目录，脚本依据映射推送到对应仓库，可同时影响多个仓。 | `npm run publish:standards -- --include powerx-plugin/guide.md --include powerx-marketplace/init-ui.md` |
| **在默认基础上排除** | 先继承 `standards-map`，再排除特定文件/目录。 | `npm run publish:standards -- --repo powerx-marketplace --exclude _shared/drafts/**` |
| **使用自定义映射** | 针对临时需求定义专用 map 文件。 | `npm run publish:standards -- --repo powerx-marketplace --standards-map docs/_data/standards-map.custom.yaml` |
| **Dry run 检查过滤效果** | 建议每次组合命令先 dry-run。 | `npm run publish:standards -- --repo powerx-marketplace --dry-run --include _shared/**` |

**注意事项**

- CLI 参数优先级：`--include/--exclude`（命令行） > `standards-map`（repo/scope/default） > 全量（`**`）。  
- 指定 `--include` 后将 **完全覆盖** 默认映射，需手动加入 `_shared/**` 等默认内容；若未指定 `--repo`，脚本会为包含文件的仓库自动生成同步。
- 匹配模式使用 POSIX 风格（`/` 分隔）且相对 `docs/standards/`；如写成 `docs/standards/...` 也会被自动归一化。

---

## 4. 常见问题与排查

| 问题 | 排查步骤 |
|------|----------|
| Dry run 无变更 | 确认修改文件已保存；检查 `standards-map` 是否排除了该目录；查看 `filesChanged` 列表。 |
| PR diff 出现非目标文件 | 检查是否缺少 `--include`/`--exclude`；或 `standards-map` 默认包含了其他 scope。必要时调整 map 或命令。 |
| 分支创建失败 | 确认 `repos/<repo>` 工作区无未提交变更；基线分支存在且可 checkout。 |
| 自动建 PR 失败 | 检查 `git_url`、权限、网络设置。可参考输出日志手动推送并创建 PR。 |
| 想同步多仓 | 使用 `--scope` 或多次 `--repo`（命令可重复）进行批量同步。 |
| 想回滚上次运行 | 利用 `--resume-token` 重试，或直接删除 `repos/<repo>` 中生成的分支后重新执行。 |

---

## 5. 参考资料

- `docs/meta/cross-repo-documentation.md` — 多仓文档体系 & 分发架构  
- `docs/standards/_shared/downstream-readonly-setup.md` — 下游仓只读治理方案  
- `.specify/memory/constitution.md` — PowerX 文档宪章与场景编写流程  
- `docs/standards/powerx-marketplace/init-ui.md` — 示例规范文档  
- `scripts/publish/push-standards.mjs` — 分发脚本实现

如流程或脚本有调整，请同步更新本指南，并在 `docs/guides/Leadership-coverage.md` 记录变更日期与责任人。
