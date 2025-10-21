# Feature Specification: PowerX Docs Render Site Reorg

**Feature Branch**: `[004-render-site-reorg]`  
**Created**: 2025-10-21  
**Status**: Draft  
**Input**: User description: "根据文档 render-site-reorg.md 实现"

## Clarifications

### Session 2025-10-21

- Q: PowerX 文档白名单发布流程要如何在 `docs/website/` 中落地？ → A: D（AI驱动）
- Q: AI驱动的白名单发布流程需要怎样的人工参与程度？ → A: B（AI生成发布建议，须人工确认后执行）
- Q: 当 AI 发布建议信心不足或评估为高风险时，流程应如何处理？ → A: D（人工直接调整）
- Q: AI 发布建议与人工确认流程需要怎样的审计记录？ → A: C（沿用现有站点日志）

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Keep rendering tree scoped to `docs/website/` (Priority: P1)

As a documentation platform maintainer, I want all renderable content to live under `docs/website/` while source materials stay outside the render tree so that site builds only ship approved, curated pages.

**Why this priority**: Establishes the new architecture foundation and prevents unvetted content from leaking into the public site.

**Independent Test**: Run the site build and verify that only files within `docs/website/` are emitted to the static output while upstream source directories remain untouched.

**Acceptance Scenarios**:

1. **Given** the repository with the restructured directories, **When** the maintainer runs the default site build command, **Then** the build pipeline reads markdown and assets exclusively from `docs/website/`.
2. **Given** a markdown file stored outside `docs/website/`, **When** the site build executes, **Then** the file is not present in the generated static site unless explicitly copied into `docs/website/`.

---

### User Story 2 - Preserve locale parity after directory move (Priority: P2)

As a localization lead, I need every existing locale mapping, review banner, and manifest entry to continue working after the directory migration so that bilingual navigation remains accurate without rework.

**Why this priority**: Localization is already live; broken mappings would surface as immediate user-facing regressions.

**Independent Test**: Execute localization validation scripts to confirm manifests, partner slugs, and review statuses continue to resolve between the zh-CN source and the mirrored locale within the new structure.

**Acceptance Scenarios**:

1. **Given** the updated manifest in the new directory, **When** localization health checks run, **Then** they report all expected pages with valid partner slugs and review statuses.
2. **Given** a visitor switching to the English locale, **When** they navigate via the site UI, **Then** locale-prefixed routes resolve without 404 errors.

---

### User Story 3 - Curate publication whitelist from source repos (Priority: P3)

As a content operations manager, I want a simple publishing workflow that copies or links approved source documents into `docs/website/` so that only vetted material appears on the public site.

**Why this priority**: Enables incremental adoption of the new structure without blocking teams that manage source directories outside the render tree.

**Independent Test**: Perform a staging publish by copying a single approved source file into the render directory and verify it appears in navigation while non-whitelisted files remain hidden.

**Acceptance Scenarios**:

1. **Given** a list of approved source files, **When** the operations manager copies them into the designated subdirectories in `docs/website/`, **Then** the next site build exposes only those files in navigation and search.
2. **Given** a source file that has not been approved, **When** it stays outside the render directory, **Then** it does not appear on the built site and no dead links reference it.

---

### Edge Cases

- Source directory contains stale symbolic links that point into removed locations — the build must either warn maintainers or skip them without failing.
- Localization sync runs before content is approved — placeholders must not automatically surface in navigation unless moved into the render tree.
- Contributors reference absolute paths from pre-migration structure — internal link validation must flag outdated references so they can be corrected.
- AI 发布建议被标记为低信心或高风险时，流程需允许人工直接接管并手动完成目录调整。
- 审计记录沿用现有站点日志能力，不新增专门的发布日志方案。

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The documentation site MUST use `docs/website/` as the sole render root for markdown, locale content, and static assets.
- **FR-002**: Source-of-truth directories (e.g., standards, scenarios, analysis) MUST remain adjacent to `docs/website/` and be excluded from automatic rendering until explicitly whitelisted.
- **FR-003**: Navigation metadata (nav, sidebar, footer, homepage CTAs) MUST reference the new `docs/website/` paths to prevent broken links.
- **FR-004**: Localization manifests, partner slugs, and review workflows MUST continue to operate after the directory move without requiring translators to duplicate work.
- **FR-005**: Build and preview commands (`docs:dev`, `docs:build`, `docs:preview`) MUST succeed without additional configuration after the restructure.
- **FR-006**: Publishing workflows MUST define how approved content is copied or linked into `docs/website/` and document the whitelist process for operations teams.
- **FR-007**: Validation tooling MUST detect references to deprecated paths and report them before release.
- **FR-008**: The whitelist publish flow MUST employ an AI驱动 automation step that reviews approvals and orchestrates moving vetted files into `docs/website/`, while requiring human confirmation of the AI发布建议 before execution.
- **FR-009**: When the AI发布建议被标记为低信心或高风险，系统 MUST 允许运营人员直接接管并手动完成渲染目录调整，不得强制执行自动化步骤。
- **FR-010**: The AI发布建议与人工确认流程 MUST rely on现有站点日志 for auditing, without introducing a separate logging subsystem.

### Key Entities *(include if feature involves data)*

- **Render Tree (`docs/website/`)**: The curated directory containing markdown, localized content, and assets that are eligible for build pipelines and deployment.
- **Source Collections**: Directories that store draft, analytical, or governance content (e.g., `docs/standards/`, `docs/scenarios/`) maintained outside the render tree until approved.
- **Localization Manifest**: Metadata store mapping render-tree routes to localized counterparts and review statuses, used to gate language toggles and review banners.

## Dependencies & Assumptions

- Existing VitePress build commands (`docs:dev`, `docs:build`, `docs:preview`) remain the canonical tooling and can be pointed at the new render directory without additional infrastructure.
- Localization automation (sync, parity, review guard scripts) can be reconfigured to read from the new directory structure without rewriting their core logic.
- Content operations have authority to approve and copy source files into the render tree and will maintain the whitelist process as part of release governance.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A full site build completes with only content from `docs/website/` deployed, and no regressions in existing locale routes (zero 404s in smoke test).
- **SC-002**: Localization health checks pass on first run after migration, confirming 100% of previously mirrored zh-CN pages maintain valid partner slugs and statuses.
- **SC-003**: Internal link validator reports zero references to the old render paths before public release.
- **SC-004**: Operations team can publish a vetted page through the whitelist workflow in ≤30 minutes end-to-end, measured from approval to appearance on staging.
