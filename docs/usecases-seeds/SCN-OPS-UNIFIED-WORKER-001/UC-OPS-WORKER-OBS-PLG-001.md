doc_id: UC-OPS-WORKER-OBS-PLG-001
scn_id: SCN-OPS-UNIFIED-WORKER-001
title: 观测、告警与降级（插件侧）
status: Draft
version: v0.1.0
repo_key: powerx-plugin
scope: powerx-plugin
layer: ops
domain: ops
scenario_title: "统一 Worker 封装与双模式任务执行"
owners:
  - name: Michael Hu
    role: Product Manager
    contact: matrix-x@artisan-cloud.com
contributors: []
linked_requirements:
  - SCN-OPS-UNIFIED-WORKER-001-D
code_refs:
  - path: internal/worker/telemetry         # 指标/日志上报封装
    description: 输出模式标识、进度/状态回写字段、降级事件
  - path: internal/worker/config/alerts     # 告警/阈值配置
    description: 队列/回写/宿主投递/降级告警配置与抑制
  - path: cli/px-plugin-worker              # standalone 观测输出
    description: 本地日志/指标采集、降级状态标识
feature_flags:
  - worker-observability
  - worker-degradation
optional: false
last_reviewed_at: 2025-10-19

---

# Usecase Overview

- **业务目标**：插件侧在两种模式下输出一致的观测与告警字段，覆盖队列/并发/进度/回写/重试/取消/降级，支撑 Admin 看板与宿主监控。
- **成功度量**：核心指标/日志字段齐全且含模式标识；告警送达率 ≥99%；降级事件 100% 审计。
- **场景关联**：对应主场景子场景 D，与 standalone/宿主执行、取消、看板共享回写与模式字段。

# Key Steps

1. **指标输出**：采集队列/并发、成功/失败/重试/取消、宿主投递延迟、降级次数等指标，含租户/插件/模式。
2. **日志与回写**：日志与进度/状态回写包含模式标识与上下文，满足脱敏；回写 schema 与宿主一致。
3. **降级事件**：宿主不可用触发降级时记录事件、原因、策略（回退本地或失败）。
4. **告警抑制**：支持阈值与抑制策略，防止告警风暴；失败写审计。

# Acceptance Checklist

- [ ] 指标/日志/回写字段完整且含模式标识、租户/插件 ID。
- [ ] 告警阈值可配置并生效；失败/延迟/降级触发告警。
- [ ] 降级事件与宿主状态同步记录，含原因与执行节点。
- [ ] 观测输出与宿主模式字段对齐，便于看板聚合展示。
