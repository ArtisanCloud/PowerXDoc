# Security Audit Pipeline

The `make security-audit` target orchestrates the baseline security checks before release. It delegates to `scripts/security/run_audit.sh`, which collects outputs under `build/security/<timestamp>/`.

## Executed steps

1. `golangci-lint run ./...`
2. `govulncheck ./...`
3. `gosec ./...`
4. `npm audit --production` (optional if npm available)
5. `trivy fs` scan of the repository (optional if trivy installed)
6. `cosign version` (metadata only)

Each step writes a log file inside the timestamped directory. A summary `report.json` captures pipeline status and artifact location.

## Usage

```bash
make security-audit
```

Artifacts appear in `build/security/<timestamp>/`. Upload SARIF or JSON logs to CI as required. The backend baseline service ingests the folder and surfaces audit reports via `/admin/security/audit-reports`.

## Findings format

`report.json` contains a minimal JSON structure suitable for parsing:

```json
{
  "timestamp": "2025-10-17T08:00:00Z",
  "status": "PASSED",
  "artifacts": {
    "directory": "build/security/20251017T080000Z"
  }
}
```

CI pipelines should fail the build if `status` is not `PASSED`.
