---
title: PowerX Port Matrix (Dev Defaults)
---

# PowerX Core & Plugin Stack – Default Ports

> Source reference: `docs/standards/_shared/service-port-matrix.md`

| Repo | Component | Protocol | Default Port | Config pointer | Notes |
|------|-----------|----------|--------------|----------------|-------|
| **PowerX Core** (`Core/PowerX`) | HTTP API / WebSocket | HTTP / WS | `8077` | `etc/config_example.yaml` → `server.port` | REST + WebSocket gateway for Admin console. |
| | gRPC endpoint | gRPC | `9001` | `server.grpc.port` | Internal gRPC surface. Override via `CORE_X_SERVER_GRPC_PORT`. |
| | MCP server | HTTP (SSE/WS) | `8086` | `mcp.server.port` | MCP message channel, exposes `/mcp/sse` & `/mcp/message`. |
| | Agent gateway | HTTP (SSE/WS) | `8082` | `agent.port` | Streams agent traffic (default mode `ws_sse`). |
| | Web Admin (Nuxt) | Vite/Nuxi dev | `3030` | Web Admin Dev Guide (`docs/guides/index.md`) | `npm run dev -- --port 3030`; adjust `--port` if conflicts. |
| | MinIO sample | HTTP | `9000` | `storage.s3.endpoint` | Example object store for media/artifacts. |
| | Redis | TCP | `6379` | `cache` / `event_bus.redis_addr` | Cache, event-bus, license cache share the same instance. |
| **PowerX Plugin Skeleton** (`Core/Plugins/PowerXPlugin`) | Backend HTTP | HTTP | `8078` | `config/config.yaml.example` → `server.listen` | Health check `/healthz` + plugin APIs; default `8078` keeps it distinct from Core MCP (`8086`), override with `PORT` if needed. |
| | Backend gRPC | gRPC | `8079` | Same doc | Override with `POWERX_GRPC_PORT`. |
| | Nuxt admin console | Vite/Nuxi dev | `3031` | `docs/guide/standalone-mode.md` | Auto-picks free port when conflicting. Use `--port`, `--hmr-port`. |
| **PowerX Plugin Marketplace** (`Core/PowerXPluginMarket`) | HTTP API | HTTP | `8080` | `backend/etc/config.yaml` → `http.addr` | Handles marketplace onboarding/release APIs. |
| | MinIO sample | HTTP | `9001` | `storage.endpoint` | Default bucket for plugin artifacts & licenses. |
| | Redis | TCP | `6379` | `license.redis.address` | Used by license renewal/revocation flows. |

## Common overrides

| Variable | Repo | Purpose | Example |
|----------|------|---------|---------|
| `CORE_X_SERVER_PORT` | PowerX Core | HTTP/WS port | `CORE_X_SERVER_PORT=9080 go run ./cmd/app` |
| `CORE_X_SERVER_GRPC_PORT` | PowerX Core | gRPC port | `CORE_X_SERVER_GRPC_PORT=9101` |
| `CORE_X_MCP_PORT` | PowerX Core | MCP port | `CORE_X_MCP_PORT=9081` |
| `PORT` | PowerXPlugin | Backend HTTP | `PORT=8078 go run ./cmd/plugin` |
| `POWERX_GRPC_PORT` | PowerXPlugin | Backend gRPC | `POWERX_GRPC_PORT=8090 go run ./cmd/plugin` |
| `NUXT_PORT` / `PORT` | PowerXPlugin | Nuxt dev | `npm run dev -- --port 3100 --hmr-port 43100` |
| `MARKETPLACE_HTTP_ADDR` | PowerXPluginMarket | API HTTP | `MARKETPLACE_HTTP_ADDR=":8180"` |

> ⚠️ Avoid port clashes when Core and Plugin Skeleton run together—keep the plugin backend on `8078` (or another free port) so it never collides with Core MCP (`8086`).
