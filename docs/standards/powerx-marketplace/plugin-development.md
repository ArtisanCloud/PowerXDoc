# PowerX 插件开发工作流总览

本文档汇总当前 `px` CLI 与 Marketd 后端的主要开发流程，结合 Quickstart、Testing 指南提供的细节，帮助开发者与运营人员快速定位所需命令。

## 1. 能力契约治理

- 定义契约：在仓库根目录创建 `contracts/<capability>.yaml`，并使用  
  `px --config backend/etc/config.yaml contract validate ./contracts/<capability>.yaml` 校验。
- 发布契约：`px --config backend/etc/config.yaml contract publish ./contracts/<capability>.yaml`。  
  首次发布会产生 `classification: major`，后续按差异自动判定 `minor/patch`，不满足 SemVer 会阻断。
- REST 接口：`POST /internal/plugins/contracts/validate`、`POST /internal/plugins/contracts/publish`、`GET /internal/plugins/contracts/{capability_id}`。

## 2. Manifest & Packaging

1. **脚手架**：`px plugin init github.com/example/payment-plugin`，生成基础目录、`plugin.yaml` 等。
2. **配置 Manifest**：使用  
   `px plugin manifest scaffold --plugin-id vendor.demo --vendor-id <UUID> --capability capability@version --out plugin.yaml` 生成模板；  
   可配合 `px plugin manifest validate --manifest plugin.yaml` 做本地校验。
3. **构建产物**：`px plugin build --manifest plugin.yaml --workspace workspace --out dist`，确保输出 `.pxp` 与 digest。
4. **封装 & 重复性校验**：`px plugin package --manifest plugin.yaml --workspace workspace --out dist`，多次执行 digest 应一致。
5. **签名**：`px plugin sign --artifact dist/<artifact>.pxp --signer local-dev` 生成 `<artifact>.sig.json`。
6. **发布**：  
   ```bash
   px plugin publish \
     --manifest plugin.yaml \
     --artifact dist/<artifact>.pxp \
     --signature dist/<artifact>.pxp.sig.json \
     --version 1.0.0 \
     --channel beta
   ```
7. **REST 接口**：  
   - Manifest：`POST /internal/plugins/manifests/validate`、`POST /internal/plugins/manifests`、`POST /internal/plugins/manifests/artifacts`  
   - 查询：`GET /internal/plugins/manifests/{plugin_id}`

## 3. 传输适配层与兼容性矩阵（US3）

- 生成适配器：  
  ```
  px plugin transport generate --type http
  px plugin transport generate --type grpc
  px plugin transport generate --type mcp
  ```
- 兼容性检查：准备 `transport-report.json`，示例如下：
  ```json
  [
    {"capability_id": "payments.transfer", "transport_type": "http", "probes_covered": true}
  ]
  ```
  执行 `px plugin transport check --manifest plugin.yaml --report transport-report.json`，CLI 会打印各 capability/transport 的状态。
- REST 接口：`POST /internal/plugins/transports/compatibility` 上传报告；`GET /internal/plugins/transports/compatibility/{plugin_id}` 查看最新矩阵。

## 4. 安全扫描与合规（US4）

1. **缓存管理**：`px plugin security cache --refresh` 在本地更新/初始化扫描缓存目录（默认 `.cache/plugin-security`）。
2. **处理扫描结果**：准备 `security-scan.json`：
   ```json
   {
     "artifact_id": "<artifact-uuid>",
     "scan_tool": "trivy",
     "scan_version": "1.0.0",
     "findings": [
       {"id": "CVE-0001", "severity": "high", "summary": "样例高危漏洞"}
     ]
   }
   ```
   调用 `px plugin security scan --input security-scan.json`。若发现 High / Critical 且无豁免，将返回错误并阻断发布。
3. **查看报告**：`px plugin security report --artifact <artifact-uuid>` 输出最新扫描摘要。
4. **REST 接口**：`POST /internal/plugins/security/reports` 上报扫描结果；`GET /internal/plugins/security/reports/{artifact_id}` 获取最新报告。

## 5. 沙箱测试

- Runner 保证 `Setup → Run → Teardown` 顺序执行。CLI 后续将统一到  
  `px plugin test --sandbox --sandbox-config <config>`。当前可直接调用服务层或借助测试用例。
- 参见 `backend/tests/plugins/sandbox/sandbox_runner_test.go` 的场景以了解如何在失败后依旧执行 Teardown。

