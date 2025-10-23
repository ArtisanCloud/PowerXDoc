# 数据隐私与 GDPR 合规指南（04_security_and_compliance/Data_Privacy_and_GDPR.md）

> 本文档定义 PowerX 插件在处理用户数据时的隐私保护与合规要求，  
> 确保插件遵循《通用数据保护条例（GDPR）》及中国《个人信息保护法（PIPL）》等全球标准，  
> 实现“最小必要”“可追溯”“可删除”“可导出”的数据生命周期管理。

---

## 🧭 一、目标与适用范围

- 适用于所有运行于 **PowerX 多租户宿主环境** 的插件；
- 约束插件在采集、存储、处理、传输用户数据的行为；
- 适用于个人信息（PI）、可识别数据（PII）、业务敏感数据；
- 规范插件与宿主、第三方 API、Marketplace 之间的数据传递方式。

---

## 🧱 二、数据保护设计原则（Privacy by Design）

PowerX 插件必须遵循以下七项隐私设计原则：

| 原则 | 说明 |
|------|------|
| 1️⃣ 最小化原则 | 仅采集任务执行所需最小数据 |
| 2️⃣ 目的限制 | 数据仅用于声明的业务场景 |
| 3️⃣ 明确同意 | 用户必须在宿主端完成授权 |
| 4️⃣ 透明可追溯 | 插件应支持审计与访问记录 |
| 5️⃣ 可删除 | 用户请求删除后，插件需彻底清除 |
| 6️⃣ 可导出 | 用户可请求导出其数据副本 |
| 7️⃣ 安全存储 | 数据在存储和传输中均需加密 |

---

## 🧩 三、数据分类与处理要求

| 数据类别 | 示例 | 处理要求 |
|-----------|------|----------|
| **个人身份信息（PII）** | 姓名、邮箱、手机号 | 必须脱敏存储；禁止外传 |
| **业务数据** | CRM 联系人、订单 | 可存储于租户 Schema 内；需访问控制 |
| **行为日志** | 操作记录、访问路径 | 可记录但需匿名化 |
| **AI 输入/输出** | Chat 内容、生成结果 | 默认不持久化；如需保留需用户同意 |
| **配置数据** | API Keys、密钥 | 使用宿主 Secrets 注入，不得明文保存 |

---

## 🧠 四、租户级隔离与数据访问控制

PowerX 宿主在插件安装时，为每个租户自动分配独立的 Schema 与凭证：  
插件必须通过环境变量读取 `POWERX_DB_DSN`，并基于租户上下文操作。

| 控制维度 | 说明 |
|-----------|------|
| **Schema 隔离** | 每租户独立 Schema |
| **Role 隔离** | 不同租户不同数据库账号 |
| **Token 隔离** | PowerX Core 注入独立 JWT |
| **API 隔离** | 插件必须携带 `tenant_id` 参数 |

示例：

```sql
SELECT * FROM contacts WHERE tenant_id = $CURRENT_TENANT
```

> ⚠️ 插件不得自行创建或操作跨租户 Schema。
> 所有访问应通过宿主提供的上下文（Context）注入租户 ID。

---

## 🔐 五、敏感信息保护与脱敏策略

插件在日志、导出、AI 推理时必须执行脱敏规则：

| 数据类型  | 示例                                          | 处理方式               |
| ----- | ------------------------------------------- | ------------------ |
| 手机号   | 13812345678                                 | `138****5678`      |
| 邮箱    | [user@example.com](mailto:user@example.com) | `u***@example.com` |
| 身份证号  | 33010119900101XXXX                          | `3301************` |
| IP 地址 | 192.168.1.12                                | `192.168.*.*`      |
| 用户名   | 张三                                          | `Z*`               |

推荐在 Go 层统一封装脱敏方法：

```go
import "powerx.io/safe"

logger.Info("user login", zap.String("email", safe.MaskEmail(user.Email)))
```

---

## 🧩 六、用户同意与授权流程

插件不得自行实现同意表单，必须复用宿主 PowerX 的授权中心。

### 同意来源

- **宿主端**：由 PowerX Marketplace 或 CoreX 提供 UI；
- **插件端**：通过 `X-PowerX-Consent-Token` Header 接收授权；
- **数据用途**：必须在插件 manifest 的 `data_usage` 字段中声明。

示例：

```yaml
data_usage:
  - purpose: "AI分析联系人沟通记录"
    type: "behavioral"
    retention: "30d"
    requires_consent: true
```

插件可在初始化时验证是否存在用户同意：

```go
token := c.GetHeader("X-PowerX-Consent-Token")
if token == "" {
    c.AbortWithStatusJSON(403, gin.H{"error": "missing consent"})
}
```

---

## 🌍 七、数据跨境与第三方传输

