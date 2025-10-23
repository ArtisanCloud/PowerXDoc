# Support & Policies Runbook

该运行手册面向值班工程师与合规运营，同步梳理通知重试、证据补传、申诉裁决以及监控响应的标准操作。

## 1. 值班前检查
- 确认 `make env.up SUPPORT_STACK=1` 启动的 Postgres / Redis / MinIO / Notification Center Mock 均健康（`docker ps` 无重启、`make logs.marketd` 无 panic）。
- `cd backend && GOCACHE=$(pwd)/tmp/go-cache go test ./tests/integration/support -run TestCrossSystemSyncAndReporting` 通过，确保跨域编排路径正常。
- 打开自定义仪表盘（参考 `backend/internal/telemetry/support/dashboard_config.md`），确认以下指标在阈值内：
  - `support.ticket.sla_breach`
  - `policy.enforcement.retry`
  - `appeal.pending`
  - `support.enforcement.saga_duration` p95

## 2. 执法通知重试
当通知中心反馈渠道异常或需要补发执法通知时：
1. 调用 Notification Center 后台重发模板（或在平台 UI 触发）。
2. 记录返还的送达时间戳，并通过 API 更新确认：
   ```bash
   curl -X POST "$BASE_URL/v1/policy/enforcements/$ACTION_ID/notifications" \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "channels": [
         {"channel": "email", "deliveredAt": "2025-10-25T03:21:00Z", "receiptId": "mail-123"},
         {"channel": "sms", "deliveredAt": "2025-10-25T03:22:05Z"}
       ],
       "batchId": "retry-20251025"
     }'
   ```
3. 确认返回状态为 `202 Accepted`，`support.enforcement.retry` 计数有增加，审计流中生成 `enforcement_sync`/phase=`apply` 事件。

## 3. 证据补传流程
1. 使用运维 MinIO 账号将文件上传至 `support/evidence/<owner_type>/<owner_id>/` 前缀（例如 `support/evidence/case/<caseId>/`），并开启合法保全锁：
   ```bash
   mc cp evidence.pdf minio/support/evidence/case/$CASE_ID/
   mc retention set --default governance-30d minio/support/evidence/case/$CASE_ID/evidence.pdf
   ```
2. 在支持后台创建时间线或附件引用：
   ```bash
   curl -X POST "$BASE_URL/v1/support/tickets/$TICKET_ID/timeline" \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "authorRole": "system",
       "visibility": "internal",
       "messageType": "attachment",
       "body": "补充上传合规报告",
       "attachment": "support/evidence/case/'"$CASE_ID"'/evidence.pdf"
     }'
   ```
3. 对应案例（Policy Case）如需同步索引，可执行一次 `support.jobs.rectify` 或人工标注。

## 4. 申诉裁决处理
1. 查询待处理申诉：`GET /v1/policy/cases/{caseId}`（`appeals` 列表中 status=`pending_review`）。
2. 通过后台指派复核人，自行记录决策时间窗口（默认 5 个工作日）。
3. 裁决时调用：
   ```bash
   curl -X POST "$BASE_URL/v1/policy/appeals/$APPEAL_ID/decision" \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "decision": {
         "outcome": "partial",
         "recoveryActions": ["restore_listing"],
         "reopenWindowDays": 7
       },
       "decidedBy": "auditor-uuid",
       "conditionsMet": false,
       "conditionalRequirements": ["submit_audit_report"]
     }'
   ```
4. 裁决后监控：
   - `appeal.pending` 降至目标值。
   - 审计中生成 `appeal_resolved`。
   - 如果 `outcome=approved/partial` 且条件满足，自动触发跨域解除（Listing/Licensing/Finance）。

## 5. 后台任务与补偿
- **SLA Worker**：`support.ticket.sla_breach` 激增时，手动跑一遍 `support.jobs.sla` 或执行 `cd backend && go run ./internal/jobs/support/sla_worker.go`（需正确注入依赖，可通过 marketd CLI）。
- **Rectify Worker**：确保整改超时的案例能创建冻结动作。命令：`make job.run scope=support job=rectify`.
- **Reconcile Worker**：当下游状态不同步时运行：
  ```bash
  make job.run scope=support job=reconcile
  ```
  监控 `policy.enforcement.retry` 与 `support.enforcement.saga_duration` 是否回落。

## 6. 报表导出与验证
1. JSON 查询：
   ```bash
   curl -H "Authorization: Bearer $TOKEN" \
     "$BASE_URL/v1/support/reporting/tenants?from=2025-10-01T00:00:00Z&to=2025-10-31T23:59:59Z"
   ```
2. CSV 导出（供审计/合规留档）：
   ```bash
   curl -H "Authorization: Bearer $TOKEN" \
     "$BASE_URL/v1/support/reporting/tenants?from=2025-10-01T00:00:00Z&to=2025-10-31T23:59:59Z&format=csv" \
     -o support-report.csv
   ```
3. 核对 CSV 中指标值与 Grafana 仪表盘一致，若差异超过 5%，检查 ETL/查询条件是否正确。

## 7. 常见告警响应
| 告警 | 处理步骤 |
|------|----------|
| `support.ticket.sla_breach` > 阈值 | 查看 SLA Worker 日志，确认是否出现 Redis 连接异常；必要时 `make job.run scope=support job=sla` 手动补跑，并通知值班产品。 |
| `policy.enforcement.retry` 连续增长 | 检查 Notification Center 或 下游 Listing/Licensing/Finance 服务可用性，手动执行 Reconcile Worker，必要时禁用相关 enforcement。 |
| `appeal.pending` 高于 48 小时平均值 | 查询 `/policy/cases/{caseId}`，确认是否存在积压；协调用例复核人，并通过决策接口更新。 |

## 8. 参考资源
- 快速上手：`specs/007-support-and-policies/quickstart.md`
- 合规模块审计：`docs/audit/README.md`
- 监控配置：`backend/internal/telemetry/support/dashboard_config.md`
