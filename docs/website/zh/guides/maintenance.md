---
title: 安装后的运维准备
description: 首次安装完成后，再规划公网 HTTPS、备份恢复与版本升级；保留实例身份与密钥。
---

# 安装后的运维准备

三篇安装教程到“能够登录并验证持久化”为止。准备正式对外服务时，再完成这一页的工作；无需为体验首装先执行升级或备份恢复脚本。

## 公网入口

首次 Setup 保持在 SSH 隧道内完成。公开访问前准备自己的域名、DNS 和有效 HTTPS 证书，将入口同时代理到管理后台和后端，并转发 WebSocket／SSE：

| 路径 | 后端目标 |
| --- | --- |
| 页面 `/` | 管理后台，systemd 为 `127.0.0.1:3000`；XDocker 网络中为 web-admin 的 3000 |
| `/api/`、`/ws/`、`/media/`、`/healthz` | 后端，systemd 为 `127.0.0.1:8080`；XDocker 网络中为 backend 的 8080 |

实际配置时统一浏览器 HTTPS origin、WSS origin、媒体公开地址和允许的前端 origin，保留请求路径、Host 与 X-Forwarded-Proto，启用 WebSocket Upgrade。XDocker 的 `sites/powerx-dev` 是接入共享入口的模板；本文首装使用的是独立私有 gateway，不应同时把另一个入口当作已配置完成。

公网入口的域名、证书和现有反向代理因部署环境而异。完成后分别验证页面、登录、上传、WebSocket／SSE，再开放给业务用户；数据库与 Redis 仍不发布到公网。部署身份 `deployment.env` 不随入口域名变化而更改，已安装实例不重新进入 Setup。

## 先验证备份能恢复

备份应覆盖 PostgreSQL 的一致性逻辑导出、Redis 持久数据、私有配置与密钥、插件及上传文件。数据库与配置必须属于同一实例、同一恢复时点；恢复到隔离目录／隔离数据库，确认能够启动和登录后，再把备份认作有效。

不要只保存镜像或 `.env`；不要在数据库运行时直接复制 PostgreSQL 数据目录；不要把真实配置当作模板交给另一位部署者。JWT 与服务加密密钥丢失后，生成新值不能替代恢复原实例身份。

## 升级是独立变更

1. 记录当前源码／镜像 SHA、私有配置位置、数据库版本，保存并验证备份。
2. 阅读目标版本的迁移与兼容要求，前后端使用同一发行版本。
3. 先在隔离环境验证迁移、登录和关键业务，再安排服务维护窗口。
4. 保留原配置和密钥；只执行目标版本明确要求的迁移，不重复首装、seed 或 refresh。
5. 验证健康、安装状态、登录与业务后再结束变更。

XDocker 本教程的固定模板尚未对接新版 `POWERX_UPGRADE_MODE`／upgrade-manifest 协议，**不能直接更换成最新镜像，再套用旧 `apps.sh migrate` 作为通用升级流程**。应先对齐部署工具与目标版本的发布合同。

systemd 更换程序软链接只恢复程序版本，不恢复数据库；历史切换脚本的健康超时退出也不能据此承诺自动回滚。有不兼容数据库迁移时，必须按事先验证的恢复方案处理数据库及其对应配置。

<details>
<summary>进一步核对来源</summary>

- [固定 XDocker 版本的备份机制](https://github.com/ReDeployment/XDocker/blob/13653a6c8dab6867a9745301b94242dad677415f/docs/guides/powerx/backups.md)
- [PowerX 固定版本的 systemd 切换实现](https://github.com/ArtisanCloud/PowerX/blob/f99333ccd80eb3c2467fe6cc9009917340556424/backend/scripts/ops/switch-release-systemd.sh)

这些是运维扩展参考，不是三篇首次安装教程的前置步骤。本次仅核对文档与源码，没有在真实服务器执行升级或恢复。

</details>
