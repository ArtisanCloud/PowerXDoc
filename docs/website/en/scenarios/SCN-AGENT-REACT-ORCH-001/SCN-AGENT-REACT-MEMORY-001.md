---
scn_id: SCN-AGENT-REACT-MEMORY-001
title: Observation Feedback and Memory Update
status: Draft
version: v0.1.0
owners:
  - name: Agent Platform Guild
    role: Observation Pipeline Owner
    contact: agent-platform@artisan-cloud.com
  - name: Knowledge Intelligence Team
    role: Memory & Knowledge Partner
    contact: knowledge@artisan-cloud.com
  - name: Ops Reliability Center
    role: Loop Governance Partner
    contact: ops-center@artisan-cloud.com
domains: [agent-orchestration]
layers: [service, ops]
repos:
  - key: powerx
    scope: core-platform
    responsibility: Observation parsing, confidence evaluation, loop control, user feedback summarization
  - key: powerx
    scope: knowledge
    responsibility: Memory writing, knowledge update triggering, snippet deduplication/watermarking
related_usecases:
  - doc_id: UC-AGENT-REACT-MEMORY-001
    layer: service
    domain: agent-orchestration
last_reviewed_at: 2025-02-21
---

# Executive Summary

This sub-scenario is responsible for transforming Observations returned by plugins into structured signals, determining whether hypotheses are valid, whether to continue loops, and deciding when to write information to short-term memory or long-term knowledge. The goal is to maintain Observation parsing accuracy ≥98%, loop steps ≤6, proactively break and request manual collaboration for high-risk or invalid loops. Success signals: Observations are automatically archived, confidence and citations synchronized to thought chains, memory writing is idempotent, loop threshold exceeded triggers alerts.

# Scope & Guardrails

- **In Scope**: Observation parsing templates, confidence and citation binding, loop control strategies, termination/manual takeover logic, short-term memory caching, long-term knowledge update triggers, user/audit feedback writeback.
- **Out of Scope**: Plugin computation logic, memory visualization UI, knowledge base reconstruction or vector training.
- **Environment & Flags**: `react-observation-pipeline`, `react-loop-guard`, `memory-sync-service`; depends on LLM Gateway, Knowledge Store, Audit, Notification.

# Participants & Responsibilities

| Scope | Repository | Layer | Responsibilities & Deliverables | Owners |
|-------|------------|-------|--------------------------------|--------|
| observation-pipeline | powerx | service | Parsing templates, confidence calculation, citation binding, loop termination conditions | Agent Platform Guild |
| memory-service | powerx | service | Short-term memory caching, long-term knowledge writing, conflict detection, TTL | Knowledge Intelligence Team |
| ops-guard | powerx | ops | Loop threshold strategies, manual collaboration, alerts/Runbooks | Ops Reliability Center |

# End-to-End Flow

1. **Stage 1 – Observation Parsing**: After Action returns, extract conclusions, evidence, metrics, error information via templates or LLM parser, and bind source snippets.
2. **Stage 2 – Hypothesis Evaluation**: Reasoner updates Thought state based on Observations, determining if hypotheses are valid, whether new Thoughts are needed, or if to converge directly.
3. **Stage 3 – Memory Decision**: Write high-value Observations to short-term memory (reusable for current session), call knowledge update pipeline if policy is met or user confirms.
4. **Stage 4 – Loop Governance & Feedback**: Accumulate loop steps/time; if exceeded threshold or failure rate too high, trigger break, manual takeover, and alerts; also output stage summaries to users.

# Architecture Diagram

```mermaid
sequenceDiagram
  participant Actor as Action Agent
  participant Parser as Observation Pipeline
  participant Reasoner as Main Agent
  participant Memory as Memory/Knowledge Service
  participant Ops as Risk Control/Alerts

  Actor-->>Parser: Observation Payload
  Parser-->>Reasoner: Structured Observation + confidence
  Reasoner->>Memory: Write short-term memory/knowledge update
  Memory-->>Reasoner: Write result/conflict prompt
  Reasoner->>Ops: Loop metrics, alert status
  Ops-->>Reasoner: Break/manual takeover decision
```

# Key Interactions & Contracts

- **APIs / Events**
  - `POST /internal/react/observation`: Body contains `action_id`, `payload`, `schema_version`; returns parsing results, confidence, citations.
  - `POST /internal/react/memory`: Write `type=[short_term|long_term]`, `content`, `source_refs`, `expires_at`.
  - `EVENT react.loop.state`: Broadcast loop steps, time consumed, threshold status, manual takeover reasons.
- **Configs / Schemas**
  - `schemas/react_observation.json`, `config/react/loop_guard.yaml`, `config/memory/policy.yaml`.
  - `docs/standards/powerx/backend/integration/09_agent/Agent_Manager_and_Lifecycle_Spec.md`.
- **Security / Compliance**
  - Memory writing follows tenant isolation, sensitive field redaction, long-term memory requires audit and reversibility.
  - Loop breaks require recording reasons, operators, and original traces.

# Usecase Links

- `UC-AGENT-REACT-MEMORY-001` — Observation Parsing and Memory Governance (service layer, `docs/usecases-seeds/SCN-AGENT-REACT-ORCH-001/UC-AGENT-REACT-MEMORY-001.md`).

# Acceptance Criteria

1. Observation parsing accuracy ≥98%, all fields provide citation ID and confidence.
2. ReAct loop steps ≤6, time ≤45 seconds; immediate break and manual collaboration on threshold exceeded.
3. Memory writing is idempotent, repeated Observations do not pollute knowledge base, and provide rollback handles.
4. Stage summaries output to users must include citation sources and confidence prompts.

# Telemetry & Ops

- **Metrics**: `react.observation.parse_success_rate`, `react.loop.steps_total`, `react.loop.break_count`, `react.memory.write_success_rate`, `react.memory.conflict_total`.
- **Logs/Audit**: `audit.react_observation` records action_id, citations, confidence; `audit.react_memory` records write type, TTL, triggering policy.
- **Alerts**: Observation parsing failure rate >2%, loop threshold exceeded events >0, memory conflicts >5 times/hour; notify Ops on-call and Teams #agent-react.
- **Tools**: `scripts/ops/react-loop-drill.mjs`, `node scripts/qa/workflow-metrics.mjs --metric react.loop.steps_total`.

# Open Issues & Follow-ups

| Risk/Issue | Impact Scope | Owner | ETA |
|------------|--------------|-------|-----|
| Long-term memory writing lacks approval/revoke interface | Knowledge pollution, audit uncontrollability | Knowledge Intelligence Team | 2025-03-06 |
| User experience plan after loop break needs design | Inconsistent manual takeover experience | Agent Platform Guild | 2025-03-10 |

# Appendix

- `docs/meta/scenarios/powerx/agent-and-automation/agent-orchestration/react-agent-orchestration/primary.md`
- `docs/_data/docmap.yaml`
