---
title: 运营与治理
---

# 运营与治理

本章节汇总平台运行期的观测、告警、安全合规与变更管理策略，供 SRE、运营与安全团队使用。

## 观测与告警 {#observability}

- 指标体系 (`metrics`)：`dev.hotload.*`、`offline.import.*`、`marketplace.publish.*`、`admin.install.*` 等关键指标需要在 Prometheus/Telemetry 平台统一注册。
- 日志策略：明确每类服务必须记录的字段（请求 ID、租户、操作人等）及敏感数据脱敏规则。
- 告警通道：列出阈值与通知策略，例如“热加载连续失败 3 次 → #powerx-dev-alerts”。

## 安全治理 {#security}

- 身份与权限：结合 Admin 后台与后端 API 的 RBAC/SOPE 策略进行统一配置。
- 能力授权：参考 Capability & Tool Grant 规范，确保插件和智能体仅能访问所需接口。
- 插件沙箱：说明资源配额、网络访问限制、调试模式开关等安全控制项。

## 变更管理 {#change-management}

- 发布策略：覆盖本地热加载、离线导入、在线发布等流程的审批、回滚及审计要求。
- 配置管理：Feature Flag、环境变量、配置中心变更流程及回滚预案。
- 演练与演示：定期开展故障演练或演示，验证回滚脚本和 SOP。

## 报告与审计 {#reporting}

- Workflow Telemetry：使用 `scripts/qa/workflow-metrics.mjs` 或 `reports/_state/**` 生成执行报告。
- 审计日志：记录管理员操作、插件安装、能力授权、离线包导入等关键事件。
- 合规报表：列出监管要求、频率与格式，并附生成/导出命令。
