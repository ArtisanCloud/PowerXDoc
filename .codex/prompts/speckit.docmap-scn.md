---
description: Derive docmap children entries from a scenario document.
---

## User Input

```text
$ARGUMENTS
```

解析用户输入，至少需要：
- `SCN_ID`（必填）或显式的 `--scenario` 路径
- 可选参数：`--yaml`、`--json`、`--docmap`、`--repos` 等

若缺少 `SCN_ID`/场景路径，请先向用户确认。

## Outline

1. **运行脚本**
   - 调用 `.specify/scripts/bash/derive-docmap-from-scenario.sh --scn-id <ID> --json`（根据用户输入追加其他参数）。
   - 解析 JSON 输出，获取 `children`、`warnings`、`yaml` 片段等信息。

2. **整理结果**
   - 将生成的 `children` 与现有 `docs/_data/docmap.yaml` 中的内容进行对比（如有 `--docmap` 提供，可读取做校对）。
   - 提醒用户检查脚本的 `warnings`（例如无法匹配仓库、缺少 layer/domain）。

3. **反馈给用户**
   - 输出推荐的 YAML 片段，说明其对应的 `scn_id`、`children` 列表以及推断出的 `repo`/`scope`/`path`。
   - 若存在未解决的 `warnings`，需在结果中明确指出并给出建议处理方式。

## Output

- 汇总生成的 YAML 片段，方便用户粘贴到 `docs/_data/docmap.yaml`。
- 列出每个 child 的解析细节（doc_id、repo、scope、layer、domain、path、optional）。
- 标注所有 `warnings` 或需要人工确认的数据。 
