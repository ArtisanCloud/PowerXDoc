# Marketplace Lifecycle Operations Runbook

本指南面向运维与产品上线团队，梳理插件生命周期关键操作（发布、回滚、日落）在 PowerX Marketplace 中的标准流程、责任人以及事后验证步骤。所有操作均基于 `http.api_prefix` 配置（默认 `/v1`），示例命令使用 `API_BASE="https://market.example.com${API_PREFIX}"` 约定。

## 1. 发布前检查清单

- ✅ **版本状态**：目标 `PluginVersion` 必须处于 `approved`，与最新审计记录时间不超过 24 小时。  
- ✅ **审计与通知**：确认上一轮发布已在 `docs/telemetry/lifecycle-metrics.md` 定义的仪表盘中恢复到绿灯。  
- ✅ **回滚方案**：记录 `rollback_of_version_id` 候选版本，确保 artifacts 仍在对象存储且生成的签名 URL 可用。  
- ✅ **沟通预案**：准备好发布前/后通知模版，必要时同步给 Vendor 与租户运营团队。

## 2. 调度发布窗口

1. `POST ${API_BASE}/plugins/releases`，配置渠道、可见范围、守护指标。  
2. 如存在变更冻结，守护服务会将状态设置为 `paused`；解除冻结后执行 `POST .../promote` 立即生效。  
3. 发布激活后，监控 `plugin_release_guardrail_evaluations_total` 指标，观察连续 10 分钟内无错误率飙升。  
4. 记录结果至运维周志，并将窗口 ID 填入待命通知。

## 3. 守护回滚流程

- 守护作业检测到阈值超限时会调用 `POST .../rollback`，自动将 Listing 默认版本指针回退。  
- 运维需在 30 分钟内完成：
  - 🔁 验证 `PluginListing.default_version_id` 已回指稳定版本；  
  - 🔄 触发 `NewNotificationWorker.Run`，确保通知中心收到回滚事件（参见 `docs/telemetry/lifecycle-metrics.md` 的失败计数）；  
  - 📝 在本Runbook的“事后记录”章节登记时间线、指标截图与根因初判。

## 4. 日落计划（Sunset）执行

1. 设置 `sunset_plan`：`POST ${API_BASE}/plugins/{pluginId}/sunsets`，强制 `notice_period_days ≥ 30`。  
2. 定义沟通方案：`communication_plan.channels` 指定主渠道，`fallback_channel` 提供兜底线路；`NotificationWorker` 会在主渠道失败时自动退避发送。  
3. 使用 `docs/tests/plugins/sunset_workflow_test.go` 中的流程在沙箱环境演练通知。  
4. 运营在 `effective_at - 7 天` 再次确认租户确认率（`sunset_notification_receipts.status == acknowledged`）。

### 日落取消

如需取消：

```bash
curl -X PATCH "${API_BASE}/plugins/{pluginId}/sunsets/{sunsetId}" \
  -H "Authorization: Bearer $OPS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"cancelled","cancellation_reason":"Dependency fixed"}'
```

系统会自动将 Listing 状态恢复为 `active`，并恢复目标版本的 `availability_status = published`。

## 5. 事后记录模板

每次发布、回滚或日落操作完成后，请将以下信息同步到运维周志或变更系统（例如 Jira Change）：

| 字段 | 内容 |
|------|------|
| 变更类型 | 发布 / 守护回滚 / 日落 / 日落取消 |
| Window / Sunset ID | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` |
| 影响范围 | 渠道、租户、版本号 |
| 触发人 / 审批人 | `ops@example.com` |
| 关键指标快照 | 链接或截图（错误率、通知失败计数等） |
| 守护/通知状态 | 成功 / 失败（含原因） |
| Follow-up | 后续修复、与 Vendor 的同步结果 |

## 6. 相关文档

- `docs/telemetry/lifecycle-metrics.md`：生命周期指标与仪表盘维护指引  
- `specs/003-title-listing-and/quickstart.md`：端到端自测流程  
- `backend/tests/plugins/sunset_workflow_test.go`：通知与回滚逻辑的集成测试参考  

> ⚠️ 所有操作必须记录在内部变更系统；若涉及跨区域租户，需提前两周向法规团队通报。
