# Integration Security & Operations Guide

这份文档汇总 A2A 协议、Webhook 以及 Secrets 生命周期在安全侧的决策与日常操作提示，供运维、安全审核及开发同学快速查阅。

## 1. A2A Envelope 校验

- 所有外部请求必须携带标准 Envelope 字段：`message_id`、`trace_id`、`correlation_id`、`tenant_id`、`tool_scope`、`issued_at`、`payload_ref`、`signature`。
- 当 `payload_ref` 为预签名 URL 时，调用方需验证过期时间并限制只读访问；超过 1 MB 的大 payload 必须走 URL 引用。
- 服务端通过 `DispatchService` 顺序执行：ToolScope → 幂等 → 宿主调用 → 观测上报。`integration.dispatch:invoke` RBAC 资源用于限制入口。

## 2. GrantMatrix 与 RBAC

- 静态 YAML 提供默认授权矩阵，数据库覆盖项必须走审批 (`integration.approvals`)；所有变更写入 `integration_change_approvals` 表。
- HTTP/GRPC/MCP Handler 仅声明路由，真正的资源判断在 `GrantMatrixService` 与 `RBAC` 中完成。
- 结合 `backend/internal/shared/app/rbac.go` 常量（`integration.dispatch:invoke`、`integration.grant_matrix:*`、`integration.webhooks:*`、`integration.secrets:*`、`integration.approvals:*`）在管理端/文档中保持资源名称一致。

## 3. Webhook & Event Delivery

- 退避策略为 60s → 300s → 900s，超过阈值进入 DLQ。指标：
  - `powerx_integration_webhook_attempts_total{status}` 统计投递结果；
  - `powerx_integration_webhook_delivery_seconds` 监控耗时。
- 管理端 `/admin/integration/webhooks` 提供 CRUD、DLQ replay，与审批流 (create/update/delete) 关联。
- CLI/脚本可使用 `scripts/mock-webhook-target.sh` 模拟目标服务；Quickstart 提供调用示例。

## 4. Secrets 生命周期

- 创建/轮换必须通过 `SecretService`，默认启用双密钥（`current_secret_ref` + `pending_secret_ref`）。
- 轮换流程：`rotate` 生成待切换 → 应用新密钥 → `complete_rotation` 推入正式位 → `revoke` 立即吊销。
- 审计日志写入 `integration_secrets.audit_log`，在管理端/ API `GET /admin/integration/secrets/{id}/audit` 中可查看。
- Secret Rotation Worker (`integration.secret_rotation`) 每小时刷新提醒，指标 `powerx_integration_secrets_rotations_due{window}` 标识待轮换数量。

## 5. 审批与审计

- Webhook 与 Secrets 的创建、轮换、吊销都会调用 `ApprovalService.SubmitChange`，落表 `integration_change_approvals`，并在 `docs/security/audit-logs.md` 建议的审计抽样中校验记录。
- 管理端 RBAC 资源：
  - `integration.webhooks:read/manage`
  - `integration.secrets:read/manage`
  - `integration.approvals:read/manage`

## 6. 运维清单

- Quickstart（`specs/005-protocols-integrations/quickstart.md`）提供端到端脚本，涵盖 Envelope 调用、Webhook retry、Secret 轮换。
- Release notes（`docs/releases/2025-10-integrations.md`）汇总功能差异，需随版本一起发布。
- CI 验证脚本位于 `scripts/ci/integration.sh`、`scripts/ci/verify_integration_metrics.sh`，用于交付前验证关键指标和构建。

## 7. 成功指标与发布前检查

- 成功标准（见 `specs/005-protocols-integrations/spec.md`）通过以下指标观测：
  - SC-001（Envelope 采用率）：`powerx_integration_envelopes_total{channel,result}`；
  - SC-002（Webhook 成功率）：`powerx_integration_webhook_attempts_total{status,tenant_id}` 与 `powerx_integration_webhook_delivery_seconds`；
  - SC-003（Secrets 轮换时效）：`powerx_integration_secrets_rotations_due{window}`；
  - SC-004（支持工单下降、采用率）：结合 Envelope 指标与 `integration_change_approvals` 审批日志抽样；
  - SC-005（幂等/权限异常告警）：`powerx_integration_idempotency_events_total{outcome}`、GrantMatrix 拒绝日志、RBAC 审计事件。
- 发布前执行：
  1. `scripts/ci/integration.sh`（包含 fmt/lint/test/Nuxt 构建）；
  2. `scripts/ci/verify_integration_metrics.sh`（校验指标名称覆盖 SC-001~SC-005）；
  3. 导入 `docs/observability/integration-dashboard.json` 验证仪表盘。

保持此文档与代码同步更新，便于安全和 SRE 团队快速理解集成组件的运行方式。
