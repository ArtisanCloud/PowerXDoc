---
scn_id: SCN-PUBLISH-OFFLINE-001
title: 插件离线包生成与手工导入
status: Draft
version: v0.1.0
owners:
  - name: Michael Hu
    role: Scenario Steward
    contact: <tech@artisan-cloud.com>
  - name: Matrix-X
    role: Docs Coordinator
    contact: <dev@artisan-cloud.com>
domains: ['publish', 'install', 'offline']
layers: ['proto', 'service', 'ui']
repos:
  - key: powerx-plugin
    scope: plg
    responsibility: 离线打包、manifest、签名
  - key: powerx
    scope: px
    responsibility: 离线导入 API、验证与目录注册
  - key: powerx
    scope: admin
    responsibility: 离线导入向导、安装日志反馈
related_usecases:
  - doc_id: PLG-PUBLISH-OFFLINE-001
    layer: proto
    domain: publish
  - doc_id: MKP-PUBLISH-OFFLINE-001
    layer: api
    domain: marketplace
  - doc_id: PX-PUBLISH-OFFLINE-001
    layer: service
    domain: publish
  - doc_id: PX-ADMIN-PUBLISH-OFFLINE-001
    layer: ui
    domain: publish
last_reviewed_at: 2025-10-24

---

# Executive Summary

本场景覆盖离线环境下插件分发流程：PowerXPlugin 生成 `.pxp` 离线包，PowerX Core Web Admin 提供导入界面并调用 PowerX Core Backend Offline Import，Backend 校验包体、注册目录并刷新缓存，确保在无 Marketplace 的情况下也能完成插件发布。

# Scope & Guardrails

- **In Scope**：离线打包 (`px-plugin dist`)、Admin 离线导入向导、Backend 导入/校验/目录注册。
- **Out of Scope**：在线审核、自动升级与灰度发布、收费策略。
- **Environment & Flags**：启用 `PX_OFFLINE_IMPORT`；配置可信 CA 证书与 manifest 签名；Admin 支持对象存储或磁盘上传。

# Participants & Responsibilities

| Scope | Repository | Layer  | 责任与交付物                     | Owners |
|-------|------------|--------|----------------------------------|--------|
| plg   | powerx-plugin             | proto  | 生成 `.pxp`、manifest、签名         | Michael Hu |
| mkp   | powerx-marketplace        | api    | 离线包登记与元数据校验（可选）      | Matrix-X |
| px    | powerx    | service| 导入 API、签名校验、目录注册、缓存刷新 | Michael Hu |
| admin | powerx      | ui     | 离线导入向导、日志与失败重试提示      | Matrix-X |

# End-to-End Flow

1. `px-plugin dist` 生成离线包与签名文件。
2. Admin 在离线导入界面上传包体，调用 `POST /internal/plugins/import-offline`。
3. Backend 校验签名、解压、注册目录并刷新缓存，记录 `PX_PLUGIN_IMPORT` 审计。
4. Admin 展示安装状态与日志，提供失败重试与撤销操作。

# Key Interactions & Contracts

- CLI：`px-plugin dist`
- Backend API：`POST /internal/plugins/import-offline`，返回 `install_job_id`、`audit_id`
- 数据契约：`plugin.yaml`、`manifest.signature`、`integrity.txt`
- 指标/审计：`offline.import.duration`、`offline.import.success_rate`、`PX_PLUGIN_IMPORT`

# Usecase Links

- PLG-PUBLISH-OFFLINE-001
- MKP-PUBLISH-OFFLINE-001
- PX-PUBLISH-OFFLINE-001
- PX-ADMIN-PUBLISH-OFFLINE-001

# Acceptance Criteria

1. 导入成功率 ≥ 98%，失败产生明确 `audit_id` 与重试指引。
2. 包体或签名校验失败时提供清晰错误原因。
3. 导入完成后 3 分钟内，Web Admin 列表可见插件并允许撤销。

# Telemetry & Ops

- 指标：`offline.import.duration`、`offline.import.success_rate`、`offline.import.signature_failures`
- 告警：连续 3 次导入失败触发 SRE 通知；无法写入审计日志触发高优先级告警
- 观测：Backend Prometheus、Web Admin Sentry、离线导入日志

# Open Issues & Follow-ups

| 风险/事项 | 影响范围 | 负责人 | ETA |
|-----------|----------|--------|-----|
| 缺少离线包批量校验脚本 | px | Michael Hu | 2025-02-05 |
| Web Admin 上传缺少进度反馈 | admin | Matrix-X | 2025-01-30 |

# Appendix

- docs/meta/scenarios/plugin/publish.md
- docs/standards/powerx-plugin/deploy/release_package.md
- docs/standards/powerx/backend/plugins/admin_workflow.md
- docs/standards/powerx/web-admin/plugins/admin_workflow.md
