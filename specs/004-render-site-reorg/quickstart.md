# Quickstart – PowerX Docs Render Site Reorg

## 1. 目标读者
- **Documentation 平台维护者**：负责目录重构、VitePress 配置与构建验证。
- **Localization Lead**：确保 zh-CN ↔ en-US 镜像脚本在新目录下正常运行。
- **内容运营（Content Ops）**：使用 AI 发布建议工作流，将已批准内容复制到 `docs/website/`。

## 2. 先决条件
1. Node.js 18+ 与 npm 可用。
2. 安装依赖：`npm install`
3. 保证 `powerx_source_docs` 中的内容与审核状态最新。

## 3. 目录迁移与配置
1. 执行迁移脚本或按规范将现有渲染内容移动到 `docs/website/`。
2. 更新 `docs/.vitepress/config.mts`：设置 `srcDir: 'website'`，同步导航路径（如 `/guides/`）。
3. 将静态资源移动到 `docs/website/public/`。
4. 运行 `npm run docs:dev` 手动验证导航、页脚、首页 CTA。

## 4. 本地化脚本校验
- 2025-10-21: 已在 docs/website 根运行本地化脚本：
  - `node scripts/localization/sync-locales.mjs` ✅
  - `node scripts/localization/check-parity.mjs` ✅（提示占位状态，暂无 Approved 页面属预期）
  - `node scripts/localization/review-guard.mjs` ❌（因多页面仍为 Placeholder/InReview，发布前需人工审批）

1. 更新 `scripts/localization/*.mjs`、`.ts` 中的根路径为 `docs/website`。
2. 依次执行：
   - `node scripts/localization/sync-locales.mjs`
   - `node scripts/localization/check-parity.mjs`
   - `node scripts/localization/review-guard.mjs`
3. 确认 manifest (`docs/website/localization/manifest.json`) 以及 `en/` 目录结构镜像正确。

## 5. AI 发布建议流程
1. 内容运营把已批准的源文件路径导出为列表（可通过自定义脚本扫描 `reviewStatus: Approved`）。
2. 运行 `npm run publish:suggest -- --input approved.json --output docs/website/_mount/publish-suggestions.json`（脚本在 Phase 1 实现）。
3. 打开 CLI 交互界面 `npm run publish:review`：
   - AI 给出目标路径、信心分与风险等级。
   - 逐条选择 `确认/驳回/手动编辑`。
4. 对于 `风险高` 或低信心条目，CLI 会切换为手动编辑模式，允许直接指定目标路径。
5. 所有条目确认后执行 `npm run publish:apply -- --session <id>`，将文件复制到 `docs/website/` 对应目录，并更新校验和。

## 6. 构建与验证
- 2025-10-21: Phase 3 迁移完成，`npm run docs:build` 与 `npm run lint` 均通过。

1. `npm run lint` 确保主题及脚本通过。
2. `npm run docs:build` 构建静态站点。
3. 使用自定义脚本 `node scripts/qa/verify-links.mjs`（Phase 1 交付）检查旧路径引用。
4. 执行 `node scripts/localization/assert-zh-default.mjs` 以及 `node scripts/localization/measure-switch.mjs` 进行语言与性能基线验证。

## 7. 发布后维护
1. 将最新的渲染目录同步到部署环境。
2. 更新 `docs/design/render-site-reorg.md` 中的 mermaid 流程图，描述源内容 → AI 建议 → 发布 → 渲染目录链路。
3. 记录发布会话 ID 与审计日志引用，方便后续追溯。