## 6. 观测与审计

- 所有 CLI/HTTP 操作均调用 `telemetry.PluginMetrics` 计数、失败统计，并通过 `audit.RecordPlugin` 写入审计表；日志携带 `plugin_id/capability_id`。
- 传输矩阵、扫描服务的指标名称：
  - `transport_matrix`
  - `security_scan`
  - `manifest_validate`
  - `plugin_build` 等

## 7. 配置摘要

`backend/etc/config.yaml` 中 `plugins` 区段包含以下重要设置：

- `artifact_prefix` / `cas_prefix`：S3/MinIO 目标路径
- `feature_flags.enforce_security_gates`：当置为 `true` 时，安全扫描失败会阻断 `px plugin publish`
- `security.severity_block_level`：允许的最高严重级别（默认 `high`，即 High 及以上阻断）
- `security.cache_directory`：离线缓存路径
- `sandbox.cleanup_timeout_minutes`：沙箱超时时间

更新配置后，建议重新运行 `px plugin security cache --refresh` 与相关 CLI 命令以验证流程。

## 8. 汇总命令速查表

| 场景 | 命令示例 |
|------|----------|
| 契约校验/发布 | `px contract validate/publish` |
| Manifest 校验 | `px plugin manifest validate --manifest plugin.yaml` |
| Build/Package | `px plugin build --manifest plugin.yaml --workspace workspace --out dist` |
| 签名 | `px plugin sign --artifact dist/<artifact>.pxp --signer local-dev` |
| 发布 | `px plugin publish --manifest plugin.yaml --artifact dist/<artifact>.pxp --signature dist/<artifact>.pxp.sig.json --version 1.0.0 --channel beta` |
| 传输适配生成 | `px plugin transport generate --type http` |
| 兼容性校验 | `px plugin transport check --manifest plugin.yaml --report transport-report.json` |
| 安全扫描 | `px plugin security scan --input security-scan.json` |
| 查看安全报告 | `px plugin security report --artifact <artifact-uuid>` |
| 初始化缓存 | `px plugin security cache --refresh` |

如需更多细节，请结合 `specs/002-plugin-development/quickstart.md` 与 `docs/vendor/02_plugin_development/Testing_and_Sandbox.md` 执行完整流程。

## 9. 目录规范

### 后端（backend/）

```
backend/
├── api/                # OpenAPI/contract 描述（仅开放 openapi.yaml）
├── cmd/                # Go entrypoints，限定为：
│   ├── marketd/        # 主服务进程
│   ├── database/       # 迁移、导入、清理工具
│   └── px/             # CLI 封装（复用 backend/internal/cli）
├── internal/           # 分层模块化实现
│   ├── config/         # 配置定义与加载
│   ├── http/           # Gin handler/middleware/router
│   │   ├── handler/
│   │   ├── middleware/
│   │   ├── router/
│   │   └── licensing/  # 新增：许可证与定价相关 HTTP 层
│   ├── services/       # 应用服务层
│   │   ├── plugins/
│   │   └── licensing/  # 新增：许可证/计费领域服务
│   ├── repo/           # 数据访问仓储
│   │   ├── onboarding/
│   │   ├── plugins/
│   │   └── licensing/  # 新增：许可证/计费仓储
│   ├── storage/        # MinIO/S3 适配
│   └── telemetry/      # 监控、日志、追踪
├── migrations/         # Goose/Atlas 等迁移脚本
├── tests/              # Go 集成与契约测试
│   ├── onboarding/
│   ├── plugins/
│   └── licensing/      # 新增：许可证/计费测试
└── tmp/                # 开发期缓存（禁止提交业务代码）

backend/internal/cli/   # CLI 子命令声明，必须被 backend/cmd/px 引用
```

约束说明：
- 仅允许在上述节点下新增子目录；新增领域需同时补齐 `http/services/repo` 三层。
- 禁止在 `backend/` 根目录引入附加可执行入口；命令型工具统一归档到 `backend/cmd`.
- 领域内的数据模型放入 `backend/internal/domain/...`，引用时遵循现有分层依赖顺序：`repo → services → http`.

### 前端（web-admin/）

