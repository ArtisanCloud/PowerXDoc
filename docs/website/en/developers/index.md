---
title: Developers
---

# Developer Hub

Resources for engineers extending PowerX with plugins, integrations and automation.

## SDK / API {#sdk-api}

- [REST & GraphQL Overview](/en/api-and-specifications/README.md)
- [Webhooks & Events](/en/api-and-specifications/03_registry_router/Capability_Registry_and_Router_Design.md)
- [Realtime Gateway](/en/api-and-specifications/04_orchestration/Realtime_Streaming_Gateway.md)

## Plugin Ecosystem {#plugin-ecosystem}

- [Plugin SDK Guide](/en/guides/PowerX_Plugin_SDK_Guide.md)
- [Runtime Guide](/en/guides/Plugin_Runtime_Guide.md)
- [Testing & Debugging](/en/guides/Plugin_Test_and_Debug_Guide.md)
- PXIP proposals for future capabilities: [PXIP-001](/en/pxip/PXIP-001_Unified_Capability_and_Transport_Proposal.md)

## Quality & Testing {#quality-testing}

- Recommended strategy across unit, integration and end-to-end layers.
- Workflow QA scripts: `scripts/qa/workflow-metrics.mjs`.
- Document expected metrics and validation steps in every Seed file.

## Tooling {#tooling}

- CLI: `px-plugin`, `px-admin`, `px-market`.
- Automation: `npm run publish:usecases`, `npm run publish:standards`, `npm run publish:collected`.
- CI/CD best practices for cross-repo synchronisation and doc validation.
