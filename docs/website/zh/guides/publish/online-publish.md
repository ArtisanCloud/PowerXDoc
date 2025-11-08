# 在线发布与 Marketplace 上架

- **覆盖场景**: `SCN-DEV-PLUGIN-PUBLISH-001`（`../../website/zh/scenarios/SCN-DEV-PLUGIN-PUBLISH-001.md`）
- **关联规范**:
  - `../Plugins/PowerXPlugin/specs/004-publish-hub-spec/spec.md`
  - `../PowerX/specs/009-install-plugin-pxp/spec.md`
  - `../PowerXPluginMarket/specs/010-install-plugin-pxp/spec.md`

本指南聚焦“在线渠道”：从质量门禁 → 发布计划 → 灰度部署 → Marketplace 上架 → 租户安装的全链路。

---

## 1. 质量门禁

> 参考 004 spec 中的 *PublishPipeline/Quality Gate* 一节。

1. **CLI 触发**  
   ```bash
   px-plugin publish precheck \
     --plugin-id com.powerx.demo \
     --channel stable
   ```
2. **必备材料**
   | 文件 | 位置 |
   |------|------|
   | `manifest.json` | `dist/manifest.json` |
   | `CHANGELOG.md` | 项目根目录 |
   | `test-report.xml` | `reports/tests/` |
   | `coverage-summary.json` | `reports/coverage/` |
3. **失败示例**  
   - 覆盖率 < 80% → `PX_GATE_201`；
   - SCA 高危漏洞 → `PX_GATE_305`；
   - `plugin.yaml` 与 manifest 版本不一致 → `PX_GATE_110`。

---

## 2. 创建发布计划

```bash
px-plugin publish create \
  --plugin-id com.powerx.demo \
  --manifest dist/manifest.json \
  --channel stable \
  --notes ./CHANGELOG.md
```

- 命令会在 Publish Hub（`../PowerX`）写入一条 `publish_plan` 记录。
- 默认灰度策略来自 `publish.yml`，示例：
  ```yaml
  rollout:
    batches:
      - percentage: 20
        wait: 10m
      - percentage: 80
  metrics:
    - name: plugin_publish_pipeline_duration_ms
      threshold: 1800000
  rollbackPlan:
    enabled: true
    maxLatency: 300s
  ```
- 可通过 `px-plugin publish plan --id <planId>` 查看状态。

---

## 3. 灰度与回滚

1. **部署灰度批次**  
   ```bash
   px-plugin publish deploy \
     --plan <planId> \
     --strategy canary \
     --batches '[{"percentage":20,"wait":"10m"},{"percentage":80}]'
   ```
2. **监控**  
   - 指标：`plugin_publish_pipeline_duration_ms`, `publish_gray_error_rate`。
   - 指标定义可在 `scripts/qa/workflow-metrics.mjs` 中查看。
3. **自动回滚**  
   - 触发阈值：灰度阶段错误率 > 3% 或 SLA 超过 30 分钟（来自 009 spec）。
   - CLI 手动回滚：
     ```bash
     px-plugin publish rollback --deployment <deploymentId>
     ```

---

## 4. Marketplace 审核与上架

1. **提交审核**  
   发布计划成功后，Publish Hub 会调用 Marketplace 审核 API：
   ```http
   POST /internal/marketplace/review
   Body: {
     "pluginId": "com.powerx.demo",
     "version": "0.2.0",
     "planId": "plan-xxx",
     "artifacts": {
       "manifest": "dist/manifest.json",
       "pxp": "dist/com.powerx.demo-0.2.0.pxp"
     }
   }
   ```
2. **审核 SLA**  
   - 在线队列 ≤ 4 小时（`../PowerXPluginMarket/specs/010...` 中的 `FR-012`）。
   - 超时会触发 `SLAWatcher`，通知发布者与运营群。
3. **上架与通知**
   - 审核通过 → Marketplace 即时上架 → `tenant.subscription` 通知在 5 分钟内送达。
   - 可使用 `../PowerXPluginMarket/scripts/workflows/marketplace-online-publish.mjs` 生成审核回执，输出默认写入 `tmp/workflows/online-publish-report.json`，用于校验通知负载。
   - 订阅租户可在 `PowerX Admin → 插件中心 → 待更新` 中看到新版本。

---

## 5. 租户安装与验证

1. **自动推送**：
   ```bash
   curl -X POST http://localhost:8080/api/admin/plugins/install \
     -H "Authorization: Bearer <token>" \
     -d '{
       "pluginId": "com.powerx.demo",
       "version": "0.2.0",
       "method": "remote"
     }'
   ```
2. **验证**：
   - 通过 `px version scan --tenant-id <id>` 检查是否安装成功。
   - 查看宿主日志：`../PowerX/backend/logs/audit.log`（包含安装、回滚事件）。

---

## 6. 遥测与审计

1. **工作流指标**  
   ```bash
   node scripts/qa/workflow-metrics.mjs --scenario SCN-DEV-PLUGIN-PUBLISH-001
   ```
2. **审计链路**  
   - Publish Hub：`reports/_state/workflows/PUBLISH_HUB*.json`
   - Marketplace：`../PowerXPluginMarket/scripts/workflows/marketplace-online-publish.mjs`

---

## 7. 自检步骤

- [ ] `px-plugin publish precheck/create/deploy` 成功并生成 planId。
- [ ] 灰度阶段指标全部达标或触发回滚能在 5 分钟内完成。
- [ ] 运行 `pnpm tsx ../PowerXPluginMarket/scripts/workflows/marketplace-online-publish.mjs` 能生成包含当前版本的 `tmp/workflows/online-publish-report.json`。
- [ ] 至少一个租户通过 API 或 Web Admin 成功安装并记录在 `px version scan`。 
- [ ] 场景脚本 `scripts/qa/workflow-metrics.mjs --scenario SCN-DEV-PLUGIN-PUBLISH-001` 返回最新时间戳。
