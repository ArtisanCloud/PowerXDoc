---
doc_id: UC-AGENT-REACT-MEMORY-001
scn_id: SCN-AGENT-REACT-ORCH-001
title: PowerX (service) - ReAct Observation Feedback and Memory Governance
status: Draft
version: v0.1.0
repo_key: powerx
scope: powerx
layer: service
domain: agent-orchestration
scenario_title: "ReAct Agent Orchestration"
owners:
  - name: Agent Platform Guild
    role: Observation Pipeline Owner
    contact: agent-platform@artisan-cloud.com
contributors:
  - name: Knowledge Intelligence Team
    role: Memory & Knowledge Partner
    contact: knowledge@artisan-cloud.com
  - name: Ops Reliability Center
    role: Loop Governance Partner
    contact: ops-center@artisan-cloud.com
linked_requirements:
  - id: SCN-AGENT-REACT-ORCH-001
    description: Main Scenario - ReAct Agent Orchestration
  - id: SCN-AGENT-REACT-MEMORY-001
    description: Sub-scenario C - Observation Feedback and Memory Update
code_refs:
  - repo: powerx
    path: services/react/observation-parser.ts
    description: Observation parsing, summarization, citation and confidence calculation
  - repo: powerx
    path: services/memory/short_term.ts
    description: Session-level memory caching and TTL management
  - repo: powerx
    path: services/memory/long_term.ts
    description: High-value Observation long-term knowledge writing/knowledge update triggering
  - repo: powerx
    path: services/observability/react_loop_metrics.ts
    description: ReAct loop steps, timeout, breakdown metrics
  - repo: powerx
    path: config/react/loop_guard.yaml
    description: Loop thresholds, risk control strategies, manual collaboration configuration
feature_flags:
  - react-observation-pipeline
  - react-loop-guard
  - memory-sync-service
last_reviewed_at: 2025-02-21
---

# Usecase Overview

- **Business Goal**: After each Action completes, parse Observations, evaluate confidence and hypothesis state, and write to short/long-term memory according to policy, while monitoring ReAct loop steps, time, and anomalies.
- **Success Metrics**: Observation parsing accuracy ≥98%; loop steps ≤6, `react.loop.break_count` = 0; memory write conflict rate <0.5%; stage summaries include citations with confidence >=0.7; threshold exceeded break trigger rate <2%.
- **Scenario Association**: Takes Action output, provides structured Observations and memory to Audit/Closure; collaborates with `SCN-AGENT-REACT-AUDIT-001` to generate playback.

> **Summary**: This use case defines the full chain of "Observation parsing → hypothesis evaluation → memory writing → loop governance", ensuring ReAct loops are stable, controllable, and can output trustworthy memory downstream.

# Context & Assumptions

- **Prerequisites**
  - Feature Flags `react-observation-pipeline`, `react-loop-guard`, `memory-sync-service` enabled.
  - Knowledge/memory storage (Redis Short-term, Vector Long-term, Audit DB) accessible.
  - `config/react/loop_guard.yaml` defines loop steps, timeout, sensitive operation thresholds and manual collaboration conditions.
- **Input/Output**
  - Input: `action_id`, `observation_payload`, `metrics`, `error?`, `trace_id`, `risk_level`, `tenant_ctx`.
  - Output: Structured `observation`, `confidence`, `source_refs`, `hypothesis_state`, `loop_state`, `memory_record?`, `break_reason?`, user stage summary.
- **Boundaries**
  - Not responsible for action execution or approval.
  - Does not generate final playback reports (handled by Audit use case).
  - Does not handle knowledge base reconstruction or large-scale index refresh, only triggers write processes.

# Solution Blueprint

## System Decomposition

| Layer | Main Components/Modules | Responsibilities | Code Entry Point |
|-------|-------------------------|------------------|------------------|
| service | `services/react/observation-parser.ts` | Parse Action output, generate structured Observation, confidence, citations | `services/react/observation-parser.ts` |
| service | `services/memory/short_term.ts` | Session-level memory caching, idempotent writing, TTL & eviction | `services/memory/short_term.ts` |
| service | `services/memory/long_term.ts` | High-value Observation knowledge base writing, conflict detection, approval | `services/memory/long_term.ts` |
| ops | `services/observability/react_loop_metrics.ts` | Steps, time, breakdown metrics; trigger `react.loop.state` events | `services/observability/react_loop_metrics.ts` |
| ops | `config/react/loop_guard.yaml` | Loop thresholds, manual collaboration conditions, exception alert configuration | `config/react/loop_guard.yaml` |

## Process & Sequence

1. **Step 1 – Observation Parsing**: Receive Action response, use template/LLM parser to extract conclusions, evidence, metrics, errors, with `source_refs`, `confidence`.
2. **Step 2 – Hypothesis Evaluation**: Update Thought state, decide whether to generate new Thought/Action or converge; sync `loop_state` metrics.
3. **Step 3 – Memory Decision**: Decide write to short/long-term memory based on policy (confidence, weight, user confirmation); detect duplicates/conflicts, trigger approval or manual if necessary.
4. **Step 4 – Loop Governance**: Accumulate loop steps, time, failure rate; if exceeded threshold or failure rate too high, trigger break or manual takeover, output stage summary to users.
5. **Step 5 – Broadcast & Audit**: Emit `react.loop.state` events, write to Audit/Telemetry, hand memory references to Audit playback.

