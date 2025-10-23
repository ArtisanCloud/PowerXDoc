# 常见任务与故障排查手册（08_dev_console_and_ui/Common_Tasks_and_Troubleshooting.md）

> 本文档收录了 PowerX 插件在开发、部署与运行阶段的常见问题、排查思路与推荐命令。  
> 适用于使用 PowerXPluginBase（Go + Nuxt）构建的插件项目。

---

## 🧭 一、设计目的

- 统一插件的调试与排查规范；
- 提供快速问题定位方法；
- 降低 Vendor 处理工单与事故的响应时间；
- 在控制台中实现「自助排查」与「一键诊断」功能；
- 增强插件可观测性与可维护性。

---

## 🧱 二、典型任务总览

| 分类 | 任务 | 执行方式 |
|------|------|----------|
| ⚙️ 初始化 | 验证宿主连接、加载配置 | CLI / 控制台 |
| 🔑 License | 校验 / 续期 / 激活 | 控制台 / CLI |
| 📊 Usage | 查看插件用量与配额 | 控制台仪表盘 |
| 🪵 日志 | 查看运行日志、错误日志 | 控制台 + API |
| 🧠 配置 | 修改 API Key、Webhook、变量 | 控制台 Settings |
| 🧩 Schema | 数据迁移或重置 | CLI / SQL |
| 🧮 测试 | 调用 MCP / gRPC 接口 | CLI / Postman |
| 🧰 调试 | 打开诊断面板 / 调试端口 | 控制台 Diagnostics |
| 🧾 审计 | 查看操作与变更记录 | Audit 模块 |
| 🚨 故障 | 快速定位异常来源 | 见「常见问题」章节 |

---

## ⚙️ 三、插件管理控制台中的常用任务

### 1️⃣ 重启插件实例
>
> 当配置变更后需重新加载环境变量时使用。

```bash
POST /api/v1/admin/plugin/restart
```

**结果：**

- 插件将由宿主重启；
- 当前会话暂时断开；
- 日志中会出现 `Plugin restarted successfully`。

---

### 2️⃣ 更新配置项

```bash
PUT /api/v1/admin/plugin/settings
{
  "enable_sync": true,
  "sync_interval": "3h"
}
```

> ⚠️ 若配置项与宿主配置冲突，将返回 `409 Conflict`。

---

### 3️⃣ 检查 License 状态

```bash
GET /api/v1/license/status
```

响应：

```json
{
  "license_id": "lic_12345",
  "plan": "pro",
  "status": "active",
  "expires_at": "2026-10-12T00:00:00Z"
}
```

---

### 4️⃣ 查看用量与配额

```bash
GET /api/v1/admin/plugin/usage
```

响应：

```json
{
  "metrics": {
    "api.calls": 1240,
    "storage.bytes": 10485760
  },
  "quota": {
    "api.calls": 5000,
    "storage.bytes": 52428800
  }
}
```

---

### 5️⃣ 触发数据同步（Manual Sync）

```bash
POST /api/v1/admin/plugin/actions/sync
```

返回：

```json
{ "status": "started", "job_id": "sync_20251013_01" }
```

---

### 6️⃣ 下载调试日志

```bash
GET /api/v1/admin/plugin/logs?level=error&limit=100
```

或通过控制台：
➡️ **[管理端 → 日志与事件 → 下载日志]**

---

## 🧠 四、常见故障分类与排查步骤

### 🧩 1. 插件无法启动

| 可能原因    | 排查步骤                          | 修复建议                                  |
| ------- | ----------------------------- | ------------------------------------- |
| 缺少环境变量  | 检查 `/config/config.yaml`      | 确保宿主注入 DSN / Redis 配置                 |
| 端口被占用   | 查看 `Runtime_Env_and_Ports.md` | 调整配置端口（默认 8077）                       |
| 无法连接宿主  | 检查 `POWERX_HOST` 环境变量         | Ping 宿主地址或重启桥接服务                      |
| 依赖服务未启动 | 检查 Postgres / Redis 状态        | 使用 `make up` 或 `docker compose up` 启动 |

---

### 🧩 2. License 校验失败

| 错误                  | 说明              | 解决方案              |
| ------------------- | --------------- | ----------------- |
| `invalid signature` | License 签名错误    | 重新激活 License      |
| `expired`           | 授权已过期           | 联系 Vendor 或续订     |
| `license not found` | License Key 未绑定 | 检查 Marketplace 账户 |
| `tenant mismatch`   | 授权租户不匹配         | 重新绑定租户 ID         |

---

### 🧩 3. 插件数据异常或不同步

| 现象         | 排查步骤                                    | 修复                   |
| ---------- | --------------------------------------- | -------------------- |
| 部分数据缺失     | 检查同步任务日志                                | 重试同步任务               |
| 外部 API 超时  | 查看 `/logs` 内错误详情                        | 增加超时设置或重试策略          |
| Schema 不一致 | 运行数据库迁移命令                               | `make migrate` 或 CLI |
| 插件版本升级后报错  | 检查 `Backward_Compatibility_Strategy.md` | 执行兼容迁移或回滚            |

---

### 🧩 4. Webhook 无响应

| 检查项      | 说明                              |
| -------- | ------------------------------- |
| 查看事件队列   | 是否存在 `event.retry` 日志           |
| 检查目标 URL | 是否返回 2xx 状态                     |
| 验证签名     | 是否启用 HMAC 验证                    |
| 重新推送事件   | 控制台按钮「重发事件」                     |
| 查看宿主日志   | `/admin/logs` → filter: webhook |

