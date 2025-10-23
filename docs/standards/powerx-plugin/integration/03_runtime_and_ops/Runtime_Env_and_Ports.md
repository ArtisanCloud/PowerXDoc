# 插件运行环境与端口管理（03_runtime_and_ops/Runtime_Env_and_Ports.md）

> 本文档定义 PowerX 插件在宿主系统中的运行模型、环境变量规范、端口分配策略与健康检查机制。  
> 适用于所有基于 **PowerXPluginBase** 的插件（Go Gin / Nuxt / PHP / Node / Rust 等语言均可）。

---

## 🧭 一、文档目标

- 统一插件运行时环境配置规范；
- 定义宿主如何启动插件进程；
- 管理端口、健康检查、日志输出；
- 说明插件进程生命周期（启动→监控→终止）；
- 支持多语言、Docker、exec 等多种运行模式。

---

## 🧩 二、运行时类型（runtime.type）

在 manifest 中通过 `runtime.type` 声明插件运行模式：

| 模式 | 说明 | 示例 |
|------|------|------|
| `exec` | 宿主直接执行插件二进制文件（推荐） | Go 插件 |
| `docker` | 宿主启动独立容器（隔离性更强） | Node / PHP 插件 |
| `http-proxy` | 插件在外部运行，宿主仅代理 HTTP 请求 | 调试场景 |
| `php-fpm` | 使用 PHP-FPM 运行脚本插件 | PHP 插件 |
| `remote` | 插件托管在远程 URL，由宿主建立桥接 | SaaS 集成类插件 |

---

## 🧱 三、运行时目录结构

宿主在启动插件时会将 `.pxp` 解包至如下结构：

```

/var/lib/powerx/plugins/
└── com.powerx.plugin.crm/
├── manifest.yaml
├── backend/
│   └── exec/plugin-crm
├── frontend/
│   └── admin/
├── migrations/
├── contracts/
├── logs/
│   └── runtime.log
└── tmp/

```

> 宿主仅在 `/var/lib/powerx/plugins/{id}/{version}/` 内执行插件，  
> 该目录具有独立权限，插件进程无法访问宿主或其他插件目录。

---

## ⚙️ 四、运行时环境变量（Runtime Env）

PowerX 会在启动时自动注入一组环境变量：

| 变量名 | 示例 | 说明 |
|--------|--------|------|
| `POWERX_PLUGIN_ID` | `com.powerx.plugin.crm` | 插件唯一标识 |
| `POWERX_PLUGIN_VERSION` | `1.3.0` | 当前版本 |
| `POWERX_PLUGIN_SCHEMA` | `tenant_123_crm` | 该租户的数据库 Schema |
| `POWERX_PLUGIN_PORT` | `8088` | 宿主分配的监听端口 |
| `POWERX_PLUGIN_LOG_DIR` | `/var/lib/powerx/plugins/.../logs` | 日志目录 |
| `POWERX_CORE_ENDPOINT` | `http://powerx-core:8077` | 宿主 API 基址 |
| `POWERX_TENANT_ID` | `tenant_123` | 当前租户标识 |
| `POWERX_AUTH_TOKEN` | `eyJhbGciOiJIUzI1NiIsInR5cCI...` | 插件间通信鉴权 Token |
| `POWERX_ENV` | `prod` | 当前运行环境（dev/test/prod） |

> 插件应通过系统变量读取这些值，而非硬编码。  
> 建议后端使用配置加载器，如 Go 的 `viper`、Node 的 `dotenv`、Rust 的 `envy`。

### Runtime Ops 默认阈值

宿主还会根据 `config/host-values.yaml` 或 `backend/etc/config.yaml` 中的 `runtime_ops` 节点，传递运行治理的默认阈值：

| 字段 | 默认值 | 含义 |
|------|--------|------|
| `heartbeat_seconds` | 15 | MCP 心跳周期（秒） |
| `heartbeat_misses` | 3 | 连续丢失心跳次数后标记 STALE |
| `quota_window_minutes` | 5 | 令牌桶/配额窗口大小（分钟） |
| `restart_backoff_start_seconds` | 5 | 首次重启退避（秒） |
| `restart_backoff_max_seconds` | 120 | 最大退避间隔（秒） |
| `log_retention_days` | 7 | 本地日志保留天数（归档前） |
| `cpu_default` | `500m` | 宿主分配的默认 CPU 限额 |
| `memory_default` | `512Mi` | 宿主分配的默认内存限额 |
| `network_profile` | `standard` | 宿主定义的网络隔离策略 |

