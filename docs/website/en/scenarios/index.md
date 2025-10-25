---
title: Scenarios & Usecases
---

# Scenarios & Usecases

PowerX documents end-to-end customer journeys through **Scenarios (SCN)** and drives implementation with **Usecase Seeds**. This page acts as the central hub.

## How to Navigate {#overview}

- Scenario markdown lives in `docs/scenarios/<domain>/SCN-*.md` and will be rendered under `en/scenarios/` after publishing.
- Each scenario follows the standard template covering scope, participants, E2E flows and acceptance.
- Use the list below to open a specific scenario.

## Docmap & Seed Flow {#docmap}

- `docs/_data/docmap.yaml` is the source of truth connecting scenarios and child usecases.
- Typical workflow:
  1. Update `docmap.yaml` after editing scenarios.
  2. Run `setup-usecase-seeds.mjs --scn-id <SCN_ID>` to generate Seed stubs.
  3. Regenerate the Seed index with `generate-usecase-seed-index.mjs`.
  4. Distribute Seeds via `npm run publish:usecases` when ready.

## Seed Tooling {#seed-tools}

- Seed generation: `node .specify/scripts/node/setup-usecase-seeds.mjs`
- Seed index: `node .specify/scripts/node/generate-usecase-seed-index.mjs`
- Seed publishing: `npm run publish:usecases`
- Collected view: `npm run publish:collected`

## Useful Links {#links}

- Scenario standards and governance are tracked inside the repository (`docs/meta/**`).
- Usecase authoring guides are located under `/en/resources/`.
