# 🧩 Versioning & Update 插件版本管理与更新机制

> 本文档定义 **PowerX Plugin Marketplace** 插件的版本规范、兼容性策略、更新发布流程与灰度回滚机制。  
> 目标：确保插件的版本升级过程可追踪、可回滚、可验证、可兼容，保障生态稳定。

---

## 🧱 1. 设计目标

| 目标 | 说明 |
|------|------|
| **规范化** | 所有插件版本必须遵循语义化版本 (SemVer) |
| **可回溯** | 每个版本具备唯一签名与构建指纹 |
| **可兼容** | 新版本升级不破坏旧功能与数据 |
| **可验证** | CoreX 与 Marketplace 双向验证版本一致性 |
| **可灰度** | 支持渐进式发布与回滚控制 |

---

## 🧩 2. 语义化版本规范（SemVer）

版本号格式：

```

MAJOR.MINOR.PATCH[-label]

```

| 字段 | 说明 | 示例 |
|------|------|------|
| **MAJOR** | 破坏性变更（API 不兼容） | `1.0.0 → 2.0.0` |
| **MINOR** | 向下兼容的新功能 | `1.0.0 → 1.1.0` |
| **PATCH** | Bug 修复，无接口变更 | `1.1.0 → 1.1.1` |
| **-label** | 预发布标记（beta/rc） | `1.2.0-beta.2` |

> 🚨 注意：任何 MAJOR 版本变更必须重新提交完整审核流程。

---

## ⚙️ 3. 版本元数据定义

在 `plugin.yaml` 中：

```yaml
id: com.vendor.analytics
name: DataForge Analytics
version: 1.2.0
manifest_version: 1.1.0
compatibility:
  corex_min: 1.0.0
  corex_max: 2.0.0
  backward_compatible: true
build:
  commit: a7d9e12
  date: 2025-10-13T09:00:00Z
  signature: ./dist/com.vendor.analytics-1.2.0.sig
```

---

## 🔁 4. 向后兼容性策略（Backward Compatibility）

### 4.1 范围定义

| 范围          | 说明              | 要求                     |
| ----------- | --------------- | ---------------------- |
| **API 接口层** | HTTP/gRPC 调用协议  | 不删除旧接口参数；新接口需保持兼容      |
| **数据结构层**   | 数据表 / Schema    | 仅允许新增字段；禁止 DROP/RENAME |
| **配置层**     | 插件配置项与环境变量      | 新增项需有默认值               |
| **事件层**     | EventBus 事件结构   | 字段新增、顺序变动允许；删除禁止       |
| **权限层**     | Role / Scope 定义 | 不得移除旧权限；新权限标记为可选       |

### 4.2 声明方式

```yaml
compatibility_policy:
  api: backward
  schema: additive-only
  config: default-safe
  events: compatible
```

### 4.3 兼容性检测机制

CoreX 在加载插件时自动执行 “Contract Diff”：

| 检查项           | 检测方式                  | 结果           |
| ------------- | --------------------- | ------------ |
| Manifest 版本差异 | 对比 `manifest_version` | 若不匹配 → 警告    |
| Schema 变更     | 分析 Migration SQL      | 若 DROP → 阻止  |
| API 变更        | Diff OpenAPI / Proto  | 若字段缺失 → 提醒   |
| 权限映射          | 比对 Role Scope         | 若缺失旧项 → 拒绝发布 |

---

## 🧩 5. 更新与发布流程

标准流程：

```
build → sign → validate → upload → review → publish
```

| 阶段           | 说明            | 执行方           |
| ------------ | ------------- | ------------- |
| **Build**    | 构建插件产物        | Makefile / CI |
| **Sign**     | 生成签名文件 `.sig` | Vendor        |
| **Validate** | 自动校验结构与安全     | Marketplace   |
| **Upload**   | 提交审核          | Vendor        |
| **Review**   | 审核验证 / 安全扫描   | 审核团队          |
| **Publish**  | 发布上线 / 进入灰度   | 系统自动          |

---

## 🧰 6. 渠道与灰度发布（Channel & Rollout）

| 渠道         | 说明    | 可见性         |
| ---------- | ----- | ----------- |
| **stable** | 稳定版   | 全量用户        |
| **beta**   | 测试版   | 白名单租户       |
| **alpha**  | 内部实验版 | 仅 Vendor 内部 |
| **lts**    | 长期支持版 | 企业客户专用      |

```yaml
rollout:
  enabled: true
  strategy: staged
  stages:
    - name: stage1
      tenants: [internal-lab]
      percent: 10
      duration_hours: 24
    - name: stage2
      percent: 50
      duration_hours: 48
```

---

## 🔄 7. 回滚与版本恢复（Rollback）

### 7.1 触发条件

* 用户反馈严重故障；
* 兼容性检测失败；
* 安全扫描命中漏洞；
* 灰度阶段异常率 > 阈值。

