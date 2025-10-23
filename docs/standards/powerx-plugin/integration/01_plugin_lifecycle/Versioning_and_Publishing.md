# 插件版本与发布策略（01_plugin_lifecycle/Versioning_and_Publishing.md）

> 本文档定义 PowerX 插件的版本号规范、发布流程、Marketplace 登记与宿主升级机制。  
> 适用于所有基于 **PowerXPluginBase** 的插件（包括二次开发的 fork 版本）。

---

## 🧭 一、文档目标

- 统一插件版本编号与发布约定；
- 定义 `.pxp` 构建、校验与上传流程；
- 规范 Marketplace 侧的版本登记与可见策略；
- 明确宿主 PowerX 的升级与回滚机制；
- 建立版本信任链（哈希 + 签名 + 公钥）。

---

## 🧩 二、版本号规范（SemVer + 扩展通道）

PowerX 插件遵循 **语义化版本（Semantic Versioning 2.0.0）**，  
并在 Marketplace 中扩展「分发通道」(channel)。

| 字段 | 含义 | 示例 |
|------|------|------|
| **主版本（MAJOR）** | 不兼容性更改 | `2.0.0` |
| **次版本（MINOR）** | 向后兼容功能新增 | `1.3.0` |
| **修订版（PATCH）** | 向后兼容问题修复 | `1.3.2` |
| **预发布后缀（Pre-release）** | alpha / beta 版本 | `1.3.0-beta.1` |
| **构建元数据（Build meta）** | 内部标识，不影响排序 | `1.3.0+20251013` |

### 📦 通道（Channel）

Marketplace 中的可见性由 `channel` 控制：

| 通道 | 用途 | 可见性 |
|------|------|--------|
| `stable` | 稳定生产版 | 默认安装 |
| `beta` | 公测版（灰度） | 需手动选择 |
| `alpha` | 内部测试版 | 开发者私有 |
| `dev` | 本地调试版 | 不上传 Marketplace |

示例：

```yaml
version: 1.3.0
channel: stable
```

---

## 🧱 三、版本号变更原则

| 变更类型                | 说明                      | 示例                                          |
| ------------------- | ----------------------- | ------------------------------------------- |
| **Breaking Change** | 与旧版不兼容（API、Schema、事件结构） | 1.x → 2.0.0                                 |
| **Feature Add**     | 新增兼容特性                  | 1.2.0 → 1.3.0                               |
| **Fix / Patch**     | 修复缺陷，不影响接口              | 1.3.0 → 1.3.1                               |
| **Deprecation**     | 标记弃用，无重大变更              | 1.3.0 → 1.3.0 + lifecycle.status=deprecated |
| **Security Update** | 紧急修复安全问题                | 1.3.0 → 1.3.1-security.1                    |

---

## ⚙️ 四、版本构建流程（无 CLI 框架下）

在 PowerXPluginBase 工程中使用 **Makefile / 脚本** 构建 `.pxp`：

```bash
# 1️⃣ 更新版本号
yq eval -i '.version = "1.3.0"' plugin.yaml
yq eval -i '.channel = "stable"' plugin.yaml

# 2️⃣ 构建产物
make backend-build
make frontend-build

# 3️⃣ 生成 manifest.yaml
cp plugin.yaml build/pxp/manifest.yaml
yq eval -i '.build.built_at = env(BUILD_TIME)' build/pxp/manifest.yaml

# 4️⃣ 打包
cd build/pxp && zip -r ../com.powerx.plugin.crm-1.3.0-linux-amd64.pxp .

# 5️⃣ 签名
openssl dgst -sha256 -sign ./keys/private.pem build/com.powerx.plugin.crm-1.3.0-linux-amd64.pxp > SIGNATURE
```

输出目录：

```
dist/
 └── com.powerx.plugin.crm-1.3.0-linux-amd64.pxp
```

> `.pxp` 包是最终交付物：包含 manifest.yaml、后端二进制、前端产物、迁移、契约与签名文件。
> 宿主和 Marketplace 均通过其校验链（SHA256 + 签名）验证来源与完整性。

---

## 🚀 五、Marketplace 发布与版本登记

### 1️⃣ 上传 `.pxp` 构件

```bash
# 伪流程：上传至 Marketplace
curl -X POST https://market/api/v1/dev/uploads -d '{ "plugin_id": "com.powerx.plugin.crm" }'

# PUT 上传 .pxp
curl -X PUT $SIGNED_URL --upload-file ./dist/com.powerx.plugin.crm-1.3.0-linux-amd64.pxp
```

### 2️⃣ 登记版本元数据

```bash
curl -X POST https://market/api/v1/dev/plugins/com.powerx.plugin.crm/versions \
  -H "Content-Type: application/json" \
  -d '{
    "version": "1.3.0",
    "channel": "stable",
    "sha256": "xxxx",
    "signature": "base64...",
    "os": "linux",
    "arch": "amd64",
    "changelog": "新增数据同步接口",
    "dependencies": ["core>=0.9.0"],
    "release_notes_url": "https://docs.powerx.cloud/plugins/crm/releases/1.3.0"
  }'
```

### 3️⃣ Marketplace 校验项

| 校验项           | 说明                      |
| ------------- | ----------------------- |
| SHA256        | 校验包完整性                  |
| 签名（SIGNATURE） | 验证开发者身份                 |
| 版本唯一性         | 不允许相同版本重复登记             |
| 依赖检查          | 核对 PowerX Core 最低版本     |
| 生命周期          | 识别 deprecated/sunset 状态 |

