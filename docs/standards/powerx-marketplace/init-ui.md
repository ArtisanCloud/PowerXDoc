# PowerX Marketplace · 初版 UI 交付规划

> 适用范围：PowerX Marketplace 前端（Nuxt 4 + Tailwind + @nuxt/ui）在“阶段 0 – 4”内需要实现的界面、组件与治理能力。目标是让支撑团队在每一阶段都可验证**权限、体验、可观测、质量**四大横切能力，同时与现有标准文档（`docs/standards/powerx-marketplace/**`、`docs/standards/powerx-plugin/**`、`docs/standards/powerx/**`、`docs/standards/powerx-admin/**`）保持一致。

---

## 1. 目标与范围

- 交付 Marketplace 前、后台（Host + Vendor）核心页面，覆盖插件发布、审核、运营、支持、政策执行、申诉等全链路。
- 采用纯前端渲染 + 后端 API（OpenAPI 契约）模式，所有页面必须支持中英文、暗/亮主题、访问控制与审计。
- 输出物包括：页面与组件清单、数据契约、权限矩阵、可观测指标、测试计划。

---

## 2. 技术基线 & 项目结构

| 项目要素 | 约定 |
|----------|------|
| 框架 | Nuxt 4（SSR/Hybrid），Tailwind 主题，@nuxt/ui 作为基础组件库 |
| 目录结构 | `layouts/`, `pages/`, `components/`, `composables/`, `stores/`, `constants/`, `plugins/`, `mocks/`, `tests/` |
| 状态管理 | Pinia（store 按业务域拆分）；支持持久化与 Feature Flag |
| API 客户端 | `ofetch` + `openapi-typescript` + `zod` runtime 校验（`scripts/gen:api`） |
| 权限 | 组合 RBAC/ABAC：`constants/permissions.ts` + `composables/useAuthz.ts` |
| 国际化 | Nuxt i18n（`locales/zh-CN.json`, `en-US.json`），日期/货币按用户时区 |
| 可观测 | Sentry + Web Vitals + 自埋点（`plugins/telemetry.client.ts`） |

---

## 3. 横切能力要求

### 3.1 权限矩阵

角色建议：`Admin`、`SupportAgent`、`PolicyReviewer`、`Enforcer`、`Auditor`、`Vendor`、`Viewer`。  
资源与动作：

| 资源 | 动作 | 角色默认权限 |
|------|------|--------------|
| Ticket | read / create / assign / escalate / close / comment / upload | Admin, SupportAgent |
| PolicyCase | read / create / adjudicate / reopen | Admin, PolicyReviewer |
| Enforcement | read / issue / notify / revoke | Admin, Enforcer |
| Appeal | read / adjudicate / request-more-info | Admin, PolicyReviewer |
| Report | read / export | Admin, Auditor |
| Vendor Listing | read / submit / update / withdraw | Vendor, Admin |

落地文件：

- `constants/permissions.ts`
- `composables/useAuthz.ts`（`can(action, subject, attrs?)`）
- `middleware/auth.global.ts`
- 组件级 `v-authz` 指令/组合式函数。

验收：角色访问受限页面显示 403 友好页；按钮禁用并提示权限不足。

### 3.2 状态与错误治理

- 统一 Loading/Empty/Error/Partial/Success 五态：`components/common/StatePlaceholder.vue`
- 错误分类：401/403/404/409/422/5xx → `plugins/ofetch.ts` 统一映射；`409` 提供“刷新重试/覆盖提交”选择。
- 表格/详情页支持骨架屏和乐观更新回退。

### 3.3 API 合同与 Mock

- `scripts/gen:api` 生成类型 + zod schema。
- `mocks/handlers/*.ts` + `msw` + Playwright 端到端测试。
- CI 对 OpenAPI schema 破坏性变更阻断合并。

### 3.4 可观测 & 审计

- 透传 `trace-id`/`request-id`；关键信息展示在时间线/审计抽屉。
- 自埋点事件：列表筛选、导出、操作按钮、政策裁决、申诉处理、通知发出。
- 指标：`marketplace.publish.duration`, `support.ticket.handle_time`, `policy.enforcement.response_time` 等。

### 3.5 UX / 可访问性

