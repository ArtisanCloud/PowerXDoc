---
title: 本地开发启动
description: 已有 PostgreSQL 和 Redis 时，从最新 Release 源码直接启动 Go 后端与 Node.js 后台，不需要 Docker。
---

# 本地开发启动

这篇教程直接在自己的电脑运行 **Go 后端和 Node.js 管理后台**，完成首次 Setup，并用自己创建的管理员登录。**不需要安装 Docker，也不使用 XDocker。**

起点：一台开发电脑，一个全新目录。终点：`http://127.0.0.1:3030` 可以登录，后端安装状态为 `installed`。

## 1. 检查工具

适用 macOS 或 Linux，使用 Bash 终端。**本页假设开发工具、PostgreSQL 和 Redis 已安装**，只说明如何连接并启动 PowerX，不展开环境安装。使用本地文件存储，不需要 MinIO。

| 工具 | 本教程使用的版本／要求 |
| --- | --- |
| Git、Make、curl、OpenSSL | 系统可执行命令 |
| Go | **1.26.7**，与本次源码 `backend/go.mod` 一致 |
| Node.js | **22.23.2**，使用随附的 npm |
| 数据服务 | 可连接的 PostgreSQL **16 + pgvector**、Redis **7**；可以是已有服务 |

<details>
<summary>不确定工具版本？展开检查</summary>

在**本机终端 A**执行：

```bash
bash
set -eu
git --version
make --version
go version
node --version
```

看到 Go `1.26.7`、Node `v22.23.2`，且其他工具没有报错即可。

</details>

以下命令在本机 Bash 终端运行；不要用 sudo 运行整个开发项目。

## 2. 获取最新 Release 的源码

在**本机终端 A**执行。`~/powerx-local` 必须是新目录，不覆盖已有实例：

```bash
git clone --depth 1 --branch docker-dev-f99333ccd80e https://github.com/ArtisanCloud/PowerX.git ~/powerx-local
cd ~/powerx-local
```

截至 **2026-11-01**，最新已发布的容器 Release 是 `docker-dev-f99333ccd80e`，属于**预发布**，不是稳定版。这里仅取对应源码，不下载镜像、不执行额外版本检测脚本。固定本次 Release 是为了让后续步骤保持一致，不是让读者长期使用旧版本。

维护约定：新 Release 发布后，文档应同步更新这里的标签、工具要求和验证结果；尚未同步时，不把这条命令称为实时自动获取最新版。源码核对依据见页末。

## 3. 确认数据库与缓存可连接

**已有服务直接用，不需要另建容器。** 准备一个仅供本次开发使用的空数据库和账号，确认安装了 pgvector；再准备可使用的 Redis 连接。不要把测试迁移连到客户或正式数据库。

需要记下：数据库主机、端口、库名、用户名、密码，以及 Redis 主机、端口、密码。以下默认用本机 PostgreSQL `127.0.0.1:5432`、数据库／账号 `powerx`，Redis `127.0.0.1:6379`。使用其他连接时，下面的检查和 Setup 要同步替换；Redis 还需写入步骤 4 配置。远程服务通过已有可信内网或隧道连接，不为本教程开放数据库公网端口。

<details>
<summary>已有连接不确定是否可用？展开检查</summary>

在**本机终端 A**检查连接，按提示输入对应密码：

```bash
psql -h 127.0.0.1 -p 5432 -U powerx -d powerx -W \
  -c "SELECT current_user, extversion FROM pg_extension WHERE extname='vector';"
redis-cli -h 127.0.0.1 -p 6379 --askpass ping
```

**通过条件**：第一条返回 `powerx` 和 vector 版本，第二条返回 `PONG`。已有本机 Redis 未设密码时，去掉 `--askpass` 再执行，并在后续配置中保持空字符串。`psql`／`redis-cli` 使用已有 PostgreSQL／Redis 附带的客户端。缺少服务或扩展时，先由自己的环境维护者补齐，不需要为了这篇教程安装 Docker。

</details>

本教程需要 PostgreSQL 和 Redis；MinIO、Kafka、RabbitMQ 和 NATS 不需要安装。

## 4. 准备自己的运行配置

在**本机终端 A**执行：

```bash
cd ~/powerx-local
test ! -e backend/etc/config.yaml
cp backend/etc/config_example.yaml backend/etc/config.yaml
chmod 600 backend/etc/config.yaml
openssl rand -hex 32
```

最后一条生成上传签名密钥；数据库与 Redis 使用步骤 3 已验证的连接与密码。将值保存到密码管理器，不要提交到 Git 或发送到聊天中。

用编辑器打开 `backend/etc/config.yaml`，**修改已有字段，勿在文件末尾追加同名段落**：

先改这几项，其余保留开发模板默认值：

| 要填的内容 | 配置位置 |
| --- | --- |
| 已有 Redis 连接 | `cache` 下的 `host`、`port`、`password`；`queue.redis.addr` 填同一 `主机:端口` |
| 仅本机监听 gRPC | `server.grpc.host: 127.0.0.1` |
| 本地文件访问地址 | `storage.local.public_base_url: http://127.0.0.1:8077/media` |
| 刚生成的上传签名密钥 | `storage.local.upload_token_secret` |

数据库连接稍后在 Setup 填写，不必先手工写 YAML。**当前 Setup 的 Redis 连接测试不会把 Redis 值写回运行配置**，所以这里仍需填写 `cache`；不能只凭连接测试成功就跳过它。其余三处 Redis 密码保留模板空值，启动时会继承 `cache.password`，不用重复填写。**如果 Redis 不是本机 6379**，还需把 `event.fabric.redis_addr`、`event.fabric.authorization.redis_addr` 改为同一个实际地址。

