# Feature Specification: PowerXDocs Cross-Repo Documentation Hub

**Feature Branch**: `005-cross-repo-documentation`  
**Created**: 2025-10-22  
**Status**: Draft  
**Input**: User description: "Cross-repo documentation hub for PowerXDoc centralizing scenario sources, usecase template distribution, and standards synchronization per docs/design/cross-repo-documentation.md."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Centralize scenario lifecycle (Priority: P1)

Documentation steward uses PowerXDocs to author a new cross-repo scenario (SCN), ensure it has the prescribed sections, register it in `docmap.yaml`, and publish the rendered page under `docs/website/scenarios/**` without manually touching consuming repos.

**Why this priority**: The scenario catalogue is the backbone for cross-repo alignment; without a reliable way to author and publish SCNs the entire documentation hub fails.

**Independent Test**: Create a new SCN draft, register it in `docmap.yaml`, run the approved publication workflow, and confirm the rendered site shows the scenario with correct metadata and child links.

**Acceptance Scenarios**:

1. **Given** a steward has authored `docs/scenarios/SCN-NEW-001.md`, **When** they register it in `docs/_data/docmap.yaml` and execute the publication workflow, **Then** the rendered site produces `docs/website/scenarios/SCN-NEW-001.md` with the mandated content blocks.
2. **Given** the steward omits a required section (e.g., Acceptance Criteria), **When** validation runs, **Then** the system flags the omission before publication.

---

### User Story 2 - Distribute usecase templates to satellite repos (Priority: P2)

Documentation operations engineer triggers the pure push pipeline so that template updates from `docs/usecases-seeds/**` propagate to the `_from_hub/` directories inside PowerX, PowerXAdmin, PowerXPlugin, and PowerXMarketplace repositories without overwriting local author-owned content.

**Why this priority**: Timely distribution of updated templates keeps satellite teams aligned with the scenario structure and layer/domain taxonomy.

**Independent Test**: Update a seed template, run the push workflow, and verify each target repo receives the new template in the correct layer/domain path while preserving locally owned files.

**Acceptance Scenarios**:

1. **Given** a revised template exists under `docs/usecases-seeds/powerx-backend/service/publish/PX-PUBLISH-002.md`, **When** the push workflow runs, **Then** `docs/use_cases/_from_hub/service/publish/PX-PUBLISH-002.md` is updated in the PowerX repository and a delivery report lists the affected repos.
2. **Given** a repo is temporarily unavailable, **When** the push workflow runs, **Then** the system records the failed delivery and provides a retry path without blocking other repos.

---

### User Story 3 - Consume aggregated library for decision making (Priority: P3)

Product leadership reviews the aggregated scenario library and `_collected` stubs to understand coverage across layers and domains, using metadata to identify gaps without needing access to individual code repositories.

**Why this priority**: Leadership needs a consolidated view to plan roadmap work, compliance checks, and AI-assisted authoring priorities.

**Independent Test**: Generate `_collected` stubs from `docmap.yaml`, load the rendered site, and confirm that each scenario exposes child cards with accurate metadata, external links, and optional indicators.

**Acceptance Scenarios**:

1. **Given** `_collected` was regenerated after docmap changes, **When** leadership inspects the scenario page, **Then** each child card shows scope, layer, domain, optionality, and an external Git link consistent with repo metadata.
2. **Given** a scenario child is marked `optional: true`, **When** the rendered page loads, **Then** the UI clearly communicates the optional status and the stub exists even if the downstream repo has no authored content yet.

### Edge Cases

