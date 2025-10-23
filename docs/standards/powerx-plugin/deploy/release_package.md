# 插件打包与发布规范（Plugin Release & Packaging Guide）

> 本页目标：说明 **PowerX 插件的标准打包、签名与发布流程**，  
> 确保所有插件在 Plugin Marketplace、CI/CD 或手动安装场景下可被安全识别与自动部署。  
>
> 读者对象：插件作者 / DevOps / Marketplace 管理员。

---

## 一、总体设计目标

PowerX 插件的打包机制追求：

| 目标 | 说明 |
|------|------|
| **可移植性** | 打包后可跨平台（Linux/Mac/Windows）安装运行 |
| **自描述性** | 包含完整 `plugin.yaml` 与版本元信息 |
| **完整性** | 包含后端二进制与前端 `.output` 构建产物 |
| **安全性** | 可验证签名与哈希 |
| **可追踪性** | 包含唯一版本号、构建时间与提交哈希 |

---

## 二、标准目录结构

构建完成后（执行 `make release` 或 `make package-release`）的产物结构如下：

```

target/
└── 0.1.0/
├── plugin.yaml
├── backend/
│   └── bin/
│       └── plugin
├── web-admin/
│   └── .output/
├── README.md
├── LICENSE
├── checksums.txt
└── manifest.json

```

最终压缩为：

```

powerx-plugin-base-0.1.0-release.zip

````

---

## 三、打包命令与流程

### 1️⃣ 本地打包

```bash
make release
make package-release
````

执行步骤：

1. 构建后端二进制 → `backend/bin/plugin`
2. 构建前端（若存在） → `web-admin/.output`
3. 复制清单与文档 → `target/<version>/`
4. 生成哈希文件 → `checksums.txt`
5. 压缩为 ZIP → `powerx-plugin-<version>-release.zip`

---

### 2️⃣ CI/CD 集成

GitHub Actions 示例：

```yaml
name: Plugin Release
on:
  push:
    tags: ['v*']

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-go@v5
        with: { go-version: '1.21' }
      - uses: actions/setup-node@v4
        with: { node-version: '18' }

      - name: Build release
        run: VERSION=${GITHUB_REF_NAME#v} make release

      - name: Package zip
        run: make package-release

      - name: Upload artifact
        uses: actions/upload-artifact@v4
        with:
          name: plugin-release
          path: target/**/*.zip
```

---

## 四、必备文件说明

| 文件                   | 说明              |
| -------------------- | --------------- |
| `plugin.yaml`        | 插件主清单（Manifest） |
| `README.md`          | 插件说明文档          |
| `LICENSE`            | 许可证             |
| `backend/bin/plugin` | 可执行后端服务         |
| `web-admin/.output`  | 前端构建产物（若有）      |
| `checksums.txt`      | SHA256 校验文件     |
| `manifest.json`      | 发布元数据（系统生成）     |

---

## 五、manifest.json 格式

PowerX Plugin Manager 在打包阶段自动生成 `manifest.json`：

```json
{
  "id": "com.powerx.plugins.base",
  "version": "0.1.0",
  "name": "Base Template Plugin",
  "description": "PowerX 插件模板",
  "author": "ArtisanCloud",
  "build_time": "2025-10-11T14:00:00Z",
  "commit_hash": "5f38a3c",
  "compatibility": {
    "powerx_min": "1.0.0",
    "powerx_max": "2.0.0"
  },
  "checksum": {
    "plugin.yaml": "7a22e91a...",
    "backend/bin/plugin": "f8a9d3c1...",
    "web-admin/.output/index.html": "c5320f..."
  }
}
```

PowerX 在安装时会校验：

* `id` 与版本；
* `checksum` 哈希；
* 兼容区间（`powerx_min` ≤ 当前版本 ≤ `powerx_max`）。

---

## 六、校验机制

### 1️⃣ 哈希校验

执行：

```bash
sha256sum -c checksums.txt
```

若全部通过：

```
OK
```

### 2️⃣ 签名校验（可选）

使用 GPG 或 Cosign 进行数字签名：

```bash
cosign sign-blob target/0.1.0/powerx-plugin-base-0.1.0-release.zip \
  --key cosign.key \
  --output-signature target/0.1.0/signature.sig
```

PowerX Marketplace 会验证：

```bash
cosign verify-blob --key cosign.pub --signature signature.sig powerx-plugin-base-0.1.0-release.zip
```

---

## 七、版本号与兼容策略

遵循 **SemVer（语义化版本号）**：

| 类型       | 规则         | 示例            |
| -------- | ---------- | ------------- |
| **主版本**  | 不兼容 API 改动 | 1.0.0 → 2.0.0 |
| **次版本**  | 向后兼容功能增强   | 1.0.0 → 1.1.0 |
| **补丁版本** | Bug 修复     | 1.0.0 → 1.0.1 |

