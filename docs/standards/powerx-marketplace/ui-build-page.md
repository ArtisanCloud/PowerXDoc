下面根据现有后端接口情况和前端目录 (`app/pages` 下已有 `index.vue`、`support`、`policies`、`appeals`、`reports`、`enforcement`、`admin`) 进行对照整理，给出一份补齐页面的开发计划。当前 API 前缀固定为 `/api/v1`，文档中的各模块只是抽象描述。实际接口远多于文档列出的几项，因此需要新增或完善相应的前端页面。

## 已实现页面梳理

* **首页（Dashboard） `/`**：角色感知仪表板，已实现。
* **支持工单模块 `/support/tickets`**：列表 + 详情已实现（含工单、反馈报告）。
* **政策案例模块 `/policies/cases`**：列表 + 详情已实现。
* **申诉中心 `/appeals`**：申诉列表与详情已实现。
* **治理报告 `/reports`**：Phase 7/8 仪表板已实现。
* **执行中心 `/enforcement`**：目前只是占位页面 (`StatePlaceholder`)。
* **管理控制台 `/admin`**：目前只是占位页面。
* **403/404 页面**：已经存在。

## 需要补充或完善的页面模块

| 模块             | 建议页面路径                           | 关联接口（示例，仅列核心，均以 `/api/v1` 为前缀）                                                                                                                                                                                                  |                                                               |                                                                                                                                          |                                                                                           |           |
| -------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | --------- |
| **插件市场浏览**     | `/plugins`、`/plugins/[pluginId]` | `GET /plugins`（插件列表），`GET /plugins/:plugin_id`（插件详情），`GET /plugins/:plugin_id/versions`（版本列表）                                                                                                                                   |                                                               |                                                                                                                                          |                                                                                           |           |
| **开发者上传与版本管理** | `/dev/uploads` 或集成到开发者控制台        | `POST /dev/uploads`（预签名上传）、`POST /dev/plugins/:plugin_id/versions`（登记构建元信息）、`POST /downloads`（获取下载链接）                                                                                                                           |                                                               |                                                                                                                                          |                                                                                           |           |
| **插件提交与审核管理**  | `/plugins/submissions`           | `POST /plugins/submissions`（新建提交）、`PATCH /plugins/submissions/:id`（更新提交）、`POST /plugins/submissions/:id/submit                                                                                                                  | withdraw`（提交/撤回）、`POST /plugins/submissions/reviews/:id/claim | request-changes                                                                                                                          | approve                                                                                   | reject` 等 |
| **供应商入驻流程**    | `/vendors/applications`          | `POST /vendors/applications`（提交入驻申请）、`GET /vendors/applications/:applicationId`（查看申请）、`POST /vendors/applications/:applicationId/sign`（签署协议）                                                                                    |                                                               |                                                                                                                                          |                                                                                           |           |
| **插件日落计划管理**   | `/plugins/[pluginId]/sunsets`    | `POST /plugins/:plugin_id/sunsets`（安排下线）、`PATCH /plugins/:plugin_id/sunsets/:sunset_id`（修改下线计划）                                                                                                                                 |                                                               |                                                                                                                                          |                                                                                           |           |
| **授权管理**       | `/licenses`                      | `POST /license/licenses`（发行许可证）、`POST /license/licenses/:id/renew                                                                                                                                                               | activate                                                      | transfer                                                                                                                                 | ticket`、`POST /license/licenses/bulk/renew`、`GET /license/licenses/reconciliation`（对账列表）等 |           |
| **许可证模版管理**    | `/license/templates`             | `GET /license/templates`（列出）、`POST`/`PATCH`/`POST …/clone`/`POST …/deprecate` 等                                                                                                                                                 |                                                               |                                                                                                                                          |                                                                                           |           |
| **价格计划管理**     | `/pricing/plans`                 | `GET /pricing/plans`、`POST /pricing/plans`、`PATCH /pricing/plans/:id`、`POST /pricing/plans/:id/publish                                                                                                                          | retire`                                                       |                                                                                                                                          |                                                                                           |           |
| **保存视图管理**     | `/support/saved-views` 或集成在支持模块  | `GET /saved-views`、`POST /saved-views`、`PUT /saved-views/:viewId`、`DELETE /saved-views/:viewId`                                                                                                                                 |                                                               |                                                                                                                                          |                                                                                           |           |
| **执行中心完善**     | `/enforcement`                   | 需要完整实现案件执行 UI：调用 `POST /policy/cases/:caseId/enforcements` 创建执行动作、`POST /policy/enforcements/:actionId/notifications` 确认通知、`POST /policy/enforcements/:actionId/sync` 同步状态、`POST /policy/enforcements/:actionId/appeals` 发起申诉等。 |                                                               |                                                                                                                                          |                                                                                           |           |
| **管理控制台完善**    | `/admin`                         | 实现功能开关、租户管理和审计相关界面。可能涉及调用价格和授权内部接口（如 `/internal/plugins/*`、`/internal/license/*` 等），按具体功能细化子模块。                                                                                                                                 |                                                               |                                                                                                                                          |                                                                                           |           |
| **内部主机集成**     | （可视需求决定是否有页面）                    | 包含 `POST /internal/host/manifest/sync`、`POST /internal/host/manifest/sync/:id/approve                                                                                                                                           | reject                                                        | apply`、`POST /internal/host/license/validate`、`POST /internal/host/usage/report`、`POST /internal/host/heartbeat` 等，若需要图形化运维界面，可开发后台专用页面。 |                                                                                           |           |

