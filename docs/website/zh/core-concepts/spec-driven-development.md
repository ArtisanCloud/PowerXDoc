---
title: 规范驱动开发（SDD）核心理念
description: 介绍 GitHub Spec Kit 的规范驱动开发方法，以及 PowerX 在场景与用例体系中的实践。
---

# 规范驱动开发（SDD）核心理念

> Specification-Driven Development（SDD）= “规范为源，代码为表达”

SDD 由 GitHub [Spec Kit](https://github.com/github/spec-kit/blob/main/spec-driven.md) 提出，核心架构是“规范→计划→实现”。它强调：规范（Specification）是事实来源（source of truth），代码、测试、运维脚本都只是规范的表达形式。

## 为什么要反转“代码至上”

过去我们习惯“先写代码，再补文档”，规范常常滞后甚至消失，导致：

- 需求、设计和实现内容分散，难以追溯；
- 跨团队交接困难，知识逐渐内隐；
- 自动化测试、运维脚本很难跟上业务迭代。

SDD 反转了这个权力结构：规范不再服务代码，代码反而从规范生成。只要规范更新，后续的实施计划与代码都可重新生成或调整。

## SDD 的工作流

1. **需求意图**：产品/业务给出目标，团队与智能体对话，澄清场景、参与者、约束。
2. **撰写规范**：形成结构化、无二义性的规范（包含 Acceptance Criteria、接口契约、测试场景）。
3. **生成计划**：自动生成 Implementation Plan，标明实现步骤、技术选型与验证路径。
4. **产出实现**：根据计划生成代码、测试与运维脚本；所有资产均与规范保持链接。
5. **反馈闭环**：生产反馈、监控指标、合规要求，都会回写到规范中，驱动下一轮迭代。

## PowerX 的 SDD 落地方式

PowerX 结合 SDD，把“场景（SCN）+ Usecase Seed”作为规范体系的载体：

- **场景文档**：描绘端到端业务旅程，是规范的叙事骨架；
- **Usecase Seed**：把场景拆成可执行的子任务，每个 Seed 都是实现计划的最小单元；
- **docmap**：维护场景与 Seeds 的唯一映射，驱动生成、索引与发布；
- **工具链**：`setup-usecase-seeds.mjs`、`generate-usecase-seed-index.mjs`、`npm run publish:usecases` 等脚本，确保规范与实现同步演进。

> 场景页 `/zh/scenarios/` 提供了 SDD 方法与 PowerX 实施流程的详细说明，建议搭配阅读。

## 与核心概念的关系

- 《[PowerX Integration Architecture](/zh/core-concepts/PowerX_Integration_Architecture)》解释了平台如何把能力注册、编排、路由整合到统一内核；
- 《[Knowledge Base Overview](/zh/core-concepts/00_overview)》介绍知识库如何为规范提供上下文与语义支持；
- 《[Agent Lifecycle Spec](/zh/core-concepts/Agent_Manager_and_Lifecycle_Spec)》描述智能体如何根据规范执行、反馈与治理。

SDD 是这些核心概念的统摄理念：只有规范始终领先、自动驱动实现，才能让架构、知识库与智能体生态保持一致、可演化。
