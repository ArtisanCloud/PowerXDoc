---
scn_id: "{{SCN_ID}}"
scenario_name: "{{SCENARIO_NAME}}"
slug: "{{SCENARIO_SLUG}}"
primary_scope: "{{PRIMARY_SCOPE}}"
primary_layer: "{{PRIMARY_LAYER}}"
primary_domain: "{{PRIMARY_DOMAIN}}"
primary_repo: "{{PRIMARY_REPO_KEY}}"
doc_owner: "{{DOC_OWNER}}"
last_generated_at: "{{GENERATED_AT}}"
---

# {{SCENARIO_NAME}} Usecase Seed 生成指南

> 场景摘要：{{SCENARIO_SUMMARY}}

本文档面向场景负责人与仓库 Stewards，说明如何把跨仓场景拆解成可交付的子用例 Seed，为分发脚本与研发落地提供基础数据。请根据实际情况补充或修订所有 `{{PLACEHOLDER}}` 字段。

## Seed 的定位

- 代表仓库在 `{{SCENARIO_NAME}}` 场景下需要实现的职责、接口、测试与运维要求。
- 与 `docs/_data/docmap.yaml` 中 `scn_id: {{SCN_ID}}` 的 `children` 节点一一对应，字段必须保持一致。
- 是 `npm run publish:usecases` 分发到下游仓库、`npm run publish:collected` 生成领导力视图的唯一信息来源。

## 前提条件

- 场景文档（如 `{{PRIMARY_SCENARIO_DOC}}`）已经勾勒业务故事线与交付矩阵。
- `docs/_data/docmap.yaml` 中存在待维护场景节点，并为每个仓库预留了 `doc_id`、`scope`、`layer`、`domain`、`repo` 等字段。
- 对应仓库在 `docs/_data/repos.yaml` 中维护了 `usecase_seed_root`、默认分支与维护者信息。

> **TODO**：如果该场景有额外的依赖（脚本、凭据、服务等），请在此列出。

## 生成流程

1. **登记/更新 docmap 子节点**

   ```yaml
   # docs/_data/docmap.yaml
   - scn_id: {{SCN_ID}}
     title: {{SCENARIO_NAME}}
     children:
{{DOCMAP_CHILD_SNIPPET}}
   ```

   - `doc_id` 与 `path` 要匹配未来的 Seed 文件名与下游仓库目录。
   - `optional: true/false` 用于领导力视图与发布脚本过滤，默认必选。

2. **复制模板并放置到对应目录**

   ```bash
   mkdir -p docs/usecases-seeds/{{PRIMARY_SCOPE}}/{{PRIMARY_LAYER}}/{{PRIMARY_DOMAIN}}
   cp docs/usecases-seeds/_template.md \
     docs/usecases-seeds/{{PRIMARY_SCOPE}}/{{PRIMARY_LAYER}}/{{PRIMARY_DOMAIN}}/{{PRIMARY_DOC_ID}}.md
   ```

   - `scope/layer/domain` 目录需与 docmap 中保持一致。
   - 建议把 `doc_id` 嵌入文件名，便于脚本按路径定位。

3. **填充 Frontmatter 区域**

   - `doc_id`、`scn_id`、`scope`、`layer`、`domain` 应与 docmap 完全一致。
   - `repo_key` 使用 `docs/_data/repos.yaml` 的 `key`。
   - `status`、`version`、`owners`、`linked_requirements` 等字段帮助审计和跨团队协作。
   - {{FRONTMATTER_NOTES}}

4. **完善正文章节**

   - `Usecase Overview`：强调业务目标、成功度量、关键摘要。
   - `Context & Assumptions`：列出 Feature Flag、依赖服务、输入输出、边界。
   - `Solution Blueprint`～`Rollback & Failure Handling`：根据仓库实现细节补充流程、接口、测试、运维与风险表。
   - 保持 Markdown 结构与模板一致，移除无用示例，引用实际代码路径/脚本。
   - {{CONTENT_NOTES}}

5. **与场景文档互相链接**

   - 在场景文档的交付矩阵中加入 Seed 文档链接，便于读者往返。
   - 如需提及新的标准或 ADR，请同步更新 `docs/standards/**`。

## 自检清单

- `docmap.yaml` 与 Seed frontmatter 字段完全一致，无大小写或路径差异。
- Seed 正文至少覆盖业务目标、流程分解、接口契约、测试策略与运维计划。
- 内容与结构满足 `.specify/memory/constitution.md` 的四大原则（Role-Driven / Concept-First / Structure-Oriented / Clarity through Visualization），必要时补充角色说明与 mermaid 图。
- 运行 `npm run lint` 与 `npm run docs:build` 确认无语法错误、站点可构建。
- 使用 `npm run publish:scenarios -- --scn-id {{SCN_ID}} --validate-only` 快速验证场景配置无误（可在正式发布前执行）。
- {{ADDITIONAL_SELF_CHECKS}}

## 常见问题

| 问题 | 处理方式 |
|------|----------|
| 脚本提示找不到 Seed | 检查文件路径是否遵循 `scope/layer/domain/doc_id.md`，以及 docmap `path` 是否对齐。 |
| 多仓共享同一实现 | 为每个仓库分别建立 Seed，正文可引用相同的实现模块，但交付/测试列表需针对仓库调整。 |
| 需要新增字段 | 先更新模板与脚本读取逻辑，再批量补齐历史 Seed，避免发布时缺字段。 |
| {{FAQ_ITEM}} | {{FAQ_RESOLUTION}} |

完成上述步骤后，即可进入分发与发布流程，参考《发布 Usecase Seeds 指南》获取后续操作。
