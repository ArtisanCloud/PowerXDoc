# PowerX Scenarios Documentation Standard

## Scope

This standard defines mandatory rules for the scenario (SCN) documentation flow described in `docs/design/cross-repo-documentation.md`. It governs how scenario drafts, rendered pages, and cross-repository mappings are maintained within PowerXDocs.

## Authoring & Storage

- **Draft Source:** All scenario drafts MUST live under `docs/scenarios/SCN-*.md`. Drafts are never rendered directly.
- **Rendered Output:** Only `docs/website/scenarios/**` participates in VitePress builds. Generated pages MUST stay in sync with their corresponding drafts.
- **Single Direction Flow:** Drafts → rendered pages is a one-way pipeline; rendered files MUST NOT be edited manually.

## Structure Requirements

Each scenario document MUST contain the following blocks:

1. **业务目标 (Business Goals)**
2. **跨仓/跨层流程 (End-to-End Flow)**
3. **子用例矩阵 (Usecase Matrix)** referencing `_collected/` stubs
4. **契约引用 (Contract References)** for APIs/events/CLI manifests
5. **验收标准 (Acceptance Criteria)**
6. **元信息 (Metadata)** including SCN ID, participating repos, status, version, maintainers

Templates in `docs/design/cross-repo-documentation.md` serve as the canonical layout reference.

## Data & Aggregation

- **Mapping File:** `docs/_data/docmap.yaml` MUST enumerate every scenario and its child usecases, including `repo`, `layer`, `domain`, and `path`. Ordering and optional flags MUST match rendered expectations.
- **Stub Generation:** `scripts/build-collected.sh` MAY generate `_collected/` placeholders, but it MUST NOT pull remote repository content. Stubs must link to external sources using repo metadata.
- **Cross-Repo Consistency:** Scenario pages MUST reference child usecases through `_collected/<scope>/<layer>/<domain>/*.md` placeholders and include external GitHub links derived from `docmap.yaml`.

## Compliance

- The constitution references this document as the authoritative scenario guideline.
- Changes to this standard require alignment with `docs/design/cross-repo-documentation.md` and approval through the PXIP process when impacting cross-repo coordination.
