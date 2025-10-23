# 多租户与 RLS 机制（Tenant Isolation & Row Level Security）

> 本页目标：说明 **PowerX Plugin Base** 如何实现多租户数据隔离，  
> 包括 Postgres RLS 策略、事务注入、应用层守卫与调试模式。  
> 读者对象：后端开发者 / 数据库工程师 / 安全审计人员。

---

## 一、设计背景

在 PowerX 生态中，多个租户共享同一数据库实例，但插件必须保证每个租户的数据完全隔离。  
为此模板采用「**应用层租户作用域 + 数据库层 RLS 兜底**」的双保险方案：

| 层级 | 隔离手段 | 作用 |
|------|-----------|------|
| **应用层** | 每请求提取 `tenant_id`，事务执行 `SET LOCAL app.tenant_id` | 请求级作用域 |
| **数据库层** | PostgreSQL **Row Level Security (RLS)** 策略 | 行级安全兜底 |

即使应用层 where 条件书写错误，RLS 仍会阻止跨租户读写。

---

## 二、执行流程

```text
1️⃣ PowerX → 插件请求（携带 JWT/HMAC 上下文）
2️⃣ TenantContext 中间件解签上下文，提取 tenant_id
3️⃣ BeginTenantTx 开启事务，并执行：
      SET LOCAL app.tenant_id = <tenant_id>
4️⃣ 所有 GORM 查询均在该事务内执行
5️⃣ Postgres RLS 自动校验行级访问
````

示意图：

```
PowerX Request
     │
     ▼
 [JWT/HMAC 验签]
     │
     ▼
 [TenantContext Middleware]
     │
     ▼
 BeginTenantTx()  →  SET LOCAL app.tenant_id = ?
     │
     ▼
 GORM / SQL 操作（受 RLS 策略保护）
```

---

## 三、RLS 策略示例

假设 schema 名为 `px_com_plugin_base`，业务表为 `template`：

```sql
CREATE SCHEMA IF NOT EXISTS template;

CREATE TABLE IF NOT EXISTS px_com_plugin_base.template (
  id         BIGSERIAL PRIMARY KEY,
  tenant_id  BIGINT NOT NULL,
  title      VARCHAR(200) NOT NULL,
  status     VARCHAR(24)  NOT NULL DEFAULT 'todo',
  assignee   BIGINT NULL,
  meta       JSONB NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ NULL
);

-- 启用 RLS
ALTER TABLE px_com_plugin_base.template ENABLE ROW LEVEL SECURITY;

-- 定义租户隔离策略
CREATE POLICY p_tenant_isolation
  ON px_com_plugin_base.template
  USING (tenant_id::text = current_setting('app.tenant_id', true));
```

说明：

* **`current_setting('app.tenant_id', true)`**
  取自当前事务中通过 `SET LOCAL` 设置的租户变量；
* **`USING` 子句**
  定义允许访问的行；
* **RLS 作用范围**
  所有 `SELECT`、`UPDATE`、`DELETE` 语句自动生效。

---

## 四、应用层封装

插件提供两层封装：

### 1️⃣ `TenantContext` 中间件

位置：`internal/transport/http/middleware/tenant.go`

职责：

* 从 HTTP Header 或 JWT Token 中提取租户 ID；
* 验证签名（HMAC 或 JWT）；
* 将租户 ID 写入请求上下文。

示例（伪代码）：

```go
func TenantContext(c *gin.Context) {
    ctx, tenantID := extractTenantFromHeader(c)
    c.Set("tenant_id", tenantID)
    c.Next()
}
```

---

### 2️⃣ `BeginTenantTx` 事务函数

位置：`internal/db/tenant_tx.go`

职责：

* 开启事务；
* 执行 `SET LOCAL app.tenant_id = ?`；
* 将事务句柄注入到当前请求作用域；
* 提供 commit/rollback 的一致性封装。

示例（伪代码）：

```go
func BeginTenantTx(ctx context.Context, db *gorm.DB, tenantID int64) (*gorm.DB, error) {
    tx := db.Begin()
    if err := tx.Exec("SET LOCAL app.tenant_id = ?", tenantID).Error; err != nil {
        return nil, err
    }
    return tx, nil
}
```

---

## 五、调试模式（DEV_MODE）

开发阶段可以开启：

```bash
export POWERX_DEV_MODE=1
```

作用：

* 跳过 JWT/HMAC 验签；
* 使用默认租户 ID（例如 `tenant_id = 1`）；
* 允许本地直连后端测试。

⚠️ **注意**：
上线时必须关闭该模式，否则将破坏多租户隔离。

---

## 六、安全最佳实践

✅ **强制租户字段**
所有业务模型必须包含：

```go
TenantID int64 `gorm:"column:tenant_id;not null"`
```

✅ **避免直接使用 `db.Raw`**
若必须执行原生 SQL，应确保：

```sql
WHERE tenant_id = current_setting('app.tenant_id', true)
```

✅ **事务必经 `BeginTenantTx`**
不要在业务层直接使用 `db.Begin()`。

✅ **禁止租户写入越权**
当 API 提交 payload 时，忽略前端传入的 tenant_id，统一以上下文为准。

✅ **日志追踪**
在日志中记录 `tenant_id`、`request_id`、`user_id`，便于排查多租户问题。

---

## 七、测试用例建议

| 测试项            | 预期结果           |
| -------------- | -------------- |
| 不同租户访问相同表      | 无法访问对方数据       |
| 应用层 where 条件缺失 | 仍无法越租户读取       |
| DEV_MODE=1     | 允许访问默认租户数据     |
| HMAC/JWT 签名错误  | 请求被拒绝（401/403） |

---

## 八、扩展：租户级密钥派生（可选）

高级场景下，你可以为每个租户派生加密密钥：

```text
租户主密钥 = HMAC(platform_secret, tenant_id)
```

可用于：

* 加密租户级配置；
* 生成租户隔离的 Agent 凭据；
* 安全地在插件与宿主之间传递临时 token。

---

## 九、总结

| 模块   | 文件                     | 关键职责             |
| ---- | ---------------------- | ---------------- |
| 中间件  | `middleware/tenant.go` | 提取租户上下文          |
| 事务封装 | `db/tenant_tx.go`      | 注入 app.tenant_id |
| 数据层  | `Postgres RLS`         | 强制行级隔离           |
| 调试模式 | `POWERX_DEV_MODE`      | 本地绕过验签           |
| 安全兜底 | 双层隔离机制                 | 防止跨租户访问          |

---

## 下一步阅读

* 🔌 [API 设计规范](./api_guidelines.md)
* 🤖 [Agent Hub 集成指南](./agent_integration.md)
* 🧱 [plugin.yaml 规范](../contract/plugin_yaml_spec.md)
