# T029 QA Log – en-US Placeholder Sweep

- **Date**: 2025-10-20
- **Reviewer**: Codex CLI session
- **Objective**: Catalogue remaining placeholder `reviewStatus` entries under `docs/en/` and identify follow-up translation owners.

## Findings

| Status | Count | Notes |
|--------|-------|-------|
| Placeholder | 24 | Machine-translated scaffolds pending human editing |
| InReview | 6 | Active editorial workstreams |
| Approved | 0 | No pages fully approved yet |

### Placeholder Backlog

- api-and-specifications/02_capability/Capability_Contract_Spec.md
- api-and-specifications/02_capability/Transport_Adapter_Spec.md
- api-and-specifications/03_registry_router/Capability_Registry_and_Router_Design.md
- api-and-specifications/03_registry_router/Runtime_Endpoint_Management.md
- api-and-specifications/04_orchestration/Flow_and_State_Model.md
- api-and-specifications/04_orchestration/Orchestrator_Service_Interface.md
- api-and-specifications/04_orchestration/Realtime_Streaming_Gateway.md
- api-and-specifications/04_orchestration/Workflow_and_Agent_Orchestration_Spec.md
- api-and-specifications/06_gateway/EventBus_and_Message_Fabric.md
- api-and-specifications/06_gateway/Integration_API_and_Admin_Interface.md
- api-and-specifications/06_gateway/MCP_Server_and_Gateway_Design.md
- api-examples.md
- core-concepts/00_overview.md
- core-concepts/Agent_Manager_and_Lifecycle_Spec.md
- core-concepts/PowerX_Integration_Architecture.md
- developer-guides/Agent_Developer_Guide.md
- developer-guides/Plugin_Runtime_Guide.md
- developer-guides/Plugin_Test_and_Debug_Guide.md
- developer-guides/PowerX_Plugin_SDK_Guide.md
- markdown-examples.md
- pxip/PXIP-001_Unified_Capability_and_Transport_Proposal.md
- security-and-governance/Agent_Security_and_Isolation_Policy.md
- security-and-governance/Capability_and_Tool_Grants_Spec.md
- security-and-governance/Security_and_Governance.md

### In-Review Pages

- api-and-specifications/README.md
- core-concepts/README.md
- developer-guides/README.md
- index.md
- pxip/README.md
- security-and-governance/README.md

## Next Steps

1. Assign translators to high-impact backlog items (API capability specs + developer guides).
2. Promote InReview pages to Approved once QA completes copy edits; this will remove the ReviewBanner on `/en/`.
3. Re-run `pnpm run localization:check` after each translation batch to keep the placeholder backlog current.