- Server-side Pagination + Sort + Filter + Query 缓存；URL 保留筛选参数。
- 键盘导航、对话框 focus trap、aria-label。
- 列表可保存自定义视图（本地或 `/user/preferences`）。

---

## 4. 阶段交付拆解

| 阶段 | 目标 | UI/组件 | 关键验收 |
|------|------|---------|----------|
| **阶段 0** 基础铺设 | 项目骨架、主题、导航、权限/状态管理 | `AppSidebar`, `AppTopbar`, `Breadcrumbs`, `StatePlaceholder`, `useAuthz`, `useQueryState` | 多角色登录体验正确；全局 404/错误页；i18n 切换无缺词 |
| **阶段 1** 工单支持中心 | 工单列表/详情、指派、评论、附件、SLA | `pages/support/tickets/index.vue`, `TicketTimeline`, `TicketAssignDialog`, `AttachmentUploader`, `SlaCountdown` | 工单主流程（建→指派→评论→关闭）端到端；权限与 SLA 提醒可验证 |
| **阶段 2** 政策执行 & 审计 | PolicyCase 列表、裁决流程、执行通知、审计视图 | `pages/policy/cases/index.vue`, `PolicyDecisionDrawer`, `EnforcementCreateDialog`, `AuditTimeline` | 单个案例从提报到裁决/执行/审计闭环；通知状态更新正确 |
| **阶段 3** 供应商交互 & 申诉 | Vendor 列表、申诉处理、回执 | `pages/vendor/appeals/index.vue`, `AppealDecisionPanel`, `EvidenceRequestDialog` | 申诉裁决流程全链路；Vendor 视角看到回执 |
| **阶段 4** 报表与运营 | 指标仪表板、导出、偏好设置 | `pages/reports/index.vue`, `components/charts/*`, `ExportButton`, `SavedViewDialog` | 报表页面可切换维度，导出成功，偏好保存并恢复 |

每阶段结束前同步：

1. 更新 `docs/standards/powerx-marketplace/**` 中的对应指南。
2. 生成/更新 SCN 文档（`docs/scenarios/publish/SCN-*.md`）与 usecase seeds。
3. 跑 `npm run publish:scenarios -- --dry-run` 及 `publish:usecases`、`publish:standards`（视需要）。

---

## 5. 页面与组件清单

### 5.1 页面

| 路径 | 描述 | 关键组件 | 数据源 |
|------|------|----------|--------|
| `/support/tickets` | 工单列表，支持队列/严重度/状态/标签筛选 | `ServerTable`, `FilterBar`, `TicketRowActions` | `GET /support/tickets` |
| `/support/tickets/[id]` | 工单详情、时间线 | `TicketHeader`, `TicketTimeline`, `CommentComposer`, `AttachmentList` | `GET /support/tickets/{id}` |
| `/policy/cases` | 政策案例列表 | `ServerTable`, `SeverityBadge` | `GET /policy/cases` |
| `/policy/cases/[id]` | 裁决页 | `PolicyDecisionPanel`, `ConditionChecklist`, `EnforcementTimeline` | `GET /policy/cases/{id}` |
| `/policy/enforcements` | 执行记录总览 | `ServerTable`, `EnforcementStatusBadge` | `GET /policy/enforcements` |
| `/vendor/appeals` | 供应商申诉列表 | `ServerTable`, `AppealStatusBadge` | `GET /vendor/appeals` |
| `/vendor/appeals/[id]` | 申诉详情 | `AppealDecisionPanel`, `EvidenceViewer` | `GET /vendor/appeals/{id}` |
| `/reports` | 指标仪表板 | `KpiCard`, `TrendChart`, `ExportButton` | `GET /reports/overview` |
| `/audits` | 审计日志 | `ServerTable`, `AuditFilter` | `GET /audits` |
| `/settings/preferences` | 个人偏好 | `PreferencesForm` | `GET/POST /users/{id}/preferences` |

### 5.2 核心组件

