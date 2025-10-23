# Operations Runbook — Support · Incident · SLA

本 Runbook 汇总了 Support Playbook、Incident Lifecycle 与 SLA Transparency 的操作步骤，适用于本地或沙盒环境的运维演练。配套的实现细节见 `specs/007-support-and-operations/` 与 `docs/integration/07_support_and_operations/` 其他专题。

---

## 1. 环境准备

- 完成 `make dev-setup && npm install`，并在 `web-admin/` 目录运行 `npm run dev` 或 `npm run build` 以获得前端产物。  
- 启动依赖：`docker compose -f config/docker-compose.integration.yml up -d`，确保 Redis 与 webhook mock 就绪。  
- 在 `backend/etc/config.yaml` 中补充 `operations` 配置项，包括 webhook 签名、SLA 采样 cron、Incident 通知渠道等。

---

## 2. Support Playbook

1. 打开 `/_p/com.powerx.plugins.base/admin/operations/support`。  
2. 依据渠道类型（Marketplace 工单、Vendor 邮箱、In-App Feedback、Hotline）填写地址、升级路径与服务窗口；保存后系统会重建 `operations_support_channels`。  
3. 补充知识库条目（FAQ、README、Troubleshooting 等），确认页面返回的 `readiness` 列表全部完成：
   - `support_channels_configured`
   - `knowledge_base_published`
4. 若需要验证 webhook，可点击「Validate Channels」并在 Redis/mock 服务查看事件；同时观察 `operations_support_ticket_events` 记录。

---

## 3. Incident Lifecycle

1. 打开 `/_p/com.powerx.plugins.base/admin/operations/incidents`，点击「Declare Incident」。  
2. 选择 SEV 级别、检测来源与标签，填写概要后提交：
   - 新建记录写入 `operations_incidents`；
   - 指标 `powerx_operations_incident_event_total{action="created"}` 增加；
   - `operations_readiness_checklist_items` 中的 `incident_ready` 相关条目会根据配置自动更新。
3. 使用时间线表单追加公告/缓解/复盘节点，验证：
   - `operations_incident_updates` 产生新行；
   - Incident Dispatcher 将事件推送至 Support Hub/Hotline/Webhook（取决于配置）；
   - 审计记录可在 `operations_sla_adjustments` 及日志中看到（`operations.sla_recompute_job` 也会写入）。
4. 在页面右侧更新状态（Acknowledged → Mitigated → Resolved → Closed），确认对应时间戳列填充，并通过数据库/日志验证审计条目。

---

## 4. SLA Transparency & Incentives

1. 打开 `/_p/com.powerx.plugins.base/admin/operations/sla`，为 Real-time / Transactional / Utility 计划填写目标值。  
2. 使用「同步实际指标」表单更新当期表现：
   - `operations_sla_profiles` 的 `sla_score` 会按公式更新；
   - 分数跨越 85 / 70 阈值时，`operations_sla_adjustments` 生成激励或处罚条目，并触发审计记录。  
3. 点击「触发重算」按钮或执行 `go run ./backend/cmd/cron --task operations-sla-refresh`，验证 `SLARecomputeJob` 对各计划重新打分并写日志。  
4. 通过公共 API `GET /api/v1/marketplace/sla/{plugin_id}` 检查对外披露的数据，与后台 Dashboard 一致。

---

## 5. 观测与排查

- **指标**：
  - Support Ticket 事件：`powerx_operations_support_ticket_total`。
  - Incident 生命周期：`powerx_operations_incident_event_total`。
  - SLA 健康度：`powerx_operations_sla_score`。
- **审计日志**：`operations_incident_updates`、`operations_sla_adjustments` 均带有时间线、执行人等信息，便于复盘。  
- **Webhook 与邮件**：如需模拟，可在 `config/docker-compose.integration.yml` 中启用 mock 服务并查看其控制台输出。  
- **复现脚本**：`specs/007-support-and-operations/quickstart.md` 提供命令级别的端到端演练，可结合本 Runbook 一同使用。

---

完成上述步骤后，即可在沙盒环境全链路验证 Support、Incident、SLA 能力，并满足 Marketplace 运营闭环的准入要求。
