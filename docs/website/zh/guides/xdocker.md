---
title: XDocker 部署（推荐）
description: 在全新 Linux 服务器上安装最新已发布的 PowerX 容器 Release，生成独立配置和随机凭据，通过 SSH 隧道完成 Setup 与登录。
---

# XDocker 部署（推荐）

这篇教程用 XDocker 管理一套 PowerX 容器。服务器直接拉取镜像，**不需要编译 Go 或 Nuxt**。

起点：全新的 Ubuntu 24.04 LTS 服务器，能 SSH 登录并使用 sudo。终点：通过 SSH 隧道打开后台、完成 Setup 并登录，数据保存在服务器独立目录。先完成私有访问，不需要域名或证书。

本页固定安装一个名为 `powerx-dev` 的实例，部署身份为 `dev`。它适合首次体验与验证；对外提供服务前再按[安装后的运维准备](/zh/guides/maintenance)配置正式入口、备份和升级方案。

## 1. 准备服务器工具

以下操作在 **SSH 登录后的服务器终端**执行。服务器需要能访问 GitHub、GHCR 和 Docker 镜像仓库；支持 `amd64`／`arm64`。本页使用 Docker Compose **v2.24+**、PostgreSQL **16 + pgvector**、Redis **7**。

全新 Ubuntu 24.04 可执行：

```bash
sudo apt-get update
sudo apt-get install -y git curl python3 ca-certificates docker.io docker-compose-v2
sudo systemctl enable --now docker
sudo docker version
sudo docker compose version
```

**通过条件**：Docker 显示 Client 和 Server，Compose 为 v2.24 或更高。已安装其他来源的 Docker 时，不混装以上软件包，直接检查版本即可。

本教程只在服务器回环地址开放 18080，PostgreSQL、Redis 和后端均不发布公网端口。不要为安装向导开放公网 18080、5432 或 6379。

## 2. 准备 XDocker，获取最新 Release

仍在**服务器终端**执行。使用新目录，不复用服务器上已有的 XDocker 或 PowerX 实例：

```bash
mkdir ~/powerx-docker
cd ~/powerx-docker
git clone https://github.com/ReDeployment/XDocker.git XDocker
cd XDocker
git checkout --detach 13653a6c8dab6867a9745301b94242dad677415f
git rev-parse HEAD
sudo sh scripts/apps.sh init powerx-dev
```

这里固定的是已核对的 **XDocker 部署工具模板**，不是 PowerX 版本。`init` 只创建实例配置与登记，尚未创建数据库或管理员，也不启动共享网站、管理面板或证书服务。

保持在 **XDocker 根目录**，展开并执行下面的命令，自动获取**按发布时间最新的容器 Release**。当前容器发布使用预发布通道（截至 2026-11-01 为 `docker-dev-f99333ccd80e`）；命令会显示实际选择，不把它称为稳定版，也不使用会漏掉预发布的 `/releases/latest` 接口。

<!--@include: ../../../_snippets/latest-release.md-->

最新版本只在此次准备阶段解析一次，后续步骤使用保存的清单和成对镜像 digest。以后出现新 Release，不会在你重启服务时偷偷换版。

## 3. 填写实例参数

在**服务器终端，XDocker 根目录**执行：

```bash
sudoedit instances/powerx-dev/.env
```

把该新实例文件的内容改为以下配置并保存：

```dotenv
COMPOSE_PROJECT_NAME=powerx-dev
DEPLOYMENT_ENV=dev
POSTGRES_IMAGE=pgvector/pgvector:pg16
REDIS_IMAGE=redis:7-alpine
GATEWAY_IMAGE=nginx:alpine
PULL_POLICY=missing
PUBLIC_ORIGIN=http://127.0.0.1:18080
PUBLIC_WS_ORIGIN=ws://127.0.0.1:18080
HTTP_BIND=127.0.0.1
HTTP_PORT=18080
ADMIN_USERNAME=admin
ADMIN_EMAIL=you@example.com
```

`ADMIN_EMAIL` 改为自己的邮箱；管理员密码稍后在 Setup 设置。上面先填写运行参数，再把步骤 2 解析出的版本写入同一实例文件：

```bash
cat powerx-release/release.env
sudo tee -a instances/powerx-dev/.env < powerx-release/release.env > /dev/null
```

**通过条件**：输出最新 Release 标签、源码 SHA，以及后端／管理端的两条 `@sha256:…` 镜像引用。两条镜像来自同一发布清单，不手工拼标签，不使用漂移的 `latest`。这条追加命令只执行一次；修改邮箱等参数时保留已经写入的版本行。

