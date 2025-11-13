---
title: Plugin Quickstart
---

# Plugin Quickstart

Build your first PowerX plugin experience in under an hour. This guide adapts the canonical tutorials from `Core/Plugins/PowerXPlugin/docs/guide/` into an English walkthrough that you can follow alongside the Chinese originals.

## Goals

- Run the official standalone skeleton (backend + admin) outside of PowerX Core.
- Exercise the CRUD reference flow and verify multitenant headers.
- Scaffold a fresh plugin project with `px-plugin` and run self-tests.

## Prerequisites

- Go 1.24+ with `GOWORK=on`.
- Node.js 18+ with npm (or pnpm), plus Git and Make.
- SQLite (bundled with macOS/Linux) or PostgreSQL if you prefer the full stack.
- Optional: Docker for auxiliary services; `curl` and `jq` for quick checks.

We assume you already cloned the monorepo:

```bash
git clone https://github.com/ArtisanCloud/PowerX.git
cd PowerX/Core/Plugins/PowerXPlugin
```

## Step 1 – Prepare configuration

1. Copy the sample config so the skeleton can boot without extra flags:
   ```bash
   cp skeleton/backend/etc/config.example.yaml skeleton/backend/etc/config.yaml
   mkdir -p skeleton/.cache
   ```
2. Adjust database settings only if you are *not* using the default SQLite DSN (`file:../.cache/powerxplugin.db?cache=shared&_fk=1`).
3. Export `GOWORK=on` (or add it to your shell profile) so the Go toolchain resolves the multi-module workspace.

## Step 2 – Boot the standalone skeleton

```bash
cd skeleton/backend
go run ./cmd/database/main.go setup   # migrate + seed demo data
go run ./cmd/plugin                   # start HTTP on :8087
```

Open a new terminal for the admin frontend:

```bash
cd ../web-admin
npm install
npm run dev -- --port 3031
```

Validate the round trip:

```bash
curl -s http://127.0.0.1:8087/healthz
curl -s -H 'X-Tenant-ID: 1' http://127.0.0.1:8087/api/v1/templates | jq
```

> Tip: Track latency with `curl -w 'time_total: %{time_total}\n' …` and record results under `docs/research` when you tune the stack.

## Step 3 – Explore the CLI scaffolding

Build the CLI once (it reuses the same repository workspace):

```bash
go build -o ./bin/px-plugin ./tools/cli
./bin/px-plugin init com.powerx.samples.demo
```

The initializer renders templates from `scaffold/templates/**`, pins framework versions, installs Go/Node dependencies, and prepares CI metadata. Change into the generated directory and run the built-in smoke checks:

```bash
cd com.powerx.samples.demo
go test ./...
npm run lint
```

Bring the sample API online and compare it with the standalone skeleton:

```bash
go run ./cmd/plugin/main.go
curl -H 'X-Tenant-ID: 1' http://127.0.0.1:8080/api/v1/ping
```

## Step 4 – Keep skeleton and templates in sync

Whenever you edit anything under `skeleton/backend` or `skeleton/web-admin`, run:

```bash
npm run sync:templates
npm run sync:templates -- --check   # CI parity check
```

This copies the golden sources into both the scaffold (`scaffold/templates/**`) and CLI generator (`tools/cli/internal/templates/**`). Forgetting this step is the most common source of drift between local testing and generated projects.

## Step 5 – Next steps

- Review `standalone-mode.md` for a deeper look at middleware, observability, and lifecycle hooks.
- Follow `cli-plugin-tutorial.md` to automate packaging (`px-plugin package`) and distribution (`px-plugin publish`).
- Capture learnings in the developer scenarios under `/en/scenarios/SCN-DEV-PLUGIN-*` so quality gates stay aligned with your workflow.
