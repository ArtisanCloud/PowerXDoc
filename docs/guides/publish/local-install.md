# 插件直接 Local Install 指南

- **覆盖场景**: `SCN-DEV-PLUGIN-PUBLISH-001`（本地部署/验收支线）
- **关联规范**:
  - `../Plugins/PowerXPlugin/specs/004-publish-hub-spec/spec.md`（Publish Hub 双通路）
  - `../PowerX/specs/009-install-plugin-pxp/spec.md`（安装/回滚 API）
  - `../PowerXPluginMarket/specs/010-install-plugin-pxp/spec.md`（离线上传、指纹）
- **延伸阅读**: `../Plugins/PowerXPlugin/docs/guides/publish/local-install.md`（CLI/Makefile 版完整教程）

本指南聚焦“**不经过 Marketplace，直接把 `.pxp`/dist 包装到 PowerX 环境**”的流程——适用于隔离网络演示、客户私有化验收或研发团队想快速验证 release 版本。它与 `px-plugin dev --watch` 的热重载完全不同：local install 是一次性部署一个可运行版本，并写入 Admin API 维护的插件列表。

---

## 0. 模式对比：Local install vs `px-plugin dev --watch`

| 维度 | Local install (`/admin/plugins/install/local`) | `px-plugin dev --watch` |
|------|-----------------------------------------------|------------------------|
| 目标 | 正式部署并长期保留一个可运行版本 | 开发调试、快速热更新 |
| 产物 | 磁盘上的 `dist/<version>` 或解包后的 `.pxp` | 内存中的差异包，会话结束即失效 |
| 接口 | `/admin/plugins/install/local`、`/internal/plugins/local/install` | `/internal/dev/plugins/register` + SSE（`plugin_dev`） |
| 是否写入插件列表 | 是，需显式卸载或切换版本 | 否，终端退出自动撤销 |
| 典型场景 | 离线演示、隔离环境验收、客户内网部署 | 日常开发、自测 |

因此：**先用 `dev --watch` 调通协议，再用 local install 部署稳定版本对外交付**。local install 也可以结合 `.pxp`/签名流程，在必要时同步到 Marketplace。

---

## 1. 前置条件

| 项目 | 说明 |
|------|------|
| dist 产物 | 插件仓库具备 `make dist`（或等效脚本），能生成 `dist/<version>`，包含 `backend/`、`web-admin/`、`plugin.yaml`、`publish.yml`、`manifest.json`。|
| 权限 | 拥有 PowerX Admin Token（`platform_ops` / `plugin_admin`），可访问 `/api/admin/plugins/**`。|
| 环境变量 | `API_BASE`（含 `apiPrefix`，如 `https://dev.powerx.local/api/v1`）与 `ADMIN_TOKEN`。|
| 服务器目录 | PowerX 机器能访问 `src_dir`（本地或远程路径）。若通过 CLI `--host-api` 打到宿主，请确认 `PX_PLUGIN_DEV_MODE` 等开关已启用。|

示例：

```bash
export API_BASE="https://dev.powerx.local/api/v1"
export ADMIN_TOKEN="eyJhbGciOi..."
```

---

## 2. 流程概览

1. **构建 dist**：`make dist` 或按手册手动编译 Go/Nuxt；必要时指定 `VERSION=0.2.0`。
2. **（可选）生成 `.pxp`**：`px-plugin pack` 或 `make pack KEY_ID=... PUBLIC_KEY=...`，保留 `integrity.txt`、`manifest.signature`。
3. **传输产物**：将 `dist/<version>`（或 `.pxp` 解包后的目录）同步到 PowerX 服务器，例如 `/srv/powerx/plugins/com.powerx.demo/dist/0.2.0`。
4. **调用 Admin API**：向 `/admin/plugins/install/local` 提交 `src_dir`，决定是否 `enable`、`force`。
5. **（可选）Host API 快速循环**：研发脚本可直接命中 `/internal/plugins/local/install` 与 `/internal/plugins/local/reload`，效果等价于 Admin API，但仅在受信主机暴露。

以下章节给出命令示例与自检清单。

---

## 3. 构建 dist

推荐使用 Phase 14 模板内置的 Makefile：

```bash
# 插件根目录执行
make dist
# 或指定版本号
VERSION=0.2.0 make dist
```

`make dist` 内部会执行：

1. `go build` → 输出 `dist/backend/bin/plugin`；
2. `npm --prefix web-admin install && npm --prefix web-admin run build`；
3. 拷贝 `plugin.yaml`、`publish.yml`、`manifest.json` 到 `dist/<version>/`。

若模板尚未合并，可按 `../Plugins/PowerXPlugin/docs/guides/publish/local-install.md#%E6%89%8B%E5%8A%A8%E6%9E%84%E5%BB%BA` 的步骤手动整理目录，并确保 `manifest.json`/`publish.yml` 与 spec 要求一致。

