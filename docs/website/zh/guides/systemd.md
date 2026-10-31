---
title: Linux / systemd 部署
description: 在全新 Ubuntu 服务器上构建 PowerX，准备 PostgreSQL 与 Redis，以独立服务账号运行并完成首次 Setup。
---

# Linux / systemd 部署

这篇教程在服务器上构建 PowerX，由 systemd 管理后端和管理后台，数据库与 Redis 使用宿主机服务。

起点：全新 **Ubuntu 24.04 LTS、x86_64** 服务器，能 SSH 登录并使用 sudo。终点：两项 systemd 服务开机启动，通过 SSH 隧道完成首次 Setup、管理员登录和健康验证。

本页固定 PowerX 源码 `f99333ccd80e`，使用 `prod` 部署身份。先完成私有安装，不需要域名或证书；这不等于已经完成公网入口与业务验收。已有 `/etc/powerx`、数据库或同名 systemd 服务的主机应走升级方案，不重复本页。

## 1. 准备构建工具

以下命令均在 **SSH 登录后的服务器 Bash 终端**执行。本页使用 Go **1.26.7**、Node.js **22.23.2**、PostgreSQL **16 + pgvector**、Redis **7**。不需要 MinIO；文件存储先用本地目录。

```bash
bash
set -eu
sudo apt-get update
sudo apt-get install -y git make build-essential curl ca-certificates gnupg openssl
mkdir ~/powerx-systemd
cd ~/powerx-systemd
mkdir tools
```

<details>
<summary>安装本页固定的 Go 和 Node.js 工具</summary>

以下为 **Linux x86_64** 官方二进制，安装到本次专用目录，不删除或覆盖系统已有工具。ARM 服务器不要复制这一组下载地址。

```bash
cd ~/powerx-systemd/tools
curl -fL https://go.dev/dl/go1.26.7.linux-amd64.tar.gz -o go.tar.gz
tar -xzf go.tar.gz
curl -fL https://nodejs.org/dist/v22.23.2/node-v22.23.2-linux-x64.tar.xz -o node.tar.xz
tar -xf node.tar.xz
sudo install -d -m 755 /opt/powerx/tools
sudo cp -a node-v22.23.2-linux-x64 /opt/powerx/tools/
```

</details>

在**服务器当前终端**设置路径并检查。即使已有 Node，也将这个固定 Node 运行时放到上面的 `/opt/powerx/tools/` 路径，后面的 unit 会明确使用它。

```bash
export PATH="$HOME/powerx-systemd/tools/go/bin:/opt/powerx/tools/node-v22.23.2-linux-x64/bin:$PATH"
export GOTOOLCHAIN=go1.26.7
go version
node --version
npm --version
test -x /opt/powerx/tools/node-v22.23.2-linux-x64/bin/node
```

**通过条件**：Go 显示 `1.26.7`，Node 显示 `v22.23.2`，最后一条无报错。`export` 仅对当前终端生效；重连 SSH 后重新执行这一组。

## 2. 安装 PostgreSQL 16 与 pgvector

在**服务器终端**添加 PostgreSQL 官方 PGDG 软件源，再安装：

```bash
sudo install -d -m 755 /etc/apt/keyrings
curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc \
  -o /tmp/powerx-postgresql.asc
sudo install -m 644 /tmp/powerx-postgresql.asc /etc/apt/keyrings/powerx-postgresql.asc
printf '%s\n' 'deb [signed-by=/etc/apt/keyrings/powerx-postgresql.asc] https://apt.postgresql.org/pub/repos/apt noble-pgdg main' \
  | sudo tee /etc/apt/sources.list.d/powerx-pgdg.list > /dev/null
sudo apt-get update
sudo apt-get install -y postgresql-16 postgresql-client-16 postgresql-16-pgvector
sudo systemctl enable --now postgresql
openssl rand -hex 24
```

保存最后生成的随机密码，下一步作为 **PowerX 数据库账号密码**。不要把它粘贴到 shell 命令参数中。

进入 PostgreSQL 管理终端：

```bash
sudo -u postgres psql -X -v ON_ERROR_STOP=1
```

在 **psql 提示符**逐行执行。`\password` 会提示输入两次密码，粘贴刚保存的值，输入不回显：