### 7.2 回滚流程

1. Vendor 在 Portal 触发回滚；
2. Marketplace 更新当前活跃版本；
3. CoreX 卸载新版本并加载旧版本；
4. 写入事件日志 `plugin.rollback.event`。

### 7.3 Makefile 示例

```makefile
rollback:
 @echo "🔁 Rolling back to $(VERSION_PREV)"
 curl -X POST https://marketplace.powerx.dev/api/v1/plugins/revert \
   -d '{"plugin_id":"$(PLUGIN_ID)","target_version":"$(VERSION_PREV)"}'
```

---

## 🧾 8. 数据迁移与兼容更新

| 场景        | 要求                                   |
| --------- | ------------------------------------ |
| Schema 变更 | 必须提供 Migration 文件（不可破坏）              |
| 配置更新      | 新旧配置可共存一个版本周期                        |
| 权限扩展      | 新权限默认禁用，由租户激活                        |
| 数据迁移脚本    | 放置于 `/migrations/V2025_10_13_01.sql` |
| 文档        | 在 `docs/migration/` 中提供升级说明          |

---

## ⚙️ 9. 插件运行环境概要（Runtime Summary）

> ⚠️ 以下为版本运行期的概要要求（详细参见 CoreX Docs）。

| 项目       | 说明                                               |
| -------- | ------------------------------------------------ |
| **运行模式** | process（默认）/ container / inline                  |
| **端口范围** | 9000–9599 动态分配                                   |
| **环境变量** | CoreX 注入 `PLUGIN_ID`, `TENANT_ID`, `PLUGIN_PORT` |
| **资源限制** | 默认 512Mi / 500m CPU，可在 plugin.yaml 声明            |
| **健康检查** | `/health` 返回 `{status: ok}`                      |
| **日志输出** | `/var/log/powerx/plugins/<plugin_id>.log`        |

---

## 🧠 10. 审核策略与状态机（Update Review）

| 更新类型  | 是否需人工复核 | 自动发布 | 是否强制兼容    |
| ----- | ------- | ---- | --------- |
| PATCH | ❌       | ✅    | ✅         |
| MINOR | ✅ 快速通道  | ✅    | ✅         |
| MAJOR | ✅ 全审核   | ❌    | ⚠️ 可破坏性更新 |
| 安全修复  | ✅ 优先    | ✅    | ✅         |
| 灰度推送  | ✅       | ✅    | ✅         |

---

## 🧩 11. 版本日志规范（CHANGELOG）

每次发布必须更新 `docs/CHANGELOG.md`：

```markdown
## [1.2.0] - 2025-10-13
### Added
- 新增图表分析模板
- 支持多租户分组数据汇总
### Fixed
- 修复 CSV 导出编码错误
```

> `CHANGELOG.md` 是 Marketplace 审核时的必查项。

---

## 🧰 12. 开发者 Makefile 模板

```makefile
# 构建
build:
 go build -o backend/bin/plugin backend/cmd/plugin/main.go

# 安全签名
sign:
 openssl dgst -sha256 -sign keys/private.pem -out dist/$(PLUGIN_ID)-$(VERSION).sig dist/$(PLUGIN_ID)-$(VERSION).tar.gz

# 发布
publish:
 make build sign
 curl -F "plugin_file=@dist/$(PLUGIN_ID)-$(VERSION).tar.gz" \
      -F "signature=@dist/$(PLUGIN_ID)-$(VERSION).sig" \
      https://marketplace.powerx.dev/api/v1/plugins/upload
```

---

## 🪶 13. 最佳实践

| 类别            | 建议                        |
| ------------- | ------------------------- |
| **版本命名**      | 严格遵循 SemVer               |
| **兼容性**       | 新旧接口并存至少一个版本周期            |
| **回滚准备**      | 始终保留上一个稳定版本               |
| **灰度验证**      | 逐步放量（10% → 50% → 100%）    |
| **安全审计**      | 每次发布前执行 `make audit`      |
| **Changelog** | 明确记录每个版本的 breaking change |
| **自动测试**      | 使用 CI 测试旧接口兼容性            |

---

## 📘 14. 关联文档

* 👉 [Submission & Review 插件上架与审核流程](./Submission_and_Review.md)
* 👉 [Deprecation & Sunset 生命周期终止策略](./Deprecation_and_Sunset.md)
* 👉 [Security & Validation 插件安全与完整性校验](../02_plugin_development/Security_and_Validation.md)
* 👉 [PowerX Plugin Manifest 对接规范](../06_integration_with_powerx/PowerX_Plugin_Manifest.md)

---

> ✅ **总结一句话：**
> PowerX 插件版本体系的设计理念是：
> **「语义化 → 可验证 → 可兼容 → 可灰度 → 可回滚」**。
> 每次更新都必须在安全、兼容、可追踪的前提下完成，让生态持续稳定迭代。
