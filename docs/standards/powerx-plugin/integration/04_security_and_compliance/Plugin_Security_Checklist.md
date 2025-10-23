# 插件安全检查清单（04_security_and_compliance/Plugin_Security_Checklist.md）

> 本文档定义 PowerX 插件在开发、打包、运行、上架、运维全过程中的安全要求与自检清单，  
> 以确保插件在 PowerX 宿主系统中运行时具备最小权限、可控边界、可追溯性与合规性。

---

## 🧭 一、文档目标

- 建立插件安全的最小基线；
- 规范宿主与插件的边界控制；
- 防止恶意行为、资源滥用、数据泄露；
- 支持 Marketplace 的自动化安全扫描；
- 为开发者提供自查模板。

---

## 🧱 二、安全总览（Security Overview）

PowerX 插件运行于受控沙箱环境中，宿主在启动时为其提供：

- 独立的文件目录；
- **由宿主分配的独立数据库 Schema 与凭证**；
- 独立的访问角色（Role）；
- 受限网络策略；
- 宿主层安全代理与监控。

插件必须遵循以下安全边界：

| 维度 | 边界定义 |
|------|-----------|
| **进程隔离** | 插件不得访问宿主文件或进程 |
| **网络限制** | 插件默认仅能访问宿主 API 与授权域名 |
| **权限最小化** | 插件仅能操作自身 Schema 与资源 |
| **配置安全** | 所有密钥、凭证不得硬编码 |
| **运行签名** | 插件 `.pxp` 必须含签名并验证通过 |
| **审计追踪** | 所有关键操作记录审计日志 |

---

## ⚙️ 三、安全分层架构

```

┌──────────────────────────────┐
│ PowerX 宿主核心（CoreX）     │
│  ├─ Tenant DB & IAM 控制     │
│  ├─ Sandbox Executor         │
│  ├─ MCP Authenticator        │
│  └─ Audit Service            │
│            ↑                 │
│ ┌──────────────────────────┐ │
│ │ PowerXPluginBase 插件   │ │
│ │ ├─ Backend (Go Gin)     │ │
│ │ ├─ Web Admin (Nuxt)     │ │
│ │ ├─ Config / Env         │ │
│ │ └─ contracts/manifest   │ │
│ └──────────────────────────┘ │
└──────────────────────────────┘

```

---

## 🧩 四、安全检查清单总表

| 编号 | 分类 | 检查项 | 状态（✅/⚠️/❌） | 说明 |
|------|------|----------|-------------------|------|
| S-01 | 文件系统 | 插件仅能访问自身目录 `/var/lib/powerx/plugins/<id>` | ✅ | 禁止访问宿主路径 |
| S-02 | 网络 | 禁止访问外网，除非显式声明 outbound 域名白名单 | ✅ | 防止外部泄露 |
| S-03 | 环境变量 | 不得硬编码密钥、Token | ✅ | 使用宿主注入变量 |
| S-04 | **数据库（宿主分配模式）** | Schema 与凭证由 PowerX Core 安装时分配并注入 | ✅ | 插件仅使用，不管理 |
| S-05 | 权限控制 | API 必须校验租户和权限码 | ✅ | 例如 `crm.contact.*` |
| S-06 | 上传文件 | 必须校验 MIME 与大小 | ✅ | 防止 RCE 上传 |
| S-07 | 序列化 | 禁止反序列化用户输入 | ✅ | 防止代码注入 |
| S-08 | 日志 | 不记录敏感数据（密码、邮箱、Token） | ⚠️ | 需脱敏 |
| S-09 | 调用安全 | 外部 API 调用需使用安全代理或 MCP 中转 | ✅ | 禁止直连外网 |
| S-10 | 加密 | 存储的密钥、凭证需加密存储 | ✅ | AES256 或 KMS |
| S-11 | 签名验证 | 插件包需通过 PowerX 签名验证 | ✅ | Marketplace 生成签名 |
| S-12 | 审计 | 插件关键操作需写入审计日志 | ✅ | `/logs/audit.log` |
| S-13 | 依赖安全 | 检查依赖库安全漏洞（Go Audit / npm audit） | ⚠️ | 持续监控 |
| S-14 | Sandbox | 插件运行时禁止 fork 子进程 | ✅ | 安全模式 |
| S-15 | Health | 插件必须实现健康检查 `/healthz` | ✅ | 参见 Runtime 文档 |
| S-16 | SSRF 保护 | 禁止使用不受信任的 URL | ✅ | 校验域名白名单 |
| S-17 | XSS 防护 | 所有前端输入需转义 | ✅ | Nuxt UI 自带防护 |
| S-18 | CSRF 防护 | 所有 API POST 请求需带 Token | ✅ | Gin 中间件 |
| S-19 | Header 安全 | 添加 `X-Frame-Options` 等安全头 | ✅ | 前端与后端均需 |
| S-20 | Marketplace 兼容 | 插件信息不得包含可执行脚本标签 | ✅ | 上架自动检测 |

