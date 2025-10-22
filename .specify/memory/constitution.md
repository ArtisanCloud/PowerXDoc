<!--
SYNC IMPACT REPORT
- Version Change: (initial adoption) -> 1.0.0
- Added Principles:
  - I. Role-Driven (角色驱动)
  - II. Concept-First (概念先行)
  - III. Structure-Oriented (结构至上)
  - IV. Clarity through Visualization (图文并茂)
- Added Sections:
  - Content & Style Guide
  - Governance & Maintenance
- Templates Requiring Updates:
  - ⚠ pending: .specify/templates/plan-template.md (to add specific constitution checks)
- Follow-up TODOs:
  - TODO(RATIFICATION_DATE): Set the official date of adoption.
-->
# PowerX Documentation Constitution

## Core Principles

### I. Role-Driven (角色驱动)

The implementation plan MUST identify the target user roles for the feature. All feature documentation (e.g., quickstart guides, tutorials) MUST be written from the perspective of one of these primary roles to ensure relevance and clarity.

### II. Concept-First (概念先行)

The implementation plan MUST include tasks for creating or updating high-level overview documents before tasks for detailing technical specifications. Users must be able to understand the "what" and "why" before the "how".

### III. Structure-Oriented (结构至上)

All new documentation artifacts MUST adhere to the established structural templates. The plan MUST list which documents will be created or updated and confirm they will follow the standard, predictable structure for that document type.

### IV. Clarity through Visualization (图文并茂)

For any feature involving new architecture, complex data flows, or multi-step user processes, the implementation plan MUST include a task to create or update a `mermaid` diagram to visually represent it.

## Content & Style Guide

- **Source of Truth:** All documentation content MUST originate from the `docs/standards/` directory as the single, authoritative source. The website is a curated presentation of this source.
- **Tone of Voice:** The tone MUST be professional and precise, using clear, unambiguous technical language. Key terms (e.g., Capability, Transport, Orchestrator) MUST be used consistently throughout the documentation. A global glossary is recommended.
- **Structural Template:**
  - Module Overviews MUST include: 'Positioning & Goals', 'Core Capabilities', 'Architecture Diagram', and 'Related Links'.
  - Technical Specifications MUST include: 'Background', 'Design', 'API/Model Definition', and 'Usage Examples'.
- **Theme Implementation:** Shared visual systems (Tailwind utility layers, PowerXAdmin CSS, brand assets) MUST be imported locally in the docs build; external CDNs are forbidden for core styling. Light and dark themes MUST be validated for WCAG AA contrast, and navigation MUST expose the global appearance toggle.

## Governance & Maintenance

- **Content Updates:** The documentation website MUST be synchronized with any changes to the `docs/standards/` source files.
- **Structural Evolution:** Significant structural changes (e.g., adding a new top-level navigation item) MUST be discussed and approved by the team to ensure alignment with the Role-Driven and Concept-First principles.
- **Proposal-Driven Changes:** Major new architectures or specifications MUST be documented and reviewed via the PXIP (PowerX Integration Proposal) process before being formally incorporated into the documentation.
- **Versioning Policy:** This constitution follows Semantic Versioning (MAJOR.MINOR.PATCH).
  - **MAJOR:** Backward-incompatible changes, principle removals, or major redefinitions.
  - **MINOR:** New principles added or significant expansions to existing guidance.
  - **PATCH:** Clarifications, wording adjustments, and non-semantic typo fixes.

## PowerXDocs 统一规章

- **适用范围:** 本规章适用于 PowerXDocs 及由其向 PowerX、PowerXAdmin、PowerXPlugin、PowerXMarketplace 等仓分发的所有文档与 CLI 规范，渲染入口固定为 `docs/website/`。
- **核心原则:** 必须遵循本宪章中的角色驱动、概念先行、结构至上、图文并茂原则；所有内容以 `docs/standards/` 为唯一源，保持专业、精准的术语体系。
- **结构要求:** 模块与技术文档需遵循标准模板（如 Positioning & Goals、Architecture Diagram、Background、Design 等），PXIP 级变更须先经提案流程批准。
- **跨仓协同:** 依照 `docs/design/cross-repo-documentation.md`，PowerXDocs 作为聚合中心以纯 push 模式下发主用例、子用例模板及规范，各仓在 `docs/use_cases/<layer>/<domain>/` 下撰写自有文档，并按 Layer 与 Domain 分类。
- **分发机制:** 使用 `scripts/push-usecases.sh` 向各仓 `_from_hub/` 下发子用例模板，`scripts/push-standards.sh` 下发统一规范；`_collected` 仅作聚合缓存，不从外仓拉取；仅 `docs/website/**` 参与构建与发布。
- **CLI 规范:** CLI 二进制命名遵循 `px-<scope>`，PX 主 CLI 为 `px`；各仓 `cmd/<binary>/` 作为 `go install` 入口，须提供统一版本输出、`--version`、`--help` 及 `PX_CI`/`--ci` 选项，并支持 Go ≥ 1.21 及 GitHub Releases 安装路径。
- **可视化与本地化:** 涉及复杂架构的文档必须附带 `mermaid` 图示；VitePress 构建需满足中英双语与 TailwindCSS 本地加载，禁止外部 CDN。
- **维护与版本:** 文档更新必须同步回源仓；结构调整需团队共识；规章遵循语义化版本，重大改动按 MAJOR，所有日期需同步更新。

**Version**: 1.0.0 | **Ratified**: TODO(RATIFICATION_DATE): Set the official date of adoption. | **Last Amended**: 2025-10-17
