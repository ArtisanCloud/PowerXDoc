---
title: Plugin Framework & Roadmap
---

# Plugin Framework & Roadmap

Translate the architectural guidance from `docs/plan/001-init-project.md` into an actionable view for day-to-day development. The PowerX Plugin repository serves three purposes at once: a runnable skeleton, reusable framework packages, and the CLI/scaffold templates that new projects consume.

## Domain-driven layering

The skeleton codifies a four-layer DDD structure. Keep new code aligned with these boundaries to make template sync and framework extraction straightforward.

| Layer | Directory | Responsibility | Example |
|-------|-----------|----------------|---------|
| Transport | `internal/transport/http` / `internal/transport/grpc` | Adapt HTTP/gRPC payloads, validate input, call services | `internal/transport/http/admin/templates/handler.go` |
| Services | `internal/services/{domain}` | Orchestrate use cases, enforce business rules across aggregates | `internal/services/marketplace/listing_service.go` |
| Domain | `internal/entity/models/{domain}` + `internal/entity/repository/{domain}` | Define aggregates, value objects, repository interfaces | `internal/entity/models/marketplace/listing.go` |
| Infrastructure | Implementation under `internal/entity/repository/{domain}` plus shared adapters | Persist data, integrate external systems, expose observability | `internal/entity/repository/marketplace/listing_repository.go` |

`internal/manifestx/manifest.go` is the single source of truth for plugin ID, menus, permissions, and marketplace metadata. Route registration remains standardized: register framework routes first, then plugin routes via `RegisterPluginRoutes(app, routes.Register)`.

## Repository layout at a glance

```
framework/                 # Shared Go + frontend packages
scaffold/templates/**      # Rendered by px-plugin; no direct imports
tools/cli/                 # px-plugin source
skeleton/backend/          # Runnable reference implementation (Go)
skeleton/web-admin/        # Runnable admin frontend (Nuxt)
examples/starter/          # Generated sample from the scaffold
docs/                      # Plans, contracts, migration paths
```

When you add cross-cutting capabilities—observability, auth middleware, manifest helpers—place them in `framework/` first, wire them into the skeleton, and only then sync templates. This keeps third-party plugins on the happy path without duplicating code.

## Skeleton → template sync workflow

1. **Change the skeleton** (`skeleton/backend` or `skeleton/web-admin`). Treat it as the golden source.
2. **Run the sync script**: `npm run sync:templates` copies files into both `scaffold/templates/**` and `tools/cli/internal/templates/**`, applying replacements defined in `scripts/template-sync-config.yaml`.
3. **Verify before commit**: `npm run sync:templates -- --check` fails when drift remains; CI executes the same command.
4. **Extend coverage when needed**: update `template-sync-config.yaml` if you introduce new file types or placeholder rules.

## Phased roadmap (from `docs/plan`)

- **Phase 0 · Foundation** – Configure `go.work`, split modules (`framework/`, `tools/cli/`), wire npm workspaces for Nuxt layers, and enable baseline CI (lint, test, build).
- **Phase 1 · Contracts** – Finalize manifest/RBAC/auth/health contracts, publish OpenAPI & JSON Schema, and keep runtime validation in lockstep with the docs.
- **Phase 2 · Skeleton extraction** – Promote the Base plugin into `skeleton/**`, ensure CRUD samples run end to end, and guarantee template sync keeps scaffolds aligned.
- **Phase 3 · Framework split** – Move reusable code into `framework/backend/go` and `framework/frontend/**`, charter the SDKs, and provide upgrade notes for existing plugins.

Each phase should ship with documentation and migration notes. Before promoting a capability to the framework layer, update the English and Chinese docs together so partner teams stay aligned on status (“landed”, “in progress”, “planned”).
