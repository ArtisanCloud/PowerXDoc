# PowerX 多仓规范聚合方案（共用 vs. 仓内专属）

## 目标

- 梳理 `docs/standards/` 现有的四个仓专属目录（`powerx`, `powerx`, `powerx-plugin`, `powerx-marketplace`）与 `_shared/` 的关系。
- 提炼通用规范，沉淀到 `_shared/`，以便所有仓共同引用；同时确保各仓独有内容仍留在各自目录。
- 为后续迁移与 PR 提供操作清单和注意事项。

## 当前目录结构概览（节选）

```
docs/standards/
├─ _shared/
│  ├─ cli-install-and-naming.md
│  └─ downstream-readonly-setup.md
├─ powerx/
│  ├─ grpc/
│  ├─ integration/
│  ├─ plugins/
│  ├─ iam/
│  └─ ...
├─ powerx/
│  ├─ plugins/
│  ├─ security/
│  ├─ i18n/
│  ├─ ...
├─ powerx-plugin/
│  ├─ lifecycle/
│  ├─ integration/
│  ├─ security/
│  └─ ...
└─ powerx-marketplace/
   ├─ plugin-development.md
   ├─ security/
   ├─ telemetry/
   └─ ...
```

## 可抽取到 `_shared` 的通用主题

| 主题 | 拟迁移内容 | `_shared` 目标位置 | 各仓保留内容 |
|------|------------|--------------------|--------------|
| 安全与权限基线 | `powerx/integration/05_security/**`, `.../iam/**`, `powerx-plugin/integration/04_security_and_compliance/**`, `powerx/security/**`、`auth-and-iam/**`, `powerx-marketplace/security/**` | `_shared/security/`（统一写安全策略、Secrets 管理、RBAC/ABAC、审计要求等） | 各仓补充自身特有的实现/工具，如：Marketplace 的财务或 KYC 安全、Plugin 的 ctx_signing 实操等 |
| Observability / Logging / Telemetry | `powerx-plugin/observability/**`, `.../integration/03_runtime_and_ops/Logs_Metrics_and_Tracing.md`, `powerx/error-and-observability/**`, `powerx-marketplace/telemetry/**`, backend 的监控说明 | `_shared/observability/`（统一指标命名、告警策略、Trace/Request ID 透传、仪表盘规范） | 各仓记录自身额外的面板、告警、事件说明 |
| 国际化 & 本地化 | `powerx/i18n/**`, `powerx-plugin/deploy/local_debug.md`, `powerx-plugin/plugins/i18n.md`, Marketplace 的多语言要求 | `_shared/i18n-localization.md`（统一语言资源结构、时区处理、翻译流程） | 仓内保留特有翻译工具或语言包例子 |
| 发布 / 版本 & 生命周期 | `powerx-plugin/lifecycle/**`, `powerx/plugins/*.md`, `powerx-marketplace/plugin-development-release.md`, `powerx/build-and-deploy/**` | `_shared/release-governance/`（定义版本号策略、审批流程、回滚原则、变更冻结等） | 仓内保留 CI/CD 实现细节、命令脚本或部署管道 |
| API / Contract 约束 | `powerx/integration/02_capability/**`, `03_registry_router/**`, `powerx-plugin/integration/01_plugin_lifecycle/Manifest_and_Metadata.md`, Marketplace vendor API 规范等 | `_shared/api-contracts/`（统一接口版本策略、Schema 验证、兼容性测试流程、事件命名等） | 仓内保留自身具体 API 列表、样例文件或生成脚本 |
| CLI & 文档治理 | 现有 `_shared/cli-install-and-naming.md`、`downstream-readonly-setup.md` 已涵盖纯推送、CLI 命名，可保留并扩展至 `_shared/governance/` | `_shared/governance/` 可进一步整理分发流程、审计报告要求 | 各仓继续引用共用策略，无需重复描述 |

## 保留在各仓目录的专属内容

- `powerx/`：宿主核心功能、Orchestrator、STS 流程、知识库/媒体模块等实现细节。
- `powerx-plugin/`：插件脚手架、目录结构、打包/发布命令、PluginBase 说明。
- `powerx/`：前端 UI 指南、组件库、性能/实时策略、Nginx 配置等。
- `powerx-marketplace/`：供应商上架、财务结算、审核与申诉、运营手册等。

## 迁移步骤建议

1. **为 `_shared` 新建主题目录**（如 `security/`, `observability/`, `release-governance/`, `api-contracts/`, `i18n-localization/` 等），每个目录内编写统一规范或索引文档。
2. **移动或拆分文件**：
   - 提取共用片段：把各仓重复出现的通用指南搬到 `_shared/`，仓内文档改写为“遵循 `_shared/...`，此处补充仓内差异/实现”。
   - 对于完全通用的章节可直接移动至 `_shared/` 并在原位置添加引用或链接。
3. **更新引用**：
   - 场景文档、指南、脚本内若引用了旧路径（例如 `docs/standards/powerx/...`），需同步改为新 `_shared` 位置。
   - 更新 `docs/meta/cross-repo-documentation.md` 中对 `docs/standards` 目录的描述，新增公用规范主题。
4. **同步 `_shared` 分发逻辑**：
   - `docs/_data/standards-map.yaml` 默认已经把 `_shared/**` 分发到所有仓，无需额外操作。
   - 迁移后执行 `npm run publish:standards -- --dry-run` 验证 diff 是否仅包含预期文件。
5. **PR 与通知**：
   - 在 PowerXDocs 提交 PR，清晰列出“抽出的共用规范 + 各仓保留内容”。
   - 同步通知下游仓负责团队，说明 `_shared` 的新增目录及引用指南。

## 后续拓展

- 多仓实践中若出现新的共性主题（例如数据脱敏、应急演练、三方合规），可继续在 `_shared` 下扩展目录。
- 子仓文档可通过自定义 Frontmatter 或尾部链接，显式指向 `_shared` 的配套规范，提高维护一致性。

