# 版本兼容性与治理

- **覆盖场景**: `SCN-DEV-PLUGIN-VERSION-COMPAT-001`
- **关联规范**:
  - `../PowerX/specs/009-install-plugin-pxp/spec.md`
  - `../Plugins/PowerXPlugin/specs/004-publish-hub-spec/spec.md`

---

## 1. 兼容性矩阵来源

| 文件 | 说明 |
|------|------|
| `compatibility.matrix.json` | `.pxp` 内置，描述宿主、插件依赖、租户标签要求 |
| `dependencies.lock` | 供 SCA 与 Marketplace 校验 |
| `reports/_state/workflows/VERSION_COMPAT*.json` | 最近一次治理扫描结果 |

> 生成矩阵的脚本位于 `../Plugins/PowerXPlugin/scripts/publish/build-compat-matrix.mjs`。

---

## 2. 运行版本扫描

```bash
px version scan \
  --tenant-id t-88001 \
  --plugin-id com.powerx.demo \
  --output reports/version/scan-t-88001.json
```

- 预期 5 分钟内完成（004 spec Success Signals）。
- 输出字段：`hostVersion`, `pluginVersion`, `riskLevel`, `recommendation`。

---

## 3. 检查兼容性

```bash
px version compat check \
  --host-version 1.24.0 \
  --plugin-version 0.2.0 \
  --matrix dist/compatibility.matrix.json
```

- CLI 会验证 `minimum_host_version`、`requires[]` 与租户标签。
- 如需排查具体条目可加 `-v`（verbose 模式）。

---

## 4. 例外审批流程

1. 申请：
   ```bash
   px version compat exception \
     --tenant-id t-88001 \
     --plugin-id com.powerx.demo \
     --current-version 0.1.0 \
     --target-version 0.2.0 \
     --reason "定制集成依赖"
   ```
2. 审批：
   ```bash
   curl -X POST http://localhost:8080/api/admin/version/compat/approve \
     -H "Authorization: Bearer <token>" \
     -d '{
       "id": "exception-uuid",
       "status": "approved",
       "reviewer": "ops@example.com"
     }'
   ```
3. 例外策略需在 30 天内回收（见 009 spec User Story 3）。

---

## 5. 治理指标

| 指标 | 说明 | 路径 |
|------|------|------|
| `plugin_publish_pipeline_duration_ms` | 发布至治理闭环的耗时 | `scripts/qa/workflow-metrics.mjs` |
| `publish_gray_error_rate` | 灰度失败概率 | 同上 |
| `tenant.install.failed` | 租户安装失败计数 | `../PowerX/backend/logs/audit.log` |
| `version_drift_count` | 单租户版本漂移数量 | `reports/_state/workflows/VERSION_COMPAT*.json` |

---

## 6. 自检步骤

- [ ] `px version scan` 在 5 分钟内结束并输出 JSON。
- [ ] `px version compat check` 通过，或生成的异常可被审批并落在 30 天窗口。
- [ ] 指标脚本能输出包含 `SCN-DEV-PLUGIN-VERSION-COMPAT-001` 的记录。
- [ ] 所有路径指向 `PowerXDocs` 与相关仓库的实际文件。
