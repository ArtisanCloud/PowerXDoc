# 场景模板规范（docs/standards/scenarios）

本目录保存跨仓场景（SCN）的“唯一母版”——它定义了 PowerXDocs 主用例的结构、元数据字段及写作要求。所有 `docs/scenarios/SCN-*.md` 都应以 `_template.md` 为起点，确保站点渲染、分发脚本与 docmap 校验具有可预测的数据结构。

## 模板设计原则

1. **多仓协同显式化**：通过 `repos`、`layers`、`domains` 等字段，把前后端/插件/市场等责任仓库一次性列清，便于自动化和治理。
2. **子用例映射**：`related_usecases` 对应 `docs/usecases-seeds/<scope>/<layer>/<domain>/` 的子用例模板 ID，发布脚本可据此生成 `_collected` 卡片、验证 docmap 关系。
3. **业务 + 运维一体**：正文同时覆盖业务目标、跨仓流程、契约、验收标准及可观测性指标，满足研发、QA、运维与领导看板的多方诉求。
4. **可机器读取**：Frontmatter 完全由结构化字段构成，使 `publish-ai.mjs`、`workflow-metrics` 等脚本能提取元数据、校验一致性。

## `_template.md` 结构概览

| 区块 | 内容要点 | 目的 |
|------|----------|------|
| Frontmatter | `scn_id`、`owners`、`domains`、`layers`、`repos`、`related_usecases` 等 | 供脚本与 docmap 校验使用 |
| Executive Summary | 业务价值、目标角色、成功标准 | 让读者快速了解场景意义 |
| Scope & Guardrails | In/Out Scope、环境假设 | 明确边界与依赖条件 |
| Participants & Responsibilities | 按 scope/layer 列出责任仓库与负责人 | 支撑跨仓协作与审计 |
| End-to-End Flow | 分阶段描述多仓流程，可附时序图 | 统一叙述跨仓联动细节 |
| Key Interactions & Contracts | API、事件、配置、合规要点 | 指明契约与安全要求 |
| Usecase Links | 映射子用例模板与自有文档 | 连接 `_from_hub` 模板与下游自有用例 |
| Acceptance Criteria | 验收条目、治理检查 | 指导评审与上线标准 |
| Telemetry & Ops | 指标、告警阈值、观测来源 | 支撑运维与回归验证 |
| Open Issues & Appendix | 未决事项、相关 PR、设计稿 | 记录风险与资料索引 |

## 使用流程

1. **起草模板内容**  
   - 阅读 `_template.md`，复制到 `docs/scenarios/SCN-<DOMAIN>-<NNN>.md`。  
   - 填写 Frontmatter 中的 ID、owners、repos、related_usecases 等字段，保持与 `docs/_data/docmap.yaml` 计划一致。

2. **撰写正文**  
   - 按章节补充业务叙述、流程图、契约列表、验收标准与运维要求。  
   - `Participants` 和 `Usecase Links` 中的表格需与 Frontmatter 信息对应，避免脚本校验失败。

3. **注册 docmap**  
   - 在 `docs/_data/docmap.yaml` 中登记 `scn_id`、权重、标签及子用例映射路径。  
   - 如子用例模板尚未生成，先在 `docs/usecases-seeds/<scope>/<layer>/<domain>/` 下创建占位文件，并在相关仓库同步。

4. **发布与验证**  
   - 运行 `npm run publish:scenarios -- --dry-run` 检查渲染结果与 `_collected` 引用。  
   - 核对 `reports/scenarios/` 输出与站点页面，确认元数据、链接、流程图无误后去除 `--dry-run`。

5. **迭代维护**  
   - 若场景逻辑或跨仓职责发生变化，先更新 `_template.md`（如字段新增/调整），再同步所有现有 `SCN-*.md`。  
   - 更新后务必调整 `docmap.yaml`、`related_usecases` 及相应下游用例，保持全链路一致。

---

> 若发现模板无法满足新的业务模型，请先在此目录提议修改（PR），并在 `docs/meta/cross-repo-documentation.md` 记录设计决策，确保所有仓库遵循同一标准。
