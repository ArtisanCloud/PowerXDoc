scn_id: SCN-DEV-HOTLOAD-001
title: 插件本地开发热加载与快速验证
status: Draft
version: v0.1.0
owners:
  - name: Li Wei
    role: Scenario Steward
    contact: <li.wei@artisan-cloud.com>
domains: ['dev', 'publish']
layers: ['proto', 'service', 'ui']
repos:
  - key: powerx-plugin
    scope: plg
    responsibility: CLI 热加载与构建输出
  - key: powerx
    scope: px
    responsibility: Dev API、沙盒容器与 Web Admin 调试面板
related_usecases:
  - doc_id: PLG-DEV-HOTLOAD-001
    layer: proto
    domain: dev
  - doc_id: PX-DEV-HOTLOAD-001
    layer: service
    domain: dev
  - doc_id: PX-ADMIN-DEV-HOTLOAD-001
    layer: ui
    domain: dev
last_reviewed_at: 2025-10-24

---

# Executive Summary

本场景描述开发者通过 `px-plugin dev --watch` 在本地热加载调试插件的流程，确保快速、无 Marketplace 依赖地验证功能。CLI 负责构建与 watcher，PowerX Core（Backend）Dev API 管理沙盒容器，PowerX Core（Web Admin）调试面板提供实时日志与控制。

# Scope & Guardrails

- **In Scope**：本地热加载、Dev API、Admin 调试面板。
- **Out of Scope**：离线导入、在线发布、收费与 License 管理。
- **Environment & Flags**：启用 `PX_DEV_PLUGIN_HOTLOAD`、Admin 打开开发者模式、配置本地 mTLS 凭据。

# Participants & Responsibilities

| Scope | Repository | Layer  | 责任与交付物                         | Owners |
|-------|------------|--------|--------------------------------------|--------|
| plg   | powerx-plugin             | proto  | CLI 热加载、watcher、构建输出        | Li Wei |
| px-svc| powerx（Backend Services）| service| Dev API、沙盒容器、日志与审计          | Carol |
| px-ui | powerx（Web Admin）     | ui     | 调试面板、日志展示、控制操作          | Dave |

# End-to-End Flow

1. 执行 `px-plugin dev --watch`，CLI 输出构建产物并启动 watcher。
2. CLI 调用 `POST /internal/dev/plugins/register` 注册本地插件，PowerX Core Backend 创建沙盒容器。
3. 文件变化时 CLI 触发 `POST /internal/dev/plugins/reload`，容器热重载并向 Web Admin 推送日志。
4. 调试完成执行 `px-plugin dev --stop`，CLI 调用 `DELETE /internal/dev/plugins/register` 清理会话，PowerX Core Backend 记录审计。

# Key Interactions & Contracts

- CLI：`px-plugin dev --watch/--stop`
- PowerX Core（Backend）Dev API：注册、重载、删除本地插件会话
- PowerX Core（Web Admin）SSE/WebSocket：推送实时日志与状态

# Usecase Links

- PLG-DEV-HOTLOAD-001
- PX-DEV-HOTLOAD-001
- PX-ADMIN-DEV-HOTLOAD-001

# Acceptance Criteria

1. 热重载延迟 ≤ 2 秒，日志实时刷新。
2. 会话结束自动回收容器与端口，并生成审计记录。
3. CLI/Dev API 错误提供明确提示与重试指引。

# Telemetry & Ops

- 指标：`dev.hotload.reload_time_ms`、`dev.hotload.active_sessions`、`dev.hotload.reload_failures`
- 告警：连续 3 次热加载失败触发 `#powerx-dev-alerts`；闲置 > 60 分钟自动清理并通知
- 观测：CLI 日志、PowerX Core Backend Dashboard、Web Admin 调试面板

# Open Issues & Follow-ups

| 风险/事项 | 影响范围 | 负责人 | ETA |
|-----------|----------|--------|-----|
| 大型资源构建耗时长，需增量编译方案 | plg | Li Wei | 2025-02-20 |
| 沙盒缺少资源配额监控，存在滥用风险 | px  | Carol | 2025-02-12 |

# Appendix

- docs/meta/scenarios/plugin/publish.md
- docs/standards/powerx-plugin/deploy/local_debug.md
- docs/standards/powerx/backend/plugins/sts_flow.md
- docs/standards/powerx/web-admin/plugins/host_plugin_grpc.md
