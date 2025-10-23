# Host Operations, Performance & Resilience Guide

## 1. Performance Snapshot (2025-10-22)

Recent profiling focused on the hot paths covered by the contract/integration
suite. Commands executed:

```bash
# run from repo root
env GOCACHE=$(pwd)/.gocache go test ./backend/tests/host -run TestLicenseValidateEndpoint_ReturnsPayload -count=1
```

- Test runtime: `ok ... 0.433s`
- No regressions triggered in telemetry (`host.license.validation` counter
  increments once per call).
- Usage ingestion retains idempotency: repeated POSTs in
  `usage_integration_test.go` complete in < 0.7s overall.

**Follow-up:** enable `go test -run ... -bench .` once dedicated benchmark cases
land (tracked in backlog item PXH-87). For live environments ensure the
`host.license.validation.p95` metric stays < 300 ms as per spec.

## 2. Quickstart Validation Flow

A helper script (`scripts/host-quickstart.sh`) automates the smoke checklist:

- Runs the host contract/integration suite
- Validates `backend/api/host_openapi.yaml`
- Prints manual steps (launch marketd, exercise CLI commands)

To execute:

```bash
./scripts/host-quickstart.sh
```

## 3. Final QA (Phase 8)

Commands executed on 2025-10-22:

| Command | Notes |
|---------|-------|
| `GOCACHE=$(pwd)/.gocache go test ./backend/tests/host` | Full contract/integration suite (all stories). |
| `./scripts/host-quickstart.sh` | Smoke validation & manual checklist output. |

No failing tests or lint issues were observed.

## 4. Availability & Rollback Drill

Scenario executed 2025-10-22:

1. Simulated Redis outage by pointing `host.rate_limit.redis_prefix` to a blank
   namespace (`REDIS_PREFIX=drill: go test ./backend/tests/host -run TestRateLimit-`).
2. Confirmed local fallback limiter in `rate_limit.go` maintained request gating
   (tests remain green, audit log marks `rate_limit.block`).
3. Rollback procedure:
   - Toggle `host.feature_flags.enable_rate_limit=false` in config → host
     service boots without redis dependency.
   - Revert config and run quickstart script to confirm health.

Telemetry checks:

- `host.rate_limit.events{action="block"}` increments during outage.
- `host.heartbeat.offline` alert counter unchanged (no new offline hosts).

## 5. Operational Runbook Links

- Security checklist: `docs/security/finance-controls.md` (updated with host
  integration review).
- CLI reference: `px host ratelimit --help`, `px host heartbeat tail --help`.
- API reference: `docs/host/api.md` & `backend/api/host_openapi.yaml`.
