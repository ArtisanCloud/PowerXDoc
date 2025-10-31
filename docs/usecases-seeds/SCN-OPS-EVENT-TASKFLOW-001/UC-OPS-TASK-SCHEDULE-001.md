doc_id: UC-OPS-TASK-SCHEDULE-001
scn_id: SCN-OPS-EVENT-TASKFLOW-001
title: 调度中心 Cron/事件触发任务管理
status: Draft
version: v0.1.0
repo_key: powerx
scope: powerx
layer: ops
domain: ops
scenario_title: "PowerX 事件与任务流管理"
owners:
  - name: Matrix Ops
    role: Platform Ops Lead
    contact: ops@artisan-cloud.com
  - name: Eva Zhang
    role: Automation Steward
    contact: automation@artisan-cloud.com
contributors: []
linked_requirements:
  - SCN-OPS-EVENT-TASKFLOW-001-B
code_refs:
  - repo: powerx
    path: internal/tasks/scheduler/cron_engine.go
    description: Cron 解析、触发窗口计算与去抖动
  - repo: powerx
    path: internal/tasks/scheduler/planner.go
    description: 任务规划、资源校验、互斥锁治理
  - repo: powerx
    path: internal/tasks/executor/runtime_client.go
    description: 任务执行请求封装、SLA/Timeout 管理
  - repo: powerx
    path: internal/tasks/monitoring/task_metrics_collector.go
    description: 指标采集、状态变更事件写入
  - repo: powerx
    path: pkg/ops/sla_notifier.go
    description: SLA 违规检测、告警与工单生成
feature_flags:
  - task-scheduler-v3
  - task-sla-monitor
  - task-retry-queue
optional: false
last_reviewed_at: 2025-10-31

---

# Usecase Overview

- **业务目标**：让平台管理员能够按 Cron 或事件规则自动触发插件任务，保证在 SLA 内完成执行、留痕及失败补偿，支持资源冲突治理与调度预警。
- **成功度量**：调度准时率 ≥ 98%，执行成功率 ≥ 97%；资源冲突提前预警命中率 ≥ 90%；任务状态可追踪率 100%。
- **场景关联**：对应主场景 `SCN-OPS-EVENT-TASKFLOW-001` Stage 2，为 Agent 自动化和重试闭环提供可依赖的调度基线。

> 打造统一任务调度中心，覆盖 Cron 配置、预检、执行调用、SLA 监控与重试触发，减少人工干预。

# Context & Assumptions

- **前置条件**
  - `task-scheduler-v3`、`task-sla-monitor`、`task-retry-queue` Feature Flag 已启用。
  - 调度中心具备高可用实例，使用 Redis/Etcd 作为锁与计划存储，执行队列接入 Kafka。
  - 插件运行时接口已支持幂等执行、SLA 报告与日志存档。
  - 运维在 Ops 控制台配置了租户配额、执行窗口与冲突策略。
- **输入/输出**
  - 输入：Cron 表达式、任务参数、租户配额、执行目标（插件实例/Agent）、事件触发信号。
  - 输出：任务实例（ID、状态、开始/结束时间）、执行日志、指标、告警、重试工单。
- **边界**
  - 不负责插件内部逻辑与资源扩缩容，仅校验调度层配额；
  - 不处理跨租户共享任务（由多租户场景覆盖）；
  - 不覆盖手工运维任务的审批流程。

# Solution Blueprint

## 体系分解

| 层 | 主要组件/模块 | 责任 | 代码入口 |
|----|---------------|------|---------|
| 调度核心 | `internal/tasks/scheduler/cron_engine.go` | 解析 Cron、维护触发窗口、去抖动与错峰 | `services/tasks/scheduler` |
| 计划器 | `internal/tasks/scheduler/planner.go` | 资源校验、互斥锁、冲突检测与排队策略 | `services/tasks/scheduler` |
| 执行客户端 | `internal/tasks/executor/runtime_client.go` | 发送执行请求、处理超时、回传状态事件 | `services/tasks/executor` |
| 监控层 | `internal/tasks/monitoring/task_metrics_collector.go` | 收集执行指标、状态变更、写入事件中心 | `services/tasks/monitoring` |
| SLA/告警 | `pkg/ops/sla_notifier.go` | 检测 SLA 违约、触发 PagerDuty/工单 | `pkg/ops` |

## 流程与时序

