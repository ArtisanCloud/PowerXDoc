doc_id: UC-OPS-PLUGIN-AUTO-UPGRADE-001
scn_id: SCN-OPS-PLUGIN-LIFECYCLE-001
title: Automated Canary Upgrade and Rollback Governance
status: Draft
version: v0.1.0
repo_key: powerx
scope: powerx
layer: ops
domain: ops
scenario_title: "PowerX Plugin Installation & Operations"
owners:
  - name: Matrix Ops
    role: Platform Ops Lead
    contact: ops@artisan-cloud.com
  - name: Eva Zhang
    role: Automation Steward
    contact: automation@artisan-cloud.com
contributors: []
linked_requirements:
  - SCN-OPS-PLUGIN-LIFECYCLE-001-C
code_refs:
  - repo: powerx
    path: internal/plugins/runtime/upgrade/planner.go
    description: Version comparison, upgrade plan generation, maintenance window management
  - repo: powerx
    path: internal/plugins/runtime/upgrade/gray_deployer.go
    description: Canary instance deployment, configuration loading, progress tracking
  - repo: powerx
    path: internal/plugins/runtime/healthcheck/probe.go
    description: Upgrade health checks, metric threshold validation, failure strategies
  - repo: powerx
    path: internal/plugins/runtime/traffic/shifter.go
    description: Traffic switching, rollback channels, concurrency control
  - repo: powerx
    path: pkg/audit/plugins/upgrade_reporter.go
    description: Upgrade report generation, alert notifications, audit logging
feature_flags:
  - plugin-upgrade-scheduler
  - plugin-traffic-shifter
  - plugin-upgrade-pause
optional: false
last_reviewed_at: 2025-11-02

---

# Usecase Overview

- **Business Objective**: When new plugin versions are detected, ensure business continuity through automated canary upgrades, providing closed-loop capabilities for health checks, traffic switching, automatic rollback, reporting and notifications.
- **Success Metrics**: Upgrade success rate ≥ 95%; canary coverage ≥ 20%; rollback response < 1 minute; upgrade report generation ≤ 5 minutes.
- **Scenario Association**: "Corresponds to main scenario `SCN-OPS-PLUGIN-LIFECYCLE-001` Stage 2-4, supporting upgrade task execution, traffic governance and audit."

> Through upgrade planning, canary deployment and metric-driven traffic switching, achieve robust automatic upgrades with second-level rollback to ensure business safety on anomalies.

# Context & Assumptions

- **Prerequisites**
  - Feature Flags `plugin-upgrade-scheduler`, `plugin-traffic-shifter`, `plugin-upgrade-pause` are enabled.
  - Upgrade tasks have access to Marketplace version lists and image repository permissions.
  - Monitoring platform provides health metrics (latency, error rate, resource consumption) with threshold configuration support.
  - Audit and notification systems can receive upgrade process events.
- **Input/Output**
  - Input: target version, maintenance window, canary ratio, health check rules, rollback strategy.
  - Output: upgrade execution status, health check results, traffic switching progress, rollback results, upgrade report.
- **Boundaries**
  - Not responsible for version building and Marketplace publishing; not covering manual upgrades; not handling cross-tenant differential configurations.

# Solution Blueprint

## System Decomposition

| Module | Responsibility | Code Entry Point |
|--------|----------------|------------------|
| UpgradePlanner | Version diff analysis, maintenance window and canary plan generation | `internal/plugins/runtime/upgrade/planner.go` |
| GrayDeployer | Canary instance deployment, configuration sync, progress tracking | `internal/plugins/runtime/upgrade/gray_deployer.go` |
| HealthProbe | Health check execution, metric threshold validation, failure strategies | `internal/plugins/runtime/healthcheck/probe.go` |
| TrafficShifter | Traffic switching, rollback channels, batch progression | `internal/plugins/runtime/traffic/shifter.go` |
| UpgradeReporter | Upgrade reports, notification distribution, audit logging | `pkg/audit/plugins/upgrade_reporter.go` |

## Process & Timeline

1. **Step 1 – Version Comparison & Planning**: UpgradePlanner compares versions, generates canary plan and maintenance window, notifies operations for confirmation.
2. **Step 2 – Canary Deployment**: GrayDeployer deploys canary instances according to plan, loads configuration and binds monitoring probes.
3. **Step 3 – Health Check & Traffic Switching**: HealthProbe validates metrics, TrafficShifter switches traffic by ratio and retains rollback channels.
4. **Step 4 – Completion & Reporting**: On success, generate report and update version status; on failure, trigger automatic rollback and alerts.

