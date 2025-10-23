# 常见问题与概念索引（99_appendix/FAQ.md）

> 本文档汇总 PowerX 插件生态中最常见的开发、发布、授权与运行问题。  
> 适用于 PluginBase、Marketplace、Tenant、License 与 Dev Console 全体系。

---

## 🧩 一、插件开发常见问题（Development）

### Q1. 我应该 fork PowerXPluginBase 还是从模板创建？

**A：**  
推荐从 PowerX 官方模板仓库创建新插件项目（`powerx init plugin`）。  
仅当你需要修改底层框架行为（如日志系统、启动逻辑、gRPC adapter）时，才 fork `PowerXPluginBase`。  
模板中已包含标准目录结构、plugin.yaml、Makefile、Nuxt 前端脚手架。

---

### Q2. 插件支持哪些编程语言？

**A：**  
目前官方支持：

- 后端：Golang（主）、Rust（实验性）、Python（工具层）
- 前端：Nuxt3（推荐）、Next.js、Vue 3  
宿主使用 Gin + gRPC SDK，可通过 HTTP、gRPC、MCP 或 A2A 协议与插件通信。

---

### Q3. 插件如何连接宿主数据库？

**A：**  
插件不会直接创建数据库，而是由 PowerX 安装器分配：

- 独立 Schema；
- 独立用户（role）与密码；
- DSN 注入至环境变量。  
插件只需从 `config.yaml` 或 `POWERX_DB_DSN` 中读取连接信息。  
（详见：`Plugin_Security_Checklist.md`）

---

### Q4. 是否支持插件之间通信？

**A：**  
支持。  
通过 **PowerX A2A Adapter**，可在插件之间使用以下模式通信：

- gRPC（高性能 API 层）
- MCP（消息通道）
- A2A（Agent-to-Agent，跨插件智能体协作）  
（详见：`A2A_Protocol_and_Agent_Interconnect.md`）

---

## 🧩 二、Marketplace 与 License 相关（Business）

### Q5. 插件如何定价？

**A：**  
在 `plugin.yaml` 中定义 `pricing` 字段，可选择：

- 免费（Free）
- 一次性购买（One-Time）
- 订阅（Subscription）
- 按量计费（Usage-Based）  
详见：`Pricing_and_Licensing.md`

---

### Q6. License 验证失败怎么办？

**A：**  
常见原因：

| 原因 | 解决方案 |
|------|-----------|
| 签名无效 | 重新激活 License |
| 过期 | 在 Marketplace 续订 |
| 绑定租户错误 | 检查 `tenant_id` 一致性 |
| 网络异常 | 确认能访问 License Server |

可通过 CLI：

```bash
powerx plugin license verify
```

---

### Q7. 我可以为不同租户设置不同价格吗？

**A：**
可以。Marketplace 支持 **按租户定制 Plan**。
Vendor 可通过 API 为特定租户下发定制 License（Custom Pricing Plan）。

---

### Q8. License 是存储在插件本地吗？

**A：**
不是。
License 主存储在 **PowerX License Server**，插件仅缓存验证结果。
插件本地不会保存明文 License Key。

---

## 🧠 三、运行与运维（Runtime & Ops）

### Q9. 插件与宿主通信失败？

**A：**

1. 检查宿主地址是否正确：`config.yaml → upstream.host`；
2. 运行健康检查：

   ```bash
   curl http://localhost:8077/_health
   ```

3. 检查宿主代理路径：

   ```
   /__up/_p/<plugin_id>/api/...
   /__up/_p/<plugin_id>/admin/...
   ```

4. 若为 gRPC 连接失败 → 检查端口与证书配置。
   （详见：`Runtime_Env_and_Ports.md`）

---

### Q10. 插件升级后旧数据丢失？

**A：**
原因可能是 Schema 迁移未执行。
运行：

```bash
make migrate
```

或在控制台执行「手动迁移」。
如为破坏性更新，请参考：
`Backward_Compatibility_Strategy.md`。

---

### Q11. 插件日志在哪里查看？

**A：**

- 控制台路径：`/admin/logs`
- API 调用：

  ```bash
  GET /api/v1/admin/plugin/logs?level=error
  ```

- 后端日志路径：`backend/logs/*.log`
- 可下载或导出为 ZIP。

详见：`Logs_Metrics_and_Tracing.md`。

---

### Q12. 如何上报自定义指标？

**A：**
使用 SDK：

```go
import "powerx.io/sdk/usage"

usage.Report(map[string]int{
  "api.calls": 12,
  "contacts.created": 3,
})
```

（详见：`Usage_Analytics_and_Reports.md`）

---

## 🧾 四、安全与合规（Security & Compliance）

### Q13. 插件是否可以访问宿主的文件系统？

**A：**
不可以。
插件运行在隔离容器中，仅可通过 PowerX 提供的 API、gRPC、MCP 等受控通道访问宿主资源。
所有文件上传/下载均需通过宿主的签名接口。

---

### Q14. 插件如何防止跨租户访问？

**A：**
宿主在连接时自动注入：

- `x-tenant-id` 请求头；
- 租户隔离 Schema；
- 独立的 ToolGrant Token。
  插件侧只需校验这些字段，不得自行信任前端传入的 tenant 参数。
  详见：`Plugin_Security_Checklist.md`。

---

### Q15. 如何确保数据合规（GDPR/PIPL）？

**A：**

