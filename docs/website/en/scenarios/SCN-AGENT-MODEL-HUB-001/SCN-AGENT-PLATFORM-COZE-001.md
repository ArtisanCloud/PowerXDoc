---
title: SCN-AGENT-EXEC-CLOSURE-001
---
# External Agent Platform Integration (Coze / n8n)
## Executive Summary
This sub-scenario is responsible for incorporating external agent/workflow platforms such as Coze and n8n into PowerX orchestration, unifying identity, secret, context mapping, and callback governance, enabling main Agents to access external platforms like internal plugins while ensuring audit and throttling.
## Scope & Guardrails
- **In Scope**: Platform registration, OAuth/Token management, context mapping, Webhook/callback signature, state synchronization, anomaly degradation.
- **Out of Scope**: External platform internal node configuration, third-party approval processes, private access to non-public APIs.
- **Environment & Flags**: `agent-platform-connectors`, `platform-webhook-guard`; depends on Identity Service, Webhook Gateway, Audit.
## Participants & Responsibilities
| Scope | Repository | Layer | Responsibilities & Deliverables | Owners |
|-------|------------|-------|--------------------------------|--------|
| connector-sdk | powerx-plugin | integration | Platform adapters, context mapping, callback handling | Plugin Guild |
| security | powerx | integration | OAuth/Token, signature validation, tenant isolation | Agent Platform Guild |
| ops | powerx | ops | Monitor latency/errors, trigger degradation and alerts | Ops Reliability Center |
## End-to-End Flow
1. Register platform instance and complete OAuth/Token → 2. Configure context mapping and callback signature → 3. Main Agent triggers workflow through connector → 4. Callback syncs results, writes to task board and audit, retries or degrades on anomalies.
## Key Interactions & Contracts
- `POST /platform/connectors/{platform}/instances`, `POST /platform/connectors/{platform}/invoke`, `EVENT platform.connector.callback`.
- Configuration: `config/platform/connectors/*.yaml`, Webhook signature scripts.
## Acceptance Criteria
- Platform call success rate ≥98%; callback latency <3s; signature failure automatically blocked with alerts; automatic degradation to local process or manual approval when platform unavailable.
## Telemetry & Ops
- Metrics: `agent.platform.latency_p95`, `agent.platform.callback_failure_total`, `agent.platform.degrade_total`.
- Alerts: Callback failure rate >5%, platform response timeout, signature validation failure.
## References
- `docs/meta/scenarios/powerx/agent-and-automation/agent-model-platform/primary.md`
- `docs/scenarios/agent-orchestration/SCN-AGENT-TASK-EXEC-001.md`