### 说明

* 表中接口路径均以 `/api/v1` 为前缀，可按角色权限在页面中调用。
* “执行中心”和“管理控制台”是文档中标记为占位的模块，需优先补齐。
* 部分接口属于内部运维或系统对接（如内部插件契约、主机同步等），是否需要前端页面取决于业务范围；若只限内部调用，可不开发 UI，只在后台工具或命令行使用。
* 若财务模块启用，还应根据 `financeModule` 开放的下载/报表接口增加相应页面，但这类接口为条件加载，待配置确定后再规划。

按照上述规划，前端团队可以逐一梳理缺失的页面，实现与后端接口对接，完善 PowerX Marketplace 的功能覆盖。

## 建议的菜单结构

可以根据功能域将现有和计划中的页面进行分组，形成更清晰的一级/二级菜单结构。下面是一种建议的聚合方式，便于用户在界面中导航，同时也方便按角色授权。

| 一级菜单      | 二级菜单（示例）                                                     | 说明                                                                      |
| --------- | ------------------------------------------------------------ | ----------------------------------------------------------------------- |
| **总览**    | 仪表板                                                          | 默认首页，展示整体运营概览。                                                          |
| **插件市场**  | - 插件目录（列表/详情）<br>- 版本历史                                      | 面向客户的插件浏览与购买入口。                                                         |
| **开发者中心** | - 上传与版本管理<br>- 插件提交管理                                        | 面向插件开发者，用于上传构建、管理提交、提交审核等。                                              |
| **供应商入驻** | - 入驻申请<br>- 协议签署                                             | 供应商申请与跟踪入驻流程。                                                           |
| **授权与定价** | - 授权管理<br>- 许可证模版<br>- 价格计划                                  | 管理许可证发行、续期、转移，维护授权模版与价格计划等。可根据权限决定是否对外展示。                               |
| **支持与合规** | - 工单（Support Tickets）<br>- 政策案例<br>- 执行中心<br>- 申诉板<br>- 保存视图 | 将客户支持与合规相关内容归类：支持工单、政策案例、执行措施、申诉处理及用户保存视图。执行中心和政策案例属于合规域，可以进一步在二级菜单中区分。 |
| **报告**    | - 治理报告<br>- 财务报表（若启用）                                        | 展示各类运营/合规/财务报表。                                                         |
| **系统管理**  | - 功能开关 / Feature Flags<br>- 租户与审计<br>- 内部集成（主机清单/心跳等）        | 面向系统管理员，用于开关功能、管理多租户、查看审计记录以及调用内部接口。                                    |

### 设计思路说明

* **功能聚合**：将相关接口聚合到同一功能域，如授权与定价、支持与合规等，避免顶层菜单过多。
* **角色区分**：开发者中心和供应商入驻主要面向插件开发者和供应商；授权与定价及系统管理面向内部运维或管理员；支持与合规面向客服与政策审核团队。
* **可扩展性**：如果将来启用财务模块，可在“报告”下增加财务报表子菜单；如果有更多运营功能，可再拆分。
* **简洁导航**：一级菜单数量控制在 6~8 个之间，二级菜单按需要展开，便于用户快速定位。

该菜单设计仅为建议，实际实施时可根据团队角色、业务优先级和权限模型调整。
