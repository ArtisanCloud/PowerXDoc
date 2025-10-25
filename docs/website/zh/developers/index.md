---
title: 开发与扩展
---

# 开发与扩展

PowerX 对外提供完整的开发工具链，涵盖 SDK / API、插件脚手架、测试策略与 CI/CD 集成。本章节聚合相关资源，帮助研发团队快速上手并扩展 PowerX 能力。

## SDK / API {#sdk-api}

- [REST & GraphQL 规范](/zh/api-and-specifications/README.md)
- [Webhook 与事件协议](/zh/api-and-specifications/03_registry_router/Capability_Registry_and_Router_Design.md)
- [实时通道与流式接口](/zh/api-and-specifications/04_orchestration/Realtime_Streaming_Gateway.md)
- 国际化与本地化脚手架可参考 `/docs/scripts/localization/` 目录中的工具。

## 插件体系 {#plugin-ecosystem}

- [PowerX Plugin SDK 指南](/zh/guides/PowerX_Plugin_SDK_Guide.md)
- [插件运行时指南](/zh/guides/Plugin_Runtime_Guide.md)
- [开发热加载/调试流程](/zh/guides/Plugin_Test_and_Debug_Guide.md)
- PXIP-001 中描述了统一能力与传输提案，可作为扩展插件协议的基础：[PXIP-001 提案](/zh/pxip/PXIP-001_Unified_Capability_and_Transport_Proposal.md)

## 质量与测试 {#quality-testing}

- 建议为每个插件或服务编写单元、集成与端到端测试；当前指南见 [智能体开发者指南](/zh/guides/Agent_Developer_Guide.md)。
- 内部工作流测试脚本位于 `scripts/qa/`，可结合 `npm run test:workflows` 统一执行。
- Seed 文档中的“Testing Strategy”章节应覆盖关键场景与指标。

## 工具链 {#tooling}

- CLI 工具：`px-plugin`、`px-admin`、`px-market`，以及项目内的 `scripts/publish/*.mjs`。
- CI/CD：推荐在每个仓设置“Seed 拉取 + 用例验证 + docs 构建”流水线，确保多仓同步。
- 发布自动化：`npm run publish:usecases`、`npm run publish:standards`、`npm run publish:collected`。
- Tips：结合 GitHub Actions/内部流水线，实现 PR 检查与多仓分发的自动化。