PowerX Core 可能部署于不同区域（如 CN/EU/US），
插件必须遵守所在区域的数据合规要求：

| 场景               | 要求                            |
| ---------------- | ----------------------------- |
| **跨境传输**         | 必须使用宿主提供的中转服务（PowerX Gateway） |
| **第三方 API 调用**   | 不得传输 PII；仅传输匿名 ID 或聚合数据       |
| **外部存储（S3/GCS）** | 必须配置区域匹配；禁止跨境 bucket          |
| **日志上报**         | 仅允许上传脱敏数据                     |

> 插件若需调用第三方（如 OpenAI、Salesforce），必须在 manifest 中声明数据流向与授权域。

---

## 🧩 八、数据保留与删除策略

插件需定义数据生命周期（Retention Policy）：

```yaml
data_retention:
  default: 30d
  audit_logs: 180d
  ai_outputs: 7d
```

宿主定期触发清理任务：

```
DELETE FROM contacts WHERE updated_at < now() - interval '30 days'
```

用户请求“删除个人数据”时：

- 插件需响应宿主发出的 `data.erasure.request` 事件；
- 执行彻底删除（包括缓存与索引）；
- 记录删除日志，状态为 `erased`。

---

## 🧩 九、数据导出（Data Portability）

当用户请求导出其数据副本时：

1. PowerX Core 发出 `data.export.request`；
2. 插件根据租户上下文导出 CSV/JSON；
3. 生成一次性下载链接（签名 URL，有效期 ≤ 24h）；
4. 插件不得直接向外部传输导出文件。

导出结构示例：

```json
{
  "tenant_id": "t123",
  "exported_at": "2025-10-13T10:00:00Z",
  "data": {
    "contacts": [...],
    "leads": [...]
  }
}
```

---

## 🧩 十、插件日志与隐私合规

| 项目         | 要求                 |
| ---------- | ------------------ |
| **访问日志**   | 禁止记录完整 Token/Email |
| **错误日志**   | 仅保留错误码与 Trace ID   |
| **操作日志**   | 可存储行为事件，但需脱敏       |
| **日志留存时间** | ≤ 30 天（除非审计要求）     |

插件可通过 PowerX 提供的日志代理统一输出：

```bash
powerx logs --plugin com.powerx.plugin.crm --filter privacy
```

---

## ⚙️ 十一、AI 与模型输出数据

如果插件调用 LLM 或 AI 服务，应遵守：

| 规则   | 说明                               |
| ---- | -------------------------------- |
| 输入脱敏 | 对文本输入执行关键词屏蔽（如邮箱、手机号）            |
| 输出审查 | 禁止输出个人身份信息或未授权数据                 |
| 存储限制 | 默认不存储对话上下文                       |
| 合规说明 | 在 manifest 的 `ai_compliance` 段声明 |

示例：

```yaml
ai_compliance:
  provider: "OpenAI"
  input_masking: true
  output_filter: true
  storage: "ephemeral"
```

---

## 🧱 十二、GDPR / PIPL 合规映射表

| 合规条款            | PowerX 实现机制               |
| --------------- | ------------------------- |
| **第5条 数据最小化**   | 宿主注入上下文，插件不可跨租户访问         |
| **第6条 合法处理基础**  | 通过 Consent Token 传递授权     |
| **第12条 用户可访问权** | `data.export.request` 事件  |
| **第17条 被遗忘权**   | `data.erasure.request` 事件 |
| **第30条 记录义务**   | 审计日志与访问记录                 |
| **第32条 安全措施**   | 加密、沙箱、RBAC                |
| **第44条 数据跨境**   | 通过宿主 Gateway 控制流向         |

---

## 📋 十三、隐私合规自检清单

| 检查项  | 说明                                  | 状态 |
| ---- | ----------------------------------- | -- |
| P-01 | 插件未存储未经授权的用户数据                      | ✅  |
| P-02 | 所有日志输出均已脱敏                          | ⚠️ |
| P-03 | manifest 已声明 data_usage 与 retention | ✅  |
| P-04 | 支持宿主触发数据删除与导出                       | ✅  |
| P-05 | 未向外部发送 PII                          | ✅  |
| P-06 | 加密传输（HTTPS / TLS）                   | ✅  |
| P-07 | Schema 层租户隔离                        | ✅  |

---

## 📚 延伸阅读

- [Plugin_Security_Checklist.md](./Plugin_Security_Checklist.md)
- [ToolGrant_Consumption_Guide.md](./ToolGrant_Consumption_Guide.md)
- [Vulnerability_Response.md](./Vulnerability_Response.md)
- [PowerX Core - Data Lifecycle Specification](../../corex/data-lifecycle.md)

---

> **文档版本：** v1.0.0
> **适用范围：** PowerX ≥ 0.9.0
> **维护团队：** PluginBase Security Team
> **最后更新：** 2025-10
