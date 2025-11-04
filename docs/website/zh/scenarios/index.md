---
title: 场景与用例导航
---

# 场景与用例导航

PowerX 采用“场景（SCN）+ Usecase Seed”的组合，将业务意图沉淀为可执行的规范，再驱动实现与交付。

## 概述 {#overview}

- **规范驱动**：遵循 GitHub Spec Kit 提出的 [Specification-Driven Development (SDD)](https://github.com/github/spec-kit/blob/main/spec-driven.md)。规范是唯一事实来源，代码、测试与运维脚本都从规范派生。
- **场景讲故事**：场景文档描绘端到端旅程，统一参与者、前置条件、流程节点与验收标准。
- **Usecase Seed 落地**：Seed 把场景拆解成最小交付单元，便于跨团队协作与复用。
- **docmap 统筹**：`docs/_data/docmap.yaml` 维护场景与 Seeds 的映射，是生成、索引与发布的唯一真相源。
- **延伸阅读**：详细操作步骤见《[场景使用流程](/zh/scenarios/usage)》，配合《[场景文档生成指南](/zh/guides/scenarios/scenario-generation)》与《[Usecase Seed 生成指南](/zh/guides/usecases/generate-usecase-seeds)》一起使用。

## 场景列表 {#catalog}

以下是 PowerX 插件生态系统的所有场景文档，按功能分组：

### DEV

- [插件开发与调试主场景](./SCN-DEV-PLUGIN-DEBUG-001) - 插件开发与调试主场景
- [插件创建与工程初始化](./SCN-DEV-PLUGIN-INIT-001) - 插件创建与工程初始化
- [插件发布与上架主场景](./SCN-DEV-PLUGIN-PUBLISH-001) - 插件发布与上架主场景
- [插件版本与兼容性管理主场景](./SCN-DEV-PLUGIN-VERSION-COMPAT-001) - 插件版本与兼容性管理主场景

### 身份认证与权限

- [PowerX 登录与认证](./SCN-IAM-LOGIN-AUTH-001) - PowerX 登录与认证
- [PowerX 多租户与组织管理](./SCN-IAM-MULTI-TENANT-001) - PowerX 多租户与组织管理
- [PowerX 用户与角色管理](./SCN-IAM-USER-ROLE-001) - PowerX 用户与角色管理

### INT

- [插件能力注册与暴露治理闭环](./SCN-INT-PLUGIN-CAPABILITY-001) - 插件能力注册与暴露治理闭环

### 运维与监控

- [PowerX 事件与任务流管理](./SCN-OPS-EVENT-TASKFLOW-001) - PowerX 事件与任务流管理
- [PowerX 插件安装与启停运营](./SCN-OPS-PLUGIN-LIFECYCLE-001) - PowerX 插件安装与启停运营
- [PowerX 系统监控与告警](./SCN-OPS-SYSTEM-MONITORING-001) - PowerX 系统监控与告警

### PUBLISH

- [PowerX 插件开发与分发全链路](./SCN-PUBLISH-HUB-001) - PowerX 插件开发与分发全链路

> **说明**：完整的场景目录请查看 [_catalog.md](./_catalog.md)，该文件由自动生成脚本维护。
