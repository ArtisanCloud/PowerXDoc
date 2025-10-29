---
title: Scenario & Usecase Navigation
---

# Scenario & Usecase Navigation

PowerX combines **Scenarios (SCN)** and **Usecase Seeds** to turn product intent into executable specifications that drive implementation, testing, and operations.

## Overview {#overview}

- **Specification-Driven**: We follow GitHub Spec Kit’s [Specification-Driven Development (SDD)](https://github.com/github/spec-kit/blob/main/spec-driven.md). Specs are the single source of truth; code, tests, and operational scripts are derived from them.
- **Scenarios Tell the Story**: Scenario docs describe the end-to-end journey—participants, prerequisites, flow, and acceptance criteria are unified in one place.
- **Usecase Seeds Deliver**: Seeds break scenarios into minimal deliverables, enabling cross-team collaboration and reuse.
- **Docmap Orchestrates**: `docs/_data/docmap.yaml` maintains the mapping between scenarios and Seeds. It is the canonical source for generation, indexing, and publishing.
- **Further Reading**: For step-by-step instructions see [Scenario Usage Guide](/en/scenarios/usage) together with the authoring guide and Seed generation guide referenced below.

## Scenario Catalog {#catalog}

The sidebar automatically lists every scenario registered in `docmap.yaml` and groups entries by `SCN_ID`. Child scenarios and Seeds appear beneath each item for direct navigation. Maintenance tips:

- Edit the source files in `docs/scenarios/**` first, then use the automation scripts to sync into `docs/website/**`. Avoid manual copy/paste that can drift from the source of truth.
- When adding a new scenario, remember to update docmap, generate Seeds, and rebuild the index so the catalog stays in sync.
- Useful references:
  - [Scenario Usage Guide](/en/scenarios/usage)
  - [Scenario Authoring Guide](/en/guides/scenarios/scenario-generation)
  - [Generate Usecase Seeds](/en/guides/usecases/generate-usecase-seeds)
  - [Usecase Seed Index Maintenance](/en/guides/usecases/seed-index-maintenance)
  - [Standards Distribution Guide](/en/guides/publish/standards-distribution)
