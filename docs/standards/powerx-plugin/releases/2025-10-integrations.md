# Release Notes · 2025-10 · Protocols & Integrations

## Highlights

- **Unified A2A Envelope**：HTTP / gRPC / MCP 入口共用 Dispatch pipeline，提供幂等、ToolScope 校验与观测指标。
- **Reliable Webhooks**：退避重试、DLQ、手动 replay 和审批记录全部落地，管理端新增 Webhook 控制面。
- **Secrets Lifecycle**：支持双密钥轮换、自动提醒、审计日志与审批，默认 Provider 可替换为宿主 Secrets Manager。
- **Polish & Release**：新的 `ci-integration` 目标和指标校验脚本确保发布前覆盖 SC-001~SC-005，`plugin.yaml` 版本提升至 `0.4.0`。

## API & Manifest Changes

- 新增 `/admin/integration/webhooks/**`、`/admin/integration/secrets/**` 管理端 API。
- `plugin.yaml`
  - 版本号提升，并追加 Webhook/Secrets Admin 菜单；
  - `data_usage` 补充 Webhook 传输与 Secret 元数据说明。
- OpenAPI (`specs/005-protocols-integrations/contracts/integration-openapi.yaml`) 更新包含 Webhook、Secrets 相关响应码与示例。

## Observability

- 新增指标：
  - `powerx_integration_envelopes_total{channel,result}`
  - `powerx_integration_webhook_attempts_total{status,tenant_id}`
  - `powerx_integration_secrets_rotations_due{window}`
- Dashboard 定义：`docs/observability/integration-dashboard.json`。
- CI 校验脚本：`scripts/ci/verify_integration_metrics.sh`。

## Upgrade Notes

1. 运行最新迁移与索引脚本：
   ```bash
   make migrate
   psql $DATABASE_URL -f backend/migrations/2025Q4_integration_indexes.sql
   ```
2. 执行 `scripts/ci/verify_integration_metrics.sh` 与 `scripts/ci/integration.sh`，检查指标、测试与构建流程。
3. 若使用外部 Secrets Manager，请实现并注入自定义 `SecretProvider`。
4. 管理端菜单新增“Integration · Webhooks / Secrets / Insights”，需在部署环境更新 manifest。
5. 快速验证：
   ```bash
   make test-all
   scripts/ci/integration.sh
   ```
