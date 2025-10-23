# 外部 API 与 Secrets 集成规范（05_protocols_and_integrations/External_API_and_Secrets_Integration.md）

> 本文档定义 PowerX 插件在访问外部第三方 API、云服务或 LLM 平台时的安全规范、凭证管理与网络策略要求。  
> 
> 它适用于所有 PowerX 插件运行环境（HTTP、gRPC、MCP、A2A），确保敏感凭证的安全存取、最小暴露、可审计与可轮换。

---

## 🧭 一、目标与范围

- 规范外部 API 的接入方式；
- 管理 Secrets（API Key、OAuth Token、服务账号）全生命周期；
- 避免凭证硬编码与明文暴露；
- 支持宿主级集中 Secrets 管理；
- 提供安全、合规、可审计的出网策略；
- 兼容 Marketplace 审核与租户合规要求（GDPR / ISO 27001）。

---

## 🧱 二、系统角色与职责

| 角色 | 说明 |
|------|------|
| **PowerX Core (宿主)** | 提供 Secrets 管理、KMS 加密、出网网关、合规审计 |
| **Plugin (PowerXPluginBase)** | 使用宿主注入的 Secrets；不得持久化或外传 |
| **Vendor (开发者)** | 定义需要哪些外部 API；提供凭证类型声明 |
| **Tenant (租户)** | 在 PowerX 控制台中配置 API Key / OAuth 授权 |
| **Marketplace** | 审核插件声明的外部依赖合法性与数据安全性 |

---

## 🧩 三、Secrets 生命周期

```

登记 (Register) → 加密存储 (Encrypt & Store) → 注入运行时 (Inject) → 轮换 (Rotate) → 撤销 (Revoke) → 审计 (Audit)

```

| 阶段 | 说明 | 责任方 |
|------|------|--------|
| **登记** | Vendor 在 manifest 中声明所需 Secrets | 插件开发者 |
| **存储** | 宿主使用 KMS 加密保存租户凭证 | PowerX |
| **注入** | 宿主启动插件时通过环境变量注入 | PowerX |
| **轮换** | 定期自动更新，或用户手动更新 | PowerX / Tenant |
| **撤销** | 凭证泄漏或租户解绑时吊销 | PowerX |
| **审计** | 每次访问/更新记录事件 | PowerX Security Service |

---

## ⚙️ 四、插件侧声明方式（manifest 示例）

```yaml
external_apis:
  - id: "openai"
    name: "OpenAI API"
    base_url: "https://api.openai.com/v1"
    scopes: ["chat.completions.create", "embeddings.create"]
    secrets:
      - key: "OPENAI_API_KEY"
        type: "api_key"
        required: true
        managed_by: "powerx"   # powerx | tenant | plugin
  - id: "notion"
    name: "Notion Integration"
    base_url: "https://api.notion.com/v1"
    secrets:
      - key: "NOTION_OAUTH_TOKEN"
        type: "oauth_token"
        managed_by: "tenant"
        refresh_interval: 86400
```

> PowerX 安装插件时，会根据 `managed_by` 决定凭证托管策略：
>
> - `powerx`: 由宿主统一管理并注入
> - `tenant`: 由租户在 PowerX 控制台配置
> - `plugin`: 插件自行维护（仅限非敏感 token）

---

## 🧠 五、宿主 Secrets 注入机制

PowerX 会在插件运行时通过安全方式注入 Secrets：

| 方式                   | 场景           | 示例                                 |
| -------------------- | ------------ | ---------------------------------- |
| **环境变量**             | 默认方式         | `export OPENAI_API_KEY=********`   |
| **临时文件（仅容器内）**       | 大型配置         | `/run/secrets/<plugin>/openai.key` |
| **KMS 动态加载**         | 轮换中          | 通过 `/__secrets/<id>` 接口临时读取        |
| **Agent Context 注入** | A2A / MCP 模式 | 通过 Envelope.auth.secrets 附带        |

> Secrets 注入遵循最小化原则：
> 仅在需要时注入、仅在插件生命周期内存在、宿主负责销毁。

---

## 🔐 六、出网与访问控制策略

所有外部访问都必须通过 **PowerX 出网网关（Egress Gateway）**：

```
Plugin → Egress Gateway → External API
```

### 出网策略

| 项目     | 默认策略                           |
| ------ | ------------------------------ |
| 白名单    | 仅允许 manifest 中声明的域名            |
| TLS 验证 | 必须开启                           |
| 超时     | 默认 10s                         |
| 带宽限额   | 每插件 10MB/min（可配置）              |
| 请求审计   | 记录 URL、租户、trace_id、status_code |
| 敏感信息脱敏 | 日志中不包含 Headers、Body            |

### 示例配置（config.yaml）

