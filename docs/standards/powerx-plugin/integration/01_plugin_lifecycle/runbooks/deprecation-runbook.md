# Deprecation / Sunset Runbook

Use this runbook to track execution of each lifecycle step. Duplicate per plugin version.

| Step | Description | Owner | Planned Date | Actual Date | Notes |
|------|-------------|-------|--------------|-------------|-------|
| 1 | 提交弃用提案并获批准 | Product / Compliance | | | |
| 2 | 更新 manifest `lifecycle.status=deprecated` & `effective_date` | Release Manager | | | |
| 3 | 发布 Marketplace 状态 & UI Banner | Marketplace Ops | | | |
| 4 | 发送邮件通知租户管理员（模板：`notices/deprecation-email.md`） | Customer Success | | | |
| 5 | 发布迁移指南 / 数据导出脚本 | Engineering | | | |
| 6 | 监控租户迁移进度，每周审查异常 | Support | | | |
| 7 | 到达 `sunset_at`，阻止新安装（宿主 & Marketplace） | Platform Ops | | | |
| 8 | 停止后端 API 或返回 410 | Engineering | | | |
| 9 | 收回 Token、关闭 CI/CD、仓库 Archive | Security / DevOps | | | |
| 10 | 归档 `.pxp` 包、审计日志、签名 | Compliance | | | |

> 每个阶段完成后在 `Notes` 记录链接（PR、公告、Jira ID 等），并在合规系统附上 artefact。
