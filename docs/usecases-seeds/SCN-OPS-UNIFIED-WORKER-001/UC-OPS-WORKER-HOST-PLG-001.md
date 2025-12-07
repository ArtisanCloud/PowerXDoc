doc_id: UC-OPS-WORKER-HOST-PLG-001
scn_id: SCN-OPS-UNIFIED-WORKER-001
title: 宿主任务分发透传（插件接入）
status: Draft
version: v0.1.0
repo_key: powerx-plugin
scope: powerx-plugin
layer: integration
domain: ops
scenario_title: "统一 Worker 封装与双模式任务执行"
owners:
  - name: Michael Hu
    role: Product Manager
    contact: matrix-x@artisan-cloud.com
contributors: []
linked_requirements:
  - SCN-OPS-UNIFIED-WORKER-001-B
code_refs:
  - path: cli/px-plugin-worker             # 宿主模式启动/配置加载
    description: 解析宿主连接、注册 Handler、启用模式标识
  - path: internal/worker/host-adapter     # 宿主任务分发透传
    description: 注册/提交/取消接口封装、回写映射
  - path: internal/worker/handler          # Handler 复用
    description: 业务 Handler 生命周期与回写
feature_flags:
  - worker-facade-v1
  - host-task-dispatcher
optional: false
last_reviewed_at: 2025-10-19

---

# Usecase Overview

- **业务目标**：插件在宿主模式下复用同一 Handler，通过脚手架加载宿主接入配置，完成任务注册/提交/取消透传，并对齐回写/日志字段与 standalone 模式。
- **成功度量**：宿主注册/提交成功率 ≥99%；回写同步延迟可控（如 <2s）；模式切换无需分叉代码；降级策略可配置并记录审计。
- **场景关联**：对应主场景子场景 B，与 standalone/取消/观测/看板共享接口与字段。

# Key Steps

1. **接入配置**：脚手架读取宿主连接与鉴权信息，注册 Handler，标记运行模式=host。
2. **任务透传**：统一接口提交/取消调用宿主分发；携带超时/重试/幂等/降级策略。
3. **回写映射**：宿主回写的进度/状态/日志字段映射为统一 schema，同步给插件侧和前端。
4. **降级处理**：宿主不可用时按配置回退本地或显式失败，记录审计与告警。

# Acceptance Checklist

- [ ] 宿主注册/提交/取消接口封装可用，鉴权与租户隔离生效。
- [ ] 进度/状态/日志回写格式与 standalone 一致，包含模式标识。
- [ ] 超时/重试/幂等/降级策略透传并校验；失败有重试与可诊断错误。
- [ ] 降级事件写审计，告警/日志包含宿主节点信息与错误码。
