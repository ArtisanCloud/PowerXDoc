
# 系统架构总览（Architecture Overview）

> 本页目标：展示 **PowerX Plugin Base** 的整体技术架构与运行流程，  
> 并说明它在 PowerX 生态中的位置与职责边界。  
> 读者对象：技术负责人 / 插件开发者 / 系统集成方。

---

## 一、总体定位

`PowerX Plugin Base` 是 PowerX 插件生态的**标准模板**，  
负责实现一个可独立运行、可被宿主反代、并具备安全上下文与多租户隔离能力的服务。  

PowerX 平台本身不直接托管插件逻辑，而是通过 **Plugin Manager** 和 **Dynamic Router**  
将外部插件进程透明地挂载到主系统下。  

---

## 二、系统层级与职责边界

```text
┌────────────────────────────────────────────┐
│                PowerX 平台                 │
│────────────────────────────────────────────│
│                                            │
│  PowerX Core        → IAM / RBAC / STS / JWT / API 网关      │
│  Plugin Manager     → 扫描插件、注入上下文、反向代理         │
│  Agent Hub          → 注册、调度各插件暴露的智能体能力       │
│                                            │
└──────────────┬─────────────────────────────┘
               │ JWT / HMAC 上下文注入
               ▼
┌────────────────────────────────────────────┐
│            PowerX Plugin (Base)            │
│────────────────────────────────────────────│
│  • 独立进程（Gin + GORM + Postgres Schema） │
│  • 每个请求含租户上下文（tenant_id）         │
│  • 启用 RLS 防止跨租户访问                  │
│  • 提供接口：                              │
│      - /v1/...                → 业务接口    │
│      - /api/v1/admin/manifest → 菜单上报    │
│      - /api/v1/admin/rbac     → 权限上报    │
│  • 可注册 Agent / Tool / Workflow 能力       │
└────────────────────────────────────────────┘
````

---

## 三、核心运行流程

| 阶段         | 发起方              | 说明                                       |
| ---------- | ---------------- | ---------------------------------------- |
| ① 插件加载     | Plugin Manager   | 扫描 `plugin.yaml`，启动插件容器或本地进程             |
| ② 环境注入     | PowerX → 插件      | 注入 DB、JWT/HMAC、schema、端口等环境变量            |
| ③ 注册与汇报    | 插件 → PowerX      | 插件暴露 manifest、rbac、agent 注册接口            |
| ④ 请求调度     | 用户 → PowerX → 插件 | PowerX 反代用户请求到 `/_p/:id/api/...`         |
| ⑤ 上下文校验    | 插件中间件            | 验签 JWT/HMAC，提取 `tenant_id`、`permissions` |
| ⑥ RLS 执行   | Postgres         | 执行 `SET LOCAL app.tenant_id`，数据库层隔离      |
| ⑦ Agent 调度 | Agent Hub        | 调用注册的 Agent Tool / Workflow 能力           |

---

## 四、架构组件说明

| 模块                           | 职责                            | 关键文件 / 目录                |
| ---------------------------- | ----------------------------- | ------------------------ |
| **backend/cmd/plugin/**      | 插件服务主入口，启动 HTTP + gRPC 服务     | `main.go`                |
| **internal/config/**         | 加载环境变量与配置文件                   | `config.go`              |
| **internal/bootstrap/**      | 初始化日志、数据库、Schema、STS          | `app.go`, `grpc.go`      |
| **internal/router/**         | Gin 中间件与路由装配（含 JWT/RBAC）      | `router.go`              |
| **internal/domain/**         | 模型与仓储层，内含租户字段                 | `models/`, `repository/` |
| **internal/services/**       | 领域服务（例如 Agent 凭据管理）           | `services/agent/`        |
| **internal/transport/http/** | 业务接口定义（admin、agent、templates） | 各子目录                     |
| **web-admin/**               | 管理端前端（Nuxt 4），编译后由宿主反代        | `.output/`               |
| **plugin.yaml**              | 插件元数据，定义路由、权限、菜单等             | 根目录                      |

---

## 五、数据与安全机制

### 1️⃣ 多租户上下文注入

每次请求经过 PowerX 时，都会附带签名上下文：

* **JWT 模式**：使用 RS256 / ES256 公钥验签；
* **HMAC 模式**：使用共享密钥（仅限开发期）。

插件端中间件负责解签并写入请求上下文，供数据库事务读取。

```go
SET LOCAL app.tenant_id = <tenant_id>
```

---

### 2️⃣ 数据库级 RLS（Row Level Security）

* 每张业务表都必须包含 `tenant_id BIGINT NOT NULL`
* 启用 RLS 策略：

  ```sql
  ALTER TABLE <schema>.<table> ENABLE ROW LEVEL SECURITY;
  CREATE POLICY tenant_isolation ON <schema>.<table>
    USING (tenant_id::text = current_setting('app.tenant_id', true));
  ```

* 即使应用层漏写 where 条件，也不会泄露其他租户数据。

---

### 3️⃣ RBAC 上报与权限合并

插件负责暴露 `/api/v1/admin/rbac`，返回自有资源树：

```json
{
  "resources": [
    { "resource": "base:template", "actions": ["read", "create", "update", "delete"] }
  ]
}
```

PowerX 聚合所有插件的 RBAC 声明，
统一存储在平台权限仓库中，供管理员在 Settings → Permission UI 中分配角色。

---

### 4️⃣ Agent Hub 能力注册

插件可注册自身的 Agent Profile / Tools / Workflows，
由 PowerX Agent Hub 统一呈现与调度。

例如：

```yaml
agents:
  - id: base.assistant
    name: Note 助理
