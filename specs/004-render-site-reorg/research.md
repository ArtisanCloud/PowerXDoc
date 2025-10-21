# Phase 0 Research – PowerX Docs Render Site Reorg

## Decision 1: AI驱动白名单发布采用“建议+人工确认”模型
- **Rationale**: Aligns with spec clarifications that AI 需生成发布建议，由人工确认执行，同时允许人工直接处理高风险场景。实现上将 AI 产出保存为 `publish-suggestions.json`，由内容运营在 CLI 中逐条确认或编辑。
- **Alternatives Considered**:
  - 全自动发布：与人工监督目标冲突，无法处理高风险或低信心情况。
  - 纯人工复制：失去提效价值，无法利用 AI 进行批量筛查。

## Decision 2: 目录迁移后本地化脚本统一切换到 `docs/website/`
- **Rationale**: 现有脚本（sync、check-parity、review-guard）只需修改根路径，即可继续镜像 zh-CN → en，并保持 partnerSlug/manifest 逻辑不变。
- **Alternatives Considered**:
  - 重写脚本：成本高且风险大，且现有逻辑已满足需求。
  - 额外维持旧目录：会造成重复维护与混乱。

## Decision 3: 链接与导航校验采用现有 VitePress 构建 + `rg` 链接扫描
- **Rationale**: `vitepress build` 默认会在生成阶段报错缺失文件；配合 `rg "/developer-guides/"` 等模式可快速定位遗留路径，符合快速检测需求。
- **Alternatives Considered**:
  - 引入额外的链接扫描工具：需要额外依赖与配置。
  - 手动检查：效率低、容易遗漏。

## Decision 4: 视觉与结构变更通过新增 mermaid 流程图表达
- **Rationale**: 宪章要求“图文并茂”；利用 `docs/design/render-site-reorg.md` 新增/更新流程图直观呈现从源目录到 AI 发布再到渲染目录的流程。
- **Alternatives Considered**:
  - 纯文字叙述：不符合宪章第四条要求，且不利于跨团队理解。
