# 安全加固指南（Security Hardening Guide）

> 本页目标：为 PowerX 插件生态提供统一的安全基线，  
> 说明宿主平台与插件在运行、通信、网络与数据层的防护措施。  
> 
> 读者对象：安全工程师 / DevOps / 插件开发者 / 系统管理员。

---

## 一、总体安全模型

PowerX 插件生态的核心安全目标：

| 目标 | 说明 |
|------|------|
| **最小信任** | 插件与宿主之间通过签名上下文认证，不直接信任网络流量。 |
| **最小权限** | 每个插件、租户、用户仅能访问授权资源。 |
| **多层隔离** | 网络、数据库、文件系统三层隔离。 |
| **可追踪性** | 每次调用都有唯一 request_id 与签名指纹。 |
| **可吊销性** | 所有密钥与凭据可在任意时刻失效或轮换。 |

---

## 二、插件运行沙箱化

### 1️⃣ 独立进程模式

每个插件运行在独立的进程与用户空间：

- 后端：`backend/bin/plugin`
- 启动命令：由 PowerX Plugin Manager 启动
- 权限隔离：
  - 独立 Linux 用户 UID；
  - 仅挂载插件目录；
  - 禁止访问 `/`、`/etc`、`/root`。

### 2️⃣ 宿主权限隔离（Systemd / Docker）

| 环境 | 隔离方式 |
|------|-----------|
| **Systemd 部署** | 使用 `User=powerx_plugin` 与 `ProtectHome=yes` |
| **Docker 部署** | 以非 root 用户运行，挂载 `/app/plugin` 只读卷 |

### 3️⃣ 文件系统保护

- 插件仅可读写：

```

/data/plugins/<plugin-id>/
/tmp/

```

- 禁止执行 `chmod 777` 或修改宿主路径；
- 禁止对宿主文件进行递归扫描或访问。

---

## 三、数据库隔离与 RLS 安全

### 1️⃣ Schema 隔离

每个插件在 Postgres 中使用独立 schema，例如：

```

px_com_powerx_plugins_base

````

宿主通过环境变量注入：

```bash
POWERX_DB_SCHEMA=px_com_powerx_plugins_base
````

### 2️⃣ 用户角色分离

| 角色                   | 权限           | 用途      |
| -------------------- | ------------ | ------- |
| `powerx_root`        | superuser    | 宿主数据库管理 |
| `powerx_plugin_base` | schema owner | 插件运行账号  |
| `powerx_tenant_*`    | tenant 级账号   | 可选多租户拆分 |

插件运行时使用 `powerx_plugin_base`，禁止访问其他 schema。

### 3️⃣ 行级安全（RLS）

启用后：

```sql
ALTER TABLE <schema>.<table> ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON <schema>.<table>
  USING (tenant_id::text = current_setting('app.tenant_id', true));
```

应用层执行：

```sql
SET LOCAL app.tenant_id = <tenant_id>;
```

确保跨租户访问永远失败。

---

## 四、网络安全与通信边界

| 项          | 策略                                    |
| ---------- | ------------------------------------- |
| **反代访问**   | 插件仅暴露在宿主内部路由：`/_p/<plugin-id>/api/*`  |
| **外部网络**   | 默认阻断 outbound 流量，除非在 manifest 明确声明    |
| **宿主访问**   | 插件访问宿主 API 必须通过 STS 临时令牌              |
| **跨插件访问**  | 禁止直接调用，需经 Agent Hub                   |
| **心跳探测**   | PowerX 定期访问 `/healthz` 检查插件存活         |
| **TLS 加密** | 宿主与插件间通信建议启用反代 HTTPS（nginx / traefik） |

---

## 五、STS 凭据与权限控制

### 1️⃣ STS 授权原则

- 每个插件通过 STS 交换临时令牌；
- 令牌包含以下字段：

  ```json
  { "plugin_id": "com.powerx.plugins.base", "scope": ["crm:lead:read"], "exp": 1735698195 }
  ```

* 有效期：≤ 300 秒；
- Scope 精确到资源级别。

### 2️⃣ 插件访问宿主 API 示例

```bash
curl -H "Authorization: Bearer STS.ABC123" \
     http://powerx.local/api/v1/tenants/current
```

PowerX 验证：

- Token 是否过期；
- plugin_id 与 scope 是否匹配；
- 是否签发自受信任的 issuer。

---

## 六、JWT / HMAC 签名上下文验证

详见：[上下文签名规范（ctx_signing.md）](../contract/ctx_signing.md)

关键点：

| 项         | 说明                                             |
| --------- | ---------------------------------------------- |
| **签名算法**  | HMAC-SHA256 或 RS256                            |
| **有效期**   | ≤ 5 分钟                                         |
| **上下文字段** | tenant_id / user_id / permissions / request_id |
| **防篡改**   | 签名或公钥验证失败即拒绝请求                                 |
| **防重放**   | PowerX 可配置 request_id nonce 校验                 |

---

## 七、密钥管理与轮换

| 类别            | 存储位置           | 轮换周期  | 说明              |
| ------------- | -------------- | ----- | --------------- |
| JWT 私钥        | PowerX Vault   | 90 天  | JWKS 支持多 key 并行 |
| HMAC 密钥       | `.env` / Vault | 30 天  | 插件启动时加载         |
| STS Token     | 内存             | 5 分钟  | 自动失效            |
| Database 用户密码 | Vault          | 180 天 | 插件重启时刷新         |

