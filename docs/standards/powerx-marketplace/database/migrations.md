# Database Migrations

PowerX Plugin Marketplace keeps schema changes in hand-authored SQL files (no production AutoMigrate). This document explains how to run them using the provided Make targets.

## Naming and Location

- All migrations live in `backend/migrations/`.
- Filename format: `YYYYMMDD_<description>.sql` (e.g. `20241001_initial_schema.sql`).
- New migrations must be committed to version control and reviewed like any other code change.

## Running Migrations


Commands below fall into two categories:

- **Go-based helpers** (AutoMigrate / seed via application code)
- **SQL-based migrations** (Goose reads the raw files in `backend/migrations/`)

All commands resolve the DSN from `backend/etc/config.yaml`, so ensure that file is up to date before running them. First-time setup: install Goose CLI via:

```bash
go install github.com/pressly/goose/v3/cmd/goose@latest
```

```bash
# Run application AutoMigrate (Go code) — safe for local dev
make db-migrate

# Seed reference data via Go helpers
make db-seed

# Apply SQL migrations through goose (install via `go install github.com/pressly/goose/v3/cmd/goose@latest`)
make migrate-up

# (Use with caution) Roll back the most recent SQL migration
make migrate-down

# Inspect applied vs pending SQL migrations
make migrate-status
```

> The make targets run from repository root and assume Go is available in `PATH`.

## Rollback

`make migrate-down` exposes Goose's `down` command. Use it only when you know the consequences. Preferred rollback strategy remains creating a forward-fixing migration.

## Creating New Migrations

Use the naming convention above, place the SQL file under `backend/migrations/`, and update docs/tests to reflect the change. (Automated `make migrate-create` command is currently not exposed; create files manually.)

## Tips

- Always run migrations in a transaction when possible (`BEGIN; ... COMMIT;`).
- Keep migrations idempotent (use `IF NOT EXISTS` / `ON CONFLICT DO NOTHING`).
- Coordinate schema changes with application updates and run `make migrate-up` as part of deploy playbooks.
