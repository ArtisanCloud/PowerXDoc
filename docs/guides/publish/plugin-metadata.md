# 插件元数据（plugin.yaml / manifest.yaml）

- **覆盖场景**: `SCN-DEV-PLUGIN-INIT-001`, `SCN-DEV-PLUGIN-DEBUG-001`
- **关联规范**:
  - `../Plugins/PowerXPlugin/specs/004-publish-hub-spec/spec.md`
  - `docs/standards/powerx-plugin/contract/plugin_yaml_spec.md`
  - `docs/standards/powerx-plugin/lifecycle/manifest-mapping.md`

本页帮助你在调试/发布前一次性对齐元数据，避免在在线/离线渠道被质量门禁或 Marketplace 拒绝。

---

## 1. 文件位置

| 文件 | 用途 | 典型位置 |
|------|------|----------|
| `plugin.yaml` | 插件元数据、权限、入口 | `<plugin-root>/plugin.yaml` |
| `manifest.yaml` | 前端/后端暴露给宿主的运行清单 | `<plugin-root>/manifest.yaml` |
| `publish.yml` | 发布策略、灰度批次 | `<plugin-root>/publish.yml` |
| `.pxp` | 打包产物 | `dist/<plugin-id>-<version>.pxp` |

> 所有示例以 `../Plugins/PowerXPlugin/templates/react-dashboard/` 为基准。

---

## 2. plugin.yaml 字段速查

| 字段 | 必填 | 说明 |
|------|------|------|
| `id` | ✅ | 全局唯一 ID，格式 `com.org.domain.name` |
| `version` | ✅ | semver（在发布前需与 `manifest.yaml`、`publish.yml` 同步） |
| `backend.entry` | ✅ | 二进制或可执行入口，相对路径 |
| `backend.port` | ✅ | 宿主用于代理的端口 |
| `routes.adminManifest` | ✅ | 宿主读取菜单/权限的接口路径 |
| `permissions[]` | ☐ | 插件自定义资源+动作数组 |
| `menus[]` | ☐ | 后台菜单（支持多语言 key） |
| `assets.webAdminPath` | ☐ | 前端打包输出路径 |
| `agents[]/tools[]/workflows[]` | ☐ | 与 Agent 平台集成的声明 |
| `dependencies.requires/conflicts` | ☐ | 版本依赖、冲突定义 |

详细语义请对照 `docs/standards/powerx-plugin/contract/plugin_yaml_spec.md`。

### 示例片段

```yaml
id: com.powerx.plugins.demo
name: Demo Plugin
version: 0.2.0
backend:
  entry: backend/bin/plugin
  port: 8087
  health: /healthz
routes:
  basePath: /v1
  adminManifest: /api/v1/admin/manifest
  rbac: /api/v1/admin/rbac
assets:
  webAdminPath: web-admin/.output
permissions:
  - resource: demo:dataset
    actions: [read, write]
```

---

## 3. 与 manifest.yaml 的映射

| plugin.yaml | manifest.yaml | 备注 |
|-------------|---------------|------|
| `routes.adminManifest` | `admin.manifestEndpoint` | 手动保持一致，或参考 `docs/standards/powerx-plugin/lifecycle/manifest-mapping.md` |
| `permissions` | `admin.permissions` | 需保持字段数量/名称一致 |
| `menus` | `admin.menus` | 建议使用相同的菜单 ID |
| `assets.webAdminPath` | `web.entry` | 打包脚本会读取该路径构建前端产物 |
| `dependencies.requires` | `compat.requires` | 影响兼容性矩阵，发布前请逐项核对 |

> `px-plugin manifest sync` / `px-plugin metadata lint` 仍在 CLI backlog，暂未发布，需手动同步上述字段。

---

## 4. 质量门禁前的校验

1. **静态校验**  
   - 使用 IDE / `yamllint` 检查语法。
   - 对照 `plugin_yaml_spec.md` 的 checklist（ID、version、backend entry 等）。
2. **字段对齐**  
   - 将 `plugin.yaml` 与 `manifest.yaml` 中的 `menus`、`permissions`、`assets.webAdminPath` 放到 diff 工具检查。
3. **依赖锁定**  
   将 `dependencies.lock` 一并提交，供 Marketplace 审核与 `.pxp` 打包使用。
4. **常见错误提示**
   | 错误码 | 说明 | 处理 |
   |--------|------|------|
   | `PX_META_001` | 缺少 `backend.entry` | 确认执行 `pnpm build` 并输出二进制 |
   | `PX_META_003` | `id` 与仓库目录不一致 | 调整仓库目录或更新 `id` |
   | `PX_META_010` | 权限声明重复 | 合并 `permissions` 数组 |

---

## 5. 在不同仓库中的同步

- 如果在 `PowerXDocs` 中更新了规范，请执行 `make sync-lifecycle-docs` 把示例推送到 `docs/standards/powerx-plugin/lifecycle/examples/`。
- 在插件仓库中，确保 `pnpm lint` 包含 `plugin.yaml` 的 schema 校验。

---

## 6. 自检步骤

- [ ] `plugin.yaml` 与 `manifest.yaml` 的 `version`、`menus`、`permissions` 字段完全一致。
- [ ] `plugin.yaml` 与 `manifest.yaml` 的 `version`、`menus`、`permissions` 字段完全一致。
- [ ] 发布到任何渠道前，都能在 MR 中看到 `dependencies.lock`、`publish.yml` 的更新。
- [ ] 文档引用的所有路径（示例及规范）均可在仓库中打开。