```sql
CREATE ROLE powerx LOGIN;
\password powerx
CREATE DATABASE powerx OWNER powerx;
\connect powerx
CREATE EXTENSION IF NOT EXISTS vector;
\q
```

回到**服务器 shell**，验证普通应用账号：

```bash
psql -h 127.0.0.1 -U powerx -d powerx -W \
  -c "SELECT current_user, extversion FROM pg_extension WHERE extname='vector';"
```

输入同一密码，应返回 `powerx` 与 vector 版本。应用账号是自己数据库的 owner，未授予数据库超级用户权限。扩展由数据库管理员预先建立；插件需要额外隔离库／角色权限时单独评估，不在首次启动时给应用提权。

PostgreSQL 保持仅本机监听，不为本教程开放公网 5432。

## 3. 安装并保护 Redis

在**服务器终端**执行：

```bash
sudo apt-get install -y redis-server
openssl rand -hex 24
sudoedit /etc/redis/redis.conf
```

保存新生成的值作为 **Redis 密码**，与数据库密码分开。在 Redis 配置中找到并修改已有项（取消 `requirepass` 的注释）：

```text
bind 127.0.0.1 ::1
protected-mode yes
requirepass YOUR_RANDOM_REDIS_PASSWORD
appendonly yes
```

将 `YOUR_RANDOM_REDIS_PASSWORD` 替换为刚生成的 Redis 密码，不要保留占位文字。然后在**服务器终端**执行：

```bash
sudo systemctl enable redis-server
sudo systemctl restart redis-server
redis-server --version
redis-cli --askpass ping
```

输入 Redis 密码后应返回 `PONG`，版本为 7.x。Redis 仅本机监听，不开放公网 6379。

## 4. 获取并构建 PowerX

在**服务器终端**执行：

```bash
cd ~/powerx-systemd
git clone https://github.com/ArtisanCloud/PowerX.git source
cd source
git checkout --detach f99333ccd80eb3c2467fe6cc9009917340556424
git rev-parse HEAD
make dist DIST_VERSION=f99333ccd80e
test -x dist/systemd/f99333ccd80e/backend/powerx
test -x dist/systemd/f99333ccd80e/backend/database
test -f dist/systemd/f99333ccd80e/web-admin/.output/server/index.mjs
```

构建会下载依赖并编译前后端，耗时取决于机器和网络。**通过条件**：最后三条检查无报错，构建显示 `[dist] done`。不要运行 `go mod tidy` 修改锁定依赖，也不要把构建失败当作已部署。

## 5. 创建服务账号与安装目录

仍在**服务器终端，源码根目录**执行。以下只适用于本页约定的全新主机：

```bash
sudo useradd --system --user-group --home-dir /var/lib/powerx --shell /usr/sbin/nologin powerx
sudo install -d -o powerx -g powerx -m 750 \
  /var/lib/powerx /var/lib/powerx/media /var/lib/powerx/plugins \
  /var/lib/powerx/plugins/installed /var/lib/powerx/plugins/market_cache \
  /var/lib/powerx/system-snapshots /var/log/powerx /var/log/powerx/audit
sudo install -d -o powerx -g powerx -m 700 /etc/powerx
sudo install -d -m 755 /opt/powerx/releases/f99333ccd80e
sudo cp -a dist/systemd/f99333ccd80e/. /opt/powerx/releases/f99333ccd80e/
sudo chown -R powerx:powerx /opt/powerx/releases/f99333ccd80e
sudo ln -s /opt/powerx/releases/f99333ccd80e/backend /opt/powerx/backend
sudo ln -s /opt/powerx/releases/f99333ccd80e/web-admin /opt/powerx/web-admin
sudo install -o powerx -g powerx -m 600 \
  dist/systemd/f99333ccd80e/backend/etc/config.yaml /etc/powerx/config.yaml
```

配置与业务数据都在 release 目录外。首次安装使用 `ln -s`，遇到“已存在”就先检查原实例，不加 `-f` 覆盖已有程序链接。

## 6. 填写私有运行配置

在**服务器终端**执行：

```bash
openssl rand -hex 32
sudoedit /etc/powerx/config.yaml
```

