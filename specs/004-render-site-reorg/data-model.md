# Data Model – PowerX Docs Render Site Reorg

## Entity: SourceContentRecord
- **Purpose**: Represents authoritative markdown or asset files under `docs/` (excluding `docs/website/`) that may be approved for publication.
- **Key Fields**:
  - `id` (path string, unique): Repository-relative path to the source file.
  - `contentType` (enum: `markdown`, `asset`, `localization-manifest`).
  - `locale` (enum: `zh-CN`, `en-US`, `mixed`, `N/A`).
  - `reviewStatus` (enum: `Placeholder`, `InReview`, `Approved`).
  - `lastReviewedAt` (datetime).
  - `ownerRole` (enum: `platform-maintainer`, `localization-lead`, `content-ops`).
- **Relationships**:
  - May link to one `RenderContentItem` via `targetPath` when published.
  - Feeds into zero or more `PublishSuggestion` entries.
- **Validation Rules**:
  - `reviewStatus` MUST be `Approved` before publication.
  - `locale` must align with directory (`en/` → `en-US`, etc.).

## Entity: RenderContentItem
- **Purpose**: Represents renderable assets located under `docs/website/`.
- **Key Fields**:
  - `targetPath` (path string, unique within `docs/website/`).
  - `sourceId` (path string, nullable) — reference to `SourceContentRecord.id`.
  - `locale` (enum).
  - `publishStatus` (enum: `active`, `pending-removal`).
  - `checksum` (string) — used for drift detection between source and rendered copy.
- **Relationships**:
  - Belongs to at most one `PublishSession`.
  - Backed by exactly one `SourceContentRecord` when `sourceId` present; otherwise denotes bespoke render-only assets (e.g., landing page).
- **Validation Rules**:
  - `targetPath` must remain within `docs/website/`.
  - `checksum` must be recalculated after every publish session.

## Entity: PublishSuggestion
- **Purpose**: AI-generated proposal describing how to move or copy approved content into the render tree.
- **Key Fields**:
  - `suggestionId` (UUID).
  - `sourceId` (path string) referencing `SourceContentRecord`.
  - `targetPath` (path string) where the file should reside in `docs/website/`.
  - `confidence` (float 0–1).
  - `riskLevel` (enum: `normal`, `elevated`, `high`).
  - `diffPreview` (string, optional) summarizing proposed changes.
  - `status` (enum: `suggested`, `confirmed`, `applied`, `dismissed`, `manual`).
- **Relationships**:
  - Aggregated inside a `PublishSession`.
  - Produces or updates one `RenderContentItem` upon application.
- **Validation Rules**:
  - `confidence` < 0.6 or `riskLevel = high` must default `status` to `manual`.
  - `targetPath` must map to allowed subdirectories (core-concepts, guides, etc.).

## Entity: PublishSession
- **Purpose**: Tracks a batch of suggestions processed together (per release or per day).
- **Key Fields**:
  - `sessionId` (UUID).
  - `createdAt` (datetime).
  - `createdBy` (role identifier).
  - `aiVersion` (string) referencing the model configuration.
  - `decisionLog` (array) capturing manual confirmations/edits.
  - `auditTrailRef` (string) pointing to existing logging system entry.
- **Relationships**:
  - Contains many `PublishSuggestion` entries.
  - Updates multiple `RenderContentItem` rows.
- **Validation Rules**:
  - `decisionLog` must capture operator identity for every `confirmed` or `manual` suggestion.
  - Sessions close automatically once all suggestions reach a terminal status.

## State Transitions
- `PublishSuggestion.status`:
  - `suggested` → (`confirmed` | `manual` | `dismissed`)
  - `manual` → (`applied` | `dismissed`)
  - `confirmed` → (`applied`)
- `RenderContentItem.publishStatus`:
  - `active` → `pending-removal` (for deprecated content)
  - `pending-removal` → (removed) handled during cleanup phase

## Data Volume & Scale Considerations
- Expect < 1,000 `RenderContentItem` nodes; operations can rely on filesystem scans with caching.
- `PublishSession` frequency: assumed 1–3 per day; logs stored in existing audit system (no new persistence required).
- `checksum` comparisons should leverage incremental hashing to avoid full-file rehash during every run.