```yaml
egress:
  allow_domains:
    - api.openai.com
    - api.notion.com
  timeout: 10s
  bandwidth_limit: 10mb_per_min
  audit: true
```

---

## 🧩 七、凭证轮换与撤销

### 自动轮换策略

- 默认每 30 天自动轮换；
- 对 OAuth token 按 `refresh_interval`；
- 宿主提供轮换事件：

```json
{
  "event": "secret.rotated",
  "plugin_id": "com.powerx.plugin.ai",
  "secret_key": "OPENAI_API_KEY",
  "tenant_id": "tenant_abc"
}
```

### 撤销策略

- 插件卸载、租户解绑或 Marketplace 撤销授权时；
- 宿主发送：

```json
{"event": "secret.revoked","reason":"tenant_unbound"}
```

- 插件需立即停止使用旧凭证并触发本地清理。

---

## 🧩 八、Secrets 使用规范

| 禁止行为          | 替代方式              |
| ------------- | ----------------- |
| 硬编码凭证         | 使用宿主注入的环境变量       |
| 明文日志打印 Key    | 使用掩码显示 (`****`)   |
| 本地缓存 Token 文件 | 使用短期内存缓存          |
| 直接调用外部域名      | 通过 Egress Gateway |
| 跨租户共享 Secrets | 每租户独立凭证           |

---

## 🧩 九、外部 API 调用最佳实践

```go
apiKey := os.Getenv("OPENAI_API_KEY")
req, _ := http.NewRequest("POST", "https://api.openai.com/v1/chat/completions", bytes.NewBuffer(body))
req.Header.Add("Authorization", "Bearer "+apiKey)
req.Header.Add("Content-Type", "application/json")
client := &http.Client{Timeout: 10 * time.Second}
res, _ := client.Do(req)
```

建议：

- 使用宿主提供的 SDK：`powerx-egress`（内置签名、限流、审计）
- 对响应中可能含敏感内容（如 embeddings）进行脱敏/掩码；
- 加入 `trace_id` 头方便宿主追踪。

---

## ⚙️ 十、合规与审计要求

| 要求       | 描述                                                                 |
| -------- | ------------------------------------------------------------------ |
| **数据合规** | 不得将 PII 数据传出宿主区域；如需跨境需声明                                           |
| **日志脱敏** | 禁止记录完整凭证内容                                                         |
| **审计事件** | `secret.issued`, `secret.rotated`, `secret.revoked`, `egress.call` |
| **安全评分** | Marketplace 将凭证安全纳入插件安全评分                                          |

---

## 🧾 十一、Secrets 元数据注册（宿主接口）

PowerX 提供注册接口（CLI / API）：

```bash
powerx-cli plugin register-secret \
  --plugin com.powerx.plugin.ai \
  --key OPENAI_API_KEY \
  --type api_key \
  --managed-by powerx \
  --ttl 30d
```

宿主返回：

```json
{
  "secret_id": "sec_01GZ9",
  "rotation_interval": "30d",
  "scope": ["ai.*"],
  "tenant_isolation": true
}
```

---

## 🧩 十二、与其他协议层的关系

| 协议            | Secrets 用法                    | 说明              |
| ------------- | ----------------------------- | --------------- |
| **HTTP/gRPC** | 通过宿主环境变量或 KMS API 注入          | 外部 API 调用常用模式   |
| **MCP**       | 作为 Tool Credential 注册         | MCP 工具访问外部服务时使用 |
| **A2A**       | 附带在 Envelope.auth.secrets（可选） | Agent 协作时共享上下文  |
| **Webhook**   | 出站请求签名使用 Secret Key           | 验签 Secret 由宿主管理 |

---

## 🧩 十三、自检清单（Secrets Ready Checklist）

| 检查项                         | 状态 |
| --------------------------- | -- |
| manifest 中已声明 external_apis | ✅  |
| 所有外部域名列入白名单                 | ✅  |
| 凭证均由宿主注入                    | ✅  |
| 无硬编码凭证                      | ✅  |
| 出网走 PowerX Egress Gateway   | ✅  |
| 轮换与撤销事件可响应                  | ✅  |
| 审计日志可追溯                     | ✅  |

---

## 📚 十四、延伸阅读

- [A2A_Protocol_and_Agent_Interconnect.md](./A2A_Protocol_and_Agent_Interconnect.md)
- [ToolScopes_and_GrantMatrix.md](./ToolScopes_and_GrantMatrix.md)
- [Plugin_Security_Checklist.md](../04_security_and_compliance/Plugin_Security_Checklist.md)
- [Data_Privacy_and_GDPR.md](../04_security_and_compliance/Data_Privacy_and_GDPR.md)

---

> **文档版本：** v1.1.0
> **适用范围：** PowerX ≥ 0.9.0
> **维护团队：** PowerX Security & Integration Team
> **最后更新：** 2025-10