```mermaid
sequenceDiagram
  participant Actor as Action Executor
  participant Parser as Observation Pipeline
  participant Loop as Loop Guard
  participant Memory as Memory Service
  participant Audit as Audit/Telemetry

  Actor-->>Parser: observationPayload + trace_id
  Parser->>Loop: parsedObservation + metrics
  alt Writable Memory
    Loop->>Memory: writeShortTerm(observation)
    Memory-->>Loop: ack / conflict
    opt High Value
      Loop->>Memory: requestLongTermWrite()
    end
  end
  Loop-->>Audit: emit react.loop.state + summary
  Loop-->>Reasoner: observation + loop decision
```

# Contracts & Interfaces

- **Inbound APIs / Events**
  - `POST /internal/react/observation` — Body: `action_id`, `payload`, `schema_version`, `metrics`; returns `observation`, `confidence`, `hypothesis_state`.
  - `POST /internal/react/loop_guard` — Update loop state, steps, thresholds.
- **Outbound Calls**
  - `POST /internal/react/memory` — `type=short_term|long_term`, `content`, `source_refs`, `trace_id`, `ttl`, `approver?`.
  - `EVENT react.loop.state` — Includes `trace_id`, `step`, `decision`, `reason`, `confidence`, `memory_ref`, `break?`.
- **Configs & Scripts**
  - `config/react/loop_guard.yaml`, `config/memory/policy.yaml`.
  - `scripts/ops/react-loop-drill.mjs`, `scripts/ops/memory-sync.mjs`.

# Implementation Checklist

| Item | Description | Completion Status | Owner |
|------|-------------|-------------------|-------|
| Observation Parser | Templates, LLM, citation extraction, error classification | [ ] | Agent Platform Guild |
| Loop Guard | Threshold management, break strategies, manual collaboration interface | [ ] | Ops Reliability Center |
| Memory Service | Short-term caching, long-term writing, approval/revoke, conflict detection | [ ] | Knowledge Intelligence Team |
| Telemetry & Audit | `react.loop.*`, `react.memory.*` metrics, audit schema | [ ] | Ops Reliability Center |
| CLI/Runbooks | `react-loop-drill`, `memory-sync`, break runbooks | [ ] | Agent Platform Guild |

# Testing Strategy

- **Unit**: Observation parser (correctness, exceptions), memory idempotency, conflict detection, loop threshold logic.
- **Integration**: Mock Memory/Audit, verify writing, approval, conflict handling; simulate loop threshold exceeded, break, manual collaboration.
- **End-to-end**: Run `scripts/ops/react-loop-drill.mjs --tenant tenant-react-lab --max-steps 6`, simulate success/failure loops, verify metrics and alerts.
- **Non-functional**: High-frequency Observation write pressure test; Chaos (Memory service unavailable, Audit delay) with buffering/replay strategies.

# Observability & Ops

- **Metrics**: `react.observation.parse_success_rate`, `react.loop.steps_total`, `react.loop.break_count`, `react.memory.write_success_rate`, `react.memory.conflict_total`, `react.memory.long_term_pending_total`.
- **Logs**: `audit.react_observation` (action_id, trace_id, confidence, references), `audit.react_memory` (type, ttl, approver, conflict_flag), loop warning logs record break reasons.
- **Alerts**: Parsing failure rate >2%, loop threshold exceeded >0, memory conflicts >5 times/hour, long-term memory approval timeout >30 minutes; notify PagerDuty + Teams #agent-react-loop.
- **Dashboards**: Grafana "ReAct Loop" + "Memory Governance", Datadog `react.loop.*`, `react.memory.*`, workflow reports.

# Rollback & Failure Handling

- **Rollback Steps**: Disable `react-observation-pipeline` Feature Flag, rollback Parser/Mem services, restore loop thresholds.
- **Remediation**: Observation parsing failure → switch to rule templates; Memory write failure → cache retry + manual approval; loop exceeded → auto-degrade or manual takeover; memory conflicts → trigger conflict resolution UI.
- **Data Repair**: `scripts/ops/react-observation-replay.mjs --trace <id>` fill audit; `memory-admin revoke --record <id>` rollback erroneous memory.

# Follow-ups & Risks

| Risk/Issue | Impact | Mitigation | Owner | ETA |
|------------|--------|------------|-------|-----|
| Memory writing lacks approval/revoke | Knowledge pollution, audit uncontrollability | Introduce approval/revoke interfaces, record citation sources | Knowledge Intelligence Team | 2025-03-06 |
| Insufficient user experience after loop break | Low manual takeover efficiency | Design UX hints, copilot collaboration, playback links | Agent Platform Guild | 2025-03-10 |
| Rising long-term storage costs | Memory retention, slow queries | TTL, cold/hot tiering, compression strategies | Ops Reliability Center | 2025-03-18 |

# References & Links

- Scenario: `docs/scenarios/agent-orchestration/SCN-AGENT-REACT-MEMORY-001.md`
- Main Scenario: `docs/scenarios/agent-orchestration/SCN-AGENT-REACT-ORCH-001.md`
- Standard: `docs/standards/powerx/backend/integration/09_agent/Agent_Manager_and_Lifecycle_Spec.md`
- Runbook: `runbooks/agent/react_loop_break.md`
- QA: `scripts/ops/react-loop-drill.mjs`, `scripts/ops/memory-sync.mjs`
