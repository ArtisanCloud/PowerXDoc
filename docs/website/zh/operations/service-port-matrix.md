---
title: PowerX 系列仓库端口规范
---

# PowerX Core & Plugin Stack 端口规范

> 对应源文档：`docs/standards/_shared/service-port-matrix.md`

| 仓库 | 组件/服务 | 协议 | 默认端口 | 关键路径/配置 | 说明 |
|------|-----------|------|----------|---------------|------|
| **PowerX Core** (`Core/PowerX`) | HTTP API / WebSocket | HTTP / WS | `8077` | `etc/config_example.yaml` → `server.port` | 提供 REST API、WebSocket（`/ws`）与 Admin 控制台代理。 |
| | gRPC 入口 | gRPC | `9001` | `server.grpc.port` | 暴露内部 gRPC 服务，默认启用反射、健康检查，可通过 `CORE_X_SERVER_GRPC_PORT` 覆盖。 |
| | MCP Server | HTTP (SSE/WebSocket) | `8086` | `mcp.server.port` | MCP 控制通道，默认启动 `/mcp/sse`、`/mcp/message` 端点。 |
| | Agent 网关 | HTTP (SSE/WebSocket) | `8082` | `agent.port` | 供 Agent 运行时收发消息；模式默认为 `ws_sse`。 |
| | Web Admin（Nuxt） | Vite/Nuxi Dev | `3030` | `docs/guides/index.md` | 开发脚本 `npm run dev -- --port 3030`；冲突时可传 `--port` 自定义。 |
| | MinIO（示例） | HTTP | `9000` | `storage.s3.endpoint` | 示例配置用于媒体、制品存储。 |
| | Redis | TCP | `6379` | `cache.port` / `event_bus.redis_addr` | 缓存、事件总线、License 缓存共用。 |
| **PowerX Plugin Skeleton** (`Core/Plugins/PowerXPlugin`) | Backend HTTP | HTTP | `8078` | `config/config.yaml.example` → `server.listen` | 插件后端服务，监听健康检查 `/healthz` 与业务接口；默认使用 `8078`，与 Core MCP (`8086`) 分离，可通过 `PORT` 调整。 |
| | Backend gRPC | gRPC | `8079` | 同上 | 通过 `POWERX_GRPC_PORT` 覆盖。 |
| | Nuxt 管理端 | Vite/Nuxi Dev | `3031` | `docs/guide/standalone-mode.md` | 冲突时自动寻找空闲端口，可传 `--port`、`--hmr-port`。 |
| **PowerX Plugin Marketplace** (`Core/PowerXPluginMarket`) | HTTP API | HTTP | `8080` | `backend/etc/config.yaml` → `http.addr` | 提供插件上架、审核、制品分发等接口。 |
| | MinIO（示例） | HTTP | `9001` | `storage.endpoint` | 默认指向 `http://localhost:9001`，存放制品、许可证等对象。 |
| | Redis | TCP | `6379` | `license.redis.address` | License 续期、撤销及风险策略依赖 Redis。 |

## 常见覆盖方式

| 变量 | 仓库 | 用途 | 示例 |
|------|------|------|------|
| `CORE_X_SERVER_PORT` | PowerX Core | HTTP/WS 端口 | `CORE_X_SERVER_PORT=9080 go run ./cmd/app` |
| `CORE_X_SERVER_GRPC_PORT` | PowerX Core | gRPC 端口 | `CORE_X_SERVER_GRPC_PORT=9101` |
| `CORE_X_MCP_PORT` | PowerX Core | MCP 端口 | `CORE_X_MCP_PORT=9081` |
| `PORT` | PowerXPlugin | Backend HTTP | `PORT=8078 go run ./cmd/plugin` |
| `POWERX_GRPC_PORT` | PowerXPlugin | Backend gRPC | `POWERX_GRPC_PORT=8090 go run ./cmd/plugin` |
| `NUXT_PORT` / `PORT` | PowerXPlugin | Nuxt Dev | `npm run dev -- --port 3100 --hmr-port 43100` |
| `MARKETPLACE_HTTP_ADDR` | PowerXPluginMarket | API HTTP | `MARKETPLACE_HTTP_ADDR=":8180"` |

> ⚠️ 如需同时启动 Core 与 Plugin Skeleton，请保持插件后端使用 `8078`（或其它未占用端口），确保与 Core MCP (`8086`) 互不干扰。