- `components/shell/*`：框架（Sidebar、Topbar、Breadcrumbs、GlobalSearch）。
- `components/common/*`：`StatePlaceholder`, `ConfirmDialog`, `ExportButton`, `ServerTable`, `FilterBar`, `FilterChips`, `Badge` 系列。
- `components/tickets/*`: `TicketTimeline`, `SlaCountdown`, `TicketAssignDialog`, `AttachmentUploader`.
- `components/policy/*`: `PolicyDecisionPanel`, `EnforcementCreateDialog`, `NotificationDialog`.
- `components/appeals/*`: `AppealDecisionPanel`, `ConditionChecklist`.
- `components/charts/*`: `KpiCard`, `TrendChart`, `StackedBarChart`.

所有组件需保持：

- Props/emit 明确、含类型。
- 国际化支持。
- 可访问性（aria、键盘）。

---

## 6. 数据契约与 API 需求

### 6.1 通用查询参数

`page`, `pageSize`, `sortBy`, `sortOrder`, `q`, `filters[]`（如 `filters[]=severity:HIGH`）。  
服务端返回统一格式：

```json
{
  "items": [...],
  "page": 1,
  "pageSize": 20,
  "total": 180
}
```

### 6.2 关键资源模型

```ts
export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'PENDING' | 'RESOLVED' | 'CLOSED' | 'ESCALATED'

export interface Ticket {
  id: string
  title: string
  severity: Severity
  status: TicketStatus
  assigneeId?: string
  queue?: string
  createdAt: string
  updatedAt: string
  slaDueAt?: string
  satisfaction?: { score?: number; comment?: string }
}

export interface TimelineEvent {
  id: string
  type: 'CREATED'|'ASSIGNED'|'STATUS_CHANGED'|'COMMENT'|'ATTACHMENT'|'ENFORCEMENT'|'APPEAL_DECISION'
  actor: { id: string; name: string }
  ts: string
  payload?: Record<string, unknown>
}
```

### 6.3 API 差距清单

1. `GET /support/tickets` 支持多筛选 + SLA 排序；`POST /support/tickets/{id}:bulk-update`.
2. `POST /support/tickets/{id}/attachments`（预签名 + 回写）。
3. `GET /policy/cases/{id}/timeline` 标准事件模型。
4. `POST /policy/enforcements/{id}/notifications` 返回状态轮询 ID。
5. `GET /audits` 支持 `actorId`、`action`、`resourceId`、`from`、`to`。
6. `GET/POST /users/{id}/preferences` 保存列表视图与列配置。
7. `GET /reports/overview`、`GET /reports/queues`、`GET /reports/escalations`.

---

## 7. 测试与质量保障

- **单元测试**：业务组件 ≥ 70% 覆盖，关键函数 ≥ 90%。
- **端到端**：Playwright 组合场景（工单主流程、政策裁决、申诉、权限受限、离线导出）。
- **契约测试**：CI 对比 OpenAPI schema；破坏性变更需后端同步更新 SDK。
- **可回滚发布**：Preview 环境 + `changeset` 记录；主干保护 + Code Review。
- **性能**：核心列表首屏 < 1.5s；CLS < 0.1；LCP < 2.5s。

---

## 8. 交付清单 & 验收标准

1. **页面实现**：表 5.1 列出的页面全部上线，并通过角色/语言/主题验证。
2. **组件库**：表 5.2 列出的组件具备文档与 Story（可选）。
3. **权限矩阵**：`permissions.ts` 与 `useAuthz` 上线，配套测试。
4. **API 对齐**：OpenAPI schema 与前端类型一致，`scripts/gen:api` 纳入 CI。
5. **可观测**：Sentry + 自埋点事件接入，生成用户行为报表。
6. **文档更新**：`docs/standards/powerx-marketplace`、`docs/scenarios/publish/SCN-*.md`、`docs/_data/docmap.yaml` 同步更新。
7. **Dry-run 验证**：`npm run publish:scenarios -- --dry-run`、`npm run publish:usecases -- --dry-run` 通过。

---

## 9. 后续展望

- 阶段 5（规划中）：第三方生态报表、License 结算、营销活动管理。
- 与 PowerX Admin 前端统一导航与账号体系，考虑单点登录与共享组件库。
- 深化 AI 辅助（自动判责建议、合规文本分析）需另起 PXIP。

---

> 对应实现过程中，如有新的横切规范（例如安全审计、数据出境、AI 生成策略），务必补充至 `docs/standards/powerx-marketplace/**` 与 `.specify/memory/constitution.md`，并更新相关场景文档与 usecase seeds。
