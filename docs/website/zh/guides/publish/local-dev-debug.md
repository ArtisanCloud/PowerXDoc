# 插件本地调试实践

- **覆盖场景**: `SCN-DEV-PLUGIN-DEBUG-001`（`../../website/zh/scenarios`）
- **关联规范**: `../Plugins/PowerXPlugin/specs/004-publish-hub-spec/spec.md`
- **读者角色**: 插件开发者、技术负责人

本指南聚焦如何把已初始化的插件挂载到宿主、跑通 `px-plugin dev` 热加载，并结合 Dev API / SSE 遥测排查问题。若你尚未完成脚手架生成与 Skeleton 启动，请先阅读 [插件本地初始化指南](./local-init.md)。

---

## 0. 前置条件检查

1. **脚手架已就绪**：参考 [插件本地初始化指南](./local-init.md) 完成模板同步、`px-plugin init` 与 Skeleton 自检。
2. **元数据同步**：对照 [插件元数据说明](./plugin-metadata.md) 校准 `plugin.yaml` / `manifest.yaml` / `publish.yml`。
3. **宿主配置**：
   - `PX_PLUGIN_DEV_MODE`：允许 Dev API 接收 `px-plugin dev`、hot reload、SSE 调试流量。
   - `PX_PLUGIN_PUBLISH`：解锁 `px-plugin publish` 的计划、灰度、回滚 API。
   - `PX_PLUGIN_HUB_ENABLED`：开启 Publish Hub 审计 / 遥测 / 审批链路。
   - 配置位置：`<workspace>/PowerX/backend/etc/config.yaml`（或 `etc/config.<env>.yaml`）的 `plugin_release.feature_flags` / `feature_gate` 段，或使用环境变量 `CORE_X_PLUGIN_RELEASE_ENABLE_LOCAL_INSTALL` 等覆盖，修改后需重启宿主。
4. **凭证与依赖**：`px auth configure` 写入 `~/.powerx/credentials.json`，Node.js ≥ 18、Go ≥ 1.24，并在需要时准备好 `npm --prefix skeleton/web-admin install` 的产物。

满足以上条件后即可进入调试环节。

## 1. 启动本地调试（当前可行方式）

> `px-plugin dev --watch` 与 `px-plugin host start --mock` 仍在开发中，可先用宿主工程自带的调试方式。

1. **挂载插件到 PowerX**  
   ```bash
   ln -sf <workspace>/PowerX/Core/Plugins/com.powerx.helloworld \
          <workspace>/PowerX/backend/plugins/installed/com.powerx.helloworld
   ```
2. **启动 Dev API / Admin**（参考 `../PowerX/docs/guide/dev-environment.md`）：  
   ```bash
   cd <workspace>/PowerX/backend
   make dev             # 或 npm run dev，根据本地脚本决定
   ```
3. **在 Admin 中调试**  
   - 登录 `http://localhost:5173/admin`（端口以实际配置为准）。
   - 通过「插件中心 → 开发调试」加载 `com.powerx.demo`。
   - 观察 `../PowerX/backend/logs/audit.log` 与浏览器 SSE 流获知热更新结果。
4. **可选：使用 skeleton**  
   - `go run skeleton/backend/cmd/plugin` 运行后端。
   - `npm --prefix skeleton/web-admin run dev` 打开前端，与宿主保持一致的 API 契约。

---

## 2. 遥测与审计

1. **工作流指标**  
   ```bash
   node scripts/qa/workflow-metrics.mjs \
     --scenario SCN-DEV-PLUGIN-DEBUG-001
   ```
   结果写入 `reports/_state/workflows/*.json`。
2. **CLI 审计记录**  
   - 目前仅 `init` / `package` / `dist` / `publish` 会输出日志；待 `doctor`/`dev` 子命令发布后再补全审计。
3. **常见故障**  
   | 症状 | 排查路径 |
   |------|----------|
   | 注册失败 `401` | 检查 `px auth configure` 是否写入 `~/.powerx/credentials.json` |
    | 热更新超过 2s | 查看 `../PowerX/backend/logs/audit.log` 与浏览器 SSE，通常是宿主没有启用 `PX_PLUGIN_DEV_MODE` 或热重载脚本仍在开发中 |
   | SSE 无输出 | 验证宿主是否启用了 `PX_PLUGIN_DEV_MODE`，并检查 Dev API mTLS/Feature Flag |

---

## 3. 自检步骤

- [ ] `px-plugin init` 在 60 秒内完成，并生成 manifest/publish.yml。
- [ ] `plugin.yaml` 按 `plugin_yaml_spec.md` 自检通过。
- [ ] 通过宿主/骨架方式完成至少两次代码修改并看到日志/SSE 输出。
- [ ] `scripts/qa/workflow-metrics.mjs` 中能看到最新的 SCN 指标。
- [ ] 所有示例路径均指向 `../Plugins/PowerXPlugin` 或目前仓库中的文件。
