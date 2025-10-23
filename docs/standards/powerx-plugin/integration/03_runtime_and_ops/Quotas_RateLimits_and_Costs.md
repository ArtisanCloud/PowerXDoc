# 插件配额、速率限制与成本计量规范（03_runtime_and_ops/Quotas_RateLimits_and_Costs.md）

> 本文档定义 PowerX 插件的配额（Quota）、速率限制（Rate Limit）与成本（Cost）控制机制，  
> 旨在保证宿主系统稳定运行、资源公平分配，并为 Marketplace 结算和多租户计费提供统一标准。

---

## 🧭 一、文档目标

- 统一插件的资源控制与调用限额策略；
- 明确宿主、插件、租户三方的配额层级；
- 支持速率限制（QPS / 并发）；
- 提供调用计费与报告机制；
- 支撑插件市场（Marketplace）的结算模型。

---

## 🧩 二、概念与范围

| 概念 | 定义 |
|------|------|
| **Quota（配额）** | 插件或租户在指定周期内可消耗的资源总量（例如：每日 10000 次调用） |
| **Rate Limit（速率限制）** | 插件在短周期（秒级）内的最大请求频率 |
| **Cost（成本 / 计费）** | 每次调用或资源使用对应的成本度量，单位为“PowerX Credit” |
| **Metering（计量）** | 宿主对调用次数、执行时间、流量、事件数量的采集 |
| **Billing（计费）** | 基于计量数据与单价规则计算费用，用于 Marketplace 结算 |

---

## 🧱 三、层级架构

PowerX 将配额控制划分为三层：

```text

┌─────────────────────────────┐
│          PowerX Core        │
│   ┌─────────────────────┐   │
│   │ Quota Manager       │   │
│   ├─────────────────────┤   │
│   │ RateLimiter         │   │
│   │ Billing Engine      │   │
│   └─────────────────────┘   │
│           ↑  ↑  ↑           │
│   ┌─────────────────────┐   │
│   │ Plugins (Execs)     │   │
│   │ CRM / EC / AI Tools │   │
│   └─────────────────────┘   │
│           ↑                 │
│   ┌─────────────────────┐   │
│   │ Tenants / Accounts  │   │
│   └─────────────────────┘   │
└─────────────────────────────┘

```

---

## ⚙️ 四、Quota 配额模型

配额定义在插件 manifest 或宿主配置中：

```yaml
quotas:
  daily_calls: 10000
  max_concurrency: 20
  data_storage_mb: 512
  event_emits_per_day: 500
  cost_per_call: 0.01  # PowerX Credit
```

宿主维护租户级表：

```
tenant_plugin_quota(tenant_id, plugin_id, used_calls, used_storage, last_reset)
```

### 典型配额类型

| 类型           | 单位           | 控制粒度                    | 示例      |
| ------------ | ------------ | ----------------------- | ------- |
| API 调用次数     | 次/天          | per-tenant / per-plugin | 10000 次 |
| 并发连接数        | count        | per-plugin              | 50      |
| 数据存储         | MB / GB      | per-tenant              | 1GB     |
| 事件发布次数       | 条/天          | per-plugin              | 500     |
| 消息推送次数       | 条/分钟         | per-plugin              | 100     |
| AI Token 使用量 | tokens / day | per-tenant              | 100,000 |

---

## 🧠 五、Rate Limit（速率限制）机制

PowerX 在 MCP 层和 HTTP 层双重实现速率控制。

### 1️⃣ 插件 manifest 中声明

```yaml
rate_limits:
  global_qps: 100        # 全局每秒请求数
  tenant_qps: 10         # 单租户每秒请求数
  burst: 20              # 瞬时突发
  refill_interval: 100ms # 令牌桶刷新周期
```

### 2️⃣ 宿主实现：令牌桶算法

伪代码：

```go
bucket := rate.NewLimiter(rate.Every(100*time.Millisecond), 20)
if !bucket.Allow() {
    return 429, "Rate limit exceeded"
}
```

宿主记录速率日志：

```
[WARN] crm.contact.create rate limit exceeded (tenant=123)
```

