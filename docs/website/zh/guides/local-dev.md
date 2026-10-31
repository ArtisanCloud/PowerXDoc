---
title: 本地开发启动
description: 从获取源码、准备 PostgreSQL 和 Redis，到启动 PowerX、完成首次 Setup 并登录管理后台。
---

# 本地开发启动

这篇教程带你在自己的电脑上跑起 **PowerX 后端和管理后台**，完成首次 Setup，并用自己创建的管理员登录。之后再开始插件开发。

起点：一台开发电脑，一个全新目录。终点：`http://127.0.0.1:3030` 可以登录，后端安装状态为 `installed`。

## 1. 检查工具

适用 macOS 或 Linux，使用 Bash 终端。先安装下列工具；本页的数据库与缓存通过 Docker 启动，无需另外安装 PostgreSQL、Redis 或 MinIO。

| 工具 | 本教程使用的版本／要求 |
| --- | --- |
| Git、Make、curl、OpenSSL | 系统可执行命令 |
| Go | **1.26.7**，与本次源码 `backend/go.mod` 一致 |
| Node.js | **22.23.2**，使用随附的 npm |
| Docker | Docker Engine 或 Docker Desktop 已启动，Compose **v2.24+** |
| 数据服务 | 下文创建 PostgreSQL **16 + pgvector**、Redis **7** |

<details>
<summary>安装本页使用的工具（新电脑）</summary>

