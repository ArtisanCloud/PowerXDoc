# Admin Console Troubleshooting Runbook

PowerX 支持工程师可以通过 Dev Console 的 **故障排查** 页签在数分钟内完成常见运维操作。本文档记录推荐操作步骤、权限要求以及观察指标，便于一线值守快速响应。

## 1. 前置条件

- 账号需具备下列权限代码之一：
  - `operations.plugin.ops`（允许查看任务、触发安全操作与查看 webhook 详情）
  - `operations.plugin.audit`（需要同时审计操作结果时）
- 对应租户必须已完成 `admin_console` 配置初始化（Retention、Safe Ops、Troubleshooting 章节至少保存一次）。
- 建议同时打开 PowerX Observability Dashboard（详见 `docs/observability/admin-console-dashboard.md`）。

## 2. 快速定位

1. **作业/安全操作历史**
   - 进入「故障排查」→「任务历史」，使用租户过滤器（`tenant_id`）缩小范围。
   - 失败状态（Failed/Cancelled）可直接点击 `重试`，系统会申请同类安全操作并写入审计记录。
   - 若任务被并发保护拦截，Dev Console 会返回 HTTP 409，提示已有同作用域的操作在进行中。

2. **Webhook 投递诊断**
   - `webhook_delivery` 模块提供成功率、重试率、死信率指标。
   - 「近期失败」列表列出最近 10 条失败尝试，可点击运行 ID 在右侧展开详情（响应码、重试次数、死信原因）。

3. **健康与配额**
   - 面板顶部标注最近刷新时间；默认 5 分钟自动刷新，可通过「立即刷新」按钮手动更新。
   - 若指标长时间不刷新，检查 PowerX Observability API 与 Redis Mock 是否正常运行。

## 3. 常见操作

| 操作 | 路径 | 备注 |
|------|------|------|
| 重放单条 Webhook | 「任务历史」中失败记录 → `重试` | 触发新的安全操作，成功后生成新的 Job Run 记录 |
| 手动执行安全操作 | 「安全操作」表单 | 需填写 Scope 信息；Dry Run 会写入审计但不实际调用后端 |
| 导出审计记录 | 「审计历史」页签 → `导出` | 支持 CSV/JSON，导出行为累加指标 `powerx_admin_console_audit_export_total` |
| 监控面板检查 | Observability Dashboard | 指标 `powerx_admin_console_dashboard_refresh_seconds` 显示刷新延迟 |

## 4. 升级与回滚提示

- 晋级到新版本（≥0.7.0）后，确保数据库执行 `2025Q4_admin_console.sql` 以获得安全操作字段以及 webhook 查询索引。
- 回滚旧版本前，请确认没有「pending / running」状态的安全操作，避免失去锁释放逻辑。可通过 SQL：

```sql
SELECT id, scope_ref, action FROM admin_console_job_runs WHERE status IN ('pending','running');
```

## 5. 支持升级的问询模版

> **现象**：请描述遇到的错误信息 / 截图。  
> **操作**：说明执行了哪种安全操作、传入的租户/作用域。  
> **时间**：指出最近一次失败时间戳，便于定位 Job Run。  
> **影响范围**：是否涉及全部租户、特定订阅、单个 webhook。  
> **其他**：若手动执行过 SQL 或脚本，也请同步。

提供上述信息可以让二线/研发快速排查是否命中并发锁、权限不足或下游不可用等问题。