默认速率参数来自 `runtime_ops.quota_window_minutes`，宿主通过 `host-values.yaml` 注入：

```yaml
runtime_ops:
  quota_window_minutes: 5
  alerts:
    quota_usage: 0.9
```

运行时代码读取该配置并驱动 `QuotaService` 中的令牌桶，配额利用率通过 `powerx_plugin_quota_usage` 指标上报。

---

## 🧩 六、多租户配额隔离策略

| 资源类型     | 隔离方式                       | 说明              |
| -------- | -------------------------- | --------------- |
| API 调用   | `tenant_id + plugin_id` 双键 | 每租户独立统计         |
| 存储空间     | schema 分区                  | 物理隔离            |
| 并发连接     | Session 级别                 | MCP Session 数限制 |
| AI Token | 每租户独立计数器                   | 用于 AI 类插件       |
| 日志容量     | 日志文件大小监控                   | 超出触发归档          |

示例数据库：

```
tenant_plugin_usage
---------------------
tenant_id
plugin_id
calls_today
storage_mb
ai_tokens_used
last_reset_at
```

宿主每日重置统计器。

### 配置入口 (`runtime_ops`)

插件运行环境的配额与告警阈值统一由 `host-values.yaml` 注入：

```yaml
runtime_ops:
  quota_window_minutes: 5
  alerts:
    quota_usage: 0.9
    error_rate: 0.05
  observability:
    loki_endpoint: https://loki.powerx.local
    tempo_endpoint: https://tempo.powerx.local
```

运行时代码通过 `backend/internal/config` 与 `QuotaService` 读取以上值，避免硬编码，确保不同环境可灵活调整策略。

---

## ⚙️ 七、调用成本计算（Costing）

PowerX 定义统一成本模型：

```
TotalCost = Σ (调用次数 × cost_per_call) + (CPU秒 × cost_cpu) + (流量MB × cost_bandwidth)
```

示例（插件 manifest）：

```yaml
costs:
  per_call: 0.01
  per_cpu_second: 0.005
  per_mb_egress: 0.0001
```

宿主在调用结束后记录账单事件：

```json
{
  "plugin_id": "com.powerx.plugin.crm",
  "tenant_id": "tenant_123",
  "capability": "crm.contact.create",
  "cost": 0.0132,
  "metrics": {
    "cpu_ms": 250,
    "egress_mb": 0.2
  }
}
```

---

## 🧩 八、Billing 计费与报告机制

宿主周期性（每日/每小时）生成账单：

| 字段        | 示例                    | 描述            |
| --------- | --------------------- | ------------- |
| plugin_id | com.powerx.plugin.crm | 插件标识          |
| tenant_id | tenant_123            | 租户            |
| calls     | 2048                  | 调用次数          |
| cost      | 20.48                 | PowerX Credit |
| timestamp | 2025-10-13T00:00Z     | 结算时间          |

示例 SQL：

```sql
SELECT plugin_id, tenant_id, SUM(cost) AS total_cost
FROM plugin_billing
WHERE date = CURRENT_DATE
GROUP BY plugin_id, tenant_id;
```

结果会上传至 Marketplace 后台，用于结算和分润。

---

## 🧩 九、成本可视化与监控指标

PowerX 监控系统（Prometheus / Grafana）暴露如下指标：

```
powerx_plugin_request_total{plugin_id="crm", capability="bootstrap"} 8421
powerx_plugin_quota_usage{plugin_id="crm", scope="tenant", scope_ref="123"} 0.83
powerx_plugin_cost_total{plugin_id="crm", tenant_id="123"} 42.13
powerx_mcp_sessions_total{plugin_id="crm"} 3
```

> 使用 `scripts/dev/quota_burst.sh --tenant demo --qps 20 --duration 15` 可以在本地快速触发配额消耗并观察上述指标的变化。

管理员可在 PowerX Admin → 【插件运行监控】中查看配额、速率与成本趋势。

表中指标来自运行时导出的 Prometheus 度量：