最后生成的随机值用作上传签名密钥。修改配置的**已有字段**，不要追加重复的顶层段落：

| 位置 | 填写值 |
| --- | --- |
| `deployment.env` | `prod` |
| `server.host` / `port` | `127.0.0.1` / `8080` |
| `server.grpc.host` / `port` | `127.0.0.1` / `9010` |
| 顶层 `web_admin_port` | `3000`；不存在时添加 |
| `database.dsn` | 空字符串 `""` |
| `database.host` / `port` | `127.0.0.1` / `5432` |
| `database.username` / `database` | 均为 `powerx` |
| `database.password` | 步骤 2 的数据库密码 |
| `database.ssl_mode` | `disable`，仅本机连接 |
| `cache.host` / `port` / `db` | `127.0.0.1` / `6379` / `0` |
| `cache.password` | 步骤 3 的 Redis 密码 |
| `queue.redis.addr` / `password` | `127.0.0.1:6379` / 同一个 Redis 密码 |
| `event.fabric.redis_addr` / `redis_password` | `127.0.0.1:6379` / 同一个 Redis 密码 |
| `event.fabric.authorization.redis_addr` / `redis_password` | `127.0.0.1:6379` / 同一个 Redis 密码 |
| `storage.default_driver` | `local` |
| `storage.local.base_path` | `/var/lib/powerx/media` |
| `storage.local.public_base_url` | `http://127.0.0.1:8080/media` |
| `storage.local.upload_token_secret` | 本步骤生成的随机值 |
| `plugin.registry_file` | `/var/lib/powerx/plugins/registry.json` |
| `plugin.installed_dir` | `/var/lib/powerx/plugins/installed` |
| `plugin.market_cache_dir` | `/var/lib/powerx/plugins/market_cache` |
| `audit.file.dir` | `/var/log/powerx/audit` |
| `log.console` | `true`，让应用日志进入 journald |
| `log.file.enable` | `false`，本教程从 journald 查服务日志 |
| `log.retention.enabled` | `false`，后续另配保留策略 |
| `system_snapshots.directory` | `/var/lib/powerx/system-snapshots` |
| `install.status` | 保持 `uninstalled` |
| `auth.jwt_secret` | 保持空，下面由程序生成 |
| `server.secret_key` | 保留本次构建生成的独立随机值 |

将 `http_security.web_admin_origins` 改为包含 `http://127.0.0.1:3000`；`frame_ancestors` 保留 `'self'` 并按需允许该入口。S3／MinIO 未启用，不填模板中的示例凭据。

接着创建环境文件；复制整段到**服务器终端**：

```bash
sudo tee /etc/powerx/powerx.env > /dev/null <<'ENV'
POWERX_ENV=prod
POWERX_CONFIG=/etc/powerx/config.yaml
POWERX_LINKS_ROOT=/opt/powerx
POWERX_RUNTIME_ROOT=/etc/powerx
POWERX_BACKEND_HOST=127.0.0.1
POWERX_BACKEND_PORT=8080
POWERX_WEB_ADMIN_PORT=3000
POWERX_BACKEND=http://127.0.0.1:8080
NUXT_UPSTREAM=http://127.0.0.1:8080
NUXT_PUBLIC_API_BASE=/api/v1
NUXT_PUBLIC_UPSTREAM_ORIGIN=http://127.0.0.1:8080
NUXT_PUBLIC_POWERX_CORE_BASE=http://127.0.0.1:8080
NUXT_PUBLIC_WS_ORIGIN=ws://127.0.0.1:8080
NUXT_PUBLIC_WS_PATH=/api/ws
POWERX_GATEWAY_BASE_URL=http://127.0.0.1:3000
POWERX_GATEWAY_WS_BASE_URL=ws://127.0.0.1:3000
NODE_ENV=production
HOST=127.0.0.1
PORT=3000
ENV
sudo chown powerx:powerx /etc/powerx/config.yaml /etc/powerx/powerx.env
sudo chmod 600 /etc/powerx/config.yaml /etc/powerx/powerx.env
sudo -u powerx /opt/powerx/backend/database init-secrets -config /etc/powerx/config.yaml
```

