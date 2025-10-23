# 审计日志策略与导出指南

## 保留策略

- 所有安全/隐私相关审计日志写入 `logs/audit.log`。
- 根据安全基线 (`security_baseline.yaml`) 的 `audit_log.retention_days`（默认 365 天）配置日志保留窗口。
- 生产环境需结合宿主运维工具（如 logrotate、S3 生命周期规则）确保在线数据至少保存 365 天，并在过期后安全归档或删除。

## 导出脚本

项目提供 `scripts/security/audit_export.sh` 用于将当前审计日志打包，生成格式化归档：

```bash
# 默认导出到 dist/security 下
scripts/security/audit_export.sh

# 自定义输出目录与日志路径
scripts/security/audit_export.sh /tmp/security-exports /var/log/powerx/audit.log
```

脚本行为：

1. 检查目标日志是否存在，若不存在返回非零退出码；
2. 在输出目录下创建 `audit-<timestamp>.tar.gz`，内容包含原始日志副本；
3. 输出归档路径便于后续上传或审计共享。

> 提示：可在 CI/运维流程中定期运行该脚本，将生成的压缩包上传至安全存储（如 S3 带版本控制的桶）。

## 轮转建议

- 若使用 logrotate，可参考：

```conf
/var/log/powerx/audit.log {
    daily
    rotate 365
    compress
    missingok
    notifempty
    create 0640 powerx powerx
    dateext
}
```

- 确保轮转后的归档统一归入安全仓储，遵守监管要求。
- 审计团队应至少每季度抽样验证归档完整性。

## 配置可见性

使用 `config.Config` 的以下方法读取基线参数，实现运行时自检或仪表盘展示：

- `AuditLogRetentionDays()`：读取保留天数；
- `AuditLogExportScript()`：获取建议导出脚本路径；
- `ToolGrantTTL()`、`ConsentRetentionDays()`：与其它安全参数组合展示。 

将上述信息暴露在运维面板或 `/admin/security` 页面，有助于审计通过。

## Integration 审计事件

- Webhook 与 Secrets 的创建/轮换/吊销会向 `integration_change_approvals` 写入记录，并在 `integration_secrets.audit_log` 中追加 JSON 事件，可通过 `GET /admin/integration/secrets/{id}/audit` 导出。
- 建议在季度抽审中，抽取至少 3 条 Webhook replay / Secrets rotation 事件，比对审批链（`submitted_by`、`reviewed_by`）与实际操作人。
- 轮换提醒脚本由 Secret Rotation Worker 自动执行；若 `powerx_integration_secrets_rotations_due{window="due_now"}` 持续大于 0，需开票给运维负责人。
- 对照 `backend/internal/shared/app/rbac.go` 中的 `integration.approvals:*`、`integration.webhooks:*`、`integration.secrets:*` 常量核对权限配置，确保审计事件与 RBAC 日志一致。