`PUBLIC_ORIGIN` 是你的浏览器入口，`PUBLIC_WS_ORIGIN` 是同一入口的 WebSocket 地址。通过后面的 SSH 隧道访问时，保留这两个回环地址。`DEPLOYMENT_ENV` 是实例身份，完成安装后不要随意修改。

准备该实例的私有网关配置，并检查 Compose：

```bash
sudo chmod 600 instances/powerx-dev/.env
sudo install -m 644 apps/powerx/gateway.conf instances/powerx-dev/gateway.conf
sudo sh scripts/apps.sh compose powerx-dev config --quiet
sudo sh scripts/apps.sh compose powerx-dev config --images
sudo sh scripts/apps.sh compose powerx-dev pull postgres redis backend web-admin init gateway
```

**通过条件**：配置检查无报错，输出的 PowerX 镜像与 `release.env` 一致，所有镜像拉取成功。`gateway.conf` 必须放到实例目录，因为 Compose 的相对挂载按实例目录解析。

镜像若提示 `denied`，先确认发布者已公开对应 GHCR 包；私有包需要有 `read:packages` 的账号执行 `sudo docker login ghcr.io`，按提示输入凭据。不要把令牌写进教程命令、`.env` 或 Git。

## 4. 启动 PowerX 和私有网关

仍在**服务器终端，XDocker 根目录**执行：

```bash
sudo sh scripts/apps.sh start powerx-dev
sudo sh scripts/apps.sh compose powerx-dev --profile standalone up -d --wait gateway
sudo sh scripts/apps.sh status powerx-dev
curl -fsS http://127.0.0.1:18080/api/v1/health
curl -fsS http://127.0.0.1:18080/api/v1/admin/setup/status
```

首次启动会自动生成独立的数据库密码、Redis 密码和私有运行配置。**通过条件**：postgres、redis、backend、web-admin 为 `healthy`，gateway 为运行中；健康请求成功，Setup 状态为 `uninstalled`、`configured: false`。

此时没有管理员是正常的。不要执行 `apps.sh migrate`、seed 或 reset 来替代下一步 Setup。若返回 `installed`，说明使用了已有实例或数据；停止这条首装路线，先确认目录，勿强行改回未安装。

## 5. 从自己的电脑打开后台

在**自己的电脑终端**执行，先将 `your-user` 和 `your-server` 换成实际 SSH 用户和服务器地址：

```bash
ssh -N -L 18080:127.0.0.1:18080 your-user@your-server
```

