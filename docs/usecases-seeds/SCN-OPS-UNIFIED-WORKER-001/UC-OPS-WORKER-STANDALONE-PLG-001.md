doc_id: UC-OPS-WORKER-STANDALONE-PLG-001
scn_id: SCN-OPS-UNIFIED-WORKER-001
title: standalone 队列与池（插件脚手架/Handler）
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
  - SCN-OPS-UNIFIED-WORKER-001-A
code_refs:
  - path: cli/px-plugin-worker           # standalone 启动入口/CLI
    description: 读取配置、注册 Handler、启动本地队列与池
  - path: internal/worker/handler        # Handler 模板与进度/日志回写
    description: 业务 Handler 生命周期、进度回写、错误处理
  - path: internal/worker/config/local   # 本地模式并发/队列/超时/重试默认值
    description: 默认策略、覆盖与验证
feature_flags:
  - worker-facade-v1
  - worker-standalone-queue
optional: false
last_reviewed_at: 2025-10-19

---

# Usecase Overview

- **业务目标**：插件侧使用 PowerXPlugin 脚手架提供的 standalone 入口，加载默认并发/队列/超时/重试策略，注册 Handler 并运行本地队列+池，完成进度/状态回写与日志输出。
- **成功度量**：脚手架启动成功率 ≥99%；默认策略可覆盖；任务提交→执行→回写全链路在本地跑通；日志/进度字段与宿主模式保持一致。
- **场景关联**：对应主场景子场景 A，与宿主透传/取消/观测/看板共用回写 schema 与模式标识。

# Key Steps

1. **启动入口**：运行脚手架提供的 CLI/二进制（如 `px-plugin worker start --mode standalone`），加载配置中心或本地 YAML，注册 Handler。
2. **提交与执行**：通过统一接口提交任务，脚手架将任务入队并由池执行 Handler（可调用外部工具），支持进度/状态回写。
3. **策略应用**：并发/队列/超时/重试/幂等策略由配置注入，支持覆盖与校验；默认值与宿主模式保持一致。
4. **观测与告警**：输出模式标识、进度与日志字段，支持本地日志/指标收集与可选告警。

# Acceptance Checklist

- [ ] CLI/入口能读取配置、注册 Handler 并启动队列+池。
- [ ] 任务提交/查询/取消接口可用，回写字段与宿主模式一致。
- [ ] 并发/队列/超时/重试策略支持默认与覆盖，入队校验幂等键。
- [ ] 进度/日志输出包含模式标识、租户/插件/任务 ID，满足脱敏要求。
- [ ] 失败/溢出/超时触发告警或可诊断错误，写入审计。