```
web-admin/
├── app/                       # Nuxt 源码根目录（srcDir 指向此处）
│   ├── components/            # UI 组件
│   ├── layouts/               # 布局定义
│   ├── pages/                 # 路由页面
│   ├── composables/           # 组合式逻辑封装
│   ├── stores/                # Pinia 状态
│   ├── plugins/               # Nuxt 插件
│   ├── locales/               # i18n 资源
│   ├── app.vue                # 根组件
│   └── assets/                # 样式、图标等静态资产
├── tests/
│   ├── e2e/                   # 端到端用例
│   └── unit/                  # 组件单测
├── public/                    # 静态资源
└── scripts/                   # 开发工具脚本（需保持无状态）
```

约束说明：
- 使用 `npx nuxi@latest init web-admin` 初始化项目（脚手架当前仍处于 3.x 版本），随后将 `package.json` 中的 `nuxt` 依赖提升至公司要求的版本（例如 `"nuxt": "^4.0.3"`），再运行 `npm install`/`pnpm install` 同步依赖。
- `nuxt.config.ts` 必须设置 `export default defineNuxtConfig({ srcDir: 'app' })`，并将所有源码目录（`components/`, `pages/`, `composables/`, `stores/`, `plugins/` 等）置于 `app/` 下，符合 Nuxt 4 推荐结构。
- API 访问逻辑统一封装在 `app/composables/` 或 `app/stores/`，复用抽象的 `useMarketplaceApi`，避免页面组件中直接发起 HTTP 请求。
- 测试与文档放在对应 `tests/` 与 `docs/` 目录，严禁将测试脚本混入业务代码。

## 10. License & Pricing Workflows

Feature 004 引入了完整的许可证与计费链路，建议运营/研发按照下列步骤完成一次端到端演练（对应 Quickstart §6~6a，可用 `go test ./backend/tests/licensing` 做快速校验）。

### 10.1 模板管理

- 创建：`px license template create --code sub-seat --display-name "Seat License" --license-type subscription --binding seat`
- 列表：`px license template list --status active --binding seat`
- 克隆开发者/教育模板：`px license template clone <template-id> --code sub-seat-dev --type developer`（系统会自动标记 `sandbox_allowed=true`、`metadata.channel=developer` 并扩展离线宽限）。

### 10.2 定价计划

- 创建：
  ```bash
  px license plan create \
    --template sub-seat \
    --name ProMonthly \
    --cadence monthly \
    --currency USD \
    --base-amount 49 \
    --free-tier-limit 5
  ```
- 发布：`px license plan publish --plan <plan-id> --target-status active`，或先进入 `beta` 渠道收集灰度反馈。

### 10.3 许可证签发与激活

- 签发：`px license instance issue --template-id <template-id> --plan-id <plan-id> --tenant-id <tenant-uuid> --binding-target <seat-id>`
- 激活：`px license instance activate --license-id <license-id> --fingerprint $(uuidgen)`
- 对 `developer/education` 模板无需显式 `--sandbox`，服务会自动开启 sandbox 并写入 `metadata.catalog_visibility=sandbox`、`metadata.channel`，便于后续过滤与非计费统计。

### 10.4 对账与提醒

- `/internal/licensing/licenses/reconciliation` 提供分页对账数据，可结合 `pricing_plan_id`、`event_type` 过滤导出财务报表。
- `licensing.reminders` 定时任务默认每日运行一次，对即将在 14/3 天后到期的开发者/教育许可证推送：
  - Notification Center topic `licensing.license.renewal`（续订提醒）
  - topic `licensing.license.compliance`（并发/指纹守卫触发）
- Grafana/Chronosphere 可导入 `backend/internal/telemetry/dashboards/licensing.json`，配合 OpenTelemetry 导出的 `licensing_validation_status_total`、`licensing_compliance_violations_total`、`notification_dispatch_total{topic=~"licensing.*"}` 指标设置 SLA 与告警阈值。

### 10.5 API 对照表

| 能力 | Endpoint |
|------|----------|
| 模板 CRUD | `/internal/licensing/templates` + `/internal/licensing/templates/:id/(clone|deprecate)` |
| 计划创建/发布 | `/internal/licensing/plans`、`/internal/licensing/plans/:id/publish` |
| 许可证生命周期 | `/internal/licensing/licenses`、`/internal/licensing/licenses/:id/(activate|transfer|renew)` |
| 对账数据 | `/internal/licensing/licenses/reconciliation` |

以上 CLI/API 与 Quickstart 一致，建议在本地完成一次“模板→计划→许可证→提醒”的演练，确保环境、配置与通知通道均正确联动。
