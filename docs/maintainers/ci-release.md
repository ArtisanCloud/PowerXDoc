# CI 与后续发布

本次 CI PR 以当前改版 `feat/docs-clear-start` 为目标，基线为 `7d5bfbe75e263901cd58f972d190e801242ad77d`，避免把整套改版混入 CI 审阅。Docker/Nginx 机制借鉴旧 `dev/scenario` 分支，仅新增打包配置，不合并旧站内容。最新 PowerX Release 仍由浏览器动态获取。

## 当前验证入口

- PR、`dev/michaelhu`、`feat/docs-clear-start` 和 `ci/**` 分支推送执行验证，不发布镜像。
- GitHub 托管的 Ubuntu runner 使用 Node.js 22 和 `npm ci`，运行 `npm run lint`、`npm run test:workflows`、`npm run docs:build`、`npm run test:tutorial-build`。现有 43 项测试包括教程、导航、搜索/SEO、打包和 Release 选择；Python resolver 测试使用 runner 自带的 `python3`。
- 构建本地 AMD64 容器，执行 `bash scripts/ci/smoke-container.sh IMAGE`。检查 Nginx、入口和教程深链接、canonical、robots、sitemap、下载脚本及真实 404，并确认教程没有把 Release 固定在静态 HTML。
- 验证成功后，构建产物作为 Actions artifact 保留 7 天。PR 不使用 self-hosted runner 或仓库密钥，token 仅有 `contents: read`。

## 尚未启用的发布入口

只有在默认分支 `dev/michaelhu` 上手动运行工作流，并明确选中 `publish=true`，才允许发布。普通推送、PR、标签和改版分支均不能发布；默认 `publish=false`。本次不运行发布。

发布 job 必须等待验证通过，并对同一提交重新构建和 smoke 检查，然后才登录 GHCR。发布 `linux/amd64,linux/arm64`，标签为 `ghcr.io/artisancloud/powerxdoc:sha-完整提交SHA`，不更新 `latest`。摘要记录提交、SHA 标签和 `image@sha256:...`。AMD64 执行 HTTP smoke；ARM64 进行构建，尚无 ARM64 运行验证。基础镜像随时间变化，同一 SHA 重跑可能产生不同 digest，实际部署应固定摘要中的 digest。

## 正式启用前的后续步骤

1. 审阅、合并 CI 至改版分支，然后另行审阅将当前站点及 CI 合入默认分支。工作流需进入默认分支，才会显示手动运行入口；当前默认分支比改版落后 8 个提交。
2. 首次镜像发布需另行授权，并检查 GHCR 现有 package 权限。本次不调整仓库或 package 权限、GitHub 环境或 secrets。
3. 部署须另行设计并授权：人工确认具体 digest、受限服务器凭据、健康检查和上一 digest 回滚。当前没有服务器部署或回滚任务；也不跟随 `latest` 自动升级。
