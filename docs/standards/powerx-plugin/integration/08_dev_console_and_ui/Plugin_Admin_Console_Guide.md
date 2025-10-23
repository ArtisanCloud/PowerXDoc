# 插件管理控制台开发指南（08_dev_console_and_ui/Plugin_Admin_Console_Guide.md）

> 本文档定义 PowerX 插件的 **管理控制台（Plugin Admin Console）** 设计与集成规范，  
> 包括 UI 架构、页面模块、数据接口、权限控制与交互约定。  
>
> 它适用于使用 PowerXPluginBase（Go + Nuxt/Vue） 开发的插件项目。

---

## 🧭 一、设计目标

- 提供统一、直观的插件管理体验；
- 支持多租户（Tenant）独立视图；
- 集成 License、Usage、Logs、Quota、事件、SLA 等关键信息；
- 与 PowerX Admin Portal 无缝嵌入；
- 支持自定义扩展页面与工具。

---

## 🧱 二、结构概览

```

┌───────────────────────────────┐
│ PowerX Admin Portal           │
│  ├─ 系统管理 / 租户中心 / 插件中心 │
│  ├─ 插件管理入口 (/_p/<plugin_id>/admin) │
│  └─ Proxy 至插件 Web-Admin 前端         │
└───────────────────────────────┘
│
▼
┌───────────────────────────────┐
│ Plugin Admin Console (Nuxt)   │
│  ├─ 仪表盘 (Dashboard)         │
│  ├─ 配置 (Settings)            │
│  ├─ 授权 (License)             │
│  ├─ 用量 (Usage & Quota)       │
│  ├─ 日志 (Logs & Events)       │
│  ├─ 审计 (Audit Trail)         │
│  ├─ 支持 (Support & SLA)       │
└───────────────────────────────┘

```

---

## ⚙️ 三、页面模块定义

| 模块 | 路由示例 | 主要功能 |
|------|-----------|-----------|
| **Dashboard** | `/admin/dashboard` | 概览插件运行状态（版本、License、SLA） |
| **Settings** | `/admin/settings` | 插件配置（API Keys、参数、开关） |
| **License** | `/admin/license` | License 状态、激活、续期 |
| **Usage & Quota** | `/admin/usage` | 用量图表、配额状态、续费入口 |
| **Logs & Events** | `/admin/logs` | 运行日志、错误日志、Webhook 事件 |
| **Audit Trail** | `/admin/audit` | 用户操作记录、权限变更 |
| **Support & SLA** | `/admin/support` | 工单入口、支持状态、SLA 指标展示 |

---

## 🧩 四、布局结构示例（Vue 组件）

```vue
<template>
  <AppLayout>
    <template #sidebar>
      <AppSidebar :menu="menuItems" />
    </template>
    <template #content>
      <RouterView />
    </template>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const menuItems = ref([
  { title: '仪表盘', path: '/admin/dashboard', icon: 'Gauge' },
  { title: '配置', path: '/admin/settings', icon: 'Settings' },
  { title: 'License', path: '/admin/license', icon: 'KeyRound' },
  { title: '用量与配额', path: '/admin/usage', icon: 'BarChart3' },
  { title: '日志与事件', path: '/admin/logs', icon: 'FileSearch' },
  { title: '审计记录', path: '/admin/audit', icon: 'History' },
  { title: '支持与 SLA', path: '/admin/support', icon: 'LifeBuoy' }
])
</script>
```

---

## 🧮 五、Dashboard 模块规范

### 必含组件

- 插件信息卡（Plugin ID、Version、Build Time）
- License 状态（Active / Expired / Trial）
- SLA 状态（Uptime、Latency、Error Rate）
- 最近事件（Last 5 Logs）
- Usage 概览图（调用量、租户数）

### 示例接口

```bash
GET /api/v1/admin/plugin/status
```

返回：

```json
{
  "plugin_id": "com.powerx.plugin.crm",
  "version": "1.2.4",
  "uptime": 99.92,
  "license_status": "active",
  "usage_today": 354,
  "tenants": 12
}
```

---

## ⚙️ 六、Settings 模块（配置中心）

| 配置类型            | 说明      | 示例                       |
| --------------- | ------- | ------------------------ |
| API Keys        | 第三方调用凭证 | Salesforce、OpenAI        |
| Feature Toggles | 功能开关    | `enable_auto_sync: true` |
| Secrets         | 加密字段    | API_SECRET_KEY           |
| Schedules       | 定时任务    | `sync_cron: 0 2 * * *`   |

接口：

```bash
GET /api/v1/admin/plugin/settings
PUT /api/v1/admin/plugin/settings
```

前端通过 Pinia store 管理状态。

---

## 🔐 七、License 模块

- 读取 License 状态、Plan、过期时间；
- 提供 License 激活 / 续期按钮；
- 支持扫码或手动输入 License Key；
- 若到期 → 显示受限模式提示；
- 自动同步 License Server。

示例接口：

```bash
POST /api/v1/license/verify
```

---

## 📊 八、Usage & Quota 模块