macOS 先运行 `xcode-select --install`，按系统提示装好 Git／Make；安装并打开 [Docker Desktop](https://www.docker.com/products/docker-desktop/)，直到 Docker Engine 运行。Ubuntu 24.04 可用下面命令安装系统工具与 Docker：

```bash
sudo apt-get update
sudo apt-get install -y git make curl openssl ca-certificates docker.io docker-compose-v2
sudo systemctl enable --now docker
sudo usermod -aG docker "$USER"
```

Linux 加入 docker 组后退出并重新登录，再继续；Docker 组具有管理本机容器的权限。其他 Linux 发行版先准备同等工具，不混用 apt 命令。

Go 和 Node 使用官方固定版本，适用 macOS／Linux 的 x86_64 或 arm64。在本机 Bash 终端执行；新建专用目录，不覆盖已有系统工具：

```bash
bash
set -eu
case "$(uname -s)" in
  Darwin) go_os=darwin; node_os=darwin ;;
  Linux) go_os=linux; node_os=linux ;;
  *) echo '此教程需要 macOS 或 Linux'; exit 1 ;;
esac
case "$(uname -m)" in
  x86_64) go_arch=amd64; node_arch=x64 ;;
  arm64|aarch64) go_arch=arm64; node_arch=arm64 ;;
  *) echo '此教程需要 x86_64 或 arm64'; exit 1 ;;
esac
mkdir ~/powerx-dev-tools
cd ~/powerx-dev-tools
curl -fL "https://go.dev/dl/go1.26.7.${go_os}-${go_arch}.tar.gz" -o go.tar.gz
tar -xzf go.tar.gz
mkdir node
curl -fL "https://nodejs.org/dist/v22.23.2/node-v22.23.2-${node_os}-${node_arch}.tar.gz" -o node.tar.gz
tar -xzf node.tar.gz -C node --strip-components=1
export PATH="$HOME/powerx-dev-tools/go/bin:$HOME/powerx-dev-tools/node/bin:$PATH"
```

新开终端时重新执行最后一条 PATH 设置。已有专用目录时先检查版本，不反复覆盖。

</details>

在**本机终端 A**执行：

```bash
bash
set -eu
export PATH="$HOME/powerx-dev-tools/go/bin:$HOME/powerx-dev-tools/node/bin:$PATH"
git --version
make --version
go version
node --version
docker version
docker compose version
```

看到 Go `1.26.7`、Node `v22.23.2`，且 Docker 同时显示 Client 和 Server 后继续。Docker 连不上时，先启动 Docker Desktop／daemon。Linux 上没有 Docker 权限时先处理 Docker 安装权限，不要用 sudo 运行整个开发项目。

## 2. 获取固定版本的源码

以下命令都在**本机终端 A**执行。`~/powerx-local` 必须是尚未使用的新目录；不要在已有业务目录重复首装。

```bash
mkdir ~/powerx-local
cd ~/powerx-local
git clone https://github.com/ArtisanCloud/PowerX.git source
cd source
git checkout --detach f99333ccd80eb3c2467fe6cc9009917340556424
git rev-parse HEAD
```

最后输出应与上面的完整 SHA 相同。这里固定源码，避免阅读教程期间 `develop` 变化；它是开发快照，不是稳定版承诺。

## 3. 启动数据库与缓存

在**本机终端 A**回到 `~/powerx-local`，生成本机私有密码文件：

```bash
cd ~/powerx-local
umask 077
test ! -e .env
printf 'POSTGRES_PASSWORD=%s\nREDIS_PASSWORD=%s\n' \
  "$(openssl rand -hex 24)" "$(openssl rand -hex 24)" > .env
```

创建依赖配置，展开后复制整段执行：

<details>
<summary>创建 compose.yaml（PostgreSQL 与 Redis）</summary>

```bash
cat > compose.yaml <<'YAML'
name: powerx-local-deps
services:
  postgres:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_USER: powerx
      POSTGRES_DB: powerx
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:?}
    ports: ["127.0.0.1:5432:5432"]
    volumes: ["./data/postgres:/var/lib/postgresql/data"]
    healthcheck:
      test: [CMD-SHELL, pg_isready -U powerx -d powerx]
      interval: 5s
      timeout: 3s
      retries: 30
  redis:
    image: redis:7-alpine
    environment:
      REDIS_PASSWORD: ${REDIS_PASSWORD:?}
    command: [/bin/sh, -ec, 'exec redis-server --appendonly yes --requirepass "$$REDIS_PASSWORD"']
    ports: ["127.0.0.1:6379:6379"]
    volumes: ["./data/redis:/data"]
    healthcheck:
      test: [CMD-SHELL, 'REDISCLI_AUTH="$$REDIS_PASSWORD" redis-cli ping']
      interval: 5s
      timeout: 3s
      retries: 30
YAML
```

</details>

然后在**本机终端 A**启动并检查：

```bash
docker compose up -d --wait
docker compose exec postgres psql -U powerx -d powerx \
  -c 'CREATE EXTENSION IF NOT EXISTS vector;'
docker compose ps
```

**通过条件**：两个服务都显示 `healthy`，扩展命令没有错误。5432 或 6379 已占用时，先确认已有服务用途；不要停止别人的服务。若修改左侧宿主机端口，下一步和 Setup 也要使用对应端口。

本地数据保存在 `~/powerx-local/data/`，密码在 `~/powerx-local/.env`。这套账号仅用于隔离的本地开发；不要将这个 Compose 当作公网数据库部署模板。

## 4. 准备自己的运行配置

在**本机终端 A**执行：

```bash
cd ~/powerx-local/source
test ! -e backend/etc/config.yaml
cp backend/etc/config_example.yaml backend/etc/config.yaml
chmod 600 backend/etc/config.yaml
cat ../.env
openssl rand -hex 32
```

最后两条仅用于你在自己的终端读取数据库／Redis 密码，并生成一个上传签名密钥。将值保存到密码管理器，不要提交到 Git 或发送到聊天中。

用编辑器打开 `backend/etc/config.yaml`，**修改已有字段，勿在文件末尾追加同名段落**：

| 位置 | 填写内容 |
| --- | --- |
| `deployment.env` | `dev` |
| `server.host` / `server.port` | `127.0.0.1` / `8077` |
| `server.grpc.host` | `127.0.0.1` |
| `database.dsn` | 保持空字符串 `""`，采用下面的分字段连接 |
| `database.host` / `port` | `127.0.0.1` / `5432` |
| `database.username` / `database` | 均为 `powerx` |
| `database.password` | `.env` 的 `POSTGRES_PASSWORD` 值 |
| `database.ssl_mode` | `disable`，仅本机连接 |
| `cache.host` / `port` / `db` | `127.0.0.1` / `6379` / `0` |
| `cache.password` | `.env` 的 `REDIS_PASSWORD` 值 |
| `queue.redis.addr` / `password` | `127.0.0.1:6379` / 同一个 Redis 密码 |
| `event.fabric.redis_addr` / `redis_password` | `127.0.0.1:6379` / 同一个 Redis 密码 |
| `event.fabric.authorization.redis_addr` / `redis_password` | `127.0.0.1:6379` / 同一个 Redis 密码 |
| `storage.default_driver` | `local` |
| `storage.local.base_path` | `./storage/media`，相对后端工作目录 |
| `storage.local.public_base_url` | `http://127.0.0.1:8077/media` |
| `storage.local.upload_token_secret` | 刚生成的上传签名密钥 |
| `install.status` | 保持 `uninstalled` |
| `auth.jwt_secret` / `server.secret_key` | 保持空，下一步自动生成 |

再在 YAML 顶层添加 `web_admin_port: 3030`（如果已有则修改）。保留模板中允许 `http://127.0.0.1:3030` 的 `http_security.web_admin_origins`。本教程使用本地文件存储，不需要填写 S3／MinIO 示例凭据。

## 5. 初始化密钥并迁移空数据库

仍在**本机终端 A，源码根目录**执行：

```bash
make init-secrets CONFIG=backend/etc/config.yaml
make migrate CONFIG=backend/etc/config.yaml
npm --prefix web-admin ci
```

首次会下载 Go／Node 依赖。**通过条件**：密钥初始化输出 `generated`（再次执行为 `existing`），迁移成功退出且日志出现 `migrate ok`，npm 安装成功。命令不会打印 JWT 或服务加密密钥。

此时还没有完成安装，也没有管理员。**不要执行 `make seed`、`make db-refresh`，也不要手改为 `installed`。** 接下来由 Setup 收集管理员信息并完成初始化。

## 6. 分别启动后端和管理后台

**本机终端 A**：

```bash
cd ~/powerx-local/source
export POWERX_CONFIG="$PWD/backend/etc/config.yaml"
export POWERX_ENV=dev
make dev
```

保持它运行，看到服务就绪后，打开**本机终端 B**：

```bash
export PATH="$HOME/powerx-dev-tools/node/bin:$PATH"
cd ~/powerx-local/source
POWERX_ENV=dev POWERX_BACKEND=http://127.0.0.1:8077 \
  npm --prefix web-admin run dev -- --host 127.0.0.1 --port 3030
```

看到 Nuxt 显示 `http://127.0.0.1:3030` 后继续。本教程显式指定 3030；不要把 Nuxt 默认端口或 systemd-dev 的 3001／8081 混进来。

## 7. 完成首次 Setup

在**本机浏览器**打开 [http://127.0.0.1:3030/setup](http://127.0.0.1:3030/setup)。按页面顺序填写：

1. **系统检查与许可**：确认许可，部署环境选 `dev`。
2. **域名与 HTTPS**：系统域名填 `127.0.0.1:3030`，不带协议；HTTPS 选关闭。后端端口 `8077`，管理端端口 `3030`。
3. **数据库与基础配置**：数据库类型 PostgreSQL、版本 16、主机 `127.0.0.1`、端口 `5432`、库名和用户均为 `powerx`；密码使用步骤 3 生成的 PostgreSQL 密码。Redis 主机 `127.0.0.1`、端口 `6379`、索引 `0`，填 Redis 密码。两项连接测试成功后再继续。文件存储选 `local`，目录 `./storage/media`，公开地址 `http://127.0.0.1:8077/media`。
4. **管理员与租户**：填写你自己的管理员用户名、邮箱、强密码和租户信息。这是以后登录使用的账号，与数据库密码无关。
5. **插件与智能体**：首次先保留默认选择；本教程不把额外插件或真实 AI 调用作为首装前置。
6. **LLM**：可以选择跳过，安装后再配置模型。点击“完成设置”。

出现“安装已完成，请重启后端”时，在终端 A 按 `Ctrl+C`，重新执行步骤 6 的后端启动命令，再回页面点击“我已重启，立即检测”。若后端已经自动恢复，也先完成下一步状态验证。

## 8. 登录并确认结果

打开 [http://127.0.0.1:3030](http://127.0.0.1:3030)，使用刚设置的管理员账号登录。然后在**另一个本机终端**执行：

```bash
curl -fsS http://127.0.0.1:8077/api/v1/health
curl -fsS http://127.0.0.1:8077/api/v1/admin/setup/status
```

**完成条件**：健康接口成功；状态响应的 `data.install_status` 为 `installed`、`data.configured` 为 `true`；刷新后台仍能进入自己的租户。`restart_required` 为 true 时按提示重启并复查端口。

开发结束时在两个前台终端按 `Ctrl+C`。数据库可在 `~/powerx-local` 执行 `docker compose stop`，下次用 `docker compose up -d --wait` 恢复。保留 `.env`、`data/`、私有 `config.yaml` 和 `backend/storage/`，再次启动不用重新首装。

## 遇到问题

| 现象 | 先检查什么 |
| --- | --- |
| Go 的 Sonic／ABI 编译错误 | 确认实际使用 Go 1.26.7；不要用旧 Go 编译这个快照 |
| 数据库／Redis 连接失败 | 在 `~/powerx-local` 执行 `docker compose ps` 和 `docker compose logs --tail 60`；核对本机端口及两项密码 |
| 迁移成功但进不了后台 | 迁移只建表，继续步骤 6、7；不要用 seed 或改安装标志代替 Setup |
| Setup API 404 或页面连接失败 | 核对后端 8077、前端 3030 和 `POWERX_BACKEND`；看终端 A、B 的日志 |
| 密钥无效／配置不可写 | 确认启动日志读取的是本次 `config.yaml`，且归当前用户所有；已有实例恢复原密钥，勿删除配置重建 |

下一步：[创建第一个插件](/zh/guides/publish/local-init) → [本地联调](/zh/guides/publish/local-dev-debug)。

<details>
<summary>版本与源码依据</summary>

本文核对 PowerX `f99333ccd80eb3c2467fe6cc9009917340556424` 的 [Make 迁移入口](https://github.com/ArtisanCloud/PowerX/blob/f99333ccd80eb3c2467fe6cc9009917340556424/make_files/database.mk)、[开发配置](https://github.com/ArtisanCloud/PowerX/blob/f99333ccd80eb3c2467fe6cc9009917340556424/backend/etc/config_example.yaml)与 [Setup 实现](https://github.com/ArtisanCloud/PowerX/blob/f99333ccd80eb3c2467fe6cc9009917340556424/backend/internal/transport/http/admin/system/setup_handler.go)。这些链接用于查阅来源，不是完成本教程的必经步骤。本文命令经过源码静态核对，本次文档修订未重新执行全新机器安装。

</details>
