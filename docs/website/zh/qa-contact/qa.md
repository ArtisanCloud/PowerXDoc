---
title: 文档支持 QA
---

# 文档支持 QA

以下是常见问题的处理方式与自助排查指引。若仍无法解决，欢迎通过“联系通道”扫码后在群内 @PowerX Docs Admin。

## 1. 场景/Usecase 文档缺失或未更新
- 首先检查 `docs/_data/docmap.yaml` 与 `docs/scenarios/**` 是否包含对应条目。
- 若缺失，请在群内提供 `SCN_ID` 或业务描述，我们会优先排期补充。

## 2. 发布脚本失败
- `npm run publish:scenarios` / `publish:usecases` 报错时，请附带完整命令与 `reports/*.json` 内容。
- 若是 resume token 无效，可重新 dry-run 生成最新 token 后重试。

## 3. 二维码或联系方式失效
- 发送邮件至 `tech@artisan-cloud.com`，或在群内私聊管理员获取新的入口。

## 4. 如何提交大篇幅文档需求
- 建议提前整理背景、目标、受众、需要输出的文档类型（场景/Usecase/指南等）。
- 我们会在群内确认细节，并在 PowerXDocs backlog 中排期。复杂需求将安排同步会议。

## 5. 安全/合规问题
- 如需分享敏感日志或客户数据，请先在群内说明，我们会提供安全的私聊或加密通道。
- 所有支持记录默认遵循公司保密政策。

> 想了解更多标准化流程，可随时在群内提问或参考 `docs/meta` 下的设计文档。