<details>
<summary>哪些默认值不用改？</summary>

本次开发模板已使用 `deployment.env: dev`、后端 `127.0.0.1:8077`、`database.dsn: ""`、本机数据库 `ssl_mode: disable`、Redis DB `0`、`storage.default_driver: local`、文件目录 `./storage/media` 和 `install.status: uninstalled`。

`auth.jwt_secret`、`server.secret_key` 保持空，下一步自动生成。保留允许 `http://127.0.0.1:3030` 的 `http_security.web_admin_origins`。不需要填写 S3／MinIO 示例凭据。远程数据库的 TLS 配置需按现有连接要求填写，不能照搬本机的 `disable`。

</details>

## 5. 初始化密钥并安装前端依赖

仍在**本机终端 A，源码根目录**执行：

```bash
make init-secrets CONFIG=backend/etc/config.yaml
npm --prefix web-admin ci
```

首次会下载 Go／Node 依赖。**通过条件**：密钥初始化输出 `generated`（再次执行为 `existing`），npm 安装成功。命令不会打印 JWT 或服务加密密钥。

此时还没有完成安装，也没有管理员。**不要执行 `make seed`、`make db-refresh`，也不要手改为 `installed`。** 接下来后端先进入无需连接数据库的 Setup 模式，由向导连接数据库、迁移表结构并收集管理员信息；不需要先执行 `make migrate`。

## 6. 分别启动后端和管理后台

**本机终端 A**：

```bash
cd ~/powerx-local
POWERX_ENV=dev make dev
```

保持它运行，看到服务就绪后，打开**本机终端 B**：

```bash
cd ~/powerx-local
POWERX_ENV=dev npm --prefix web-admin run dev -- --host 127.0.0.1 --port 3030
```

看到 Nuxt 显示 `http://127.0.0.1:3030` 后继续。本教程显式指定 3030；不要把 Nuxt 默认端口或 systemd-dev 的 3001／8081 混进来。

## 7. 完成首次 Setup

在**本机浏览器**打开 [http://127.0.0.1:3030/setup](http://127.0.0.1:3030/setup)。按页面顺序填写：

1. **系统检查与许可**：确认许可，部署环境选 `dev`。
2. **数据库与基础配置**：数据库类型 PostgreSQL、版本 16、主机 `127.0.0.1`、端口 `5432`、库名和用户均为 `powerx`；密码使用步骤 3 已验证的 PostgreSQL 密码。Redis 主机 `127.0.0.1`、端口 `6379`、索引 `0`，填 Redis 密码。两项连接测试成功后再继续。文件存储选 `local`，目录 `./storage/media`（把默认 `/data/uploads` 改成这个开发目录）。
3. **域名与 HTTPS**：系统域名填 `127.0.0.1:3030`，不带协议；HTTPS 选关闭。后端端口 `8077`，管理端端口 `3030`。
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

开发结束时，在后端和前端终端按 `Ctrl+C`，已有数据服务不随开发项目停止。保留数据库数据、私有 `config.yaml`、原密钥和 `backend/storage/`。再次开发只需确认依赖可连接并执行步骤 6，不重新首装。

## 遇到问题

| 现象 | 先检查什么 |
| --- | --- |
| Go 的 Sonic／ABI 编译错误 | 确认实际使用 Go 1.26.7；不要用旧 Go 编译这个快照 |
| 数据库／Redis 连接失败 | 重新执行步骤 3 的 `psql`／`redis-cli` 检查；核对服务是否运行、实际地址／端口和密码 |
| 打开 Setup 不代表安装完成 | 按步骤 7 完成向导；不要用 seed 或改安装标志代替 Setup |
| Setup API 404 或页面连接失败 | 核对后端 8077、前端 3030 和 `POWERX_BACKEND`；看终端 A、B 的日志 |
| 密钥无效／配置不可写 | 确认启动日志读取的是本次 `config.yaml`，且归当前用户所有；已有实例恢复原密钥，勿删除配置重建 |

下一步：[创建第一个插件](/zh/guides/publish/local-init) → [本地联调](/zh/guides/publish/local-dev-debug)。

<details>
<summary>版本与源码依据</summary>

本页命令核对基线为 PowerX `f99333ccd80eb3c2467fe6cc9009917340556424`；步骤 2 明确使用截至核对日期最新 Release 的标签，不运行文档仓库的检测脚本。核对来源包括 [Make 迁移入口](https://github.com/ArtisanCloud/PowerX/blob/f99333ccd80eb3c2467fe6cc9009917340556424/make_files/database.mk)、[开发配置](https://github.com/ArtisanCloud/PowerX/blob/f99333ccd80eb3c2467fe6cc9009917340556424/backend/etc/config_example.yaml)与 [Setup 实现](https://github.com/ArtisanCloud/PowerX/blob/f99333ccd80eb3c2467fe6cc9009917340556424/backend/internal/transport/http/admin/system/setup_handler.go)。当前源码缓存工厂只注册 Redis，不能把 Setup 中其他缓存选项当成已实现的替代方案；核对了[缓存工厂](https://github.com/ArtisanCloud/PowerX/blob/f99333ccd80eb3c2467fe6cc9009917340556424/backend/pkg/cache/factory.go)。这些链接用于查阅来源，不是完成本教程的必经步骤。本文命令经过源码静态核对，本次文档修订未重新执行全新机器安装。

</details>
