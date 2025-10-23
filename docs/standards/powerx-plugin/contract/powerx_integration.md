# PowerX Integration 交互协议（PowerX ↔ Plugin Integration Contract）

> 本页目标：阐述 **PowerX 宿主平台与插件之间的完整交互流程**，  
> 包括反向代理机制、环境注入、生命周期事件、STS 授权与心跳监控等。  
>
> 读者对象：平台工程师 / 插件开发者 / 集成架构师。

---

## 一、集成设计概览

PowerX 与插件之间的通信是 **双向隔离、单向信任** 的模式：

- PowerX → 插件：以签名上下文（JWT/HMAC）调用插件 API；  
- 插件 → PowerX：通过受限接口（STS / SDK / gRPC）访问宿主能力。

### 通信拓扑

```text

+-----------------------------+

| PowerX Core                     |
| ------------------------------- |
| IAM / RBAC / STS / JWKS         |
| Plugin Manager / Agent Hub      |
| Dynamic Router                  |
| +-------------+---------------+ |

```

          │

```text

JWT/HMAC   │ 反向代理 (_p/:id/api)
▼
+-----------------------------+

| PowerX Plugin                   |
| ------------------------------- |
| backend/bin/plugin              |
| web-admin/.output               |
| /api/v1/...                     |
| /api/v1/admin/...               |
| /api/v1/agent/...               |
| +-----------------------------+ |

```

---

## 二、核心组件角色

| 模块 | 职责 |
|------|------|
| **Plugin Manager** | 插件扫描、启动、环境注入、反代代理 |
| **Dynamic Router** | 挂载插件 API 与前端路径（`/_p/<id>/...`） |
| **STS Service** | 短期授权凭据签发（供插件访问宿主） |
| **JWKS Service** | 公钥分发（JWT 校验使用） |
| **Agent Hub** | 汇总与调度插件注册的智能体与工具 |
| **PowerX Core** | 提供 IAM、RBAC、Tenant、日志与上下文 |

---

## 三、通信路径与反代规则

| 类型 | PowerX 路径 | 插件内部映射 |
|------|--------------|--------------|
| 前端管理页 | `/_p/<plugin-id>/admin/*` | `/`（web-admin/.output） |
| 业务接口 | `/_p/<plugin-id>/api/*` | `/v1/...` |
| Manifest | `/_p/<plugin-id>/api/v1/admin/manifest` | `/api/v1/admin/manifest` |
| RBAC | `/_p/<plugin-id>/api/v1/admin/rbac` | `/api/v1/admin/rbac` |

PowerX 会将插件注册进 Gin/Echo 的动态路由表中。  
所有请求通过宿主签名（JWT/HMAC）后再进入插件。

---

## 四、环境注入机制

### 1️⃣ 插件启动参数注入

当 PowerX 启动插件时，会注入一组环境变量：

| 环境变量 | 说明 |
|-----------|------|
| `POWERX_PLUGIN_ID` | 插件唯一 ID |
| `POWERX_DB_DSN` | 数据库连接字符串 |
| `POWERX_DB_SCHEMA` | 当前插件 schema |
| `POWERX_CTX_MODE` | 签名模式：`jwt` / `hmac` |
| `POWERX_CTX_JWKS_URL` | JWKS 公钥地址（JWT 模式） |
| `PLUGIN_CTX_HMAC_SECRET` | HMAC 密钥（HMAC 模式） |
| `POWERX_TENANT_MODE` | 租户运行模式（multi / single） |
| `POWERX_STS_ENDPOINT` | STS 短期凭据服务地址 |
| `POWERX_LOG_LEVEL` | 日志级别 |
| `POWERX_DEV_MODE` | 是否处于开发模式 |

插件启动时应从这些环境变量加载配置。

---

## 五、STS 授权机制（Plugin → PowerX）

**STS（Security Token Service）** 是插件访问宿主 PowerX 能力的唯一入口。  
例如：插件希望访问宿主的 CRM API、文件存储、或 Agent Hub 工具注册接口。

### 请求

