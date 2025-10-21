# Tasks: PowerX Docs Render Site Reorg

**Input**: Design documents from `/specs/004-render-site-reorg/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Align team on scope, tooling, and baseline artifacts.

- [X] T001 Review feature scope and acceptance criteria in specs/004-render-site-reorg/spec.md and plan.md
- [X] T002 [P] Verify Node.js/Tailwind/VitePress dependencies in package.json and package-lock.json match plan assumptions
- [X] T003 [P] Capture baseline docs tree snapshot notes in docs/design/render-site-reorg.md before migration

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish the new render root and baseline configuration required by all user stories.

- [X] T004 Create docs/website/ skeleton (index.md placeholders, public/, _mount/) per architecture in docs/design/render-site-reorg.md
- [X] T005 Update docs/.vitepress/config.mts to use `srcDir: 'website'` and adjust `publicDir`/nav defaults
- [X] T006 Ensure docs build scripts in package.json (`docs:dev`, `docs:build`, `docs:preview`) still target docs/ after srcDir change

**Checkpoint**: New render root scaffolded, VitePress aware of docs/website/.

---

## Phase 3: User Story 1 - Keep rendering tree scoped to `docs/website/` (Priority: P1) 🎯 MVP

**Goal**: All renderable content and navigation reference `docs/website/` while source directories remain non-rendered.

**Independent Test**: `npm run docs:build` emits pages solely from docs/website/; moving a markdown file outside docs/website/ does not affect the build output.

### Implementation

- [X] T007 [US1] Relocate renderable directories (core-concepts, guides, api-and-specifications, security-and-governance, localization, en, public, index.md) into docs/website/ following the mapping in docs/design/render-site-reorg.md
- [X] T008 [P] [US1] Update docs/.vitepress/theme/components/FooterBar.vue links to the new `/guides/` and related routes
- [X] T009 [P] [US1] Update docs/.vitepress/theme/components/MyAwesomeHome.vue CTA routes to the `/guides/` paths
- [X] T010 [US1] Implement FR-007 by adding scripts/qa/verify-links.mjs to detect residual `/developer-guides/` or root docs references
- [X] T011 [US1] Document the final layout and before/after diff in docs/design/render-site-reorg.md after migration
- [X] T012 [US1] Validate restructure via `npm run docs:build` and `npm run lint`, recording outcomes in specs/004-render-site-reorg/quickstart.md

**Checkpoint**: Render tree isolated to docs/website/, navigation updated, link verifier in place.

---

## Phase 4: User Story 2 - Preserve locale parity after directory move (Priority: P2)

**Goal**: Localization pipelines continue to mirror zh-CN to en-US without regression.

**Independent Test**: Running localization sync, parity, and review guard scripts succeeds and reports zero missing partners after migration.

### Implementation

- [X] T013 [US2] Rewrite docs/website/localization/manifest.json slugs and partnerSlug entries to match new docs/website/ routes
- [X] T014 [P] [US2] Point scripts/localization/sync-locales.mjs and scripts/localization/sync-locales.ts to the docs/website root paths
- [X] T015 [P] [US2] Update scripts/localization/check-parity.mjs and scripts/localization/check-parity.ts for docs/website/
- [X] T016 [P] [US2] Update scripts/localization/review-guard.mjs, review-guard.ts, assert-zh-default.mjs, assert-zh-default.ts, and measure-switch.* to respect the new directories
- [X] T017 [US2] Execute localization sync/parity/review guard and log results plus troubleshooting steps in specs/004-render-site-reorg/quickstart.md

**Checkpoint**: Localization automation succeeds end-to-end with the new render root.

---

## Phase 5: User Story 3 - Curate publication whitelist from source repos (Priority: P3)

**Goal**: AI-driven workflow produces publish suggestions, enforces human confirmation, and applies whitelisted files into docs/website/.

**Independent Test**: Running the new CLI pipeline generats suggestions, allows manual overrides for high-risk items, and copies approved files into docs/website/ while logging to existing audit channels.

### Implementation

- [X] T018 [US3] Scaffold scripts/publish/generate-suggestions.mjs to parse approved source files and emit PublishSuggestion objects per contracts/publish-api.yaml
- [X] T019 [P] [US3] Build interactive reviewer CLI scripts/publish/review-suggestions.mjs to confirm/dismiss/manual suggestions with confidence and risk handling
- [X] T020 [P] [US3] Implement scripts/publish/apply-suggestions.mjs that copies vetted files into docs/website/ and updates checksums
- [X] T021 [US3] Integrate existing logging/audit hooks within scripts/publish/apply-suggestions.mjs so decisions reuse current site logs (FR-010)
- [X] T022 [US3] Update docs/website/_mount/README.md and specs/004-render-site-reorg/quickstart.md with AI发布建议→人工确认流程 including manual override steps

**Checkpoint**: AI-assisted publish pipeline ready with human-in-the-loop confirmation and audit coverage.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final documentation, visualization, and quality sweeps spanning all stories.

- [X] T023 [P] Update docs/design/render-site-reorg.md mermaid diagrams to show source → AI suggestion → publish → docs/website flow (constitution IV)
- [X] T024 [P] Refresh AGENTS.md and related onboarding notes with new tooling references post-implementation
- [X] T025 Run scripts/qa/verify-links.mjs, localization scripts, and `npm run docs:build` as a release gate; capture summary in specs/004-render-site-reorg/quickstart.md

---

## Dependencies & Execution Order

- Phase 1 must complete before any structural changes.
- Phase 2 establishes the docs/website root; all user stories depend on it.
- User Story 1 (Phase 3) delivers the MVP and unlocks later stories.
- User Story 2 (Phase 4) depends on the migrated tree from US1.
- User Story 3 (Phase 5) depends on both the new render tree and validated localization scripts.
- Polish phase runs after desired user stories are complete.

### Parallel Opportunities

- T002 and T003 can run in parallel after T001.
- Within Phase 3, T008 and T009 can run concurrently after the relocation work starts.
- Phase 4 tasks T014–T016 are parallelizable across script files.
- Phase 5 tasks T019 and T020 can proceed in parallel once T018 scaffolds shared data structures.
- Polish tasks T023 and T024 are parallel-friendly.

### Implementation Strategy

1. Deliver MVP by completing Phases 1–3 and validating the new render tree.
2. Add localization validation (Phase 4) to maintain bilingual coverage.
3. Implement AI-driven publish flow (Phase 5) for operational efficiency.
4. Finish with visualization and release gates (Phase 6).