**通过条件**：初始化输出 JWT 为 `generated`、服务密钥为 `existing`（保留本次构建值），不打印密钥正文。以实际服务账号执行，避免 root 生成 0600 文件后服务账号读不到。

此时不手动 seed、不改安装状态。表结构和管理员初始化留给步骤 8 的 Setup。

## 7. 安装并启动 systemd 服务

在**服务器终端**创建两项明确的服务定义。这里直接管理程序，不调用 release 切换／回退脚本。

<details>
<summary>展开复制两项服务定义</summary>

```bash
sudo tee /etc/systemd/system/powerx-backend.service > /dev/null <<'UNIT'
[Unit]
Description=PowerX Backend
After=network-online.target postgresql.service redis-server.service
Wants=network-online.target

[Service]
Type=simple
User=powerx
Group=powerx
WorkingDirectory=/opt/powerx/backend
EnvironmentFile=/etc/powerx/powerx.env
UMask=0077
ExecStart=/opt/powerx/backend/powerx
Restart=on-failure
RestartSec=3
LimitNOFILE=65535

[Install]
WantedBy=multi-user.target
UNIT
sudo tee /etc/systemd/system/powerx-web-admin.service > /dev/null <<'UNIT'
[Unit]
Description=PowerX Web Admin
After=powerx-backend.service
Requires=powerx-backend.service

[Service]
Type=simple
User=powerx
Group=powerx
WorkingDirectory=/opt/powerx/web-admin
EnvironmentFile=/etc/powerx/powerx.env
UMask=0077
ExecStart=/opt/powerx/tools/node-v22.23.2-linux-x64/bin/node /opt/powerx/web-admin/.output/server/index.mjs
Restart=on-failure
RestartSec=3

[Install]
WantedBy=multi-user.target
UNIT
```

</details>

复制完两项 unit 后，在**服务器终端**校验并启动：

```bash
sudo systemd-analyze verify /etc/systemd/system/powerx-backend.service /etc/systemd/system/powerx-web-admin.service
sudo systemctl daemon-reload
sudo systemctl enable --now powerx-backend powerx-web-admin
sudo systemctl status powerx-backend powerx-web-admin --no-pager
curl -fsS --retry 30 --retry-connrefused --retry-delay 2 \
  http://127.0.0.1:8080/api/v1/health
curl -fsS http://127.0.0.1:8080/api/v1/admin/setup/status
```

**通过条件**：unit 校验没有错误，两项服务为 `active (running)`，健康请求成功，Setup 为 `uninstalled`、`configured: false`。启动后需要短暂等待；失败时先看本页末尾的日志命令，不反复初始化数据库。

独立 Runner 不是这条首装路线的必需项，本页不创建或启用 runner 服务。插件子进程由 PowerX 的 supervisor 管理。

## 8. 通过 SSH 隧道完成 Setup

在**自己电脑的终端**执行，将 `your-user@your-server` 换成实际 SSH 用户和服务器地址：

```bash
ssh -N -L 3000:127.0.0.1:3000 -L 8080:127.0.0.1:8080 your-user@your-server
```