展示租户级使用数据：

| 项目      | 指标                       | 示例     |
| ------- | ------------------------ | ------ |
| API 调用量 | api.calls                | 12,340 |
| 存储使用量   | storage.bytes            | 523 MB |
| 配额使用率   | quota.used / quota.total | 78%    |
| 费用预估    | usage.cost               | ¥218   |

支持折线图（使用趋势）、饼图（配额分布）。

接口：

```bash
GET /api/v1/admin/plugin/usage
```

---

## 🪵 九、Logs & Events 模块

整合运行日志与宿主事件：

| 来源          | 类型              | 示例                   |
| ----------- | --------------- | -------------------- |
| 应用日志        | Info / Error    | "Sync completed"     |
| Webhook 事件  | license.updated | "License renewed"    |
| Incident 通知 | SEV-1           | "Connection timeout" |

支持过滤器：

- 时间区间；
- 日志等级；
- 事件类型；
- 关键字搜索。

---

## 🧾 十、Audit Trail 模块

记录所有关键管理操作：

| 操作         | 用户                                          | 时间         | 状态   |
| ---------- | ------------------------------------------- | ---------- | ---- |
| 修改配置项      | [admin@tenant.com](mailto:admin@tenant.com) | 2025-10-13 | 成功   |
| 更新 License | vendor_ops                                  | 2025-10-13 | 成功   |
| 调整配额       | powerx_system                               | 2025-10-13 | 自动执行 |

接口：

```bash
GET /api/v1/admin/plugin/audit
```

---

## 🧰 十一、Support & SLA 模块

- 直接显示当前 SLA 等级与可用性；
- 入口按钮 → 打开 PowerX Support Hub；
- 可查看近 30 天 SLA 曲线；
- 若存在未解决工单 → 显示提醒；
- 集成快捷「报告问题」表单。

```bash
POST /api/v1/support/ticket
{
  "plugin_id": "com.powerx.plugin.crm",
  "title": "功能异常",
  "description": "同步客户数据时报错 500。"
}
```

---

## 🧩 十二、权限控制（RBAC）

PowerX Admin Portal 会将租户管理员角色注入：

- 通过 `x-tenant-id` 与 JWT 权限字段；
- 插件侧需验证角色（`tenant_admin`, `support_agent` 等）；
- 前端隐藏无权限菜单项；
- 操作按钮需二次确认（ConfirmDialog）。

示例：

```ts
const canManageLicense = usePermission('plugin.license.update')
```

---

## 🧠 十三、UI 风格规范

| 设计要素      | 说明                       |
| --------- | ------------------------ |
| **框架**    | Nuxt 3 + Tailwind CSS    |
| **组件库**   | shadcn/ui 或 Element Plus |
| **图标库**   | lucide-react / Iconify   |
| **主题色**   | 继承 PowerX Admin 主色       |
| **字体**    | Inter / PingFang SC      |
| **国际化**   | i18n 支持 zh-CN / en-US    |
| **响应式布局** | 宽屏（>=1200px） + 移动端兼容     |

---

## 🧩 十四、扩展与插件内嵌

开发者可定义自有扩展页：

```yaml
admin:
  routes:
    - id: reports
      path: /admin/reports
      name: "分析报表"
      icon: "PieChart"
      component: "@/pages/admin/reports.vue"
```

PowerX 会自动注册该路由到宿主菜单树下。

---

## 📈 十五、插件诊断（Admin Diagnostics）

内嵌诊断页 `/admin/diagnostics`，用于调试与验证环境。

显示：

- Plugin build 信息；
- 当前环境变量；
- 与宿主通信状态（Ping）；
- gRPC / MCP / HTTP 适配状态；
- License / Usage 实时检查。

---

## 🧾 十六、自检清单（Admin Console Ready Checklist）

| 检查项                                      | 状态 |
| ---------------------------------------- | -- |
| 管理端路由 `/admin/` 已启用                      | ✅  |
| Dashboard 显示 License/Usage/SLA 状态        | ✅  |
| 支持 Settings 配置保存                         | ✅  |
| 集成 Logs / Audit / Support 模块             | ✅  |
| 权限控制与 JWT 校验生效                           | ✅  |
| 国际化与主题适配完成                               | ✅  |
| 与宿主代理 `/__up/_p/<plugin_id>/admin/` 流畅集成 | ✅  |

---

## 📚 十七、延伸阅读

- [Audit_and_History_View.md](./Audit_and_History_View.md)
- [Common_Tasks_and_Troubleshooting.md](./Common_Tasks_and_Troubleshooting.md)
- [Runtime_Env_and_Ports.md](../03_runtime_and_ops/Runtime_Env_and_Ports.md)
- [Logs_Metrics_and_Tracing.md](../03_runtime_and_ops/Logs_Metrics_and_Tracing.md)

---

> **文档版本：** v1.1.0
> **适用范围：** PowerXPluginBase ≥ 0.9.0
> **维护团队：** PowerX Frontend & Integration UX Team
> **最后更新：** 2025-10