---

## 🧩 五、数据库与 Schema 安全控制（宿主分配）

PowerX 插件的数据存储由宿主 CoreX **统一管理与分配**。

### 🔹 安装阶段

宿主在安装插件时自动执行：

1. 为插件创建独立 Schema（如 `tenant_123_crm`）；  
2. 创建独立数据库用户（role），并生成强随机密码；  
3. 在宿主内部记录 Schema、用户、租户三元绑定；  
4. 通过环境变量注入连接字符串（DSN）；  
5. 插件仅负责「使用」，**无权创建或修改 Schema 与凭证**。

示例环境变量：

```bash
export POWERX_DB_DSN="postgres://plugin_crm:9s7d1h@db.powerx:5432/powerx?search_path=tenant_123_crm"
```

### 🔹 宿主职责

| 项目        | 动作                           |
| --------- | ---------------------------- |
| Schema 命名 | PowerX Core 自动生成             |
| 用户与密码     | PowerX Core 随机生成             |
| 权限控制      | 仅允许访问对应 Schema               |
| 凭证轮换      | 宿主定期轮换密码                     |
| 卸载清理      | 宿主执行 DROP SCHEMA CASCADE（受控） |

### 🔹 插件职责

| 项目         | 要求             |
| ---------- | -------------- |
| 连接         | 通过注入 DSN 连接    |
| migrations | 仅定义表结构，不包含连接信息 |
| 密钥管理       | 不缓存或持久化凭证      |
| 权限限制       | 不创建新角色、不修改系统表  |

### 🔹 安全收益

- 插件“使用但不拥有”数据；
- 数据隔离粒度到 Schema；
- 即便插件被攻破也无法越权访问宿主；
- 满足 Zero-Trust 架构的最小权限原则。

---

## 🧩 六、插件包签名与验证

PowerX 在构建 `.pxp` 插件包时，会生成签名文件：

```
plugin.yaml
manifest.sig
```

验证流程：
1️⃣ PowerX Core 安装时验证签名；
2️⃣ 校验 Marketplace 公钥；
3️⃣ 比对 `.pxp` 哈希；
4️⃣ 验证失败则拒绝安装。

```bash
powerx plugin verify com.powerx.plugin.crm-1.3.0.pxp
→ signature valid ✅
```

---

## 🧠 七、沙箱运行时控制（Runtime Sandbox）

宿主通过 **PluginSandboxManager** 实现隔离：

| 资源          | 限制             | 说明        |
| ----------- | -------------- | --------- |
| CPU         | 限制核数（默认 1）     | 超出自动熔断    |
| Memory      | 限制内存（默认 512Mi） | 超出重启      |
| Disk        | 挂载只读           | `/tmp` 可写 |
| Network     | 仅宿主内网          | 禁止出网      |
| Exec        | 禁止 fork/exec   | 防止 RCE    |
| File Access | 仅限插件目录         | 防止越权      |

违规行为 → 记录安全事件并触发告警。

---

## 🧩 八、通信与认证安全

