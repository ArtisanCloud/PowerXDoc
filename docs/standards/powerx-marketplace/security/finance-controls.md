# Finance & Settlement Security Controls

This memo documents the security posture for the finance bounded context and
captures outcomes of the Phase 7 mini-review (T044).

## Data Protection

- **Storage encryption**: all reconciliation reports, payout bundles, invoices,
  and audit artefacts are written via the shared storage client which enforces
  SSE-S3 (`storage.NewClient` + `ReportStorage`). Retention metadata is attached
  through object metadata (`retention_until`).
- **Database**: finance tables inherit the global PostgreSQL TLS enforcement.
  Sensitive columns (invoice tax IDs, payout failure reasons) remain plaintext
  but are covered by RBAC (see below). Consider future hashing if regulatory
  requirements change.

## Access Control

- **HTTP routes**: mounted under `/v1/internal/finance/...` and gated by the
  internal auth middleware. Finance Ops roles include scopes:
  - `finance:reconciliation:*`
  - `finance:payout:*`
  - `finance:invoice:*`
  - `finance:audit:export`
- **CLI**: relies on the same runtime config; ensure exported kube secrets map
  finance service accounts to the correct token.
- **Audit trail**: new append-only access log (`finance_audit_artifacts.access_log`)
  records bundle consumption with `actor`, `purpose`, and `export_uri`.

## Secrets

- Payment gateway keys: `POWERX_FINANCE_GATEWAY_KEY`
- FX API key: `POWERX_FINANCE_FX_API_KEY`
- OTLP endpoint credentials (optional)

Store all secrets in Vault path `powerx/finance/<env>` with 7-day rotation.

## Threat Review (2025-10-21)

| Risk | Mitigation | Status |
|------|------------|--------|
| Unauthorized audit export | Require `finance:audit:export` scope and append access log | ✅ Implemented |
| Payout replay / double-trigger | Job enforces feature flag + retry window; CLI trigger logs manual reason | ✅ Implemented |
| Invoice tampering | File hashes stored (`invoice.file_hash`); audit bundle manifest includes hash | ✅ Implemented |
| Data exfiltration via CLI | CLI inherits auth; recommend enabling IP allowlist for finance namespace | ⏳ Pending follow-up |

## Action Items

- Enable Vault lease monitoring for finance gateway credentials.
- Wire `finance.anomaly.detected` alert to compliance duty officer (see
  `/docs/finance/operations.md`).
- Schedule formal penetration test once public vendor APIs go GA.

## Host Integration Security Review (2025-10-22)

| Area | Control | Status |
|------|---------|--------|
| Transport security | Host endpoints require mutual TLS and service-token auth when invoked by internal operators. | ✅ Active |
| JWT lifecycle | License & heartbeat paths validate host-issued JWTs; rotation tracked via `host.security.jwt_rotation` audit events. | ✅ Active |
| Secrets | Host manifest secrets persist in the Secrets Manager through `ManifestService.ingestSecrets`; access logged with actor metadata. | ✅ Active |
| Rate limiting | Tenant/plugin scoped rate limits enforced in Redis with local fallback; blocks are auditable (`rate_limit.block`). | ✅ Active |
| Event ingestion | Usage batches validated for UUIDs and idempotency; invalid payloads return `ERR_USAGE_INVALID_INPUT` without persisting data. | ✅ Active |

### Host Security Follow-up

- Enable automated redis availability alerts for rate limit keyspace.
- Document host CLI least-privilege scopes (`host:ratelimit:*`, `host:manifest:*`).
- Review heartbeat metadata payload (currently optional) for PII before GA.