```bash
POST /_p/_internal/sts/exchange
Content-Type: application/json
````

Body:

```json
{
  "plugin_id": "com.powerx.plugins.base",
  "scope": ["crm:lead:read"]
}
```

### 响应

```json
{
  "access_token": "STS.ABC123",
  "expires_in": 300,
  "tenant_id": 1024
}
```

插件随后可在请求宿主 API 时添加：

```
Authorization: Bearer STS.ABC123
```

PowerX 会验证该临时令牌是否有效，并限定作用域。

---

## 六、插件生命周期事件

PowerX Plugin Manager 在插件全生命周期中触发标准事件：

| 阶段     | 事件          | 插件行为                                  |
| ------ | ----------- | ------------------------------------- |
| **安装** | `install`   | 初始化 schema / migrations / manifest 注册 |
| **启用** | `enable`    | 启动后端进程 / 加载菜单与 RBAC                   |
| **禁用** | `disable`   | 停止插件进程 / 从路由表移除                       |
| **升级** | `update`    | 执行迁移、版本校验、重新注册 Agent                  |
| **卸载** | `uninstall` | 删除 schema / 清除配置                      |
| **心跳** | `ping`      | PowerX 定期检测健康状态 `/healthz`            |

---

## 七、健康检查与心跳协议

### 健康检查路径

```
GET /healthz
```

**响应格式：**

```json
{ "status": "ok", "version": "0.1.0", "time": "2025-10-10T12:00:00Z" }
```

PowerX 会：

- 启动后立即探测健康状态；
- 每隔 30 秒发送一次心跳；
- 3 次失败后自动重启插件。

---

## 八、日志与监控注入

PowerX 会通过环境变量或 STDOUT 流注入日志上下文：

| 字段           | 说明       |
| ------------ | -------- |
| `tenant_id`  | 当前租户     |
| `request_id` | 请求 ID    |
| `plugin_id`  | 插件标识     |
| `span_id`    | 分布式追踪 ID |

建议插件标准输出 JSON 格式日志：

```json
{"level":"info","msg":"request handled","tenant_id":1024,"plugin_id":"com.powerx.plugins.base"}
```

宿主会统一采集、聚合并输出到 Loki / ELK。

---

## 九、反向调用（插件 → PowerX）

插件调用 PowerX 能力时，有三种通道：

| 通道           | 协议                  | 说明                                 |
| ------------ | ------------------- | ---------------------------------- |
| **HTTP API** | RESTful             | 访问 PowerX 公共接口，如 `/api/v1/tenants` |
| **gRPC**     | 二进制协议               | 调用 PowerX 核心服务，如 AgentHubService   |
| **SDK（可选）**  | Go / TypeScript 客户端 | 封装 STS、JWT 自动续签                    |

示例：

```go
resp, err := http.NewRequest("GET", os.Getenv("POWERX_STS_ENDPOINT")+"/v1/tenants", nil)
resp.Header.Set("Authorization", "Bearer "+stsToken)
```

---

## 十、插件与宿主的信任模型

| 方向                    | 鉴权机制                         | 安全边界               |
| --------------------- | ---------------------------- | ------------------ |
| PowerX → Plugin       | JWT / HMAC 签名上下文             | 插件验证签名             |
| Plugin → PowerX       | STS 临时令牌                     | 宿主验证 Token 与 Scope |
| Plugin → Other Plugin | 禁止直接调用（需通过 PowerX Agent Hub） | 避免横向攻击             |

> ⚠️ 插件之间的直接通信是被禁止的，
> 所有跨插件调用必须通过 **Agent Hub** 或 **PowerX API Proxy** 完成。

---

## 十一、上下文注入与 RLS 配合

PowerX 在每个请求注入 `tenant_id` 和 `permissions`，插件中间件在验证后执行：

```sql
SET LOCAL app.tenant_id = <tenant_id>;
```

从而激活 PostgreSQL RLS。
这样可以保证：

- 不同租户在同一表中隔离；
- 插件开发者无需重复编写 where 条件；
- PowerX 可统一管理租户权限。

---

## 十二、版本与兼容性

| 字段               | 说明                      |
| ---------------- | ----------------------- |
| `api_version`    | 当前插件通信协议版本（默认 `v1`）     |
| `plugin_version` | 插件版本号（来自 `plugin.yaml`） |
| `powerx_version` | 宿主平台版本                  |
| `compatibility`  | 兼容性标记，支持 semver 约束      |

宿主会在插件启动时校验：

```
plugin.api_version == powerx.api_version
```

若不兼容，则阻止加载。

---

## 十三、安全防护建议

✅ **插件文件系统沙箱化**：宿主仅挂载 `/data/plugins/<id>/` 子目录。
✅ **数据库角色隔离**：每个插件分配独立角色与 schema。
✅ **限制外网访问**：插件默认禁止出站网络。
✅ **STS 最小权限原则**：Token Scope 仅覆盖必要资源。
✅ **开发模式标识**：`POWERX_DEV_MODE=1` 时跳过 JWT 验签，仅限本地。
✅ **插件审计日志**：所有调用会被宿主记录 request_id 与签名指纹。

---

## 十四、典型调用链路示意

```text
用户 → PowerX 前端
      ↓
      PowerX API Gateway → Dynamic Router (/_p/com.powerx.plugins.base/api/v1/templates)
      ↓
      插件后端 (Gin)
      ↓
      TenantContext Middleware → Verify JWT/HMAC
      ↓
      BeginTenantTx → SET LOCAL app.tenant_id
      ↓
      Repository / RLS → PostgreSQL
      ↓
      返回响应 → PowerX Gateway → 用户