PowerX Marketplace 版本策略：

* 同一插件允许多个版本共存；
* `latest` 指向最高稳定版；
* 插件依赖约束可使用：

  ```yaml
  requires:
    - com.powerx.plugins.crm >=0.5.0 <1.0.0
  ```

---

## 八、安装与卸载流程

### 安装

1️⃣ 上传 ZIP 至 PowerX Marketplace 或手动复制到：

```
$POWERX_HOME/plugins/
```

2️⃣ PowerX Plugin Manager 解压结构：

```
plugins/com.powerx.plugins.base/
  plugin.yaml
  backend/bin/plugin
  web-admin/.output/
```

3️⃣ 校验签名与哈希；
4️⃣ 注册菜单、权限与 Agent；
5️⃣ 启动插件进程。

### 卸载

宿主命令：

```bash
powerx plugins uninstall com.powerx.plugins.base
```

操作步骤：

1. 调用插件 `/api/v1/admin/uninstall`（若存在）；
2. 停止进程；
3. 删除目录与 schema；
4. 更新插件注册表。

---

## 九、发布签名（PowerX Marketplace）

每个插件上架 Marketplace 时需上传签名元信息：

| 字段             | 说明          |
| -------------- | ----------- |
| `signature`    | Base64 编码签名 |
| `public_key`   | 开发者公钥       |
| `publisher_id` | 开发者或组织 ID   |
| `build_time`   | 构建时间        |
| `verified`     | 是否通过官方验证    |

PowerX Marketplace 将对签名与 hash 进行比对，
确保包来源可信且未被篡改。

---

## 十、插件追踪与版本探针（可选）

PowerX 可选开启「版本探针」机制：

* 每次插件启动时，定期向 Marketplace 上报：

  * plugin_id / version / instance_id；
* 仅用于统计，不包含用户隐私；
* 支持匿名 UUID。

示例：

```bash
POST https://market.powerx.io/ping
{
  "plugin_id": "com.powerx.plugins.base",
  "version": "0.1.0",
  "instance_id": "uuid-xxx-yyy-zzz"
}
```

---

## 十一、安全建议

✅ **始终包含校验文件（checksums.txt）**
✅ **版本号与 commit 一致**（推荐从 Git Tag 自动生成）
✅ **构建产物只包含必要文件**
✅ **后端二进制剥离符号表（strip）**
✅ **前端 `.output` 不包含 `.map` 文件**
✅ **上传前扫描漏洞与依赖风险**

---

## 十二、PowerX 插件发布流程图

```text
[开发者] 
   ↓  make release
[构建产物] 
   ↓  make package-release
[生成 ZIP + checksums + manifest.json]
   ↓
[上传至 Marketplace 或内部镜像]
   ↓
[PowerX Plugin Manager 安装]
   ↓
[解压 → 校验 → 注册 → 启动]
```

---

## 十三、常见问题（FAQ）

| 问题                       | 原因                        | 解决方案                     |
| ------------------------ | ------------------------- | ------------------------ |
| PowerX 无法识别插件            | 缺失 plugin.yaml            | 确认清单路径正确                 |
| 启动报错 `checksum mismatch` | 文件被修改                     | 重新打包                     |
| 前端未生效                    | `.output` 未构建             | 运行 `make frontend-build` |
| 版本未更新                    | 未修改 `plugin.yaml.version` | 更新版本号并重新打包               |
| Marketplace 验签失败         | 签名文件不匹配                   | 检查签名命令与公钥                |

---

## 十四、示例 checksums.txt

```
f8a9d3c19ad3d6b2b1f5d42d  backend/bin/plugin
c5320fa131a54cdd22e0b6b5  web-admin/.output/index.html
b42d1ce79a823445e2a3a5d4  plugin.yaml
f0b1da1459edc4cf551c3ef8  manifest.json
```

---

## 十五、总结

* 插件包必须自包含所有必要资源；
* 版本、哈希与签名构成安全三要素；
* 统一目录结构保证自动安装；
* PowerX Marketplace 自动完成验签与注册；
* 强制使用 SemVer 版本控制；
* 支持离线安装、CI/CD 自动发布。

---

## 十六、关联文档

| 模块        | 文档                                                         |
| --------- | ---------------------------------------------------------- |
| 构建与任务说明   | [makefile_tasks.md](../developer/makefile_tasks.md)        |
| 签名上下文规范   | [ctx_signing.md](../contract/ctx_signing.md)               |
| 反代通信协议    | [powerx_integration.md](../contract/powerx_integration.md) |
| 安全加固指南    | [security_hardening.md](./security_hardening.md)           |
| Docker 部署 | [docker_guide.md](./docker_guide.md)                       |

---

## 十七、下一步阅读

* 🐳 [Docker 构建与部署说明](./docker_guide.md)
* 🧱 [环境变量与配置指南](./env_vars.md)
