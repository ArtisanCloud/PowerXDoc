把「.pxp」当成**PowerX 插件的发布包**就好——它是一个**不可变的、可签名的压缩包**，里面放了运行所需的一切：清单、前后端制品、数据库迁移、契约声明等。宿主（PowerX）只需要下载、校验、解压、启动即可。

下面按「是什么 → 里面有什么 → 谁在什么时候做什么」把机制讲清楚。

---

# .pxp 是什么

* **本质**：一个 ZIP 压缩包（扩展名 `.pxp`），内容**只读、不可变**。
* **粒度**：**建议每个 OS/ARCH 一个 .pxp**（如 `linux-amd64` / `darwin-arm64`）。一个版本可有多个 .pxp 构建。
* **可信链**：

    1. 市场返回 `sha256`；宿主先校验文件哈希。
    2. 包内有签名（开发者私钥签 manifest/payload）；宿主用开发者公钥复验。
* **生命周期**：下载 → 校验 → 解压到版本目录 → 迁移 → 注册 → 启动 → 健康检查 → 上线；升级是并行准备 + 原子切换，可回滚。

---

# .pxp 包内结构（推荐 v1）

```
<plugin-id>-<version>-<os>-<arch>.pxp
├─ manifest.yaml                # 插件清单（核心元数据）
├─ backend/                     # 后端可执行物或启动脚本
│  ├─ exec/                     # 进程型（Go/Node/PHAR 等）
│  │  ├─ start.sh               # 宿主调用的统一入口
│  │  └─ <your-binary-or-phar>
│  └─ docker/                   # (可选) 容器型运行配置
│     └─ image.txt              # 或 OCI ref，如 ghcr.io/acme/foo:1.2.3
├─ frontend/
│  ├─ admin/                    # 管理后台 SPA 产物
│  └─ web/                      # C 端 Web/小程序静态资源
├─ migrations/                  # 数据库迁移（SQL / goose）
│  ├─ 001_init.sql
│  └─ 002_add_index.sql
├─ contracts/                   # 契约（OpenAPI/Proto/Event Topics）
│  ├─ http.yaml
│  └─ events.yaml
├─ hooks/                       # 可选：安装/升级/卸载钩子脚本
│  ├─ pre_install.sh
│  └─ post_migrate.sh
├─ config.schema.json           # 可选：配置 UI 的 JSON Schema
├─ LICENSE                      # 许可证文本
├─ SIGNATURE                    # 清单与载荷的签名(Ed25519等, 开发者签)
└─ SIGNATURE.pub                # (可选) 对应公钥/证书链
```

---

# manifest.yaml（示例）

```yaml
id: com.example.promo
name: Promo
version: 1.0.0
channel: stable
description: Marketing promo engine
categories: [marketing, ecommerce]
min_core: 1.0.0

# 运行方式：选其一
runtime:
  type: exec            # exec|docker|http-proxy|php-fpm
  entrypoint: ./backend/exec/start.sh
  health:
    http: /healthz
    interval: 5s
  env:
    - name: PROMO_MODE
      value: "prod"

# 前端挂载
frontends:
  admin:
    base_path: /plugins/com.example.promo/admin
    dir: ./frontend/admin
  web:
    base_path: /plugins/com.example.promo/web
    dir: ./frontend/web

# 数据迁移
migrations:
  engine: goose         # goose|raw-sql
  dir: ./migrations

# 契约与权限
contracts:
  http: ./contracts/http.yaml
  events:
    publish: [promo.v1.events.PromoCreated]
    subscribe: [user.v1.events.UserTagChanged]
rbac:
  resources:
    - name: promo.campaign
      actions: [create, read, update, delete]

# 配置与密钥需求（宿主驱动 UI & 下发）
config_schema: ./config.schema.json
secrets:
  - name: PROMO_API_KEY
    description: "3rd party api key"

# 签名与发布信息（包内不含签名私钥）
signature:
  algo: ed25519
  file: ./SIGNATURE
```

> 你的 **后端可以是 PHP/PHAR**：只要 `start.sh` 能把它以 HTTP 服务跑起来（例如 `php -S 0.0.0.0:$PORT public/index.php`），宿主按 `runtime.type=exec` 启动子进程并做健康检查即可。

---

# 上下游各自要做什么

## 开发者（制作 .pxp）

