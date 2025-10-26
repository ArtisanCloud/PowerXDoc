---
title: Specification-Driven Development (SDD)
description: Overview of the GitHub Spec Kit SDD approach and how PowerX applies it across scenarios and usecase seeds.
---

# Specification-Driven Development (SDD)

SDD, articulated in GitHub’s [Spec Kit](https://github.com/github/spec-kit/blob/main/spec-driven.md), places specifications at the centre of delivery: implementation plans, code, tests, and runbooks all derive from a single, executable specification.

## Why invert “code is king”

Traditional flows start with code and treat documentation as an afterthought, which creates:

- Fragmented knowledge and poor traceability.
- Onboarding friction when context lives only in code.
- Automation gaps (tests, ops scripts) that lag behind production.

SDD reverses this: specifications no longer serve code—code serves specifications. When the spec changes, the plan and implementation regenerate accordingly.

## The SDD loop

1. **Intent capture** – Teams iterate with AI assistants to clarify actors, constraints, acceptance criteria.
2. **Specification** – Produce a precise, unambiguous document covering scenarios, contracts, and validation checks.
3. **Implementation plan** – Generate an executable plan that maps requirements to technical actions and safeguards.
4. **Delivery** – Produce code, tests, and operational assets straight from the approved plan.
5. **Operational feedback** – Metrics, incidents, and governance updates feed back into the specification for the next evolution.

## PowerX adoption

PowerX implements SDD through the **Scenario (SCN) + Usecase Seed** model:

- **Scenario documents** capture end-to-end journeys and business intent.
- **Usecase Seeds** break scenarios into actionable tasks with clear ownership and validation.
- **Docmap** (`docs/_data/docmap.yaml`) keeps the single source of truth between scenarios and seeds.
- **Automation scripts**—`setup-usecase-seeds.mjs`, `generate-usecase-seed-index.mjs`, `npm run publish:usecases`—keep specifications and artefacts in sync.

The landing page `/en/scenarios/` walks through the same process in detail, highlighting how teams collaborate around specifications.

## Linked core concepts

SDD ties together the rest of the core concept stack:

- [PowerX Integration Architecture](/en/core-concepts/PowerX_Integration_Architecture) shows how capabilities are registered, orchestrated, and routed.
- [Knowledge Base Overview](/en/core-concepts/00_overview) explains how knowledge assets supply context to specifications.
- [Agent Lifecycle Spec](/en/core-concepts/Agent_Manager_and_Lifecycle_Spec) describes how agents execute, govern, and feed back into the specification loop.

By treating specifications as the source and everything else as transformation, PowerX keeps architecture, knowledge, and agents aligned as the platform evolves.
