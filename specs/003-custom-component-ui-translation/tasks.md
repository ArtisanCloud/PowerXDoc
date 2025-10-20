# Task List: Custom Component UI Translation

**Branch**: `003-custom-component-ui-translation` | **Date**: 2025-10-20 | **Spec**: [./spec.md](./spec.md)

This task list is generated from the implementation plan and design artifacts. It is organized by phase and user story to facilitate parallel work and incremental, testable delivery.

## Phase 1: Setup

These tasks initialize the project dependencies and file structure.

- [ ] T001 Install `vue-i18n` library via `pnpm add vue-i18n`
- [ ] T002 Create the locales directory at `docs/.vitepress/theme/locales`
- [ ] T003 [P] Create the English locale file at `docs/.vitepress/theme/locales/en-US.ts`
- [ ] T004 [P] Create the Chinese locale file at `docs/.vitepress/theme/locales/zh-CN.ts`

## Phase 2: Foundational

This phase establishes the core `vue-i18n` integration, which is a prerequisite for all other tasks.

- [ ] T005 Configure the `vue-i18n` instance and install it as a plugin in the VitePress app at `docs/.vitepress/theme/index.ts`

## Phase 3: User Story 1 (Developer Refactor)

**Goal**: Refactor an existing Vue component to use the centralized translation system.
**Independent Test**: Verify that `MyAwesomeHome.vue` no longer contains hardcoded strings and renders the correct language based on user selection.

- [ ] T006 [P] [US1] Populate the English locale file with translations for `MyAwesomeHome.vue` in `docs/.vitepress/theme/locales/en-US.ts`
- [ ] T007 [P] [US1] Populate the Chinese locale file with translations for `MyAwesomeHome.vue` in `docs/.vitepress/theme/locales/zh-CN.ts`
- [ ] T008 [US1] Create a placeholder component `MyAwesomeHome.vue` with hardcoded text strings in `docs/.vitepress/theme/components/MyAwesomeHome.vue`
- [ ] T009 [US1] Refactor the `MyAwesomeHome.vue` component to use the `useI18n` composable and remove all hardcoded strings in `docs/.vitepress/theme/components/MyAwesomeHome.vue`

## Phase 4: User Story 2 (Content Manager Workflow)

**Goal**: Enable a non-developer to update UI text by editing a locale file.
**Independent Test**: Change a string in `locales/en-US.ts` and confirm the change is reflected on the site without any code modifications.

- [ ] T010 [US2] Verify the content manager workflow by modifying a string in `docs/.vitepress/theme/locales/en-US.ts` and confirming the live site updates as expected.
- [ ] T011 [US2] Add a section to the `quickstart.md` guide for the "Content Manager" role, explaining how to update text, in `specs/003-custom-component-ui-translation/quickstart.md`

## Phase 5: Polish & Finalization

- [ ] T012 Review all modified files for code quality, consistency, and formatting.
- [ ] T013 [US1] Verify that the production JavaScript bundle size increase is less than 1% as per SC-004.
- [ ] T014 Mark this feature as complete and merge the branch.

---

## Dependencies & Parallel Execution

- **Dependency Graph**: `Phase 1` → `Phase 2` → (`Phase 3 (US1)` | `Phase 4 (US2)`) → `Phase 5`
  - Phase 2 is blocked by Phase 1.
  - Phases 3 and 4 are blocked by Phase 2.
  - Phases 3 and 4 can be worked on in parallel after Phase 2 is complete.

- **Parallel Opportunities**:
  - **Phase 1**: `T003` and `T004` can be done in parallel.
  - **Phase 3**: `T006` and `T007` can be done in parallel.

## Implementation Strategy

- **MVP Scope**: The Minimum Viable Product consists of completing Phase 1, Phase 2, and Phase 3 (User Story 1). This delivers the core functionality of a fully refactored, translatable component.
- **Incremental Delivery**: User Story 2 (Phase 4) can be considered a fast-follow, as it primarily involves verifying and documenting the workflow established by the MVP.
