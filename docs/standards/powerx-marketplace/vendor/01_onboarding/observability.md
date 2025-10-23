# 📈 Onboarding Observability & Audit Playbook

> 本文档汇总 Vendor Onboarding 流程的可观测性与审计要求，便于合规、运营与 SRE 团队快速定位问题、追溯行为并构建统一告警。

---

## 🧭 1. 总览

- **覆盖范围**：自助注册 → 风控审核 → 协议签署 → Portal/环境开通全链路。
- **数据来源**：
  - 指标：`backend/internal/telemetry/onboarding_metrics.go` 暴露的内存指标（Zap 导出 + OTEL 网关）。
  - 日志：Onboarding 服务的结构化日志（`logger` 中间件 + 审计记录器）。
  - 审计：`onboarding_audit_events` 表，全量记录关键动作与上下文。
  - 追踪：`audit_context` 中间件注入的 `X-Request-Id` / `X-Audit-Id`。

---

## 📊 2. 指标指标 Metrics

| 指标 | 说明 | 标签 | 采集频率 | 典型用途 |
|------|------|------|----------|----------|
| `onboarding_stage_duration_seconds` | 各阶段完成耗时累计 | `stage`, `subject_type` | 事件结束时 | SLO 计算、瓶颈分析 |
| `onboarding_failures_total` | 阶段失败次数 | `stage`, `reason` | 错误发生时 | 告警、错误分布 |
| `http_requests_total` | HTTP 请求计数 | `route`, `status` | 每次请求 | 端点流量、错误率 |
| `http_request_duration_seconds` | HTTP 请求耗时 | `route`, `status` | 每次请求 | 性能基线 |
| `audit_events_total` *(日志衍生指标)* | 审计事件计数 | `stage`, `action`, `actor_type` | 事件写入时 | 合规审计稽核 |

**阶段 (stage) 枚举**：

1. `registration`
2. `risk_evaluation`
3. `agreement`
4. `portal_setup`
5. `environment_provision`

> **采集途径**：指标通过内存结构 + Zap 日志镜像；在部署环境需对接 OTEL Collector，将日志解析为指标/Tracing。

---

## 🛰 3. 日志 & 审计

- **请求日志**：`logger` 中间件打印 JSON，包含 `request_id`、`path`、`latency_ms`、`user_agent`。
- **审计日志**：`onboarding_audit_events` 表字段：
  - `stage`, `action`, `actor_type`, `actor_id`
  - `payload`（JSON）保留原始上下文，如 `contact_email`、`risk_score` 等。
  - 通过 `audit_context` 中间件写入的 `X-Audit-Id` 贯穿 HTTP → Service → Repo。
- **关联方式**：
  - HTTP Header: `X-Request-Id`、`X-Audit-Id`
  - 日志字段: `request_id`, `audit_id`
  - 审计表: `ActorID`, `ApplicationID`, `VendorID`

> **合规要求**：所有对 Vendor 状态的变更必须写入审计表；禁止直接操作数据库绕过 Recorder。

---

## 🚨 4. 告警矩阵

| 场景 | 指标/条件 | 阈值示例 | 告警动作 |
|------|-----------|----------|----------|
| 注册耗时异常 | `onboarding_stage_duration_seconds{stage="registration"}` P95 | > 3 min 持续 15 min | SRE 值班钉钉/Slack |
| 风控失败激增 | `onboarding_failures_total{stage="risk_evaluation"}` | 5 分钟内 > 20 次 | 通知风控 & SRE |
| 协议签署失败 | `onboarding_failures_total{stage="agreement",reason="provider_error"}` | 单日 > 5 次 | 通知法务/合规 |
| Prod 激活滞留 | 审计事件中连续 30 分钟无 `prod_activated` 且存在 `prod_pending_ops` | 滞留 > 30 分钟 | 通知 Ops 值班 |
| HTTP 错误率 | `sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m]))` | 错误率 > 2% 加 5 分钟 | 标准 API 告警 |

> 各团队可在 Grafana / Prometheus Alertmanager 中调整阈值，但需保留默认规则。

---

## 📈 5. 仪表盘建议

1. **《Onboarding Overview》**
   - 新增申请数、通过率、阶段耗时漏斗。
2. **《Risk & Review Drilldown》**
   - 风控失败原因 Top N、人工审核处理时长。
3. **《Provisioning Status》**
   - Sandbox/Pre 成功率、Prod 待审批列表（接审计表 `prod_pending_ops`）。
4. **《Audit Explorer》**
   - 提供 `application_id` / `vendor_id` 查询，关联原始 payload。

---

## 🧾 6. Runbook（常见问题排查）

| 问题 | 排查步骤 | 处理建议 |
|------|----------|----------|
| 注册流程大量失败 | 查看 `onboarding_failures_total{stage="registration"}` & `audit` payload | 多因 KYC 附件上传异常 → 排查 MinIO / SSE 配置 |
| 风控长时间 pending | 检查 `risk` Callback 日志、确认 `serviceToken` Header 是否合法 | 恢复风控服务或人工批量审批 |
| 协议签署失败 | 查看 `provider_error` 失败原因，检查签署服务可用性 | 手动重试；必要时更换 Provider 配置 |
| Sandbox 未激活 | 审核 `auto_sandbox_disabled` 失败计数 & Feature Flag | 若 Feature Flag 关闭，则需手动触发 provisioning |
| Prod 激活卡住 | 审计表中有 `prod_pending_ops` 无 `prod_activated` | 提醒 Ops 执行审批脚本 / API，确保 Ticket ID 录入 |

---

## ✅ 7. 落地检查清单

- [ ] 指标已在环境的 OTEL/Prometheus 中注册。
- [ ] 日志包含 `request_id`、`audit_id`，并可与审计表关联。
- [ ] Grafana 仪表盘 + Alertmanager 规则上线。
- [ ] Ops Runbook 涵盖 `onboarding_smoke.sh` 脚本输出（参见 Phase 5 T039）。
- [ ] 文档更新同步至合规与风控团队。

> 完成以上 checklist 后，即可覆盖合规稽核 & SLO 观察要求。
