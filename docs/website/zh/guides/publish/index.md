# PowerX 插件发布路线图

欢迎来到插件发布专区。在这里我们会手把手说明：**如何把一个插件从本地代码送进 PowerX，并让租户安心使用**。你只需要选择当下所在阶段，其余交给对应的操作指南。

---

## 我现在需要看哪一篇？

| 目标 | 适合阅读的指南 |
|------|---------------|
| 第一次搭插件工程、跑通 Skeleton UI | [插件本地初始化](./local-init.md) |
| 直接 local install（绕过 Marketplace） | [插件直接 Local Install 指南](./local-install.md) |
| 给隔离环境交付 `.pxp`，处理密钥/分块上传 | [离线发布与导入](./offline-publish.md) |
| 在宿主中热调试、连通 Dev API/SSE | [插件本地调试实践](./local-dev-debug.md) |
| 走在线发布 → Marketplace 审核 → 租户安装 | [在线发布与上架](./online-publish.md) |
| 确认 `plugin.yaml`/`manifest` 写法 | [插件元数据说明](./plugin-metadata.md) |
| 检查租户兼容性、申请例外或做版本治理 | [版本兼容性与治理](./version-compatibility.md) |
| 想确认官方要求、产出是否满足标准 | [标准分发要求](./standards-distribution.md) |

> 小贴士：每份指南末尾都有“自检步骤”。踩坑时就按清单排查，通常能快速定位问题。

---

## 完整流程一目了然

```mermaid
graph TD
  A[准备工程] --> B[本地调试]
  B --> C[质量门禁]
  C --> D{选择渠道}
  D -->|在线| E[Marketplace 审核]
  D -->|离线| F[加密打包+分块上传]
  E --> G[租户安装]
  F --> G
  G --> H[版本治理]
```

每一站对应的指南：

1. **准备工程** → [插件本地初始化](./local-init.md)：模板同步、`px-plugin init`、Skeleton 启动自检。  
2. **Local install（可选）** → [插件直接 Local Install 指南](./local-install.md)：dist → `/admin/plugins/install/local` / `/internal/plugins/local/install`，用于隔离环境或私有验收。  
3. **离线交付**（可选） → [离线发布与导入](./offline-publish.md)：临时密钥、50MB 分块、指纹记录。  
4. **宿主调试** → [插件本地调试实践](./local-dev-debug.md)：宿主挂载、`px-plugin dev --watch`、SSE 日志。  
5. **在线发布** → [在线发布与上架](./online-publish.md)：`px-plugin publish precheck/create`、灰度、回滚。  
6. **安装与治理** → [版本兼容性与治理](./version-compatibility.md)：`px version scan/compat`、例外审批。

---

## 第一次发布？照着做就行

1. **初始化**：按照 [插件本地初始化](./local-init.md) 执行模板同步、`px-plugin init <id>` 与 Skeleton 启动自检。  
2. **（可选）直接 local install**：若只需在 PowerX 环境快速装包或给隔离环境验收，按照 [插件直接 Local Install 指南](./local-install.md) 构建 dist、调用 `/admin/plugins/install/local`。  
3. **（可选）离线交付**：为空气隔离场景准备 `.pxp`、密钥与分块上传流程，可参考 [离线发布与导入](./offline-publish.md)。  
4. **调试与联调**：`px-plugin dev --watch --tenant demo`，并按 [插件本地调试实践](./local-dev-debug.md) 处理宿主挂载、Feature Flag、SSE 日志。  
5. **准备元数据**：对照 [插件元数据说明](./plugin-metadata.md) 校准 `plugin.yaml`、`manifest.yaml`、`publish.yml`。  
6. **选择渠道**：
   - 在线：`px-plugin publish precheck/create/deploy` → Marketplace 审核 → 通过租户管理面板或 API 安装。  
   - 离线：`px-plugin pack --mode release` → 临时密钥加密 → `px-plugin offline upload` 分块 → 审核通过后导入。  
7. **上线后巡检**：`px version scan`、`px version compat check`，确认租户没有版本漂移；如需例外审批，直接使用 `px version compat exception`。

---

## 常备资源

- **场景剧本**（了解端到端故事线）：  
  `SCN-DEV-PLUGIN-INIT-001` / `SCN-DEV-PLUGIN-DEBUG-001` / `SCN-DEV-PLUGIN-PUBLISH-001` / `SCN-DEV-PLUGIN-VERSION-COMPAT-001`（位于 `../../website/zh/scenarios/`）。
- **更详实的标准要求**：如果需要交付材料或对齐内部审计，可回看 `../Plugins/PowerXPlugin/specs/004-publish-hub-spec`、`../PowerX/specs/009-install-plugin-pxp` 与 `../PowerXPluginMarket/specs/010-install-plugin-pxp`。
- **遥测&报表**：`scripts/qa/workflow-metrics.mjs` 会生成 `reports/_state/workflows/*.json`，方便在复盘会上引用。

---

准备好后，直接进入你需要的那篇指南，我们会在里边放上命令、表单字段示例，以及最常见的“踩坑提醒”。祝你发布顺利！
