---
title: Operations & Governance
---

# Operations & Governance

Guidance for SRE, security and compliance teams running PowerX in production.

## Observability & Alerts {#observability}

- Metrics to capture (`dev.hotload.*`, `offline.import.*`, `marketplace.publish.*`).
- Logging strategy: required fields, masking rules, retention.
- Alert playbooks and escalation channels.

## Security {#security}

- Identity, RBAC, tenant isolation and secret management.
- Capability/tool grants for agents and plugins.
- Sandbox policies: resource quotas, network isolation, launch flags.

## Change Management {#change-management}

- Release flows (local dev, offline import, online publish) and rollback guidance.
- Feature flag & configuration rollout procedures.
- Sandboxing vs production differences.

## Reporting & Audit {#reporting}

- Audit logs for admin actions, plugin installs, capability changes.
- Workflow telemetry using `scripts/qa/workflow-metrics.mjs`.
- Compliance exports (CSV/PDF) and automation scripts.
