doc_id: UC-OPS-WORKER-ADMIN-BOARD-PLG-001
scn_id: SCN-OPS-UNIFIED-WORKER-001
title: Admin 任务看板数据回写（插件侧）
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
  - SCN-OPS-UNIFIED-WORKER-001-E
code_refs:
  - path: internal/worker/telemetry           # 看板字段输出
    description: 队列/并发/进度/状态/日志片段/模式标识
  - path: internal/worker/audit               # 审计上下文
    description: 取消/重试/降级操作记录
  - path: cli/px-plugin-worker                # standalone 看板数据输出
    description: 本地模式下的指标/日志/模式标识
feature_flags:
  - worker-admin-board
  - worker-facade-v1
optional: false
last_reviewed_at: 2025-10-19

---

# Usecase Overview

- **业务目标**：插件侧按统一 schema 回写任务状态、进度、日志片段、模式标识与审计上下文，供 PowerX Admin 任务看板聚合展示和受控操作。
- **成功度量**：回写字段完整且与宿主模式一致；数据延迟 <1 分钟；取消/重试等操作的审计上下文齐全。
- **场景关联**：对应主场景子场景 E，与 standalone/宿主执行、观测、取消共用回写与模式字段。

# Key Steps

1. **字段对齐**：回写任务状态、进度、日志片段、执行节点/模式等字段，遵循看板 schema。
2. **模式标识**：输出 `mode=standalone|host` 及降级状态，便于筛选/聚合。
3. **审计上下文**: 对取消/重试/降级写入操作人、时间、原因，确保租户隔离。
4. **日志片段**：按脱敏规则输出可展示的日志片段，支持跳转到宿主监控。

# Acceptance Checklist

- [ ] 回写字段满足看板 schema（状态/进度/日志片段/模式/节点）。
- [ ] 数据延迟在 SLA 内；缺失数据有健康指示。
- [ ] 取消/重试/降级操作的审计上下文完整并可查询。
- [ ] 日志片段遵循脱敏与租户隔离要求。