| 指标 | 说明 |
|------|------|
| `powerx_plugin_quota_usage{scope,scope_ref}` | 当前配额使用率 (0~1) |
| `powerx_plugin_cost_total{plugin_id,tenant_id}` | 累计成本合计 |
| `powerx_plugin_restart_total{plugin_id,instance_id}` | 插件实例重启次数 |
| `powerx_plugin_health_status{plugin_id,instance_id}` | 健康状态（1/0） |

相关代码见 `runtime_metrics.go`，`QuotaService` 在每次请求时调用 `SetQuotaUsage`、`AddCost` 更新以上指标。

---

## 🧩 十、超限行为与惩罚机制

| 状况             | 处理动作                         | 描述     |
| -------------- | ---------------------------- | ------ |
| QPS 超限         | 限流返回 `429 Too Many Requests` | 短时间阻断  |
| Daily Quota 超限 | 拒绝请求并记录事件                    | 暂停插件调用 |
| 存储超限           | 拒绝写入新数据                      | 可人工扩容  |
| 成本超限           | 停止服务并通知 Marketplace          | 限制账户使用 |
| 异常调用（Loop）     | MCP 自动熔断通道                   | 防止死循环  |

宿主通过事件通知机制向 Marketplace 发送警报：

```json
{
  "type": "EVENT_PUBLISH",
  "topic": "plugin.quota.exceeded",
  "data": {
    "plugin_id": "com.powerx.plugin.crm",
    "tenant_id": "tenant_123",
    "metric": "daily_calls",
    "limit": 10000
  }
}
```

---

## 🧩 十一、插件侧自监控与上报

插件应主动向宿主报告关键指标（可选）：

```json
{
  "type": "METRIC_PUSH",
  "payload": {
    "calls_today": 123,
    "cpu_seconds": 2.1,
    "storage_mb": 31.5
  }
}
```

宿主将该数据融合至全局统计表中。

---

## 🧩 十二、Marketplace 成本与分润模型

PowerX Marketplace 将插件成本与开发者分润挂钩：

| 项目         | 说明                                 |
| ---------- | ---------------------------------- |
| **调用计费模式** | 按调用次数收取费用（per-call）                |
| **订阅计费模式** | 固定月费，附带免费额度                        |
| **分润比例**   | 默认 70% 开发者 / 30% 平台                |
| **成本抵扣**   | 开发者可用内部 Credit 抵扣资源费用              |
| **透传成本**   | 若插件使用外部 API，可透传计费项（如 OpenAI Token） |

Marketplace 端展示示例：

```
CRM Plugin — 每次调用 ¥0.05，月度上限 ¥199
```

---

## 🧩 十三、调试与本地开发

开发阶段可禁用配额检查：

```bash
export POWERX_QUOTA_MODE=off
```

或手动注入测试额度：

```bash
powerx-cli plugin quota --set com.powerx.plugin.crm --tenant tenant_dev --calls 1000
```

查看状态：

```bash
powerx-cli plugin quota --get com.powerx.plugin.crm
```

---

## 🧩 十四、设计原则（Design Principles）

1. **最小干扰**：插件无需自行实现限流逻辑；
2. **集中控制**：宿主统一实现，插件仅声明；
3. **分层统计**：Tenant / Plugin / Capability；
4. **灵活扩展**：支持自定义指标（AI Tokens、存储容量等）；
5. **安全合规**：所有计量信息需签名传输；
6. **透明计费**：Marketplace 可审计；
7. **可追溯性**：调用日志可追溯至租户与用户级别。

---

## 📚 延伸阅读

- [Runtime_Env_and_Ports.md](./Runtime_Env_and_Ports.md)
- [MCP_Session_and_Registration.md](./MCP_Session_and_Registration.md)
- [Logs_Metrics_and_Tracing.md](./Logs_Metrics_and_Tracing.md)
- [06_marketplace_and_business/Pricing_and_Licensing.md](../06_marketplace_and_business/Pricing_and_Licensing.md)

---

> **文档版本：** v1.0.0
> **适用范围：** PowerX ≥ 0.9.0
> **维护团队：** PluginBase Runtime & Billing Team
> **最后更新：** 2025-10
