---
scn_id: SCN-PUBLISH-001
title: 插件发布后目录同步
status: Draft
---

# Positioning & Goals

覆盖插件发布后多仓同步流程。

# Core Capabilities

- 触发纯 Push 分发
- 校验 docmap 对应关系

# Acceptance Criteria

1. docmap 注册齐全
2. 发布脚本输出报告

# Validation Workflow

| Step | Owner | Tool |
| --- | --- | --- |
| Draft | Steward | Markdown |
| Docmap | Steward | YAML |
| Publish | Ops | CLI |

# Related Links

- docs/usecases-seeds/**
- reports/**

# Architecture Diagram

```mermaid
graph TD
  A[Draft] --> B[Docmap]
  B --> C[Publish CLI]
  C --> D[Website]
```
