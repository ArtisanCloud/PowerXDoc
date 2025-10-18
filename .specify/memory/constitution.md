<!--
SYNC IMPACT REPORT
- Version Change: (initial adoption) -> 1.0.0
- Added Principles:
  - I. Role-Driven (角色驱动)
  - II. Concept-First (概念先行)
  - III. Structure-Oriented (结构至上)
  - IV. Clarity through Visualization (图文并茂)
- Added Sections:
  - Content & Style Guide
  - Governance & Maintenance
- Templates Requiring Updates:
  - ⚠ pending: .specify/templates/plan-template.md (to add specific constitution checks)
- Follow-up TODOs:
  - TODO(RATIFICATION_DATE): Set the official date of adoption.
-->
# PowerX Documentation Constitution

## Core Principles

### I. Role-Driven (角色驱动)
The implementation plan MUST identify the target user roles for the feature. All feature documentation (e.g., quickstart guides, tutorials) MUST be written from the perspective of one of these primary roles to ensure relevance and clarity.

### II. Concept-First (概念先行)
The implementation plan MUST include tasks for creating or updating high-level overview documents before tasks for detailing technical specifications. Users must be able to understand the "what" and "why" before the "how".

### III. Structure-Oriented (结构至上)
All new documentation artifacts MUST adhere to the established structural templates. The plan MUST list which documents will be created or updated and confirm they will follow the standard, predictable structure for that document type.

### IV. Clarity through Visualization (图文并茂)
For any feature involving new architecture, complex data flows, or multi-step user processes, the implementation plan MUST include a task to create or update a `mermaid` diagram to visually represent it.

## Content & Style Guide

- **Source of Truth:** All documentation content MUST originate from the `powerx_source_docs` directory as the single, authoritative source. The website is a curated presentation of this source.
- **Tone of Voice:** The tone MUST be professional and precise, using clear, unambiguous technical language. Key terms (e.g., Capability, Transport, Orchestrator) MUST be used consistently throughout the documentation. A global glossary is recommended.
- **Structural Template:**
  - Module Overviews MUST include: 'Positioning & Goals', 'Core Capabilities', 'Architecture Diagram', and 'Related Links'.
  - Technical Specifications MUST include: 'Background', 'Design', 'API/Model Definition', and 'Usage Examples'.
- **Theme Implementation:** Shared visual systems (Tailwind utility layers, PowerXAdmin CSS, brand assets) MUST be imported locally in the docs build; external CDNs are forbidden for core styling. Light and dark themes MUST be validated for WCAG AA contrast, and navigation MUST expose the global appearance toggle.

## Governance & Maintenance

- **Content Updates:** The documentation website MUST be synchronized with any changes to the `powerx_source_docs` source files.
- **Structural Evolution:** Significant structural changes (e.g., adding a new top-level navigation item) MUST be discussed and approved by the team to ensure alignment with the Role-Driven and Concept-First principles.
- **Proposal-Driven Changes:** Major new architectures or specifications MUST be documented and reviewed via the PXIP (PowerX Integration Proposal) process before being formally incorporated into the documentation.
- **Versioning Policy:** This constitution follows Semantic Versioning (MAJOR.MINOR.PATCH).
  - **MAJOR:** Backward-incompatible changes, principle removals, or major redefinitions.
  - **MINOR:** New principles added or significant expansions to existing guidance.
  - **PATCH:** Clarifications, wording adjustments, and non-semantic typo fixes.

**Version**: 1.0.0 | **Ratified**: TODO(RATIFICATION_DATE): Set the official date of adoption. | **Last Amended**: 2025-10-17
