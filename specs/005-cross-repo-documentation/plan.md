# Implementation Plan: PowerXDocs Cross-Repo Documentation Hub

**Branch**: `005-cross-repo-documentation` | **Date**: 2025-10-23 | **Spec**: specs/005-cross-repo-documentation/spec.md
**Input**: Feature specification from `/specs/005-cross-repo-documentation/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build PowerXDocs into the authoritative cross-repo documentation hub so stewards can author SCN scenarios once, push governed templates and standards to downstream repos, and render `_collected` summaries for leadership without pulling external content. Delivery relies on pure push Node.js workflows, enforced docmap validation, and governance-aligned VitePress outputs rooted in `docs/website/`.

## Technical Context

**Language/Version**: TypeScript 5.9 + Node.js 18 CLI scripts  
**Primary Dependencies**: VitePress 1.6, TailwindCSS 3.4, PostCSS/Autoprefixer, internal `scripts/publish/*.mjs`, native Git CLI orchestration via Node `child_process`
**Storage**: Git-tracked filesystem under `docs/**` and generated `docs/website/**` artifacts  
**Testing**: ESLint 9.x for static analysis; `node --test` integration suites that spin up temporary repos for workflow smoke tests  
**Target Platform**: Static VitePress site built to `docs/website/` and distributed to downstream repos via Git feature branches  
**Project Type**: Documentation tooling + static site build system  
**Performance Goals**: Publication and push workflows complete within 8 minutes per run while handling four downstream repos  
**Constraints**: Pure push distribution (no remote pulls), docs/website as sole render root, bilingual (zh-CN/en) VitePress build with Tailwind local assets, governance enforcement via docmap + validation reports, workflows must remain idempotent and safe to rerun without overwriting downstream content  
**Scale/Scope**: 4 downstream repositories, dozens of SCN scenarios, 7+ layer/domain combinations, leadership-facing `_collected` overview pages

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Role-Driven**: Identify documentation steward, documentation operations engineer, and product leadership as primary roles; ensure quickstart and contracts speak to their workflows.
- **Concept-First**: Sequence deliverables so high-level overview (research summary, architecture diagram updates) precede implementation details or CLI instructions.
- **Structure-Oriented**: All planned docs (scenarios, usecase templates, standards, `_collected`) must map to existing templates under `docs/standards/` and scenario standards.
- **Clarity through Visualization**: Include tasks to maintain mermaid diagrams for cross-repo flows in `docs/design/cross-repo-documentation.md` and new scenario quickstarts.

## Project Structure

### Documentation (this feature)

```
specs/[###-feature]/
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
├── scenarios/                 # SCN primary sources (Role-Driven templates)
├── _data/
│   ├── docmap.yaml            # Scenario registry & taxonomy validation
│   └── repos.yaml             # Downstream repo delivery metadata
├── usecases-seeds/            # Pure push template seeds by scope/layer/domain
├── website/
│   ├── scenarios/             # Rendered SCN pages (build output)
│   ├── _collected/            # Leadership stubs generated from docmap
│   └── library/               # Leadership landing pages sourced from standards
├── standards/                 # Governance source of truth (scenario templates originate here)
└── design/
    └── cross-repo-documentation.md  # Architecture + mermaid diagrams

scripts/
├── publish/
│   ├── push-usecases.mjs      # New workflow to branch, push, and report template delivery
│   ├── push-standards.mjs     # New workflow to distribute standards with reporting
│   ├── publish-scenarios.mjs  # Generates rendered SCN pages into docs/website/scenarios
│   └── generate-collected.mjs # Builds `_collected` stubs from docmap metadata
├── qa/
│   └── validate-docmap.mjs    # Validation + duplicate detection tasks
└── workflows/
    └── notify-reviewers.mjs   # Reminder automation for pending downstream PRs

specs/
└── 005-cross-repo-documentation/
    ├── plan.md
    ├── research.md
    ├── data-model.md
    ├── quickstart.md
    └── contracts/

tests/
└── workflows/
    ├── push-usecases.spec.mjs
    ├── push-standards.spec.mjs
    └── publish-scenarios.spec.mjs
```

**Structure Decision**: PowerXDocs remains a documentation tooling repository centered on `docs/**` sources with generated `docs/website/**` outputs and supporting Node.js workflow scripts under `scripts/`. Automated and manual validation live beside publish scripts, while feature documentation resides in `specs/005-cross-repo-documentation`.

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

No constitution violations identified.