```mermaid
sequenceDiagram
  participant Planner as UpgradePlanner
  participant Deployer as GrayDeployer
  participant Monitor as HealthProbe
  participant Traffic as TrafficShifter
  participant Reporter as UpgradeReporter
  participant Ops as Operations

  Planner->>Deployer: Create upgrade plan
  Deployer->>Monitor: Register health checks
  Deployer->>Traffic: Notify canary deployment complete
  Traffic->>Monitor: Fetch health metrics
  Monitor-->>Traffic: Return evaluation results
  Traffic->>Traffic: Switch traffic or trigger rollback
  Traffic->>Reporter: Report upgrade progress
  Reporter->>Ops: Send upgrade report/alerts
```


# Contracts & Interfaces

- **Inbound APIs / Events**
  - `POST /api/plugins/upgrade/plan` — 创建或更新升级计划。
  - `POST /api/plugins/upgrade/execute` — 启动升级任务。
  - `POST /api/plugins/upgrade/rollback` — 触发回滚。
  - `EVENT plugin.upgrade.progress`、`EVENT plugin.upgrade.rollback` — 升级进度与回滚事件。
- **Outbound 调用**
  - `GET /marketplace/plugins/{id}/releases` — 获取版本与镜像信息。
  - `POST /monitoring/check` — 触发健康检查并返回指标。
  - `POST /notify/ops` — 升级进度、回滚、报告通知运维与管理员。
  - `POST /audit/logs` — 记录版本切换、回滚、审批。
- **配置与脚本**
  - `config/plugins/upgrade_windows.yaml` — 维护窗口、灰度比例、暂停策略。
  - `config/plugins/health_checks.yaml` — 健康指标、阈值、重试策略。
  - `docs/standards/powerx-plugin/lifecycle/capabilities.md` — 升级能力与回滚要求。

# Implementation Checklist

| 项目 | 描述 | 完成状态 | 负责人 |
|------|------|----------|--------|
| 计划生成 | 支持按租户/插件配置灰度比例、维护窗口、暂停开关 | [ ] | Matrix Ops |
| 健康检查 | 丰富指标模板、支持自定义脚本与失败降级策略 | [ ] | Eva Zhang |
| 流量切换 | 提供分批进度控制、快照回滚、并发限制 | [ ] | Matrix Ops |
| 报告生成 | 输出升级总结、指标、回滚信息、通知渠道 | [ ] | Eva Zhang |
| 控制台集成 | 展示升级进度、健康状态、手动暂停/恢复按钮 | [ ] | Matrix Ops |

# Testing Strategy

- **单元测试**：计划生成、维护窗口校验、健康检查评估、流量切换状态机、回滚流程。
- **集成测试**：执行 primary.md C-1、C-2 用例；模拟健康检查失败、指标异常、回滚路径；验证暂停/恢复开关。
- **端到端验证**：在预生产环境上线新版本，观察灰度覆盖、指标、流量切换、报告；验证回滚恢复能力。
- **非功能测试**：大规模租户并发升级、健康检查超时、Marketplace 不可用、监控延迟。

# Observability & Ops

- **指标**：`plugin.upgrade.success_rate`、`plugin.upgrade.duration_p95`、`plugin.upgrade.rollback_total`、`plugin.upgrade.gray_coverage`、`plugin.upgrade.healthcheck_failure_total`。
- **日志**：记录 `plugin_id`、`from_version`、`to_version`、`gray_ratio`、`stage`、`status`、`rollback_reason`。
- **告警**：健康检查失败率 >5%、升级超出维护窗口、回滚失败、暂停状态超过 12 小时。
- **Dashboards**：Grafana `Runtime Ops / Plugin Upgrade`、Datadog `plugin.upgrade.*`、Ops 控制台升级视图。

# Rollback & Failure Handling

- **回滚步骤**：TrafficShifter 切换回旧版本、撤销新实例、恢复配置和流量；UpgradeReporter 更新报告。
- **补救措施**：保留旧版本配置快照；在灰度阶段可自动暂停并人工诊断；提供“重放灰度”脚本。
- **数据修复**：更新审计状态、重建升级报告、同步版本元数据；通知相关团队。

# Follow-ups & Risks

| 风险/事项 | 影响 | 缓解方案 | 负责人 | ETA |
|-----------|------|----------|--------|-----|
| 部分插件缺少专属健康指标导致误判 | 升级可靠性 | 引入“指标模板库”，支持按插件定制 | Matrix Ops | 2025-11-16 |
| 暂停开关仅支持全局，无法按租户细化 | 运营灵活性 | 支持租户/插件级暂停；更新控制台配置 | Eva Zhang | 2025-11-20 |

# References & Links

- 主场景：`docs/scenarios/runtime-ops/SCN-OPS-PLUGIN-LIFECYCLE-001.md`
- 子场景：`docs/scenarios/runtime-ops/SCN-OPS-PLUGIN-AUTO-UPGRADE-001.md`
- 背景材料：`docs/meta/scenarios/powerx/core-platform/runtime-ops/plugin-install-and-ops/primary.md`
- 标准文档：`docs/standards/powerx-plugin/lifecycle/capabilities.md`