插件可以读取这些值，用于运行时的启动参数、配额配置以及日志轮转策略，但不得覆写宿主分配的端口或凭据。

---

## 🧩 五、端口分配策略

| 运行模式 | 分配方式 | 默认端口 | 备注 |
|-----------|-----------|-----------|------|
| `exec` | 宿主分配随机端口并注入 `POWERX_PLUGIN_PORT` | 动态 | 推荐 |
| `docker` | 容器端口映射至宿主随机端口 | 动态 | `EXPOSE 8080` 映射 |
| `http-proxy` | 外部固定 URL | N/A | 由插件外部维护 |
| `php-fpm` | FPM 监听 UNIX Socket | N/A | `/tmp/plugin.sock` |

PowerX 宿主会维护一个 **Port Registry** 表，用于记录分配情况：

| plugin_id | version | tenant | port | pid | status |
|------------|----------|--------|------|------|--------|
| com.powerx.plugin.crm | 1.3.0 | tenant_123 | 8088 | 31245 | running |

> 每个插件实例拥有独立端口，不得监听宿主系统全局端口（如 80/443）。

---

## 🧩 六、健康检查机制（Health Check）

在 manifest.yaml 中声明健康探针：

```yaml
runtime:
  health:
    http: /healthz
    interval: 5s
```

宿主定期轮询：

```
GET http://127.0.0.1:<POWERX_PLUGIN_PORT>/healthz
→ 200 OK
```

> 若连续失败 3 次（默认），宿主将触发重启流程。
> 插件应确保 `/healthz` 仅返回最基础状态，不依赖外部网络。

Go 示例实现：

```go
r.GET("/healthz", func(c *gin.Context) {
    c.JSON(200, gin.H{"status": "ok"})
})
```

---

## 🧱 七、进程生命周期管理

宿主的 **PluginRuntimeManager** 负责整个生命周期：

| 阶段         | 动作        | 描述                     |
| ---------- | --------- | ---------------------- |
| `prepare`  | 解包 `.pxp` | 创建工作目录                 |
| `spawn`    | 启动进程      | 执行 entrypoint 或 Docker |
| `register` | 注册进程信息    | 写入 PID / PORT / Tenant |
| `watch`    | 监控健康状态    | 周期探测健康检查               |
| `restart`  | 重启插件      | 出现异常时自动重启              |
| `stop`     | 停止进程      | 插件卸载或禁用                |
| `cleanup`  | 清理资源      | 删除临时文件与缓存              |

---

## 🧩 八、日志与标准输出

PowerX 规定插件输出的日志方式：

| 类型              | 输出位置                         | 格式                                |
| --------------- | ---------------------------- | --------------------------------- |
| stdout / stderr | 捕获后写入宿主 `plugin_runtime.log` | `[2025-10-13T12:00:00Z] INFO ...` |
| 应用日志            | 写入 `POWERX_PLUGIN_LOG_DIR`   | 多文件分级                             |
| 访问日志            | `/logs/access.log`           | 可选                                |
| 错误日志            | `/logs/error.log`            | 必须存在                              |
| 指标日志            | `/logs/metrics.log`          | Prometheus 兼容格式                   |

宿主提供日志收集器（PowerX Agent），周期性推送日志到集中监控系统（Elastic / Loki）。

---

## ⚙️ 九、资源限制与隔离

| 项目                | 说明                                   |
| ----------------- | ------------------------------------ |
| **CPU 限制**        | 可通过宿主配置控制单插件 CPU 上限                  |
| **内存限制**          | 宿主监控 RSS 超限后触发重启                     |
| **网络隔离**          | 插件默认仅能访问宿主代理地址，不可访问外网（除非授权）          |
| **文件系统隔离**        | 插件目录为沙箱（read-only + tmpfs）           |
| **数据库连接**         | 每个插件拥有独立 DB schema 与连接凭证             |
| **Redis / Cache** | 使用租户隔离前缀，如 `tenant_123:plugin_crm:*` |

---

## 🧩 十、运行模式对比与建议

| 模式           | 隔离性  | 启动速度 | 调试便利 | 推荐场景                   |
| ------------ | ---- | ---- | ---- | ---------------------- |
| `exec`       | 中等   | 快    | 高    | Go / Rust 插件           |
| `docker`     | 高    | 中等   | 低    | Node / PHP / Python 插件 |
| `http-proxy` | 无    | 快    | 高    | 外部系统接入                 |
| `php-fpm`    | 中等   | 中等   | 中等   | CMS / legacy 插件        |
| `remote`     | 依赖网络 | 慢    | 低    | 第三方 SaaS 插件            |