> 校验通过后，Marketplace 更新可见版本列表，并触发宿主同步缓存。

---

## 🔄 六、宿主 PowerX 升级策略

当宿主检测到 Marketplace 上有新版本时，会按以下流程执行：

| 阶段          | 动作                                           | 说明 |
| ----------- | -------------------------------------------- | -- |
| 1️⃣ 检查版本    | 对比当前版本与 Marketplace 最新 stable 版本             |    |
| 2️⃣ 下载包     | 按 OS/ARCH 拉取 `.pxp` 并校验 SHA256               |    |
| 3️⃣ 解包至临时目录 | `/var/lib/powerx/plugins/com.xxx/{version}/` |    |
| 4️⃣ 校验签名    | 验证 manifest 与签名文件                            |    |
| 5️⃣ 执行迁移    | 运行 `migrations/`，失败则回滚                       |    |
| 6️⃣ 启动新版本   | 按 `manifest.runtime` 启动后端进程                  |    |
| 7️⃣ 健康检查    | 探测 `/healthz`；成功后切换活动版本                      |    |
| 8️⃣ 清理旧版本   | 延迟删除或归档旧版本文件夹                                |    |

### 回滚机制

若升级失败：

- 停止新进程；
- 回滚到上一个可用版本；
- 标记升级状态为 `failed`；
- 触发告警（Webhook/Email）。

---

## 🧩 七、版本兼容性与依赖策略

manifest 中可声明插件依赖关系：

```yaml
dependencies:
  - id: com.powerx.plugin.base
    version: ">=1.0.0"
  - id: com.powerx.plugin.crm
    version: "<2.0.0"
```

> 宿主在安装时执行拓扑排序，确保依赖已存在或自动安装兼容版本。

### PowerX Core 兼容性声明

```yaml
min_core: 0.9.0
max_core: 1.2.0
```

宿主校验：

- 若当前 CoreX < min_core → 拒绝安装；
- 若超出 max_core → 警告或禁用升级。

---

## 🧾 八、版本可见性与发布状态

| 状态               | 可安装 | 可见性   | 用途                      |
| ---------------- | --- | ----- | ----------------------- |
| `draft`          | ❌   | 开发者私有 | 本地构建                    |
| `pending_review` | ❌   | 审核中   | 等待 Marketplace 验证       |
| `published`      | ✅   | 公共可见  | 正式上架                    |
| `deprecated`     | ✅   | 标记警告  | 即将退役（参见 Deprecation 文档） |
| `sunset`         | ❌   | 不可见   | 已退役                     |

> 版本状态与 Marketplace 生命周期一致，宿主可通过 API 同步状态标签。

---

## 🔏 九、签名与公钥管理

- 每个 Vendor 拥有一对签名密钥；
- Marketplace 保存 Vendor 公钥；
- 插件 `.pxp` 中记录：

  ```yaml
  signature:
    algo: ed25519
    file: ./SIGNATURE
    pubkey: ./SIGNATURE.pub
  ```

- PowerX 核心在安装时使用公钥验证：

  ```bash
  openssl dgst -sha256 -verify SIGNATURE.pub -signature SIGNATURE manifest.yaml
  ```

> 该机制确保 `.pxp` 来自可信开发者，防止被篡改。

---

## 🧠 十、版本升级建议与策略

| 场景           | 策略                               |
| ------------ | -------------------------------- |
| **功能迭代**     | 使用 MINOR 升级；保持向后兼容               |
| **安全修复**     | 使用 PATCH 升级；更新说明中标明 CVE 编号       |
| **API 断裂变更** | 使用 MAJOR 升级；标记旧版为 deprecated     |
| **试验功能**     | 发布 beta / alpha 通道；不影响 stable 版本 |
| **租户灰度升级**   | 通过 channel 控制，仅指定租户可拉取 beta 版    |
| **紧急回滚**     | 保留旧版本 `.pxp`，可快速回滚               |
| **自动升级**     | 宿主支持版本检测与安全升级任务（cron / webhook）  |

---

## 🧩 十一、发布记录模板（建议）

放置于 `docs/releases/CHANGELOG.md`：

```markdown
# CRM Plugin 更新记录

## v1.3.0（2025-10-13）
- ✨ 新增客户分群统计 API
- ⚙️ 优化数据库索引
- 🧩 调整 manifest 签名逻辑
- 🐞 修复旧版 webhook 回调超时问题

## v1.2.3（2025-09-05）
- 🛠 修复日志写入路径权限问题
```

---

## 📚 延伸阅读

- [Manifest_and_Metadata.md](./Manifest_and_Metadata.md)
- [Deprecation_and_Sunset_Policy.md](./Deprecation_and_Sunset_Policy.md)
- [02_capabilities_and_schema/Capability_Design_Guide.md](../02_capabilities_and_schema/Capability_Design_Guide.md)
- [06_marketplace_and_business/Listing_and_Branding_Guide.md](../06_marketplace_and_business/Listing_and_Branding_Guide.md)

---

> **文档版本：** v1.0.0
> **适用范围：** PowerX ≥ 0.9.0
> **维护团队：** PluginBase 核心组 & Marketplace 团队
> **最后更新：** 2025-10
