# Data Model: PowerX Docs Bilingual Experience

## Locale
- **Key Fields**
  - `code` (string, primary key): ISO code such as `zh-CN`, `en-US`.
  - `label` (string): Display name used in UI language selector.
  - `isDefault` (boolean): Identifies the fallback locale (`zh-CN`).
- **Validation**
  - `code` must match `^[a-z]{2}-[A-Z]{2}$`.
  - Exactly one locale may have `isDefault = true`.
- **Relationships**
  - One-to-many with `DocumentationPage` (a locale owns many pages).

## DocumentationPage
- **Key Fields**
  - `slug` (string, composite key with locale): Mirrors folder hierarchy (`core-concepts/intro`).
  - `localeCode` (string, FK → `Locale.code`).
  - `title` (string): Localized page title.
  - `sourcePath` (string): Absolute path to markdown file.
  - `reviewStatus` (enum): `Placeholder`, `InReview`, `Approved`.
  - `lastSyncedAt` (datetime): Last time parity script confirmed the page.
  - `sourcePartnerSlug` (string): Slug of the counterpart page in the other locale.
- **Validation**
  - `sourcePartnerSlug` must resolve to an existing page in non-default locale.
  - `reviewStatus` transitions governed by Localization Workflow (see below).
- **Relationships**
  - Bidirectional link with the counterpart `DocumentationPage`.
  - Consumes metadata from translation parity checklist (not persisted in DB but stored in YAML/JSON manifest).

## Localization Workflow State Machine
- **States**: `Placeholder` → `InReview` → `Approved`.
- **Transitions**
  - `Placeholder` → `InReview`: Human reviewer picks up machine-translated draft.
  - `InReview` → `Approved`: Reviewer finalizes edits and marks ready.
  - `Approved` → `Placeholder`: Triggered when Chinese source changes and English page needs re-translation.
- **Guards**
  - Transition to `Approved` requires QA checklist pass and banner removal.
  - Regression to `Placeholder` automatically re-enables review banner and parity alerts.