| 通信场景       | 机制                          | 说明      |
| ---------- | --------------------------- | ------- |
| 插件 → 宿主    | JWT 鉴权（`POWERX_AUTH_TOKEN`） | 由宿主注入   |
| 宿主 → 插件    | MCP 双向签名 + Token 验证         | 防止伪造    |
| Agent → 插件 | ToolGrant 授权机制              | 限定能力范围  |
| 内部调用       | HMAC 签名                     | 保护消息完整性 |

---

## 🧩 九、插件配置安全（Config Security）

配置文件 `backend/etc/config.yaml` 要求：

- 所有敏感值从环境变量注入；
- 禁止提交密钥至 Git；
- 可用 `.example` 作为模板；
- 加密存储（AES256 或 KMS）；
- 在 `manifest.yaml` 中声明引用：

  ```yaml
  secrets:
    - name: CRM_API_KEY
      source: env
  ```

---

## 🧩 十、日志与审计

插件需在 `/logs/audit.log` 记录操作事件：

```json
{
  "timestamp": "2025-10-13T12:00:00Z",
  "actor": "user_321",
  "tenant_id": "tenant_123",
  "action": "contact.delete",
  "result": "success",
  "trace_id": "81a22f9dcb13"
}
```

宿主定期汇总审计日志至中央系统。

---

## 🧩 十一、依赖与构建安全

```bash
go mod verify
npm audit --production
```

- 禁止使用未知源；
- 固定版本；
- 所有构建产物需签名。

---

## 🧩 十二、前端安全（Web Admin）

- 禁止 `v-html`；
- 使用 PowerX SDK 调用；
- 校验 CSRF；
- 不暴露密钥；
- 仅访问授权 API。

---

## 🧩 十三、Marketplace 审核与评分

上架阶段自动化检查包括：

- 构建签名验证；
- SAST 静态分析；
- 沙箱行为检测；
- 权限与安全头验证；
- 审计日志合规性。

评分权重：

| 项目    | 权重  |
| ----- | --- |
| 代码安全  | 40% |
| 权限控制  | 30% |
| 网络与配置 | 20% |
| 日志合规  | 10% |

---

## 🧩 十四、安全扫描命令

```bash
make security-scan
```

或：

```bash
powerx-cli plugin scan --id com.powerx.plugin.crm
```

输出：

```
[S-04] DB schema assignment ✅
[S-08] Log desensitization ⚠️
```

报告位置：

```
/var/lib/powerx/reports/security/com.powerx.plugin.crm-2025-10-13.json
```

---

## 🧠 十五、安全事件响应

| 阶段 | 动作                         |
| -- | -------------------------- |
| 检测 | 宿主发现异常行为                   |
| 通知 | 触发 `plugin.security.alert` |
| 响应 | 安全团队分级                     |
| 处理 | 暂停插件或强制更新                  |
| 复盘 | 审计报告归档                     |

---

## 📚 延伸阅读

- [Data_Privacy_and_GDPR.md](./Data_Privacy_and_GDPR.md)
- [ToolGrant_Consumption_Guide.md](./ToolGrant_Consumption_Guide.md)
- [Vulnerability_Response.md](./Vulnerability_Response.md)
- [03_runtime_and_ops/Runtime_Env_and_Ports.md](../03_runtime_and_ops/Runtime_Env_and_Ports.md)

---

> **文档版本：** v1.1.0
> **适用范围：** PowerX ≥ 0.9.0
> **维护团队：** PluginBase Security Team
> **最后更新：** 2025-10

```

---

✅ **更新说明总结：**

| 变更点 | 描述 |
|---------|------|
| **数据库安全段重写** | 改为“由 PowerX Core 负责分配 schema 与凭证” |
| **宿主职责/插件职责表** | 明确双方边界 |
| **连接说明与示例环境变量** | 插件仅读取，不创建 |
| **安全收益分析** | 强调 Zero Trust 与最小权限 |
| **S-04 检查项更新** | 改为“宿主分配模式 ✅” |
| 文档版本 | 升级至 v1.1.0 |

---
