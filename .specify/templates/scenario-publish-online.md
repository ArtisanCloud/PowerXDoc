scn_id: SCN-PUBLISH-ONLINE-001
title: 插件标准发布与 Marketplace 上架
status: Draft
version: v0.1.0
owners:
  - name: Michael Hu
    role: Scenario Steward
    contact: <tech@artisan-cloud.com>
  - name: Matrix-X
    role: Docs Coordinator
    contact: <dev@artisan-cloud.com>
domains: ['publish', 'marketplace', 'install']
layers: ['proto', 'api', 'service', 'ui']
repos:
  - key: powerx-plugin
    scope: plg
    responsibility: CLI 发布、审计日志
  - key: powerx-marketplace
    scope: mkp
    responsibility: 审核、目录管理、事件广播
  - key: powerx-backend
    scope: px
    responsibility: 目录同步、缓存刷新、安装编排
  - key: powerx-admin
    scope: admin
    responsibility: 市场展示、安装流程、运维日志
related_usecases:
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

本场景描述插件在 Marketplace 在线发布的端到端流程：PowerXPlugin CLI 提交发布请求，PowerXMarketplace 审核与安全扫描后写入目录并广播事件，PowerX Backend 同步目录与缓存，PowerX Admin 提供市场安装入口，实现插件从提交到可用的闭环交付。

# Scope & Guardrails

- **In Scope**：`px-plugin publish`；Marketplace 审核与事件；Backend 目录同步与安装 API；Admin 市场 UI。
- **Out of Scope**：离线导入、本地调试、收费策略。
- **Environment & Flags**：开启 `PX_MARKETPLACE_SYNC` 与 Admin `marketplace.enabled=true`；Marketplace 配置生产签名与安全扫描。

# Participants & Responsibilities

| Scope | Repository | Layer  | 责任与交付物                               | Owners |
|-------|------------|--------|-------------------------------------------|--------|
| plg   | powerx-plugin     | proto  | CLI 发布、审计日志输出、打包验证             | Michael Hu |
| mkp   | powerx-marketplace| api    | 审核、安全扫描、目录注册、事件广播         | Matrix-X |
| px    | powerx-backend    | service| 目录同步、缓存刷新、安装编排、License 校验  | Michael Hu |
| admin | powerx-admin      | ui     | 市场展示、安装向导、运维日志、失败恢复       | Matrix-X |

# End-to-End Flow

1. 开发者执行 `px-plugin publish`，CLI 上传包体、manifest、签名和审计日志。
2. Marketplace 审核与安全扫描，写入目录后广播 `mkp.plugin.published` 事件。
3. Backend 监听事件，校验签名、刷新目录与缓存，并创建安装任务；记录审计。
4. Admin 市场页面通过 GraphQL 展示新插件，管理员一键安装，安装结果与日志写回给运维团队。

# Key Interactions & Contracts

- CLI：`px-plugin publish`
- Marketplace API：`POST /marketplace/plugins`；事件 `mkp.plugin.published`
- Backend API：安装、目录刷新、缓存失效；License 校验
- Admin GraphQL：`listMarketplacePlugins`、安装向导 API

# Usecase Links

- PLG-PUBLISH-ONLINE-001
- MKP-PUBLISH-ONLINE-001
- PX-PUBLISH-ONLINE-001
- PX-PUBLISH-ONLINE-UI-001

# Acceptance Criteria

1. 发布后 5 分钟内，Admin 市场列表可搜索到插件且元数据同步一致。
2. 所有关键指标写入审计，并在告警渠道可追踪。
3. 指标 `publish_online.success_rate` ≥ 99%，告警阈值可配置且正常生效。

# Telemetry & Ops

- 指标：`marketplace.publish.duration`、`powerx.catalog.sync.latency`、`admin.plugin.install.time_to_ready`
- 告警：审核失败率 > 5% 触发 PagerDuty；目录同步延迟 ≥ 2 次事件触发高优先级告警；安装失败自动通知维护人
- 观测来源：Marketplace telemetry dashboards、Backend workflow metrics、Admin Sentry

# Open Issues & Follow-ups

| 风险/事项 | 影响范围 | 负责人 | ETA |
|-----------|----------|--------|-----|
| 审核高峰时事件延迟，需要扩容队列或调整 SLA | MKP, PX | Matrix-X | 2025-02-15 |
| Admin 安装缺少重试按钮，需要补 UI 提示 | admin | Matrix-X | 2025-02-10 |

# Appendix

- docs/meta/scenarios/plugin/publish.md
- docs/standards/powerx-plugin/integration/01_plugin_lifecycle/Versioning_and_Publishing.md
- docs/standards/powerx-marketplace/发布和下载插件流程.md
- docs/standards/powerx-backend/plugins/admin_workflow.md
- docs/standards/powerx-admin/plugins/admin_workflow.md