保持这个终端运行，在**自己电脑的浏览器**打开 [http://127.0.0.1:18080/setup](http://127.0.0.1:18080/setup)。这是本机 SSH 隧道入口，不是让你在浏览器填服务器公网 IP。

**通过条件**：看到 PowerX 首次安装向导。若本机 18080 被占用，先释放自己的隧道端口，或统一调整实例 `PUBLIC_ORIGIN`、`PUBLIC_WS_ORIGIN`、`HTTP_PORT` 和隧道端口后重建 gateway／web-admin，不能只改浏览器地址。

## 6. 读取连接值并完成 Setup

回到**服务器终端，XDocker 根目录**执行：

```bash
sudo sh scripts/apps.sh setup-values powerx-dev
```

这条命令会显示该实例私有连接信息，**只在自己的终端查看**。其中 `database.password` 和 `cache.password` 是两项不同的随机密码；没有通用默认密码，也不是 Linux、SSH 或管理员密码。

在浏览器按以下顺序完成：

1. **系统检查与许可**：确认许可，部署环境选 `dev`。
2. **域名与 HTTPS**：域名填 `127.0.0.1:18080`，不带协议；HTTPS 关闭。内部后端端口保持 **8080**、管理端保持 **3000**；18080 是网关端口，不要填到内部端口字段。
3. **数据库与基础配置**：按下表填写，数据库与 Redis 连接测试都成功后再继续保存、初始化。
4. **管理员与租户**：设置自己的用户名、邮箱、强密码和租户信息。数据库步骤只迁移表结构，管理员在确认后完成安装时创建。
5. **插件与智能体**：先保留默认选择；具体业务插件在首装完成后单独安装与验证。
6. **LLM**：首次可以跳过，点击“完成设置”。

| Setup 字段 | 填写值 |
| --- | --- |
| 数据库类型／版本 | PostgreSQL／`16` |
| 数据库主机／端口 | `postgres`／`5432` |
| 数据库名／用户名 | `powerx`／`powerx` |
| 数据库密码 | `setup-values` 的 `database.password` |
| Redis 主机／端口／索引 | `redis`／`6379`／`0` |
| Redis 密码 | `setup-values` 的 `cache.password`，不能留空 |
| 文件存储 | `local` |
| 本地文件目录 | `/data/uploads`，这是容器内路径 |
| 文件公开地址 | `http://127.0.0.1:18080/media` |

连接测试由**后端容器**执行，因此主机用 `postgres`／`redis`，不要用 `localhost`、自己电脑地址或服务器公网 IP。

页面提示重启后端时，在**服务器终端**执行：

```bash
sudo sh scripts/apps.sh compose powerx-dev restart backend
```

然后回页面点击“我已重启，立即检测”。不要重复 `init` 或删除数据目录。

## 7. 登录并验证数据保留

保持 SSH 隧道，在浏览器打开 [http://127.0.0.1:18080](http://127.0.0.1:18080)，用自己设置的管理员登录。然后在**服务器终端**执行：

```bash
curl -fsS http://127.0.0.1:18080/api/v1/health
curl -fsS http://127.0.0.1:18080/api/v1/admin/setup/status
sudo sh scripts/apps.sh status powerx-dev
```

**通过条件**：`data.install_status` 为 `installed`，`data.configured` 为 `true`，四个应用容器健康；刷新后台仍可登录并看到自己的租户。

最后验证一次应用重启：

```bash
sudo sh scripts/apps.sh compose powerx-dev restart backend web-admin
```

等待恢复健康后再次刷新并登录。账号与租户信息应仍保留。关闭 SSH 隧道只会结束本机访问，服务器容器继续运行。

## 数据保存在哪里

相对 `~/powerx-docker/XDocker/`：

| 目录 | 内容 |
| --- | --- |
| `powerx-release/` | 本次 Release 记录、校验后的清单与成对镜像版本 |
| `instances/powerx-dev/.env` | 镜像、实例身份和浏览器入口 |
| `instances/powerx-dev/config/` | 私有 `config.yaml`、随机凭据、密钥和 Setup 配置 |
| `data/instances/powerx-dev/postgres/` | PostgreSQL 数据 |
| `data/instances/powerx-dev/redis/` | Redis 持久数据 |
| `data/instances/powerx-dev/runtime/` | 上传、插件、日志与运行文件 |

备份必须包含配置、密钥、数据库与运行数据，不能只保存 `.env`。运行中的 PostgreSQL 不能靠直接复制数据目录完成一致性备份。

## 遇到问题

| 现象 | 处理 |
| --- | --- |
| 版本工具提示 GitHub 限流 | 稍后重试；不会因此改装旧版本，不要把令牌粘贴进页面或聊天 |
| 启动超时／容器不健康 | `sudo sh scripts/apps.sh logs powerx-dev`；数据库问题另用 `sudo sh scripts/apps.sh compose powerx-dev logs --tail 80 postgres redis` |
| 网关启动报挂载／配置错误 | 确认步骤 3 的 `instances/powerx-dev/gateway.conf` 是文件，再查看 gateway 日志 |
| 服务器 curl 正常，浏览器打不开 | 确认 SSH 隧道仍运行，本机 18080 未冲突，浏览器使用 `127.0.0.1:18080` |
| Setup 数据库／Redis 连接失败 | 重新读取该实例 `setup-values`，核对服务名与两项密码；不要在页面另编密码或重建数据库 |
| 完成后页面仍要求重启 | 重启 backend，复查 Setup 的 `effective_ports`／`restart_required`；不要把 18080 填为后端端口 |

下一步：[插件本地安装](/zh/guides/publish/local-install)；正式开放前阅读[安装后的运维准备](/zh/guides/maintenance)。

<details>
<summary>版本与源码依据</summary>

本文核对 XDocker `13653a6c8dab6867a9745301b94242dad677415f` 的 [实例脚本](https://github.com/ReDeployment/XDocker/blob/13653a6c8dab6867a9745301b94242dad677415f/scripts/apps.sh)、[Compose 模板](https://github.com/ReDeployment/XDocker/blob/13653a6c8dab6867a9745301b94242dad677415f/apps/powerx/compose.yml)，并核对 [PowerX 容器 Release](https://github.com/ArtisanCloud/PowerX/releases/tag/docker-dev-f99333ccd80e) 的清单、成对镜像和首装入口。最新镜像仍支持该模板使用的 `init`／`setup-values`／首次 Setup 路径；首装与升级不是同一件事。本文不会把旧 `apps.sh migrate` 用于新版升级。

发布清单下载与校验已实际执行，版本选择逻辑通过自动化测试；应用启动步骤经过源码静态核对，本次文档修订未在全新服务器重新拉取镜像、完成 Setup 或验证登录，不把历史旧镜像验收算作新版实测。

</details>
