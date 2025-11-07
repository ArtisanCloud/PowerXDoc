title: Developer Hub
---

# Developer Hub

This section curates everything engineers need to build, package, and operate PowerX plugins. Start with the guides below and dive into the references that apply to your team.

## Start Here

- [Plugin Quickstart](./quickstart.md) – Bootstrap the standalone skeleton, run the simulator, and validate CRUD flows end to end.
- [Plugin Framework & Roadmap](./plugin-framework.md) – Understand the repository layout, DDD layering, and the phased plan for the PowerX plugin ecosystem.
- [Tooling & Quality Practices](./tooling-and-quality.md) – Align on CLI usage, release automation, and multi-layer testing expectations.

## SDK & API References {#sdk-api}

- [REST & GraphQL overview](/en/api-and-specifications/README.md)
- [Webhook and event contracts](/en/api-and-specifications/03_registry_router/Capability_Registry_and_Router_Design.md)
- [Realtime streaming gateway](/en/api-and-specifications/04_orchestration/Realtime_Streaming_Gateway.md)
- Localization tooling lives under `docs/scripts/localization/` for teams adopting multilingual content.

## Plugin Ecosystem Guides {#plugin-ecosystem}

- [PowerX Plugin SDK Guide](/en/guides/PowerX_Plugin_SDK_Guide.md)
- [Plugin runtime guide](/en/guides/Plugin_Runtime_Guide.md)
- [Testing and debugging playbook](/en/guides/Plugin_Test_and_Debug_Guide.md)
- Architecture proposals (PXIP): [PXIP-001 – Unified capability & transport](/en/pxip/PXIP-001_Unified_Capability_and_Transport_Proposal.md)

## Scenarios & Implementation Patterns

- Plugin scaffolding and debugging scenarios: browse `/en/scenarios/meta/powerx/plugin-ecosystem/` (primary narratives) and the detailed stage playbooks under `/en/scenarios/SCN-DEV-PLUGIN-*`.
- Cross-repo automation and publishing examples live in the Operations hub, especially [`/en/scenarios/SCN-OPS-PLUGIN-LIFECYCLE-001/`](../scenarios/SCN-OPS-PLUGIN-LIFECYCLE-001/UC-OPS-PLUGIN-DEV-INSTALL-001.md).

## Looking for the Chinese source?

The canonical architectural notes and tutorials originate from `Core/Plugins/PowerXPlugin/docs/guide` and `docs/plan`. When something is missing in English, check those files first and help upstream improvements.
