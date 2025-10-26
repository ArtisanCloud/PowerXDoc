# Data Model — PowerXDocs Cross-Repo Hub

## Scenario (`docs/scenarios/SCN-*.md`)
- **Fields**
  - `scn_id` (string; format `SCN-[DOMAIN]-[NNN]`; unique)
  - `title` (string; human-readable scenario name)
  - `layers` (array<string>; layered coverage from docmap)
  - `domains` (array<string>; business domain tags)
  - `status` (enum: `Draft`, `Registered`, `Published`)
  - `required_sections` (array<string>; enforced by scenario template)
  - `optional_sections` (array<string>; optional template blocks)
  - `mermaid_diagrams` (array<string>; fenced mermaid code blocks)
  - `last_validated_at` (datetime; set on successful validation)
- **Relationships**
  - Has one `DocmapEntry` (1:1) keyed by `scn_id`
  - Links to many `UsecaseTemplate` records via docmap children
  - Generates one `RenderedScenario` under `docs/website/scenarios/**`
- **Validation Rules**
  - `scn_id` must be unique and match regex `^SCN-[A-Z0-9-]+-\d{3}$`
  - Required sections: Introduction, Positioning & Goals, Acceptance Criteria, Validation Workflow, Related Links
  - Must include at least one mermaid diagram when layers > 1 or domains > 1
- **State Transitions**
  - `Draft` → `Registered`: steward registers entry in docmap, validation passes for required sections
  - `Registered` → `Published`: publication workflow renders scenario and writes delivery report
  - `Published` → `Draft`: steward revises content; triggers re-validation

## Docmap Entry (`docs/_data/docmap.yaml`)
- **Fields**
  - `scn_id` (string; FK to Scenario)
  - `doc_id` (string; unique child identifier for usecases)
  - `title` (string)
  - `scope` (enum: `powerx`, `powerx-plugin`, `powerx-marketplace`)
  - `layer` (enum; e.g., `service`, `ui`, `api`, `ops`, `repo`, `proto`, `domain`)
  - `domain` (string; validated against taxonomy)
  - `repo` (string; FK to RepositoryProfile.key)
  - `path` (string; downstream target relative path)
  - `optional` (boolean; default `false`)
  - `ordering` (integer; controls rendered card order)
- **Relationships**
  - Belongs to `Scenario`
  - References one `RepositoryProfile`
  - Drives generation of `CollectedStub` artifacts
- **Validation Rules**
  - (`scn_id`, `doc_id`) must be unique pairs
  - `path` must live under `_from_hub/` for seed distributions
  - Missing or unreachable repository/profile halts workflow with error

## Usecase Template (`docs/usecases-seeds/<scope>/<layer>/<domain>/*.md`)
- **Fields**
  - `doc_id` (string; unique; matches header frontmatter)
  - `scn_id` (string; FK to Scenario)
  - `repo_key` (string; matches `RepositoryProfile.key`)
  - `layer` (string; validated as in docmap)
  - `domain` (string; validated as in docmap)
  - `version` (string; semantic version of template)
  - `status` (enum: `Draft`, `Approved`)
  - `content_hash` (string; computed for change detection)
  - `last_distributed_at` (datetime; per repository)
- **Relationships**
  - References `Scenario` through `scn_id`
  - On distribution, creates or updates downstream `_from_hub` copies via `DistributionRecord`
- **Validation Rules**
  - Must include standard frontmatter fields defined in scenario standards
  - Template path must mirror taxonomy directory (scope/layer/domain)
  - Content hash diff must be recorded for audit trail

## Repository Profile (`docs/_data/repos.yaml`)
- **Fields**
  - `key` (string; unique identifier e.g., `powerx`)
  - `display_name` (string)
  - `git_url` (string; SSH/HTTPS remote URL)
  - `default_branch` (string; e.g., `main`)
  - `runners` (array<string>; optional automation contexts)
  - `paths` (object; includes `usecase_seed_root`, `standards_root`)
- **Relationships**
  - Referenced by `DocmapEntry`, `DistributionRecord`
  - Drives branch naming and PR metadata during push workflows
- **Validation Rules**
  - `git_url` must be reachable; unreachable repos recorded as failures
  - Paths must guarantee `_from_hub` is read-only contract

## Collected Stub (`docs/website/_collected/<scope>/<layer>/<domain>/*.md`)
- **Fields**
  - `doc_id` (string; from docmap child)
  - `scn_id` (string)
  - `repo_url` (string; deep link to downstream repository path)
  - `optional` (boolean; toggles UI badge)
  - `metadata` (object; includes layer, domain, scope, status)
  - `generated_at` (datetime)
- **Relationships**
  - Generated from `DocmapEntry` + `RepositoryProfile`
  - Displayed alongside `RenderedScenario` cards
- **Validation Rules**
  - Must regenerate whenever docmap changes, else leadership view flagged stale
  - Fails generation if metadata incomplete or repo_url invalid

## Distribution Record (`reports/push/*.json`)
- **Fields**
  - `workflow_id` (string; unique run identifier)
  - `run_type` (enum: `usecase-seed`, `standards`)
  - `repo_key` (string)
  - `branch_name` (string; created per run)
  - `status` (enum: `Success`, `Failed`, `Deferred`)
  - `files_changed` (array<string>)
  - `pr_url` (string; optional; set when PR created)
  - `retry_token` (string; used for follow-up attempts)
- **Relationships**
  - Logs outcomes for `Usecase Template` distributions
  - Consumed by notification workflow for 72-hour reminders
- **Validation Rules**
  - `branch_name` must be unique per run and prefixed with `docs/hub/`
  - Status `Failed` requires non-empty error payload
