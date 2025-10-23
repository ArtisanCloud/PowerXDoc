# 插件向后兼容性策略（02_capabilities_and_schema/Backward_Compatibility_Strategy.md）

> 本文档定义 PowerX 插件在版本迭代过程中的兼容性维护规则，  
> 包括 API / Schema / 事件 / 数据模型 / RBAC 等多个层面的策略，  
> 确保插件升级不破坏现有租户业务和宿主系统稳定性。

---

## 🧭 一、文档目标

- 约束插件升级过程中的兼容性规则；
- 建立向前 / 向后兼容（Forward / Backward）的技术准则；
- 定义版本号与兼容性之间的关系；
- 提供兼容性自动检测与测试流程；
- 降低升级风险、支持热替换与回滚。

---

## 🧩 二、兼容性定义

| 类型 | 说明 | 典型场景 |
|------|------|----------|
| **Backward Compatible（向后兼容）** | 新版本能处理旧版本请求 / 数据 | 新版 API 仍支持旧参数 |
| **Forward Compatible（向前兼容）** | 旧客户端能识别新版数据 | 新增字段被旧客户端忽略 |
| **Breaking Change（非兼容变更）** | 旧数据或客户端无法使用 | 删除字段、修改类型、改名 |
| **Deprecation（弃用）** | 提前声明计划废弃但仍可用 | 字段添加 `"deprecated": true` |

---

## 🧱 三、兼容性关注维度

| 层级 | 内容 | 风险 |
|------|------|------|
| API 层 | HTTP/gRPC 接口定义 | 客户端无法解析请求或响应 |
| Schema 层 | 输入输出结构、类型 | 参数校验失败 |
| 数据层 | 数据表结构、迁移脚本 | SQL 错误或数据丢失 |
| 事件层 | 发布/订阅消息格式 | 事件消费者出错 |
| RBAC 层 | 权限资源或动作变化 | 权限丢失或越权 |
| Config 层 | 配置项/环境变量变更 | 启动失败或配置错误 |

---

## ⚙️ 四、版本号与兼容性关系（SemVer 规范）

| 变更类型 | 示例版本变化 | 说明 |
|-----------|---------------|------|
| **PATCH** | 1.2.0 → 1.2.1 | Bug 修复，兼容性完全保留 |
| **MINOR** | 1.2.0 → 1.3.0 | 新增字段、方法、事件，保持向后兼容 |
| **MAJOR** | 1.2.0 → 2.0.0 | 存在破坏性变更（API / Schema / DB） |
| **BETA / RC** | 1.3.0 → 1.3.0-beta.1 | 实验性版本，不承诺兼容性 |

---

## 🧩 五、API 兼容性策略

### 1️⃣ 可兼容的变更

| 允许操作 | 示例 | 说明 |
|-----------|------|------|
| 新增可选字段 | `POST /contacts { nickname? }` | 老客户端仍可正常工作 |
| 新增响应字段 | `{ id, name, created_at, tags? }` | 新客户端可利用新数据 |
| 新增 Endpoint | `/contacts/export` | 不影响旧接口 |
| 修改字段描述 | `description` 改写 | 文档层变更 |

### 2️⃣ 非兼容的变更（应 MAJOR 升级）

| 禁止操作 | 示例 | 原因 |
|-----------|------|------|
| 删除字段 | `email` 被移除 | 老请求失效 |
| 修改字段类型 | `int → string` | Schema 校验失败 |
| 修改字段语义 | `status` 含义不同 | 客户端逻辑出错 |
| 更改路径或动词 | `/user` 改 `/account` | SDK 不兼容 |

---

## 🧠 六、Schema 兼容策略（结合 IO Schema）

> 对应《IO_Schema_and_Validation.md》中的 JSON Schema 文件。  

| 操作 | 兼容性 | 策略 |
|------|----------|--------|
| 新增可选字段 | ✅ 向后兼容 | `required` 不应增加 |
| 新增必填字段 | ❌ 破坏性变更 | 改为可选或设默认值 |
| 修改类型 | ❌ 破坏性变更 | 新增新字段替代旧字段 |
| 字段弃用 | ✅ 临时兼容 | 添加 `"deprecated": true"` |
| 调整枚举 | ⚠️ 部分兼容 | 仅新增枚举值是安全的 |
| 移除字段 | ❌ 不兼容 | 新版本需 MAJOR 升级 |

示例：

```json
{
  "properties": {
    "source": {
      "type": "string",
      "enum": ["manual", "import", "form"],
      "deprecated": true
    },
    "origin": {
      "type": "string",
      "enum": ["manual", "import", "api"]
    }
  }
}
```

---

## 🧱 七、数据模型与迁移兼容性

插件升级时数据库迁移应遵循：

| 操作    | 兼容性 | 建议                |
| ----- | --- | ----------------- |
| 新增列   | ✅   | 可安全执行             |
| 删除列   | ❌   | 需 MAJOR 版本并提供迁移脚本 |
| 修改列类型 | ⚠️  | 建议新增列 + 数据迁移      |
| 新增索引  | ✅   | 安全操作              |
| 删除索引  | ⚠️  | 评估性能影响            |
| 修改表名  | ❌   | 提供向后视图或别名表        |

示例迁移策略（Goose）：

```sql
ALTER TABLE contacts ADD COLUMN nickname VARCHAR(128);
-- instead of DROP COLUMN email, use rename or leave deprecated
```

---

## 🧩 八、事件兼容性（Event Contract）

