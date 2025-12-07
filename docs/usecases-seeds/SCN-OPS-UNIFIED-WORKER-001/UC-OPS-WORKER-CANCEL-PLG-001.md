doc_id: UC-OPS-WORKER-CANCEL-PLG-001
scn_id: SCN-OPS-UNIFIED-WORKER-001
title: 取消/超时与进程终止（插件侧）
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
  - SCN-OPS-UNIFIED-WORKER-001-C
code_refs:
  - path: internal/worker/handler/cancel    # Handler 中断点/取消钩子
    description: 取消/超时信号处理、外部进程终止
  - path: cli/px-plugin-worker              # 取消/超时信号接入（standalone）
    description: 接收取消请求并传递给 Handler/子进程
  - path: internal/worker/host-adapter      # 宿主取消透传
    description: 将取消/超时指令同步至宿主分发并校验幂等
feature_flags:
  - worker-facade-v1
  - worker-cancel-sla
optional: false
last_reviewed_at: 2025-10-19

---

# Usecase Overview

- **业务目标**：在 standalone 与宿主模式下，插件 Handler 支持可中断，子进程可被终止；取消/超时状态与原因回写一致，满足审计。
- **成功度量**：取消/超时成功率 ≥99%；子进程无残留；回写状态/原因一致且幂等；错误可诊断并告警。
- **场景关联**：对应主场景子场景 C，依赖 standalone/宿主入口的取消信号与回写模板。

# Key Steps

1. **中断点设计**：Handler 模板提供取消/超时钩子，确保调用外部工具时可终止（kill/timeout）。
2. **信号接入**：standalone 入口监听取消/超时请求，向 goroutine 与子进程分发；宿主模式透传取消指令。
3. **状态回写**：统一回写取消/超时状态、原因、时间，附模式标识与租户/插件上下文。
4. **审计与告警**：记录取消/超时审计，失败触发告警；确保操作幂等。

# Acceptance Checklist

- [ ] Handler 可处理中断，外部进程终止后无僵尸任务。
- [ ] standalone/宿主取消链路均回写一致的状态/原因与时间。
- [ ] 取消/超时幂等校验，重复请求无副作用。
- [ ] 失败/超时触发告警，审计记录包含操作人、模式与节点。
