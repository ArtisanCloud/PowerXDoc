# Deprecation Email Template

```
Subject: [PowerX] 插件弃用通知 — {{plugin_name}}

Hi {{tenant_admin}},

感谢您使用 {{plugin_name}}（{{plugin_id}}）。我们计划于 {{deprecated_at}} 将其状态设置为“弃用”，并在 {{sunset_at}} 完成退役。届时将不再提供功能更新，仅保留安全修复。

推荐替代方案：{{replacement}}。
迁移指南：{{migration_link}}

请在 {{sunset_at}} 前完成迁移，如需协助可随时联系 support@powerx.dev。

PowerX 插件团队
```

## 使用说明
- 用发送系统填充花括号占位符；支持国际化版本。
- 退役日期缺省时，可改为“预计 xx 日”。