1. **编译/打包**

    * 后端：编译或准备可运行体（Go 二进制、PHAR、Node bundle…）
    * 前端：build 出静态文件
    * 迁移：放 `migrations/*.sql`
    * 契约：`contracts/*`
2. **生成 manifest.yaml**（如上）
3. **签名**

    * 计算包体哈希（或对 `manifest.yaml`+特定路径做归档哈希）
    * 用开发者私钥（Ed25519/RSA）生成 `SIGNATURE`
4. **打包**：把以上目录打成 zip → `.pxp`
5. **发布**

    * 调用市场 API：`/v1/dev/uploads` 拿 `upload_url`
    * `PUT` 到对象存储
    * `/v1/dev/plugins/:id/versions` **登记**（写入 `sha256/size/storage_key` 与发行说明）

## 市场（你现在写的服务）

* 管理 **Plugin / PluginVersion** 元数据
* 存储**构建地址**与**哈希**，返回下载时的 **预签名 URL**
* 可选：保存/校验 **签名** & 提供 **开发者公钥**（/v1/licenses/public-key 或 /v1/devs/\:id/pubkey）

## 宿主（PowerX）

**安装流程（伪码）**：

1. 发现版本：

    * `GET /v1/plugins/:id/latest?channel=stable&core={core}`
2. 申请下载：

    * `POST /v1/downloads {id, version}` → 得到 `signed_url/sha256/size`
3. 下载与校验：

    * GET `signed_url` → 比对 `sha256/size`
4. 解包到版本目录：

    * `/var/lib/powerx/plugins/{id}/{version}/...`（只读）
5. 校验签名（可选但推荐）：

    * 读取 `SIGNATURE` + `manifest.yaml` → 用开发者公钥验签
6. 迁移：

    * 根据 `manifest.migrations` 执行 SQL（失败则回滚并终止安装）
7. 注册与配置：

    * 读取 `contracts/*` 自动挂载菜单/路由/事件
    * 按 `config_schema` 渲染配置 UI；将配置/密钥以 env/file 下发给进程
8. 启动进程：

    * `exec ./backend/exec/start.sh`（或拉起容器）
    * 健康检查直到 ready
9. 原子切换（升级场景）：

    * 新版本 ready 才替换当前 active 链接；失败则回滚

**卸载/停用**：发停用信号 → 等健康停止 → 卸载（是否回滚迁移视策略而定）。

---

# 为什么要这样设计（关键点）

* **不可变构件**：每次部署都可复现、可回滚。
* **解耦语言**：宿主只认运行协议（HTTP/gRPC/进程健康），后端用什么语言都行。
* **安全与合规**：哈希校验 + 可选签名验证；权限（RBAC）与事件权限（publish/subscribe）由宿主管控。
* **多端一致**：前端资源与契约（OpenAPI/Proto）打进包，宿主按 manifest 自动挂载。
* **平滑升级**：并行准备 + 原子切换，失败即回滚，不影响在线业务。

---

# 最小工作流（你现在就能跑）

1. 按本文目录结构准备一个 `hello.pxp`（后端就放一个返回 200 的 `start.sh` + `echo` 也行）。
2. 通过你已有的市场 API：

    * `/v1/dev/uploads` → PUT 上传 `.pxp` →
    * `/v1/dev/plugins/:id/versions` 登记 `sha256/size/storage_key`。
3. 宿主侧：

    * `/v1/downloads` → 下载 `.pxp` → 校验 `sha256` → 解包 → 运行。

> 你**现在的代码**已经满足 MVP 流程：`.pxp` 只是你上传的文件名；校验与下载已经打通。接下来要做的是在宿主里实现**解包→迁移→启动**这三个步骤，以及（可选）签名验证。

---

# 进阶：多构建与依赖

* **Artifact 表**：同一版本有多构建（OS/ARCH），`/v1/downloads` 参数加 `os/arch` 选择具体构建。
* **依赖声明**：manifest 加 `requires`（依赖其他插件的最小版本），宿主在安装前做拓扑排序与检查。
* **License**：宿主把租户的 license JWT 下发给插件（env/file），插件按权益开关功能。

---

如果你愿意，我可以基于这个规范帮你：

* 出一份 `manifest.yaml` 的 JSON Schema；
* 给 PowerX 宿主写一个“安装器”最小实现（Go），包含：解包、迁移（goose）、进程管理（supervisor）、健康检查与回滚。
