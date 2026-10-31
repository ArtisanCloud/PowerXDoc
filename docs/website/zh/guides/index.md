---
title: 开始使用
description: 选择一条完整的 PowerX 安装教程：本地开发、推荐的 XDocker，或 Linux/systemd。在站内完成启动、Setup 与登录。
---

# 开始使用

**选一条路线，从第一步开始。** 每篇都包含准备环境、配置、启动、首次 Setup 和登录验证，不需要先读 GitHub 或架构文档。

## 选择运行方式 {#quickstart}

| 你想做什么 | 从这里开始 | 完成后得到什么 |
| --- | --- | --- |
| 修改源码、开发插件 | [本地开发启动 →](/zh/guides/local-dev) | 本机运行的后端与管理后台 |
| 在服务器用容器运行 PowerX | **[XDocker 部署（推荐）→](/zh/guides/xdocker)** | 独立容器、私有配置与持久数据 |
| 用 Linux 服务账号和 systemctl 管理 | [Linux / systemd 部署 →](/zh/guides/systemd) | 开机启动的后端与管理后台服务 |
| 不自行维护服务器 | SaaS 即将提供 | 暂无公开开通入口 |

本地教程面向开发者；两篇服务器教程先通过 SSH 隧道完成私有安装，不需要为首次 Setup 准备域名。三者是同一底座的不同运行方式，选一条完成即可。

## 本地开发启动 {#local}

从固定源码开始，准备 PostgreSQL 16 与 Redis 7，分别启动后端 8077、管理后台 3030，创建自己的管理员。

<a class="docs-tutorial-action" href="/zh/guides/local-dev.html">开始本地教程 <span aria-hidden="true">→</span></a>

## XDocker 部署（推荐） {#xdocker}

从全新服务器开始，拉取配套的前后端镜像，生成独立随机凭据，通过私有网关完成 Setup。服务器不需要编译代码。

<a class="docs-tutorial-action" href="/zh/guides/xdocker.html">开始 XDocker 教程 <span aria-hidden="true">→</span></a>

## Linux / systemd 部署 {#systemd}

从全新 Ubuntu 服务器开始，准备依赖、构建程序，以独立服务账号运行；配置、媒体与插件数据放在程序版本目录之外。

<a class="docs-tutorial-action" href="/zh/guides/systemd.html">开始 systemd 教程 <span aria-hidden="true">→</span></a>

## 什么算首次安装完成 {#checklist}

- 健康接口成功，安装状态为 `installed`。
- 使用自己创建的管理员登录，刷新后仍可访问自己的租户。
- 应用重启后，账号、配置与数据仍保留。

具体业务插件、AI 模型与外部系统要在接入后分别验证。底座能够登录，不代表这些业务已经交付。

## 安装之后 {#deployment}

公网 HTTPS、备份和升级单独阅读[安装后的运维准备](/zh/guides/maintenance)。不要把升级迁移、seed、refresh 或恢复旧数据混进全新安装。

### 配置与集成 {#configuration}

安装插件从[插件本地安装](/zh/guides/publish/local-install)开始；开发与系统集成进入[开发与扩展](/zh/developers/)。

### 遇到问题 {#ops-faq}

每篇安装教程末尾都有针对该路线的排查步骤。先核对运行位置、端口、配置和日志，再到[运维与治理](/zh/operations/)继续排查。
