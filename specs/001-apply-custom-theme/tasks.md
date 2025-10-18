# Tasks: VitePress Theme Customization

**Input**: Design documents from `/specs/001-apply-custom-theme/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic theme structure.

- [X] T001 Create the theme directory at `docs/.vitepress/theme`
- [X] T002 Create the theme entry point file at `docs/.vitepress/theme/index.ts`

---

## Phase 2: User Story 1 - Simple CSS Override (Priority: P1) 🎯 MVP

**Goal**: A developer can make simple, site-wide style changes (e.g., colors, fonts) to the VitePress documentation site.

**Independent Test**: A developer can add a CSS rule to `docs/.vitepress/theme/style.css` and see the visual change on the live development server.

### Implementation for User Story 1

- [X] T003 [US1] Create the custom stylesheet at `docs/.vitepress/theme/style.css`
- [X] T004 [US1] Import the stylesheet in `docs/.vitepress/theme/index.ts`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently.

---

## Phase 3: User Story 2 - Custom Homepage Integration (Priority: P2)

**Goal**: A developer can replace the default VitePress homepage with a completely custom Vue component.

**Independent Test**: A developer can configure the theme to use a custom Vue component for the root `index.md`. When visiting the homepage, the custom component is displayed.

### Implementation for User Story 2

- [X] T005 [P] [US2] Create the custom homepage component at `docs/.vitepress/theme/MyAwesomeHome.vue`
- [X] T006 [US2] Register the custom homepage component in `docs/.vitepress/theme/index.ts`
- [X] T007 [US2] Update the frontmatter of `docs/index.md` to use the `home` layout

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories.

- [ ] T008 Add comments to `docs/.vitepress/theme/index.ts` to explain the theme setup.
- [ ] T009 Create a `README.md` in `docs/.vitepress/theme/` to explain the theme structure and customization options.
- [ ] T010 Create a Mermaid diagram in `design/theme-customization-strategy.md` to visualize the theme extension architecture.
- [ ] T011 Measure and compare Lighthouse performance scores before and after theme changes to ensure impact is less than 10%.
- [X] T012 Integrate a local Tailwind/PostCSS build that reuses the PowerXAdmin CSS stack (`tailwind.config.cjs`, `postcss.config.cjs`, `docs/.vitepress/theme/style.css`).
- [X] T013 Expose theme appearance toggle and social link controls on the custom landing navigation (`docs/.vitepress/theme/components/MyAwesomeHome.vue`).
- [X] T014 Align light/dark typography and gradients with PowerXAdmin palette, including shared logo assets (`docs/.vitepress/theme/components/MyAwesomeHome.vue`, `docs/public/images/`).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately.
- **User Stories (Phase 2 & 3)**: Both depend on Setup completion.
- **Polish (Phase 4)**: Depends on all user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Setup. No dependencies on other stories.
- **User Story 2 (P2)**: Can start after Setup. No dependencies on other stories.

### Parallel Opportunities

- Once the Setup phase is complete, User Story 1 and User Story 2 can be implemented in parallel.
- Within User Story 2, task T005 can be done in parallel with the tasks for User Story 1.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: User Story 1
3. **STOP and VALIDATE**: Test User Story 1 independently.

### Incremental Delivery

1. Complete Setup.
2. Add User Story 1 → Test independently (MVP).
3. Add User Story 2 → Test independently.
