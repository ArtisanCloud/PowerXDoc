# Implementation Plan: Apply Custom Theme

**Branch**: `001-apply-custom-theme` | **Date**: 2025-03-06 | **Spec**: `specs/001-apply-custom-theme/spec.md`
**Input**: Feature specification and research collateral under `specs/001-apply-custom-theme/`

## Summary

Extend the VitePress default theme to deliver a bespoke PowerX-branded landing page while retaining the stock documentation experience for all other routes. The plan introduces a local Tailwind/PostCSS toolchain that reuses the existing PowerXAdmin style sheets, swaps the homepage layout based on frontmatter, and exposes shared navigation elements (appearance toggle, GitHub link, logo) so the docs site mirrors the admin product identity.

## Technical Context

**Language/Version**: TypeScript
**Primary Dependencies**: VitePress, Vue.js, Tailwind CSS (local build), PostCSS/Autoprefixer
**Storage**: N/A
**Testing**: Manual verification via `vitepress dev`; automated visual/perf tests TBD
**Target Platform**: Web
**Project Type**: Web Application
**Performance Goals**: Lighthouse regression < 10% from baseline once instrumentation is in place.
**Constraints**:
- Build must fail if the custom landing component is missing.
- Docs build must succeed offline; CDN CSS links are disallowed in favour of local tooling.
- Light/dark themes must maintain WCAG AA contrast for primary text.
**Scale/Scope**: Introduces one custom landing component, supporting assets (logo, shared CSS), Tailwind build config, and targeted nav enhancements.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Role-Driven (角色驱动)**: **PASS**. The target user role for this feature is the **Developer**. The implementation plan includes a `quickstart.md` guide specifically tailored to this role.
- **II. Concept-First (概念先行)**: **PASS**. The plan prioritizes creating high-level design and strategy documents (`theme-customization-strategy.md`, `sidebar-structure.md`) before implementation details.
- **III. Structure-Oriented (结构至上)**: **PASS**. All new documentation artifacts (`research.md`, `data-model.md`, etc.) will be created according to the predefined templates and structure outlined in this plan.
- **IV. Clarity through Visualization (图文并茂)**: **PASS**. The plan will include a task to create a `mermaid` diagram to visually explain the theme extension architecture, showing how custom components override the default theme.

## Project Structure

### Documentation (this feature)

```
specs/001-apply-custom-theme/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```
docs/
├── .vitepress/
│   ├── theme/
│   │   ├── index.ts         # Theme extension entry point
│   │   ├── style.css        # Shared Tailwind + PowerXAdmin imports
│   │   ├── tailwind.css     # Tailwind layer directives
│   │   └── components/
│   │       ├── MyAwesomeHome.vue  # PowerX landing page
│   │       └── FooterBar.vue      # Shared footer
│   └── config.mts           # VitePress configuration
├── index.md                 # Homepage frontmatter selects landing layout
└── public/images/           # Shared logo assets (logo-m.png, etc.)
```

**Structure Decision**: The project is a web application built with VitePress. The source code structure is based on VitePress conventions, with theme customizations located in the `docs/.vitepress/theme` directory. This structure is chosen to align with the framework's requirements for extending the default theme.

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