1. **Step 1 – 任务登记**：管理员或 API 调用 `registerTask`，写入 Cron/事件规则与元数据。
2. **Step 2 – 预检与计划**：触发窗口前执行资源校验、互斥锁检查，必要时重排队列或发出预警。
3. **Step 3 – 调度执行**：到达触发时间后调用插件运行时/Agent 接口，记录追踪 ID，订阅执行事件。
4. **Step 4 – 状态追踪**：Executor 收到执行结果或心跳，更新任务状态，写入指标与审计。
5. **Step 5 – 失败补偿**：失败任务根据策略进入重试队列、延迟计划或生成工单。

# Contracts & Interfaces

- **Inbound APIs / Events**
  - `POST /internal/tasks/register` — 新建任务，校验租户、Cron、互斥策略。
  - `PUT /internal/tasks/{id}/pause`、`PUT /internal/tasks/{id}/resume` — 控制任务生命周期。
  - `EVENT task.execution.updated` — 执行状态回传（progress/success/failure）。
- **Outbound 调用**
  - `POST /plugin/runtime/{pluginId}/execute` — 插件任务执行接口，包含 `task_id`、参数、Trace 上下文。
  - `POST /ops/capacity/reserve` — 预留资源、更新配额。
  - `POST /notifications/sla-breach` — SLA 违约告警。
- **配置与脚本**
  - `config/tasks/default_policy.yaml` — 默认重试、冲突、SLA 策略。
  - `scripts/ops/task-dryrun.mjs` — 调度前置验证。
  - `scripts/ops/task-sla-report.mjs` — SLA 报告生成。

# Implementation Checklist

| 项目 | 描述 | 完成状态 | 负责人 |
|------|------|----------|--------|
| Cron 引擎 | 升级 Cron 解析、去抖、错峰策略并补充单元测试 | [ ] | Matrix Ops |
| 资源预检 | 接入租户配额、互斥策略、冲突检测 | [ ] | Eva Zhang |
| 执行链路 | 完善 runtime_client 调用、超时/重试处理 | [ ] | Matrix Ops |
| 观测 | 增加执行指标、日志、Ops 控制台任务面板 | [ ] | Eva Zhang |
| Runbook | 更新任务调度 Runbook、预警/告警 SOP | [ ] | Matrix Ops |

# Testing Strategy

- **单元测试**：Cron 解析、错峰算法、配额/冲突校验、任务状态机。
- **集成测试**：执行用例 B-1 验证按计划触发、配额足够；执行 B-2 验证资源不足时排队与扩容预警；模拟事件驱动任务。
- **端到端验证**：在沙箱租户配置日常任务，监控调度准时率、执行日志、Ops 控制台展示与告警；验证失败后进入重试并更新指标。
- **非功能测试**：压测 10k 定时任务并发调度，观察锁争用；Chaos 注入 Redis 集群故障验证降级与恢复。

# Observability & Ops

- **指标**：`task.scheduler.on_time_rate`、`task.scheduler.missed_total`、`task.execution.success_total`、`task.execution.retry_total`、`task.sla.breach_total`。
- **日志**：记录 `task_id`, `tenant_id`, `trigger_time`, `actual_start`, `duration_ms`, `status`, `retry_count`, `error_code`。
- **告警**：调度失败率 >5%/5 分钟触发 PagerDuty；连续 3 次 SLA 违约升级到运维经理；锁争用 >70% 时提示扩容。
- **Dashboards**：Grafana `Runtime Ops / Scheduler Overview`、Datadog `task.scheduler.*`、Ops 控制台任务时间线。

# Rollback & Failure Handling

- **回滚步骤**：恢复旧版 Scheduler/Planner 镜像，回滚配置，关闭新特性 Flag，重新部署 Cron 表。
- **补救措施**：使用 `task-dryrun.mjs` 检测待执行任务，人工触发关键任务或通知租户，调整配额/互斥策略。
- **数据修复**：通过 SQL 更新错误状态、重新计算下次执行时间；使用 `task-sla-report.mjs --rebuild` 修复指标。

# Follow-ups & Risks

| 风险/事项 | 影响 | 缓解方案 | 负责人 | ETA |
|-----------|------|----------|--------|-----|
| 调度中心集群扩容策略未自动化 | 高峰期可能触发 SLA 违约 | 接入自动扩容脚本、扩展指标预警 | Matrix Ops | 2025-11-08 |
| 互斥策略配置复杂易误配 | 任务被意外阻塞 | 在控制台提供模板与检测脚本 | Eva Zhang | 2025-11-15 |

# References & Links

- 主场景：`docs/scenarios/runtime-ops/SCN-OPS-EVENT-TASKFLOW-001.md`
- 背景材料：`docs/meta/scenarios/powerx/core-platform/runtime-ops/event-and-taskflow-management/primary.md`
- 运行参考：`scripts/ops/task-dryrun.mjs`、`scripts/ops/task-sla-report.mjs`