轮换流程：

1. PowerX 发布新密钥；
2. JWKS 公钥中保留旧 + 新；
3. 插件自动同步；
4. 确认旧 key 停止使用后删除。

---

## 八、容器镜像与供应链安全

### 1️⃣ 镜像安全策略

- 基于最小镜像构建：`FROM golang:1.21-alpine`
- 清除构建缓存与多余依赖；
- 使用多阶段构建分离编译与运行层；
- 启动命令仅为 `/app/plugin`；
- 不以 root 身份运行。

### 2️⃣ 签名与扫描

- 使用 Cosign/Sigstore 对镜像签名：

  ```bash
  cosign sign powerx-plugin-base:0.1.0
  ```

* 使用 Trivy 或 Grype 扫描漏洞：

  ```bash
  trivy image powerx-plugin-base:0.1.0
  ```

---

## 九、日志与审计

### 1️⃣ 插件日志格式

统一使用 JSON：

```json
{"time":"2025-10-10T12:00:00Z","level":"info","plugin":"com.powerx.plugins.base","msg":"create template","tenant_id":1001,"user_id":501}
```

### 2️⃣ 宿主审计日志

宿主记录：

- request_id
- plugin_id
- tenant_id
- user_id
- endpoint
- action
- duration(ms)
- status

### 3️⃣ 日志保留策略

- 默认保留 30 天；
- 可对单租户导出；
- 需遵守 GDPR / PIPL。

---

## 十、防护建议清单

| 类别        | 策略                        | 说明       |
| --------- | ------------------------- | -------- |
| **进程隔离**  | 每插件独立 PID + 用户空间          | 防止插件互相访问 |
| **网络隔离**  | 禁止跨插件访问                   | 所有通信经宿主  |
| **数据库安全** | 启用 RLS，禁止跨 schema 查询      | 多租户隔离    |
| **身份验证**  | 必须验证 HMAC/JWT 签名          | 防伪造上下文   |
| **最小权限**  | STS Scope 精细化             | 降低越权风险   |
| **审计追踪**  | 记录 request_id 与 plugin_id | 可追溯调用链   |
| **密钥轮换**  | 定期刷新加密密钥                  | 防长期泄露    |
| **供应链安全** | 签名镜像 + CVE 扫描             | 保证镜像可信   |

---

## 十一、开发者安全建议

✅ **不要在插件中保存宿主 Token 或用户密码**。
✅ **避免动态执行代码（eval/new Function 等）**。
✅ **禁止插件尝试修改宿主文件系统或配置文件**。
✅ **使用依赖锁文件（go.sum / package-lock.json）确保一致性**。
✅ **在插件中禁用反序列化执行（如 unsafe.Unmarshal）**。
✅ **前端资源通过宿主反代加载，不可外链第三方 CDN**。

---

## 十二、应急处置流程

1️⃣ **检测异常调用**（PowerX 日志标识）
2️⃣ **立即吊销 STS Token / JWT Key**
3️⃣ **暂时禁用插件（disable）**
4️⃣ **分析审计日志与请求源 IP**
5️⃣ **必要时回滚插件版本或删除 schema**

宿主命令示例：

```bash
powerx plugins disable com.powerx.plugins.base
powerx security revoke-key px-key-2025
```

---

## 十三、可选安全增强模块（PowerX Enterprise）

| 模块                        | 功能                 |
| ------------------------- | ------------------ |
| **VPC Sandbox**           | 插件运行在私有子网          |
| **Secrets Manager**       | 自动轮换与加密插件密钥        |
| **WAF**                   | 防护异常请求（SQLi / RCE） |
| **Audit Center**          | 跨租户统一审计日志中心        |
| **Runtime Policy Engine** | 实时检测插件资源越权行为       |

---

## 十四、合规与政策要求

| 规范            | 要求                  |
| ------------- | ------------------- |
| GDPR / PIPL   | 插件不得收集超出业务目的的个人数据   |
| ISO 27001     | 安全策略与日志审计符合信息安全标准   |
| SOC 2 Type II | 插件数据传输、存储、加密需可审计    |
| OWASP Top 10  | 插件开发需通过 A1–A10 安全检测 |

---

## 十五、总结

- PowerX 插件安全基线涵盖「进程隔离、通信加密、租户隔离、密钥轮换」四大层；
- 所有插件必须遵循最小权限原则；
- 宿主负责安全注入、日志与监控；
- 插件负责校验上下文、保护自身数据；
- 平台安全需开发者与宿主共同维护。

---

## 十六、关联文档

| 模块      | 文档                                                         |
| ------- | ---------------------------------------------------------- |
| 签名上下文规范 | [ctx_signing.md](../contract/ctx_signing.md)               |
| 反代与通信协议 | [powerx_integration.md](../contract/powerx_integration.md) |
| 部署与打包   | [release_package.md](./release_package.md)                 |
| 插件数据库结构 | [tenant_rls.md](../developer/tenant_rls.md)                |

---

## 十七、下一步阅读

- 🚀 [插件打包与发布规范](./release_package.md)
- 🧩 [Docker 部署说明](./docker_guide.md)
