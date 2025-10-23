# Deprecation & Sunset Playbook

This document defines how a PowerX plugin transitions from **active** to **deprecated** and finally **sunset** status. It covers state transitions, required metadata, notifications, and operational controls.

## 1. Lifecycle State Machine

```
Active ──(announce deprecation)──▶ Deprecated ──(sunset date reached)──▶ Sunset
   ▲                                       │                                   │
   └───────────────(cancel deprecation)────┘                                   │
                                                                               ▼
                                                                            Archived
```

| Transition | Required Actions | Notes |
|------------|------------------|-------|
| Active → Deprecated | Publish deprecation notice (≥30 天提前量); populate `manifest.yaml:lifecycle.status=deprecated`, `effective_date`, `replacement` (若有); update Marketplace channel record | New installs仍允许，但前端/Marketplace需显示提醒 |
| Deprecated → Active | 仅在撤销弃用时执行；撤销公告；更新 manifest 与 Marketplace 状态 | 需要产品/合规审批 |
| Deprecated → Sunset | 公告明确退役日期；在 `sunset_at` 生效时阻止新安装；准备数据迁移/导出方案 | 可以保留只读运行直至完成迁移 |
| Sunset → Archived | 清理 CI/CD；仓库只读；保留 artefact 供审计 | 可与 compliance 合作完成 |

## 2. Manifest Lifecycle Block

Populate these fields before packaging：

```yaml
lifecycle:
  status: deprecated   # active | deprecated | sunset
  effective_date: "2025-12-01"  # ISO 8601 date when status takes effect
  replacement: "com.powerx.plugin.crm.v2"  # 可选，推荐替代插件
  sunset_at: "2026-03-01"  # 可选，进入 Sunset 的计划日期
  notes: "v2 提供 LTS 支持，请提前迁移"
```

- **status**：当前生命周期状态。
- **effective_date**：状态生效日期，Marketplace 同步展示。
- **replacement**：建议迁移目标，宿主可用于推荐安装。
- **sunset_at**：弃用后计划退役的日期；用于驱动通知节奏。
- **notes**：额外提示（最长 200 字符）。

## 3. Required Artifacts

| 阶段 | Artefact | 存放位置 |
|------|----------|----------|
| Deprecation 公告 | `docs/lifecycle/notices/deprecation-email.md`（或自定义） | Lifecycle notices | 
| Marketplace 更新 | `docs/integration/01_plugin_lifecycle/Manifest_and_Metadata.md` 引用的状态记录 | 集成文档 | 
| 迁移指南 | `docs/lifecycle/runbooks/deprecation-runbook.md`（模板） | Lifecycle runbooks |
| Manifest 样例 | `docs/lifecycle/examples/manifest-lifecycle.yaml` | Lifecycle examples |

## 4. Communication Cadence

1. **T-30 天**：发布弃用公告；更新 Marketplace 与 manifest。
2. **T-14 天**：再次提醒租户管理员；提供迁移指南链接。
3. **Sunset 当日**：阻止新安装；保留现有租户运行；通知退役完成时间。
4. **Sunset +30 天**：完成迁移验证；撤销权限、工具；进入归档状态。

## 5. Operational Controls

- **访问权限**：退役后撤销 API Key / ToolGrant；删除长效凭证。
- **运行时**：可返回 `410 Gone`，但需提前在公告中说明。
- **数据处理**：提供导出脚本；对敏感数据执行脱敏或删除；留痕合规。
- **审计**：在 `docs/lifecycle/runbooks/deprecation-runbook.md` 中记录每次步骤执行时间和负责人。

## 6. Marketplace Integration Steps

1. 调用 `PATCH /plugins/{pluginId}/versions/{version}/lifecycle`（见 [`contracts/marketplace-lifecycle.openapi.yaml`](./contracts/marketplace-lifecycle.openapi.yaml)）。
2. 如果 `replacement` 非空，Marketplace UI 显示推荐插件。
3. 退役时将 `status=sunset`，并设置 `effectiveDate`。

## 7. Checklist Additions

在 `docs/lifecycle/checklists/release-checklist.md` 中勾选以下项：

- [ ] manifest `lifecycle.status` 与 Marketplace 状态一致
- [ ] 通知模板已发送（邮件/系统公告/UI banner）
- [ ] `sunset_at` 之后的安装防护已验证
- [ ] 数据迁移脚本/指南完成现场演练

完成上述步骤后再执行 `make package-pxp` 和 Marketplace 提交流程。