保持隧道运行，在**自己电脑浏览器**打开 [http://127.0.0.1:3000/setup](http://127.0.0.1:3000/setup)。本机 3000 与 8080 都必须空闲；这里两条转发分别服务页面和后端／WebSocket。

1. **系统检查与许可**：确认许可，部署环境选 `prod`，与实际配置一致。
2. **域名与 HTTPS**：系统域名填 `127.0.0.1:3000`，不带协议；HTTPS 关闭（仅 SSH 隧道访问）。后端端口 `8080`，管理端端口 `3000`。
3. **数据库与基础配置**：PostgreSQL 16，主机 `127.0.0.1`、端口 `5432`、库名和用户均为 `powerx`，使用步骤 2 的密码；Redis 主机 `127.0.0.1`、端口 `6379`、索引 `0`，使用步骤 3 的密码。两项连接测试成功后再继续。存储选 `local`，目录 `/var/lib/powerx/media`，公开地址 `http://127.0.0.1:8080/media`。
4. **管理员与租户**：设置自己的用户名、邮箱、强密码与租户信息；该管理员不是 Linux 用户或数据库账号。
5. **插件与智能体**：先完成底座安装，具体插件另行安装与验收。
6. **LLM**：可以跳过，点击“完成设置”。

页面提示重启后端时，在**服务器终端**执行：

```bash
sudo systemctl restart powerx-backend powerx-web-admin
```

回页面点击“我已重启，立即检测”，再用刚设置的管理员账号登录 [http://127.0.0.1:3000](http://127.0.0.1:3000)。

## 9. 验证安装与持久化

在**服务器终端**执行：

```bash
sudo systemctl is-active powerx-backend powerx-web-admin
sudo systemctl is-enabled powerx-backend powerx-web-admin
curl -fsS --retry 30 --retry-connrefused --retry-delay 2 \
  http://127.0.0.1:8080/api/v1/health
curl -fsS http://127.0.0.1:8080/api/v1/admin/setup/status
sudo stat -c '%U %a %n' /etc/powerx/config.yaml /etc/powerx/powerx.env
```

**完成条件**：两项服务 `active`、`enabled`；健康成功，`data.install_status` 为 `installed`、`data.configured` 为 `true`；两个私有文件均为 `powerx 600`。`restart_required` 为 true 时核对并重启，不跳过检查。

再次重启两项 PowerX 服务后，浏览器刷新并登录，账号和租户应仍保留。关闭 SSH 隧道不会停止服务器服务。

| 位置 | 保存内容 |
| --- | --- |
| `/etc/powerx/` | 私有配置、JWT／加密密钥及实例环境 |
| `/var/lib/postgresql/` | PostgreSQL 数据，由数据库服务管理 |
| `/var/lib/redis/` | Redis 持久数据，由 Redis 服务管理 |
| `/var/lib/powerx/` | 媒体、插件与系统快照 |
| `/var/log/powerx/` | 审计文件；程序服务日志另在 journald |
| `/opt/powerx/releases/f99333ccd80e/` | 本次构建程序与静态资源 |

## 遇到问题

查看两项服务最近的错误：

```bash
sudo journalctl -u powerx-backend -u powerx-web-admin -n 100 --no-pager
```

| 现象 | 处理 |
| --- | --- |
| `permission denied` 读取配置 | 检查文件归 `powerx`、权限 600、`/etc/powerx` 目录归属；不要改成 644 绕过 |
| PostgreSQL 登录失败／找不到 vector | 用步骤 2 的普通账号命令复查；确认扩展由数据库管理员建在 `powerx` 库中 |
| Redis `NOAUTH` | 核对 cache、queue、event fabric 三处及其 authorization 配置使用同一个 Redis 密码 |
| Web 服务执行失败 | 检查 unit 中固定 Node 路径存在，版本为 v22.23.2，构建产物完整 |
| 浏览器页面正常但 API／WS 失败 | 确认 3000 和 8080 两条 SSH 转发都运行，私有配置与环境未混用 systemd-dev 的 3001／8081 |
| 完成安装失败 | 保留配置和数据库，查看日志具体错误并从同一 Setup 草稿重试；不要执行 refresh、伪造 installed 或重新生成密钥 |

下一步：[安装插件](/zh/guides/publish/local-install)；公网开放、备份和升级见[安装后的运维准备](/zh/guides/maintenance)。

<details>
<summary>版本与源码依据</summary>

本文核对 PowerX `f99333ccd80eb3c2467fe6cc9009917340556424` 的[构建目标](https://github.com/ArtisanCloud/PowerX/blob/f99333ccd80eb3c2467fe6cc9009917340556424/make_files/dist.mk)、[生产模板](https://github.com/ArtisanCloud/PowerX/blob/f99333ccd80eb3c2467fe6cc9009917340556424/backend/etc/config_example.prod.yaml)、[密钥初始化](https://github.com/ArtisanCloud/PowerX/blob/f99333ccd80eb3c2467fe6cc9009917340556424/backend/config/init_secrets.go)与 [Setup 实现](https://github.com/ArtisanCloud/PowerX/blob/f99333ccd80eb3c2467fe6cc9009917340556424/backend/internal/transport/http/admin/system/setup_handler.go)。服务定义显式固定了本文路径与端口；未调用历史 release 切换脚本，不承诺自动回滚。本文命令经过源码静态核对，本次文档修订未重新执行全新服务器安装。

</details>