事件定义文件：`contracts/events.yaml`

兼容规则：

- `topic` 不可修改；
- `payload` 可增加字段；
- 不可删除字段或改变类型；
- 推荐使用命名版本前缀：
  `crm.v1.events.ContactCreated` → `crm.v2.events.ContactCreated`

宿主 PowerX 会在订阅时自动区分事件版本并路由。

示例：

```yaml
publish:
  - id: crm.v1.events.ContactCreated
    schema: ./contracts/events/crm.v1.events.ContactCreated.json
  - id: crm.v2.events.ContactCreated
    schema: ./contracts/events/crm.v2.events.ContactCreated.json
```

---

## 🧩 九、RBAC 与权限兼容策略

| 操作        | 是否兼容 | 说明                  |
| --------- | ---- | ------------------- |
| 新增权限      | ✅    | 需同步更新 manifest.rbac |
| 移除权限      | ❌    | 老角色可能失效             |
| 修改权限名     | ❌    | 会破坏绑定关系             |
| 新增 Action | ✅    | 向后兼容                |
| 改变资源层级    | ❌    | 需 MAJOR 升级          |

PowerX 宿主在插件升级时会自动检测 `rbac.resources` 的 diff：

```bash
[WARNING] Resource 'crm.contact' removed; may break role bindings.
```

---

## ⚙️ 十、配置项与环境变量兼容性

| 操作    | 兼容性 | 策略               |
| ----- | --- | ---------------- |
| 新增配置项 | ✅   | 添加默认值            |
| 修改默认值 | ⚠️  | 应公告变更            |
| 删除配置项 | ❌   | 提供迁移机制或 fallback |
| 修改键名  | ❌   | 旧配置失效            |
| 类型改变  | ❌   | 应保留旧字段并映射新字段     |

示例：

```json
{
  "properties": {
    "ENABLE_SYNC": { "type": "boolean", "default": true },
    "SYNC_INTERVAL": { "type": "integer", "default": 60, "deprecated": true }
  }
}
```

---

## 🧩 十一、自动兼容性检测流程（CI）

建议在插件仓库中集成以下检查：

```bash
make check-compat
```

CI 检查逻辑：

1. 对比上个发布版本的 `manifest.yaml`；
2. 检查以下变化：

   - [ ] API 接口路径、方法、字段；
   - [ ] JSON Schema 属性差异；
   - [ ] DB migration 文件变更；
   - [ ] RBAC 权限定义；
   - [ ] 事件契约差异；
3. 若发现破坏性变更 → 阻止发布或强制要求 MAJOR bump。

可使用工具：

- [`openapi-diff`](https://github.com/OpenAPITools/openapi-diff)
- [`json-diff`](https://www.npmjs.com/package/json-diff)
- [`schemalint`](https://github.com/stoplightio/spectral)
- 自研脚本：比较上版本 `manifest.yaml` 与当前版本。

---

## 🧩 十二、向后兼容迁移模式（Bridge / Adapter）

当必须引入 Breaking Change 时，可提供桥接层：

```
┌───────────────────────┐
│ Old API (v1)          │
│   POST /contacts       │
│   -> redirects to v2   │
│   -> adapts body       │
└───────────────────────┘
        ↓
┌───────────────────────┐
│ New API (v2)          │
│   POST /v2/contacts    │
│   strict validation    │
└───────────────────────┘
```

> 建议保留旧版本一段过渡期，并在 manifest.lifecycle 中声明 `deprecated_at` / `sunset_at`。
> （参见 [Deprecation_and_Sunset_Policy.md](../01_plugin_lifecycle/Deprecation_and_Sunset_Policy.md)）

---

## 🧱 十三、兼容性文档与公告模板

每个插件升级版本应附带兼容性声明文件：

路径：`docs/releases/vX.Y.Z/compatibility.md`

```markdown
# 兼容性声明（v1.3.0 → v1.4.0）

## 保持兼容的变更
- 新增字段：`contact.nickname`
- 新增事件：`crm.v1.events.ContactMerged`

## 破坏性变更
- 删除字段：`contact.email_verified`（请改用 `status`）
- 删除旧权限：`crm.contact.export`（由 `crm.contact.download` 取代）

## 迁移建议
执行脚本：
```bash
make migrate-v1.4.0
```

---

## 🧩 十四、最佳实践

- 任何 Breaking Change 必须经过评审；
- 迁移脚本应可回滚；
- manifest 中版本必须与 Schema 版本同步；
- 提供 `deprecated` 字段说明；
- 在插件内保留一层兼容适配；
- Marketplace 上新版本发布前必须通过 `compat-check`；
- 所有能力（Capability）必须明确版本号（v1/v2）。

---

## 📚 延伸阅读

- [Capability_Design_Guide.md](./Capability_Design_Guide.md)
- [IO_Schema_and_Validation.md](./IO_Schema_and_Validation.md)
- [Versioning_and_Publishing.md](../01_plugin_lifecycle/Versioning_and_Publishing.md)
- [Deprecation_and_Sunset_Policy.md](../01_plugin_lifecycle/Deprecation_and_Sunset_Policy.md)
- [03_runtime_and_ops/Runtime_Env_and_Ports.md](../03_runtime_and_ops/Runtime_Env_and_Ports.md)

---

> **文档版本：** v1.0.0  
> **适用范围：** PowerX ≥ 0.9.0  
> **维护团队：** PluginBase 核心组  
> **最后更新：** 2025-10
