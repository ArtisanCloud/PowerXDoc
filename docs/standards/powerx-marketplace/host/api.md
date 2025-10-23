# PowerX Host Integration API

This document captures the current host-facing endpoints described in
`backend/api/host_openapi.yaml`. It complements the generated OpenAPI contract
and highlights authentication, request/response shapes, and rate-limit
behaviour introduced in Phase 7.

## Authentication

All endpoints are served under `/v1/internal/host` and require:

- Mutual TLS between the Marketplace gateway and host SDK
- Service-token header for internal operators where applicable
- Host JWT validation performed in the handlers (see `license_handler.go`)

## Endpoints

| Path | Method | Purpose | Notes |
|------|--------|---------|-------|
| `/license/validate` | POST | Validate tenant/plugin license tokens. | Returns cache hints, enforces rate limits and audit logging. |
| `/manifest/sync` | POST | Submit or update a manifest synchronisation request. | Triggers approval workflow and secrets ingestion. |
| `/manifest/sync/{id}/approve` | POST | Approve a pending manifest request. | Requires reviewer identity. |
| `/manifest/sync/{id}/reject` | POST | Reject a manifest request. | Records reviewer notes and audit trail. |
| `/manifest/sync/{id}/apply` | POST | Apply an approved manifest. | Marks manifest as `applied`. |
| `/manifest/sync/{id}` | GET | Fetch manifest request status. | Supports CLI/status checks. |
| `/usage/report` | POST | Report batched usage metrics. | Accepts idempotent batches and queues retries; subject to rate limits. |
| `/heartbeat` | POST | Record host heartbeat status. | Enforces status transitions and emits offline alerts. |
| `/ratelimit/rules` | GET | (Future public) list configured rate limit rules. | Currently used for internal CLI.

Refer to the OpenAPI document for schema definitions (`LicenseValidateRequest`,
`UsageBatch`, `HeartbeatRequest`, `RateLimitRule`, etc.).

## Rate Limits

- Tenant + plugin scoped rules are persisted in `host_rate_limits` and cached in
  Redis.
- Default rule falls back to configuration (`host.rate_limit.default_limit`,
  `host.rate_limit.window_seconds`).
- Exceeding requests receive HTTP 429 with `Retry-After` header; see
  `rate_limit.go` for decision logic.

## Error Codes

Structured envelope responses use the shared helper in
`backend/internal/http/handler/common.go`. Host-specific error codes are
documented in `docs/host/error-codes.md`.

## Change History

- 2025-10-22: Added heartbeat & rate limit endpoints (Phase 7).
- 2025-10-14: Initial license, manifest, usage endpoints.
