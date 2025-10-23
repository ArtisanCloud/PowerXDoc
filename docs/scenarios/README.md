# PowerXDocs 场景（SCN）工作流程

本目录存放通过 PowerXDocs 发布的跨仓场景文档。场景内容的唯一模板源位于 `docs/standards/scenarios/_template.md`，请勿在此处拷贝旧模板。

## 目录组织

- 当前发布领域统一使用 `publish/` 子目录，集中管理与插件发布、安装相关的全部场景（包括线上流程、离线导入、开发热加载等）。
- 如后续新增其他领域，可增设新的子目录，但需在 `docs/_data/docmap.yaml` 与模板中保持一致。
- 示例结构：
  ```
  docs/scenarios/
  ├─ README.md
  └─ publish/
     ├─ SCN-PUBLISH-001.md
     ├─ SCN-PUBLISH-OFFLINE-001.md
     ├─ SCN-PUBLISH-ONLINE-001.md
     └─ SCN-DEV-HOTLOAD-001.md
  ```

## 编写流程

1. **复制模板**  
   在 `docs/standards/scenarios/_template.md` 复制一份内容到新的 `docs/scenarios/SCN-<DOMAIN>-<NNN>.md` 文件，并填写 Frontmatter 与各章节。

2. **注册 Docmap**  
   在 `docs/_data/docmap.yaml` 中为该场景添加条目，并配置关联的 usecase 子文档元数据。

3. **运行校验与发布**  
   ```bash
   npm run publish:scenarios -- --scn-id SCN-<DOMAIN>-<NNN>
   ```
   - CLI 会执行结构校验、生成 `docs/website/scenarios/` 渲染页，并写入 `reports/scenarios/<workflowId>.json`。
   - 若需重试，可使用报告中提供的 `resumeToken`。

4. **提交与沟通**  
   将场景 Markdown、docmap 变更以及报告一并提交，通知相关仓库负责人进行 review。

## 结构要求

- 章节顺序必须符合模板：Positioning & Goals、Core Capabilities、Architecture Diagram、Acceptance Criteria、Validation Workflow、Related Links、Architecture Diagram。
- Mermaid 图示需描述从草稿到发布的流程，并保持与 `docs/design/cross-repo-documentation.md` 一致。
- 所有外链需指向受控仓库或 PowerXDocs 渲染站点，禁止第三方模板源。
