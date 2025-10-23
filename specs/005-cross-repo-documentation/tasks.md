# Tasks: PowerXDocs Cross-Repo Documentation Hub

**Input**: Design documents from `/specs/005-cross-repo-documentation/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are included where workflows require validation; they use the Node 18 `node --test` runner.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare the repository for new cross-repo workflows and reporting outputs.

- [x] T001 Update Node engine metadata and add npm scripts (`publish:scenarios`, `publish:usecases`, `publish:standards`, `publish:collected`, `publish:notify`, `test:workflows`) in package.json
- [x] T002 Create reports guidance and placeholder files in reports/README.md and reports/.gitkeep
- [x] T003 Document workflow testing setup with Node's test runner in tests/workflows/README.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish shared data sources and utilities that every workflow depends on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T004 Scaffold central registries in docs/_data/docmap.yaml, docs/_data/repos.yaml, and docs/_data/taxonomy.yaml
- [x] T005 [P] Implement docmap and taxonomy loader utilities with duplicate detection in scripts/lib/docmap-utils.mjs
- [x] T006 [P] Implement Git child_process wrapper for branch, commit, and push operations in scripts/lib/git-utils.mjs
- [x] T007 [P] Implement workflow report writer helpers for JSON emission in scripts/lib/report-writer.mjs
- [x] T008 [P] Implement workflow state ledger and resume-token helpers for idempotent reruns in scripts/lib/workflow-state.mjs
- [x] T009 [P] Write failing shared workflow state tests covering duplicate prevention in tests/workflows/workflow-state.spec.mjs
- [x] T010 Wire up docmap validation CLI using shared utilities in scripts/qa/validate-docmap.mjs

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel.

---

## Phase 3: User Story 1 - Centralize scenario lifecycle (Priority: P1) 🎯 MVP

**Goal**: Allow stewards to validate SCN drafts, enforce required sections, register docmap entries, and publish rendered scenario pages without touching downstream repos.

**Independent Test**: Author a new scenario in docs/scenarios/, register docmap metadata, run the publish CLI, and confirm docs/website/scenarios/ contains the rendered page with child metadata.

### Tests for User Story 1 ⚠️

- [x] T011 [P] [US1] Write failing workflow tests for scenario validation, publish flow, and rerun safety in tests/workflows/publish-scenarios.spec.mjs

### Implementation for User Story 1

- [x] T012 [US1] Implement markdown section/frontmatter parser for SCN templates in scripts/lib/markdown-utils.mjs
- [x] T013 [US1] Implement scenario workflow CLI (validate + publish) writing reports, artifacts, and workflow-state entries in scripts/publish/publish-scenarios.mjs
- [x] T014 [P] [US1] Author canonical scenario template with mandated sections in docs/standards/scenarios/_template.md
- [x] T015 [P] [US1] Document steward workflow and required steps referencing the standards template in docs/scenarios/README.md
- [x] T016 [US1] Update docs/.vitepress/config.mts to surface scenario metadata from docmap and render docs/website/scenarios/**
- [x] T017 [US1] Refresh mermaid architecture flow to include validation, publish, and rerun stages in docs/design/cross-repo-documentation.md
- [x] T018 [US1] Implement rerun guardrails (duplicate detection, resume tokens) for scenario publish CLI in scripts/publish/publish-scenarios.mjs

**Checkpoint**: Scenario lifecycle is fully automated and independently testable.

---

## Phase 4: User Story 2 - Distribute usecase templates to satellite repos (Priority: P2)

**Goal**: Deliver updated usecase templates and standards via pure push workflows that open downstream PRs, log statuses, and support retries and reminders.

**Independent Test**: Modify a seed template, run the push CLI, verify `_from_hub` updates across all repos, inspect generated delivery reports, and ensure unreachable repos can be retried.

### Tests for User Story 2 ⚠️

- [x] T019 [P] [US2] Write failing workflow tests for template distribution happy/error/rerun paths in tests/workflows/push-usecases.spec.mjs
- [x] T020 [P] [US2] Write failing workflow tests for standards distribution behavior and rerun safety in tests/workflows/push-standards.spec.mjs

### Implementation for User Story 2

- [x] T021 [US2] Implement GitHub helper for PR creation and reviewer metadata in scripts/lib/github-utils.mjs
- [x] T022 [US2] Implement usecase push workflow CLI with branch creation, PR opening, reporting, and rerun safeguards in scripts/publish/push-usecases.mjs
- [x] T023 [US2] Implement standards push workflow CLI with read-only path enforcement and rerun safeguards in scripts/publish/push-standards.mjs
- [x] T024 [US2] Implement reviewer reminder workflow honoring 72-hour SLA in scripts/workflows/notify-reviewers.mjs
- [x] T025 [P] [US2] Populate downstream repository metadata for all four targets in docs/_data/repos.yaml
- [x] T026 [US2] Document pure push distribution process, retry strategy, and safety constraints in docs/standards/cli-install-and-naming.md

**Checkpoint**: Template and standards distribution workflows operate independently with retry and reporting support.

---

## Phase 5: User Story 3 - Consume aggregated library for decision making (Priority: P3)

**Goal**: Generate `_collected` stubs and leadership views that expose scope, layer, domain, optionality, and external links without pulling downstream content.

**Independent Test**: Run the collected generator, confirm `_collected` stubs exist per docmap child, and verify the rendered leadership page surfaces metadata badges and external links.

### Tests for User Story 3 ⚠️

- [x] T027 [P] [US3] Write failing workflow tests for collected stub generation, error handling, and rerun safety in tests/workflows/generate-collected.spec.mjs

### Implementation for User Story 3

- [x] T028 [US3] Implement collected stub generation CLI producing docs/website/_collected/**, reports, and rerun safeguards in scripts/publish/generate-collected.mjs
- [x] T029 [P] [US3] Extend docs/.vitepress/config.mts to surface `_collected` metadata with optionality badges
- [x] T030 [US3] Create leadership landing page that lists collected stubs in docs/website/library/index.md
- [x] T031 [P] [US3] Add `_collected` stub template and placeholder keeper in docs/website/_collected/_template.md and docs/website/_collected/.gitkeep
- [x] T032 [US3] Document leadership review workflow and gap analysis steps in docs/guides/Leadership-coverage.md

**Checkpoint**: Leadership can review aggregated coverage without accessing downstream repositories.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final integration, documentation alignment, and validation of the full hub workflows.

- [x] T033 Implement workflow runtime telemetry and SLA verification tooling in scripts/qa/workflow-metrics.mjs
- [x] T034 Run linting and docs build pipelines (`npm run lint`, `npm run docs:build`) and capture results in reports/build.md
- [x] T035 Align quickstart instructions with final CLI signatures in specs/005-cross-repo-documentation/quickstart.md
- [x] T036 Update AGENTS.md with any additional tooling insights discovered during implementation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: Start immediately to register scripts and reporting scaffolds.
- **Phase 2 (Foundational)**: Depends on Phase 1 completion; blocks all user stories.
- **Phase 3 (US1)**: Starts after foundational utilities (including workflow state ledger) exist; delivers MVP.
- **Phase 4 (US2)** & **Phase 5 (US3)**: Both depend on Phase 2 and benefit from outputs of Phase 3 but remain independently testable.
- **Phase 6 (Polish)**: Runs after desired user story phases are complete.

### User Story Dependencies

- **US1 (P1)**: Requires docmap utilities (T005), Git/report helpers (T006–T007), and workflow state ledger (T008–T009).
- **US2 (P2)**: Requires Git/report helpers (T006–T007), workflow state ledger (T008–T009), GitHub utilities (T021), and docmap data (T004–T005); independent of US3.
- **US3 (P3)**: Requires docmap utilities (T005), workflow state ledger (T008–T009), and scenario metadata integration (T016) but does not depend on US2 workflows.

### Within Each User Story

- Tests (e.g., T011, T019, T027) precede CLI implementation to ensure red → green cycles.
- Shared utilities (e.g., T012, T021, T028) must exist before CLI layers that consume them.
- Documentation updates (e.g., T015, T026, T032) follow code changes to remain accurate.
- Rerun safeguards (T018, T022–T023, T028) depend on the shared workflow state ledger (T008–T009).

### Parallel Opportunities

- `T005`, `T006`, `T007`, and `T008` can proceed concurrently once data files (T004) exist.
- After Phase 2, US1 implementation tasks `T012`–`T018` can run alongside US1 documentation tasks `T014`–`T015`.
- US2 test tasks `T019`–`T020` and GitHub utility work `T021` can run in parallel.
- US3 presentation tasks `T029`–`T031` can run concurrently once the generator (T028) stub exists.
- Polish tasks `T033`–`T036` can overlap, provided the repository is in a stable state.

---

## Parallel Example: User Story 1

```bash
# In parallel, write tests and supporting template docs:
Task T011: tests/workflows/publish-scenarios.spec.mjs
Task T014: docs/standards/scenarios/_template.md
Task T015: docs/scenarios/README.md

# Once tests exist, implement CLI and config updates:
Task T012: scripts/lib/markdown-utils.mjs
Task T013: scripts/publish/publish-scenarios.mjs
Task T016: docs/.vitepress/config.mts
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phases 1–2 to establish shared scaffolding.
2. Deliver Phase 3 (US1) to automate scenario validation and publishing.
3. Stop for validation: run T011 tests, execute the publish CLI twice to confirm rerun safety, review generated reports, and demo the rendered scenario pages.

### Incremental Delivery

1. US1 establishes the core scenario pipeline (MVP).
2. US2 layers in template/standards distribution with retry and notification capabilities.
3. US3 adds leadership insights without impacting earlier workflows.
4. After each phase, run the corresponding workflow tests and capture delivery reports.

### Parallel Team Strategy

- Developer A: Focus on scenario lifecycle (T009–T015).
- Developer B: Own distribution workflows and GitHub integration (T016–T023).
- Developer C: Build collected stubs and leadership views (T024–T029).
- Shared resources: Rotate polish tasks (T030–T032) and ensure coordinated merges through generated reports.