tools:
  - id: template.template.create
    transport: grpc
```

---

## 六、典型请求链路

```text
用户 → PowerX（JWT 验签 / RBAC 校验） → 反代 /_p/:id/api/v1/... 
     → PowerX Plugin Base (Gin) → BeginTenantTx (SET LOCAL tenant)
     → Repository / GORM → Postgres (RLS) → 返回结果
```

---

## 七、上下文与反代路径约定

| 类型       | 宿主访问路径                                  | 插件内部路由                   |
| -------- | --------------------------------------- | ------------------------ |
| 管理页      | `/_p/<plugin-id>/admin/*`               | `/`（Nuxt 入口）             |
| 业务接口     | `/_p/<plugin-id>/api/*`                 | `/v1/...`                |
| Manifest | `/_p/<plugin-id>/api/v1/admin/manifest` | `/api/v1/admin/manifest` |
| RBAC     | `/_p/<plugin-id>/api/v1/admin/rbac`     | `/api/v1/admin/rbac`     |

> ⚠️ 注意：PowerX 不会重复拼接 `/v1`，前端请求必须显式带上 `/v1/...`。

---

## 八、组件关系图（简化版）

```text
┌─────────────── PowerX Core ────────────────┐
│ IAM / RBAC / API / STS / JWT              │
│                                            │
│   ┌────────────── Plugin Manager ───────────────┐
│   │ 扫描 plugin.yaml、启动插件、反代、注入上下文 │
│   └─────────────────────────────────────────────┘
│                      │
│                      ▼
│               JWT / HMAC 签名上下文
│                      │
└──────────────────────┼───────────────────────────
                       ▼
         ┌───────────────────────────────┐
         │      PowerX Plugin (Base)     │
         │ Gin + GORM + Postgres (RLS)   │
         │ 上报 Manifest / RBAC / Agent   │
         └──────────────┬────────────────┘
                        │
                        ▼
         ┌───────────────────────────────┐
         │         Agent Hub             │
         │ 汇总 & 调度插件注册的工具能力 │
         └───────────────────────────────┘
```

---

## 九、扩展建议

* **多插件协同**：多个插件可通过 Agent Hub 互相调用（通过 Tool/Workflow）。
* **安全优化**：生产建议使用 JWT（RS256）+ 独立数据库用户。
* **Schema 管理**：插件可在安装时自动执行迁移；卸载时删除 schema。
* **可观测性**：在 `internal/middleware` 中统一引入日志追踪与 Request ID。

---

## 下一步阅读

* 开发指南：👉 [后端结构说明](../developer/backend.md)
* 安全机制：👉 [多租户与 RLS 机制](../developer/tenant_rls.md)
* 协议层：👉 [plugin.yaml 规范](../contract/plugin_yaml_spec.md)