---

### 🧩 5. 前端 UI 无法加载

| 原因        | 检查项                                 | 解决方式                |
| --------- | ----------------------------------- | ------------------- |
| 构建资源缺失    | `/web-admin/dist` 不存在               | 重新构建前端 `npm run build` |
| 路由代理错误    | `/__up/_p/<plugin_id>/admin` 返回 404 | 检查宿主 Gin proxy 配置   |
| i18n 加载失败 | 缺少语言文件                              | 检查 `/app/i18n` 目录   |
| 权限控制错误    | Token 无效                            | 重新登录或刷新 JWT         |

---

## ⚙️ 五、调试与诊断工具

### 🧾 1. CLI 调试命令（powerx-cli）

> 适用于开发与运维阶段（见 PowerX CLI 文档）。

```bash
powerx plugin verify
powerx plugin logs --tail 100
powerx plugin restart
powerx plugin license check
```

---

### 🧰 2. 宿主代理诊断（Host Bridge）

```bash
GET /api/v1/debug/bridge/status
```

返回：

```json
{ "status": "ok", "routes": 12, "connected": true }
```

---

### 🪪 3. gRPC / MCP 适配测试

```bash
grpcurl -plaintext localhost:8090 list
```

或通过：

```bash
curl http://localhost:8077/_health
```

检查连接是否成功。

---

### 🧠 4. 一键诊断功能（控制台内置）

路径：**插件控制台 → 管理 → 诊断（Diagnostics）**

展示内容：

- 运行状态
- License 有效性
- 网络连通性（宿主 / License Server / Redis）
- Schema 校验结果
- 日志快照

> 可点击「导出诊断报告」，生成 ZIP 包含日志与配置摘要。

---

## 🔐 六、安全相关问题

| 问题          | 原因              | 建议                                  |
| ----------- | --------------- | ----------------------------------- |
| 插件访问宿主接口被拒绝 | ToolGrant 权限不足  | 检查 `ToolGrant_Consumption_Guide.md` |
| Redis 数据泄露  | 使用宿主共享连接        | 启用 Schema 隔离连接                      |
| 秘钥硬编码       | 未使用 config.yaml | 使用宿主注入配置                            |
| 数据未加密传输     | HTTP 直连         | 启用 HTTPS / TLS gRPC                 |

---

## 🧩 七、性能调优建议

| 场景       | 调优策略             |
| -------- | ---------------- |
| 高并发请求    | 使用连接池与缓存层        |
| 慢 SQL 查询 | 添加索引、优化 join     |
| 日志过大     | 启用日志轮转与归档        |
| 消息堆积     | 调整异步队列 worker 数量 |
| 前端加载慢    | 采用懒加载与 CDN 缓存    |

---

## 🧠 八、问题分级与处理优先级

| 等级     | 说明          | 响应时间   |
| ------ | ----------- | ------ |
| **P0** | 插件无法启动或严重宕机 | 1 小时内  |
| **P1** | 关键功能不可用     | 2 小时内  |
| **P2** | 性能下降、部分异常   | 4 小时内  |
| **P3** | 轻微问题        | 24 小时内 |
| **P4** | 咨询与改进建议     | 48 小时内 |

参见：[Customer_Support_Playbook.md](../07_support_and_operations/Customer_Support_Playbook.md)

---

## 🧾 九、常见错误代码表

| 错误码     | 含义         | 排查方向                     |
| ------- | ---------- | ------------------------ |
| `PX001` | 插件未注册      | 检查 manifest 与宿主注册状态      |
| `PX002` | License 无效 | License Server 返回错误      |
| `PX003` | 权限不足       | JWT / ToolGrant 校验失败     |
| `PX004` | Schema 不存在 | 插件未执行初始化迁移               |
| `PX005` | 配额超限       | Usage Report 超出上限        |
| `PX006` | 无法连接宿主     | 网络或端口错误                  |
| `PX007` | 插件版本冲突     | manifest 版本不匹配           |
| `PX008` | 插件未签名      | 缺少 manifest.signature 字段 |
| `PX009` | 插件数据损坏     | migration 失败或 schema 不兼容 |
| `PX010` | 内部错误       | 查看 backend 日志详细栈         |

---

## 🧩 十、自检清单（Troubleshooting Ready Checklist）

| 检查项                   | 状态 |
| --------------------- | -- |
| 控制台已集成 Diagnostics 面板 | ✅  |
| CLI 命令可运行             | ✅  |
| License 与宿主连通正常       | ✅  |
| 日志可检索与导出              | ✅  |
| 审计记录同步正常              | ✅  |
| Webhook 重试功能可用        | ✅  |
| 常见错误码映射表已实现           | ✅  |

---

## 📚 十一、延伸阅读

- [Plugin_Admin_Console_Guide.md](./Plugin_Admin_Console_Guide.md)
- [Audit_and_History_View.md](./Audit_and_History_View.md)
- [Runtime_Env_and_Ports.md](../03_runtime_and_ops/Runtime_Env_and_Ports.md)
- [Incident_Handling_for_Plugin.md](../07_support_and_operations/Incident_Handling_for_Plugin.md)
- [Logs_Metrics_and_Tracing.md](../03_runtime_and_ops/Logs_Metrics_and_Tracing.md)

---

> **文档版本：** v1.1.0
> **适用范围：** PowerXPluginBase ≥ 0.9.0
> **维护团队：** PowerX Developer Experience (DevEx) & Reliability Team
> **最后更新：** 2025-10
