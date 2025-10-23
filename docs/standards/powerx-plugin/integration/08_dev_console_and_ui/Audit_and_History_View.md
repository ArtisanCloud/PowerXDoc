# 审计与历史记录视图规范（08_dev_console_and_ui/Audit_and_History_View.md）

> 本文档定义插件在 PowerX 管理控制台中「审计（Audit）」与「历史记录（History）」模块的  
> 设计与实现标准，包括日志内容、展示方式、API 结构与合规要求。  
>
> 适用于所有使用 PowerXPluginBase 开发的插件（Go + Nuxt）。

---

## 🧭 一、设计目标

- 确保插件操作的透明性与可追踪性；
- 满足企业与监管场景的合规需求；
- 提供多层次的操作记录与变更历史；
- 与 PowerX 宿主的审计中心无缝对接；
- 支持租户、Vendor、系统三层溯源。

---

## 🧱 二、架构概览

```

┌────────────────────────────┐
│ PowerX 宿主审计中心        │
│ ├─ 收集所有插件审计事件     │
│ ├─ 聚合存储 / 过滤 / 查询    │
│ └─ 提供统一 API 与搜索索引   │
└───────────────┬────────────┘
│
▼
┌────────────────────────────┐
│ Plugin 审计记录模块（前端） │
│ ├─ /admin/audit            │
│ ├─ /admin/history          │
│ └─ API → 宿主 /audit/logs  │
└────────────────────────────┘

```

---

## 🧩 三、日志类型分类

| 类型 | 描述 | 示例 |
|------|------|------|
| **系统操作 (System)** | 系统自动执行或后台任务 | 定期配额同步 |
| **用户操作 (User Action)** | 管理员或用户手动操作 | 修改配置项 |
| **API 调用 (API)** | 外部接口访问 | POST /api/v1/customers |
| **安全事件 (Security)** | 登录失败、权限变更 | Token 过期、Role 更新 |
| **License 事件 (License)** | 授权状态变化 | License 续期成功 |
| **数据变更 (Data Change)** | 数据更新、删除 | 删除客户记录 ID=123 |

---

## 🧮 四、日志字段结构

```json
{
  "id": "audit_20251013_0001",
  "plugin_id": "com.powerx.plugin.crm",
  "tenant_id": "tenant_abc",
  "actor": {
    "type": "user",
    "id": "user_123",
    "name": "Michael Hu",
    "role": "tenant_admin"
  },
  "action": "update_setting",
  "resource": "crm.settings",
  "result": "success",
  "ip": "192.168.1.23",
  "user_agent": "Mozilla/5.0 Chrome/141.0.0",
  "created_at": "2025-10-13T08:34:02Z",
  "meta": {
    "field": "sync_interval",
    "old_value": "6h",
    "new_value": "3h"
  }
}
```

---

## ⚙️ 五、审计日志 API 规范

### 查询接口

```bash
GET /api/v1/admin/plugin/audit
?tenant_id=tenant_abc
&resource=crm.settings
&actor=user_123
&date_start=2025-10-01
&date_end=2025-10-13
```

响应：

```json
{
  "total": 124,
  "logs": [
    {
      "action": "update_setting",
      "resource": "crm.settings",
      "actor": "user_123",
      "created_at": "2025-10-13T08:34:02Z",
      "meta": {
        "field": "sync_interval",
        "old_value": "6h",
        "new_value": "3h"
      }
    }
  ]
}
```

---

## 🧰 六、前端视图规范

### 页面路径

`/admin/audit`

### 基本组件

- 筛选条件栏（时间范围、操作类型、用户、资源）
- 日志表格（分页展示）
- 点击详情 → 弹出 Modal 展示 meta 信息
- 导出按钮（CSV / JSON）

### Vue 结构建议

```vue
<template>
  <Card title="审计记录">
    <AuditFilterBar @change="fetchLogs" />
    <AuditTable :logs="logs" />
  </Card>
</template>
```

---

## 📜 七、历史记录模块（History View）

### 功能目标

展示插件关键数据的版本演变历史（如配置项、License 状态、配额变更等）。

### 路径

`/admin/history`

### 示例接口

```bash
GET /api/v1/admin/plugin/history?type=license
```

返回：

```json
[
  {
    "timestamp": "2025-09-01T00:00:00Z",
    "event": "license.issued",
    "detail": "License Plan: PRO"
  },
  {
    "timestamp": "2025-10-01T00:00:00Z",
    "event": "license.renewed",
    "detail": "License renewed successfully"
  }
]
```