- 插件不得采集个人隐私信息；
- 删除租户时必须同步清除其数据；
- 所有日志与备份需加密存储；
- 用户可请求“导出或删除其个人数据”；
  详见：`Data_Privacy_and_GDPR.md`。

---

### Q16. 如何报告安全漏洞？

**A：**

- 发送邮件至 `security@powerx.io`；
- 或通过控制台【支持 → 安全问题】入口提交；
  提交后会生成 `SEC-XXXX` 工单号。
  详见：`Vulnerability_Response.md`。

---

## 🧰 五、控制台与前端（Admin Console & UI）

### Q17. 控制台页面 404？

**A：**
检查宿主代理路径：

```
/__up/_p/<plugin_id>/admin/
```

是否已正确注册；
前端构建输出目录应为：

```
web-admin/.output/public
```

若路径错误，请在宿主配置 `router_proxy.go` 中修复。

---

### Q18. 为什么 License 状态未刷新？

**A：**
License 状态缓存 5 分钟刷新一次。
你可在控制台执行：
➡️ 「License → 手动验证」或运行 CLI：

```bash
powerx plugin license verify --force
```

---

### Q19. 支持多语言吗？

**A：**
是的。插件前端应在 `/app/i18n/` 目录下定义语言包。
PowerX 会自动检测用户语言（`Accept-Language` 头）加载对应资源。
支持 `zh-CN` 与 `en-US`。

---

## 🧩 六、Marketplace 与上架（Publishing）

### Q20. 插件如何上架到 Marketplace？

**A：**
使用 `powerx-cli package` 生成 `.pxp` 文件后上传。
流程：

```
1️⃣ powerx build
2️⃣ powerx sign
3️⃣ powerx package
4️⃣ 上传至 Marketplace 控制台
```

系统自动校验 manifest、签名、License、兼容性。

详见：`Versioning_and_Publishing.md`。

---

### Q21. 插件能否被多个租户同时使用？

**A：**
可以。
PowerX 采用多租户架构：

- 每个租户对应独立 Schema；
- 独立 License；
- 隔离的配额与日志。

---

### Q22. 插件如何下架或暂停？

**A：**
在 Marketplace 后台操作：

- 设置状态为 `deprecated`；
- 上传替代版本（optional）；
- 租户端将显示“插件已下架”标记。
  详见：`Deprecation_and_Sunset_Policy.md`。

---

## 🧠 七、性能与监控（Performance & Observability）

### Q23. 插件性能下降？

**A：**
使用控制台 → 【日志与事件】查看指标：

- 响应时间；
- 错误率；
- 资源使用。
  或使用 CLI：

```bash
powerx plugin stats
```

详见：`Logs_Metrics_and_Tracing.md`。

---

### Q24. 如何查看 SLA 状态？

**A：**
进入控制台：
➡️ 「支持与 SLA」 → 查看近 30 天可用率。
或通过 API：

```bash
GET /api/v1/marketplace/sla/{plugin_id}
```

详见：`SLA_and_SLO_for_Plugin.md`。

---

### Q25. 如何导出审计日志？

**A：**
控制台路径：
➡️ 「审计记录」 → 「导出为 CSV」。
或调用 API：

```bash
GET /api/v1/admin/plugin/audit/export?format=csv
```

详见：`Audit_and_History_View.md`。

---

## 🧾 八、关键概念速查（Glossary）

| 术语                 | 含义                               |
| ------------------ | -------------------------------- |
| **PowerX Core**    | 宿主核心系统（Gin + GORM + PostgreSQL）  |
| **PluginBase**     | 插件开发基础框架（Go + Nuxt）              |
| **Plugin.yaml**    | 插件元数据定义文件（ID、版本、依赖等）             |
| **License Server** | 授权签发与验证中心                        |
| **ToolGrant**      | 宿主与插件之间的访问令牌（权限粒度控制）             |
| **A2A**            | Agent-to-Agent 协议（智能体互联）         |
| **MCP**            | Message Channel Protocol（消息通道协议） |
| **Manifest**       | 插件声明文件，描述能力、版本、配置                |
| **Tenant**         | 多租户系统中的独立业务空间                    |
| **Schema**         | 每租户的数据库命名空间                      |
| **Marketplace**    | 插件分发与授权管理中心                      |
| **Quota**          | 插件使用配额（API、存储、调用量等）              |
| **Audit**          | 操作与安全事件的记录机制                     |
| **SLA/SLO**        | 服务等级协议 / 服务等级目标                  |

---

## 📚 九、延伸阅读

- [Create_and_Init_Project.md](../01_plugin_lifecycle/Create_and_Init_Project.md)
- [Manifest_and_Metadata.md](../01_plugin_lifecycle/Manifest_and_Metadata.md)
- [Pricing_and_Licensing.md](../06_marketplace_and_business/Pricing_and_Licensing.md)
- [Logs_Metrics_and_Tracing.md](../03_runtime_and_ops/Logs_Metrics_and_Tracing.md)
- [Plugin_Security_Checklist.md](../04_security_and_compliance/Plugin_Security_Checklist.md)
- [Common_Tasks_and_Troubleshooting.md](../08_dev_console_and_ui/Common_Tasks_and_Troubleshooting.md)

---

> **文档版本：** v1.1.0
> **适用范围：** PowerX ≥ 0.9.0
> **维护团队：** PowerX Core & Marketplace Team
> **最后更新：** 2025-10