推荐默认使用 `exec` 模式。

---

## 🧩 十一、端口冲突与检测

宿主在启动插件前执行端口检测：

```bash
netstat -anp | grep :8088
```

若端口占用：

- 自动分配新端口；
- 更新环境变量并重写运行配置；
- 写入日志警告；
- 更新 Port Registry 状态为 `reassigned`。

---

## 🧩 十二、运行参数与配置文件加载

插件可在 manifest 中定义 `runtime.env`，也可加载外部配置文件：

```yaml
runtime:
  env:
    - name: CRM_SYNC_INTERVAL
      value: "10m"
    - name: LOG_LEVEL
      value: "info"
```

宿主启动时写入：

```bash
export CRM_SYNC_INTERVAL="10m"
export LOG_LEVEL="info"
```

若存在 `backend/etc/config.yaml`，PowerX 会优先加载：

```yaml
db:
  host: ${POWERX_DB_HOST}
  user: ${POWERX_DB_USER}
```

---

## 🧩 十三、本地开发与模拟环境

在开发阶段，可通过环境变量直接启动插件：

```bash
export POWERX_PLUGIN_ID=com.powerx.plugin.example
export POWERX_PLUGIN_PORT=8088
go run ./backend/cmd/plugin
```

本地代理模式：

```
http://localhost:8088/_p/com.powerx.plugin.example/api/
```

或使用 Makefile：

```bash
make dev
```

---

## 🧩 十四、安全注意事项

- 插件不得监听 `0.0.0.0:80/443`；
- 禁止 fork/exec 未授权进程；
- 禁止访问宿主文件系统 `/etc /var/log /root`；
- 插件仅能访问 `/var/lib/powerx/plugins/{id}/`；
- 插件必须实现健康检查接口；
- 宿主应定期验证进程签名与哈希；
- 插件退出码非零时将被记录并告警。

---

## 🧱 十五、示例：manifest.runtime 段（完整）

```yaml
runtime:
  type: exec
  entrypoint: ./backend/exec/start.sh
  env:
    - name: LOG_LEVEL
      value: "info"
    - name: POWERX_MODE
      value: "prod"
  health:
    http: /healthz
    interval: 5s
  ports:
    internal: 8088
    metrics: 9090
  limits:
    cpu: "1"
    memory: "512Mi"
```

> 宿主启动时将：
> 1️⃣ 分配端口 → 2️⃣ 注入环境变量 → 3️⃣ 启动进程 → 4️⃣ 注册健康探针。

---

## 🧠 十六、调试建议

- 在开发环境中禁用资源限制；
- 使用 `POWERX_ENV=dev` 启动以打印详细日志；
- 使用 `curl http://localhost:$POWERX_PLUGIN_PORT/healthz` 验证运行；
- 若端口被占用，可手动设置：

  ```bash
  export POWERX_PLUGIN_PORT=9099
  ```

* 在 Docker 模式下调试时可进入容器查看日志：

  ```bash
  docker logs plugin-crm
  ```

---

## 🔐 Admin Runtime APIs & RBAC

- 管理端路由统一挂载在 `/api/v1/admin/runtime`，由宿主的 JWT + RBAC 中间件保护。
- 所有 `POST` 操作（如 `/bootstrap`、`/sessions/register`、`/quota/overrides`）需要 `runtime.ops:manage` 权限。
- 只读接口（`GET /quota/status`）要求 `runtime.ops:read`，指标抓取（`GET /metrics`）使用 `runtime.ops:observe`，便于将 Prometheus 权限委托给宿主平台账号。
- 在 `plugin.yaml` 的 `rbac.resources` 与 `permissions` 中新增 `runtime.ops` 资源后，宿主安装流程会自动同步该策略，确保 `runtime.manage` Scope 生效。

---

## 📚 延伸阅读

- [MCP_Session_and_Registration.md](./MCP_Session_and_Registration.md)
- [Logs_Metrics_and_Tracing.md](./Logs_Metrics_and_Tracing.md)
- [04_security_and_compliance/Plugin_Security_Checklist.md](../04_security_and_compliance/Plugin_Security_Checklist.md)
- [01_plugin_lifecycle/Manifest_and_Metadata.md](../01_plugin_lifecycle/Manifest_and_Metadata.md)

---

> **文档版本：** v1.0.0
> **适用范围：** PowerX ≥ 0.9.0
> **维护团队：** PluginBase Runtime 组
> **最后更新：** 2025-10
