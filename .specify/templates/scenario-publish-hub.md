scn_id: SCN-PUBLISH-HUB-001
title: PowerX 插件开发与分发全链路
status: Draft
version: v0.1.0
owners:
  - name: Michael Hu
    role: Scenario Steward
    contact: <tech@artisan-cloud.com>
  - name: Matrix-X
    role: Docs Coordinator
    contact: <dev@artisan-cloud.com>
domains: ['dev', 'publish', 'marketplace', 'install']
layers: ['proto', 'api', 'service', 'ui']
repos:
  - key: powerx-plugin
    scope: plg
    responsibility: CLI/SDK 构建、热加载与打包发布
  - key: powerx-marketplace
    scope: mkp
    responsibility: 审核与目录管理、事件分发
  - key: powerx-backend
    scope: px
    responsibility: 目录同步、安装编排、生命周期治理
  - key: powerx-admin
    scope: admin
    responsibility: 运维界面、离线导入、安装与调试能力
related_usecases:
  - doc_id: PLG-DEV-HOTLOAD-001
    layer: proto
    domain: dev
  - doc_id: PX-DEV-HOTLOAD-001
    layer: service
    domain: dev
  - doc_id: PX-DEV-HOTLOAD-UI-001
    layer: ui
    domain: dev
  - doc_id: PLG-PUBLISH-OFFLINE-001
    layer: proto
    domain: publish
  - doc_id: MKP-PUBLISH-OFFLINE-001
    layer: api
    domain: marketplace
  - doc_id: PX-PUBLISH-OFFLINE-001
    layer: service
    domain: publish
  - doc_id: PX-PUBLISH-OFFLINE-UI-001
    layer: ui
    domain: publish
  - doc_id: PLG-PUBLISH-ONLINE-001
    layer: proto
    domain: publish
  - doc_id: MKP-PUBLISH-ONLINE-001
    layer: api
    domain: marketplace
  - doc_id: PX-PUBLISH-ONLINE-001
    layer: service
    domain: catalog
  - doc_id: PX-PUBLISH-ONLINE-UI-001
    layer: ui
    domain: marketplace
last_reviewed_at: {{LAST_REVIEWED_AT}}

---

# Executive Summary

PowerX 插件生态支持开发者从本地调试、离线分发到在线发布的完整旅程。PowerXPlugin 提供 CLI/SDK，PowerXMarketplace 负责审核与目录分发，PowerX Backend 负责安装编排与生命周期治理，PowerX Admin 提供运维界面。三个流程通过标准化工具链和事件契约协同，确保插件安全高效交付。

# Scope & Guardrails

- **In Scope**：覆盖开发/热加载、离线导入、在线发布全链路。
- **Out of Scope**：收费与 License 策略、第三方安全审计、运行期性能优化。
- **Environment & Flags**：依流程启用 `PX_DEV_PLUGIN_HOTLOAD`、`PX_OFFLINE_IMPORT`、`PX_MARKETPLACE_SYNC` 等特性，并在 Admin/Marketplace 中配置对应开关与凭据。

# Participants & Responsibilities

| Scope | Repository | Layer  | 责任与交付物                               | Owners |
|-------|------------|--------|-------------------------------------------|--------|
| plg   | powerx-plugin     | proto  | CLI/SDK；热加载、离线打包与在线发布           | Michael Hu |
| mkp   | powerx-marketplace| api    | 审核与安全扫描；目录管理；事件广播             | Matrix-X |
| px    | powerx-backend    | service| 目录同步、安装编排、缓存治理、License 校验    | Michael Hu |
| admin | powerx-admin      | ui     | 运维面板；离线导入；市场安装与日志展示          | Matrix-X |

# End-to-End Flow

1. **本地调试**：开发者使用 `px-plugin dev --watch`，Backend Dev API 管理沙盒，Admin 调试面板展示日志。
2. **离线导入**：`px-plugin dist` 生成 `.pxp`，Admin 上传并触发 Backend Offline Import。
3. **在线发布**：CLI 发布请求到 Marketplace，审核通过后广播事件，Backend 同步目录，Admin 市场提供安装入口。

# Key Interactions & Contracts

- CLI：`px-plugin dev/dist/publish`、`px-admin plugin upload`
- Backend API：Dev 注册/重载、Offline Import、Install、缓存刷新
- Marketplace：`POST /marketplace/plugins`、事件 `mkp.plugin.published`
- 数据契约/指标：`plugin.yaml`、`manifest.signature`、`publish_online.success_rate` 等

# Usecase Links

- PLG-DEV-HOTLOAD-001、PX-DEV-HOTLOAD-001、PX-DEV-HOTLOAD-UI-001
- PLG-PUBLISH-OFFLINE-001、MKP-PUBLISH-OFFLINE-001、PX-PUBLISH-OFFLINE-001、PX-PUBLISH-OFFLINE-UI-001
- PLG-PUBLISH-ONLINE-001、MKP-PUBLISH-ONLINE-001、PX-PUBLISH-ONLINE-001、PX-PUBLISH-ONLINE-UI-001

# Acceptance Criteria

1. 三种流程提供成功/失败信号并附审计及重试指引。
2. 关键指标（热加载响应、离线导入成功率、在线发布时延）达到阈值且可观测。
3. Admin 市场及离线导入界面在流程结束后 5 分钟内反映最新状态。

# Telemetry & Ops

- 指标：`dev.hotload.reload_time_ms`、`offline.import.success_rate`、`marketplace.publish.duration`、`powerx.catalog.sync.latency`、`admin.plugin.install.time_to_ready`
- 告警：热加载连续失败、离线导入失败率 > 2%、Marketplace 审核延迟等
- 观测：PowerXPlugin CLI、Prometheus Dashboard、Admin Sentry、Marketplace telemetry

# Open Issues & Follow-ups

| 风险/事项 | 影响范围 | 负责人 | ETA |
|-----------|----------|--------|-----|
| Marketplace 审核高峰导致时延，需要扩容队列或调整 SLA | MKP, PX | Matrix-X | 2025-02-15 |
| 离线导入缺少批量校验脚本，需要自动化 | PX | Michael Hu | 2025-02-05 |
| 开发模式日志未统一归档至中央观测系统 | PLG, PX | Li Wei | 2025-02-10 |

# Appendix

- docs/meta/scenarios/plugin/publish.md
- docs/standards/powerx-plugin/integration/01_plugin_lifecycle/Versioning_and_Publishing.md
- docs/standards/powerx-marketplace/发布和下载插件流程.md
- docs/standards/powerx-backend/plugins/admin_workflow.md
- docs/standards/powerx-admin/plugins/admin_workflow.md