### 前端组件

- 时间轴（Timeline）
- 可筛选事件类型
- 支持事件展开查看详情

```vue
<Timeline>
  <TimelineItem v-for="event in events" :key="event.timestamp">
    <p>{{ event.timestamp }} - {{ event.event }}</p>
    <small>{{ event.detail }}</small>
  </TimelineItem>
</Timeline>
```

---

## 🔐 八、安全与合规要求

| 要点         | 说明                        |
| ---------- | ------------------------- |
| **租户隔离**   | 仅能查看当前租户数据                |
| **只读访问**   | 审计数据禁止修改或删除               |
| **数据保留周期** | 默认保留 180 天，可配置            |
| **脱敏处理**   | 不显示敏感字段（Token、密码、密钥）      |
| **可导出性**   | 支持 CSV / JSON 导出（供合规审查）   |
| **追踪链一致性** | Audit ID 与宿主日志保持一致（可交叉验证） |

---

## 🧠 九、与宿主 PowerX 的联动

PowerX 宿主系统会同步以下来源的数据至插件：

| 来源                  | 事件类型    | 说明              |
| ------------------- | ------- | --------------- |
| **CoreX IAM**       | 用户、角色变更 | 角色绑定更新          |
| **License Server**  | 授权事件    | License 续期、吊销   |
| **Metrics Hub**     | 性能事件    | SLA 变动、Quota 超限 |
| **Support Hub**     | 支持事件    | 工单关联日志          |
| **Incident Center** | 故障事件    | SEV-0/1 关联记录    |

插件可选择是否在 `/admin/audit` 中联合展示。

---

## 🧾 十、典型使用场景

| 场景         | 示例                                               |
| ---------- | ------------------------------------------------ |
| 管理员变更配置    | “将同步周期从 6h 调整为 3h”                               |
| License 到期 | “License expired on 2025-10-10”                  |
| 支持工单关联     | “Support ticket PX-TKT-001 linked to this event” |
| 安全事件       | “User token invalidated due to IP change”        |
| Schema 更新  | “Migration v12 applied successfully”             |

---

## 🧩 十一、后端实现建议（Go 示例）

```go
type AuditLog struct {
    ID        string    `json:"id"`
    PluginID  string    `json:"plugin_id"`
    TenantID  string    `json:"tenant_id"`
    Actor     string    `json:"actor"`
    Action    string    `json:"action"`
    Resource  string    `json:"resource"`
    Result    string    `json:"result"`
    CreatedAt time.Time `json:"created_at"`
    Meta      map[string]interface{} `json:"meta"`
}

func (s *AuditService) Record(log *AuditLog) error {
    // 写入数据库 & 同步宿主
    return s.repo.Create(log)
}
```

---

## 🧮 十二、性能与扩展

| 项目   | 建议                                 |
| ---- | ---------------------------------- |
| 存储   | PostgreSQL 独立表 `plugin_audit_logs` |
| 索引   | `(tenant_id, created_at)` 复合索引     |
| 分页   | Cursor-based 分页，默认 50 条            |
| 导出   | CSV/JSON 统一格式                      |
| 清理策略 | 定时归档超期数据（>180 天）                   |

---

## 🧩 十三、自检清单（Audit Ready Checklist）

| 检查项                         | 状态 |
| --------------------------- | -- |
| 审计记录表结构已定义                  | ✅  |
| API `/admin/audit` 可用       | ✅  |
| 历史记录视图 `/admin/history` 已启用 | ✅  |
| 脱敏字段处理完成                    | ✅  |
| 与宿主日志同步机制正常                 | ✅  |
| 审计日志可导出                     | ✅  |
| 安全合规要求通过                    | ✅  |

---

## 📚 十四、延伸阅读

- [Plugin_Admin_Console_Guide.md](./Plugin_Admin_Console_Guide.md)
- [Logs_Metrics_and_Tracing.md](../03_runtime_and_ops/Logs_Metrics_and_Tracing.md)
- [Data_Privacy_and_GDPR.md](../04_security_and_compliance/Data_Privacy_and_GDPR.md)
- [Customer_Support_Playbook.md](../07_support_and_operations/Customer_Support_Playbook.md)

---

> **文档版本：** v1.1.0
> **适用范围：** PowerXPluginBase ≥ 0.9.0
> **维护团队：** PowerX Platform Security & Compliance Team
> **最后更新：** 2025-10