```

---

## 十五、调试与诊断

| 命令                            | 作用             |
| ----------------------------- | -------------- |
| `make run`                    | 启动插件并加载本地配置    |
| `make logs`                   | 查看插件 STDOUT 日志 |
| `curl /healthz`               | 检查健康状态         |
| `curl /api/v1/admin/manifest` | 查看 manifest 输出 |
| `curl /api/v1/admin/rbac`     | 查看权限声明         |
| `curl /api/v1/agent/register` | 测试 Agent 注册    |

PowerX 中可执行：

```bash
powerx plugins reload com.powerx.plugins.base
```

---

## 十六、PowerX ↔ Plugin 协议小结

| 模块           | 方向              | 协议          | 安全机制       |
| ------------ | --------------- | ----------- | ---------- |
| **Context**  | PowerX → Plugin | HTTP Header | JWT / HMAC |
| **STS**      | Plugin → PowerX | HTTP API    | 临时 Token   |
| **Manifest** | PowerX → Plugin | HTTP        | 平台级 JWT    |
| **RBAC**     | PowerX → Plugin | HTTP        | 平台级 JWT    |
| **Agent 注册** | 双向              | HTTP/gRPC   | JWT / STS  |
| **反代 API**   | 双向              | HTTP        | 宿主动态代理     |
| **健康检查**     | PowerX → Plugin | HTTP        | 无需签名       |

---

## 十七、未来规划（PowerX Integration v2）

- 双向 gRPC Streaming 支持；
- 插件消息总线（Event Bus，基于 NATS）；
- 插件 Marketplace 自动部署协议；
- WebSocket 反向通道（Agent 实时流式对话）；
- 分布式插件签名（Plugin Certificate Authority）。

---

## 十八、关联文档

| 模块              | 文档                                                                 |
| --------------- | ------------------------------------------------------------------ |
| 插件清单规范          | [plugin_yaml_spec.md](./plugin_yaml_spec.md)                       |
| RBAC 与 Manifest | [rbac_manifest_spec.md](./rbac_manifest_spec.md)                   |
| Agent 注册协议      | [agent_contract.md](./agent_contract.md)                           |
| 签名与上下文          | [ctx_signing.md](./ctx_signing.md)                                 |
| 安全与部署           | [../deploy/security_hardening.md](../deploy/security_hardening.md) |

---

## 十九、总结

- PowerX 通过 **反代机制 + 签名上下文** 与插件通信；
- 插件通过 **STS 临时授权** 安全调用宿主；
- 整体模型遵循 “最小信任 + 最小权限”；
- 插件生命周期由宿主 Plugin Manager 全权管理；
- 安全策略与租户隔离由上下文 + RLS 共同保障。

---

## 下一步阅读

- 🔒 [部署与安全加固指南](../deploy/security_hardening.md)
- 🧩 [插件市场打包与发布规范](../deploy/release_package.md)
