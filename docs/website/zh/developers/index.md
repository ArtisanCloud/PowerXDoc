---
title: 开发与扩展
description: 从本地插件开发到能力共享，了解 PowerX 的安装、调试、接口契约与运行验证。
---

# 开发与扩展

**先做一个能运行的插件，再开放可复用的业务能力。** 不需要先读完所有提案，也不必改动 PowerX 内核才能扩展业务。

## 最短开发路径 {#plugin-ecosystem}

1. **准备底座**：按[开始使用](/zh/guides/local-dev)运行本地 PowerX，确认后台和依赖服务正常。
2. **创建插件**：进入[本地初始化](/zh/guides/publish/local-init)，再按[本地调试](/zh/guides/publish/local-dev-debug)联调前后端。
3. **装到宿主验证**：按[Local Install](/zh/guides/publish/local-install)验证启用、页面、权限与一次业务调用。
4. **准备交付**：阅读[离线发布与导入](/zh/guides/publish/offline-publish)以及[版本兼容性](/zh/guides/publish/version-compatibility)，明确依赖与升级方式。

## 把业务能力共享出去 {#sdk-api}

插件保留自己的数据和业务逻辑，通过接口、事件或能力契约供其他插件、流程与智能体调用。调用必须遵守租户与权限边界，不通过直接访问底座或其他插件的数据库来“打通”。

- [插件 SDK 指南](/zh/guides/PowerX_Plugin_SDK_Guide)：了解插件接入方式。
- [能力契约规范](/zh/developers/api-and-specifications/02_capability/Capability_Contract_Spec)：了解输入、输出与调用约定。
- [能力注册与路由设计](/zh/developers/api-and-specifications/03_registry_router/Capability_Registry_and_Router_Design)：理解能力如何被发现和路由。

规范说明机制，不代表每项设计已在当前版本完整实现；集成时以运行版本与实际接口验证为准。

## 验证与运行 {#quality-testing}

先验证正常调用，再覆盖权限拒绝、依赖不可用、重试和重复请求。确认停用、重启与升级不会破坏业务数据。

[插件测试与调试](/zh/guides/Plugin_Test_and_Debug_Guide) · [插件运行时](/zh/guides/Plugin_Runtime_Guide) · [智能体开发指南](/zh/guides/Agent_Developer_Guide)

## 需要深入时再查 {#tooling}

[API 与规范](/zh/developers/api-and-specifications/README) · [PXIP 提案](/zh/developers/pxip/README) · [完整参考入口](/zh/reference/)