---

## 4. 传输并调用 `/admin/plugins/install/local`

将 dist 复制到 PowerX 机器：

```bash
DIST_VERSION=0.2.0
rsync -avz dist/$DIST_VERSION \
  powerx-admin:/srv/powerx/plugins/com.powerx.demo/dist/$DIST_VERSION
```

然后由具备 Token 的环境调用 Admin API：

```bash
curl -X POST "$API_BASE/admin/plugins/install/local" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
        "src_dir": "/srv/powerx/plugins/com.powerx.demo/dist/0.2.0",
        "enable": true,
        "force": false
      }'
```

- `src_dir`：PowerX 服务器可读的绝对路径，目录内需含 `backend/`、`web-admin/`、`plugin.yaml`。
- `enable`：安装完成后立即切换为当前版本。
- `force`：已存在同版本时是否覆盖。

成功会返回：

```json
{
  "installed": {
    "id": "com.powerx.demo",
    "version": "0.2.0",
    "state": "installed"
  }
}
```

> 如果宿主配置了 `server.apiPrefix: /api`，则 URL 是 `https://host/api/admin/plugins/install/local`；根据实际前缀调整。

---

## 5. `.pxp` → local install（可选）

当你需要保留 Marketplace 同款指纹/签名时，可在 dist 基础上生成 `.pxp`，然后再在宿主解包：

```bash
px-plugin pack \
  --plugin-id com.powerx.demo \
  --manifest dist/manifest.json \
  --output dist/artifacts/com.powerx.demo-0.2.0.pxp

make local-install-pxp \
  PACKAGE=dist/artifacts/com.powerx.demo-0.2.0.pxp \
  API_BASE=$API_BASE TOKEN=$ADMIN_TOKEN
```

`make local-install-pxp` 会：

1. 在临时目录解包 `.pxp`；
2. 校验 `integrity.txt`/`checksums.txt`；
3. 再次调用 `/admin/plugins/install/local`。

也可以手动 `unzip` 后复用上一节的 `curl`，此路径与 `docs/guides/publish/offline-publish.md` 的离线导入步骤兼容。

---

## 6. Host API（`--host-api`）脚本

CLI/脚本需要绕开 Admin API、直接在宿主打接口时，可使用 `px-plugin dev --host-api https://powerx.local:7443` 提供的入口。`plugin_dev` 模块已经开放：

- `POST /internal/plugins/local/install`
- `POST /internal/plugins/local/reload`

请求体与 Admin API 相同，区别在于：

```bash
curl -X POST "https://powerx.local:7443/internal/plugins/local/install" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
        "src_dir": "/srv/powerx/plugins/com.powerx.demo/dist/0.2.0",
        "enable": false,
        "force": true
      }'
```

该接口通常只在内网或 `px-plugin dev --watch` 的 watch session 中暴露，适合 CI、Dev Gateway 或 `make local-install` 复用。

---

## 7. 验证与自检

- [ ] `make dist` 输出的目录包含 `backend/bin/plugin`、`web-admin/.output/public`、`plugin.yaml`、`publish.yml`、`manifest.json`。
- [ ] `curl /admin/plugins/install/local` 返回 `installed.state = installed`，并能在 Admin UI → 插件管理中看到目标版本。
- [ ] 通过 `curl $API_BASE/admin/plugins/<id>/status` 或 `px version scan` 能查到新版本。
- [ ] 若使用 `.pxp`，`integrity.txt` 与宿主日志中的指纹一致。
- [ ] 重复执行 `make local-install`（或 Host API）不会破坏现有运行版本，`force=false` 时会提示版本已存在。

---

## 8. 常见问题

| 症状 | 排查建议 |
|------|-----------|
| `404 /admin/plugins/install/local` | 检查 `server.apiPrefix` 配置，确认 Admin API 已注册 `plugin_install` 路由。|
| `src_dir not exists` | 命令需要在能访问目标路径的机器执行；通过 SSH/CI 进入 PowerX 服务器再调用。|
| `.pxp` 直接安装失败 | `.pxp` 仍需解包为 dist；参考「5. `.pxp` → local install」。|
| 与 `dev --watch` 混淆 | 记住 watch 会话不写入插件列表；local install 面向正式版本，需要显式 enable/rollback。|
| 需要 reload 而非 reinstall | 使用 `POST /internal/plugins/local/reload`，它会在不变更版本号的情况下重启插件。

---

完成以上步骤后，即可把 `.pxp` 或 dist 交付给隔离环境的管理员。若后续仍需经 Marketplace 分发，请继续阅读《[离线发布与导入](./offline-publish.md)》和《[在线发布与上架](./online-publish.md)》。
