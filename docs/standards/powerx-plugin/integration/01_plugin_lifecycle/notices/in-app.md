# In-App Banner Template

```json
{
  "severity": "warning",
  "title": "{{plugin_name}} 即将弃用",
  "message": "该插件将在 {{sunset_at}} 退役，请尽快迁移至 {{replacement}}。",
  "actions": [
    {
      "caption": "查看迁移指南",
      "href": "{{migration_link}}"
    },
    {
      "caption": "联系支持",
      "href": "mailto:support@powerx.dev"
    }
  ],
  "dismissible": false,
  "scope": ["tenant_admin"]
}
```

## 使用说明
- 将 JSON 投递到宿主的通知/配置中心。
- `severity` 可根据阶段调整（例如 sunset 生效后改为 `error`）。
