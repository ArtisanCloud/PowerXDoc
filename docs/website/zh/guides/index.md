---
title: 开始使用
description: 先选运行方式：本地开发、推荐的 XDocker 容器部署，或 Linux systemd。
---

# 开始使用

**部署使用，首推 XDocker；开发调试，先从本地 HelloWorld 开始。** 不必先读完所有架构文档，选一条适合你的路径即可。

## 选择运行方式 {#quickstart}

| 你的目标 | 建议路径 | 需要准备 |
| --- | --- | --- |
| 本地修改代码、理解一次请求与插件调用 | [本地 HelloWorld](#local) | 开发工具链、数据库与缓存 |
| 在服务器上运行 PowerX，统一管理容器与配置 | [XDocker（推荐）](#xdocker) | 容器运行环境、持久化目录与服务配置 |
| 沿用已有 Linux 服务管理体系 | [Linux / systemd](#systemd) | Linux 主机、服务账号与依赖服务 |
| 不自行维护服务器 | SaaS 即将提供 | 暂无公开开通入口 |

三种自部署路径服务于不同工作阶段，不是三个不同产品。SaaS 后台目前也采用 XDocker 部署；对外服务尚未开放。

## 1. 本地 HelloWorld：先跑通开发闭环 {#local}

适合准备修改 PowerX 或开发插件的团队。“HelloWorld”在这里指最小验证目标：**启动底座 → 登录管理后台 → 接入一个示例插件 → 完成一次调用**，不是业务方案已交付。

1. 获取 PowerX 源码，按所选版本准备 Go、Node.js、PostgreSQL、Redis；版本要求以仓库为准。
2. 配好数据库、缓存与认证参数，完成首次安装初始化，再启动后端与管理后台。已有数据的环境不要重复执行初始化种子命令。
3. 确认能够登录、后端正常响应，再按[插件本地初始化](/zh/guides/publish/local-init)创建插件，并按[本地调试](/zh/guides/publish/local-dev-debug)完成联调。

进入 [本地配置与密钥初始化指南](https://github.com/ArtisanCloud/PowerX/blob/f99333ccd80eb3c2467fe6cc9009917340556424/docs/guides/deploy/025-powerx-docker-systemd/manual-secret-initialization.md)。它是固定版本参考；请与实际 checkout 版本配套使用。

## 2. XDocker：推荐的容器部署路径 {#xdocker}

XDocker 用于组织 PowerX 的容器服务、配置与持久化数据，适合测试环境与服务器部署。先跑通一套环境，再规划升级与备份。

- **部署前**：确定运行版本、访问域名与 HTTPS，按方案配置数据库与缓存，准备持久化目录；媒体存储可选本地目录或按需接入对象存储。
- **首次启动**：完成安装配置，检查后台、后端和插件运行状态，再验证登录与一次插件调用。
- **持续运行**：备份数据库、配置及插件数据；升级前核对版本说明，保留可恢复的备份与旧版本。

从 [XDocker PowerX 部署指南](https://github.com/ReDeployment/XDocker/blob/main/docs/guides/powerx/README.md)进入具体安装步骤。按所选版本使用配套配置；不要混用旧版升级命令与新版发布清单。

容器运行正常不等于业务已经验收。至少完成本页的[首次运行检查](#checklist)，再把实际业务接入。

## 3. Linux / systemd：融入已有运维体系 {#systemd}

适合已经采用 Linux 服务账号、日志和 systemctl 管理应用的团队。PowerX 后端与管理后台由 systemd 管理，插件子进程由 PowerX 的 supervisor 管理；独立 Runner 按需启用，依赖服务独立准备。

参考 [systemd 部署与启动指南](https://github.com/ArtisanCloud/PowerX/blob/f99333ccd80eb3c2467fe6cc9009917340556424/docs/guides/deploy/025-powerx-docker-systemd/systemd/01-deploy-config-start.md)，结合实际版本检查服务路径、账号、端口和配置。

::: warning 上线前检查
历史手册中的配置权限、提权示例和自动回滚说明需要按环境复核。含密钥的配置仅允许服务账号读取，不照搬宽松文件权限或数据库 SUPERUSER 配置；健康检查失败后应确认实际版本并按预案恢复，不默认脚本已自动回滚。
:::

## 首次运行检查 {#checklist}

- 能登录管理后台，且初始账号已设置独立强密码。
- 后端与插件运行状态正常，插件可以启用，并完成一次实际调用。
- 数据和插件文件持久化；重启后记录仍在。
- 外部访问使用 HTTPS，敏感配置权限收紧，数据库与缓存不直接暴露公网。
- 备份可恢复；业务负责人确认这次接入覆盖了哪些操作。

## 继续部署与配置 {#deployment}

运行后再处理[插件安装](/zh/guides/publish/local-install)、[离线发布与导入](/zh/guides/publish/offline-publish)和[插件运行管理](/zh/guides/Plugin_Runtime_Guide)。安装插件到已有 PowerX，与首次部署 PowerX 是两件事。

### 配置与集成 {#configuration}

先对齐身份、权限和接口契约，再连接外部系统。参见[开发与扩展](/zh/developers/)和[集成架构](/zh/core-concepts/PowerX_Integration_Architecture)。

### 遇到问题 {#ops-faq}

无法启动先查服务日志、依赖连通性与配置；看不到插件先查启用状态、权限和插件日志。进入[运维与治理](/zh/operations/)继续排查。升级前备份并核对迁移说明，**不要把首次初始化或 seed 当作常规升级步骤**。