- Missing `docmap.yaml` entry for an SCN draft must block publication and surface a clear remediation message.
- Target repository declared in `repos.yaml` is unreachable or has read-only permissions; distribution workflow must log the failure and support deferred retry without corrupting other deliveries.
- Duplicate `doc_id` or `scn_id` detected across scenarios or templates must fail validation and require the steward to resolve naming conflicts before proceeding.
- `_collected` stub generation encounters an undefined scope/layer/domain combination; workflow must halt and highlight the misconfigured taxonomy.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: PowerXDocs MUST mandate that every scenario draft resides in `docs/scenarios/SCN-*.md` and includes the standardized sections defined in the scenario template.
- **FR-002**: The system MUST require each published scenario to have a matching entry in `docs/_data/docmap.yaml` capturing scope, layer, domain, repo, path, title, ordering, and optionality.
- **FR-003**: The publication workflow MUST generate rendered scenario pages under `docs/website/scenarios/**` from the drafts and docmap metadata without manual edits.
- **FR-004**: `_collected` stub generation MUST produce one placeholder per docmap child that links to the authoritative external repository without performing network pulls, and MUST halt with an error report if the configured repository path or name is invalid or unavailable.
- **FR-005**: The usecase seed distribution workflow MUST push updated templates from `docs/usecases-seeds/<scope>/<layer>/<domain>/` to each repo’s `docs/use_cases/_from_hub/<layer>/<domain>/` directory while leaving author-owned paths untouched, and MUST do so via auto-created feature branches with Pull Requests for downstream review.
- **FR-006**: Standards distribution MUST deliver `docs/standards/**` content to downstream repos in read-only form to maintain consistent governance language, also using dedicated branches and Pull Requests rather than direct commits.
- **FR-007**: All workflows MUST emit delivery and validation reports summarizing files touched, successes, failures, and outstanding retries so stewards can track compliance.
- **FR-008**: The taxonomy of scopes, layers, and domains MUST be validated against an allowed list and surfaced in the rendered UI to ensure consistent navigation.
- **FR-009**: The system MUST block publication if duplicate `doc_id`, `scn_id`, or conflicting repo paths are detected across docmap, scenarios, or seed templates.
- **FR-010**: The documentation hub MUST provide a recovery path that allows rerunning any workflow without producing duplicate files or overwriting independent downstream contributions.
- **FR-011**: Distribution workflows MUST send automated reminders to downstream reviewers when Pull Requests remain unmerged after 72 hours while leaving final merge control to the repository maintainers.

### Key Entities *(include if feature involves data)*

- **Scenario (SCN)**: Canonical cross-repo narrative identified by `scn_id`, authored in `docs/scenarios/`, rendered under `docs/website/scenarios/`, and mapped to child usecases via `docmap.yaml`.
- **Usecase Template**: Seed document housed in `docs/usecases-seeds/<scope>/<layer>/<domain>/`, versioned by doc ID, and distributed to downstream repos’ `_from_hub` directories.
- **Repository Profile**: Entry in `docs/_data/repos.yaml` providing repo identifier, web base URL, default branch, and delivery paths used by push workflows and stub generation.
- **Collected Stub**: Placeholder markdown stored in `docs/website/_collected/<scope>/<layer>/<domain>/`, containing metadata and external links for leadership review without fetching remote content.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of newly authored scenarios appear on the rendered site with complete metadata within one business day of registration in `docmap.yaml`.
- **SC-002**: Usecase seed updates reach all four downstream repositories within two successful push attempts, with delivery status reported for each repo on completion.
- **SC-003**: Leadership can identify layer/domain coverage gaps in under five minutes by reviewing `_collected` cards, as validated through user acceptance testing.
- **SC-004**: Publication validation blocks release when structural requirements are unmet, reducing post-release documentation defects related to SCN structure by at least 80% compared with the previous workflow.
- **SC-005**: No more than 5% of push operations require manual rollback due to unintended overwrites or duplicated files during a rolling 90-day period.

## Assumptions

- Documentation stewards and operations engineers have authenticated Git access to PowerXDocs and the downstream repositories when executing push workflows.
- Downstream repositories honor the read-only contract for `_from_hub` and `docs/standards` paths, with ownership boundaries communicated to their maintainers.
- The taxonomy for scopes, layers, and domains is centrally maintained and versioned alongside the docmap to avoid conflicting interpretations across teams.

## Clarifications

### Session 2025-10-22

- Q: 分发标准与用例模板的 Push 工作流在各下游仓库执行时，最终交付形态应该是哪一种？ → A: 选项 B（创建独立分支与 Pull Request，由下游维护者合并）
- Q: 当向下游仓库提交分发用的 Pull Request 后，如果在约定时间内仍未被合并，应采用哪种处理策略？ → A: 选项 A（72 小时后自动提醒一次并继续等待人工处理）
- Q: 在 `_collected` 占位生成流程中，如果 `docmap.yaml` 指向的外部仓库路径发生变更（例如仓库改名），系统应该怎样处理？ → A: 选项 B（立即停止并在报告中标记为错误，等待 steward 修复）
