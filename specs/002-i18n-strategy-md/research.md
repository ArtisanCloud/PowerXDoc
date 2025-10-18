# Research Notes: PowerX Docs Bilingual Experience

## Decision: Automate `/docs` → `/docs/en` structure mirroring with a sync script
- **Rationale**: Guarantees every new Chinese page produces an English placeholder instantly, reducing human error and supporting FR-005 parity requirements.
- **Alternatives considered**: Manual folder-by-folder copying (error-prone, slow); VitePress `srcExclude` hacks (does not create content or enforce parity).

## Decision: Implement a non-blocking review banner component for untranslated English pages
- **Rationale**: Satisfies FR-008 by keeping placeholder content accessible while transparently signaling review status and linking back to Chinese source.
- **Alternatives considered**: Hard redirect to Chinese page (breaks English access); modal confirmation (interruptive and harms UX).

## Decision: Add a locale parity QA script that crawls both locales nightly
- **Rationale**: Provides objective verification for SC-001 and SC-004, surfacing missing pages or untranslated blocks before release.
- **Alternatives considered**: Manual QA checklist (does not scale to ~150 pages); relying solely on build warnings (won’t detect untranslated copy).
