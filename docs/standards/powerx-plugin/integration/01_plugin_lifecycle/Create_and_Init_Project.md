# 插件创建与项目初始化（Fork/二次开发版）
>
> 适用于 **已存在的 PowerXPluginBase 框架**：Go Gin 后端 + Nuxt 前端（web-admin）。  
> 开发者通过 **Fork 本仓库** 开始二次开发；后续通过 **Makefile/Docker** 构建运行，并最终打包为 **.pxp** 发布包。

---

## 1. 背景与适用范围

- 本指南用于 **插件作者** 基于 `PowerXPluginBase` 的 **Fork→开发→构建→发布** 全链路。
- 不依赖任何 PowerX 专用 CLI；工程自带 `Makefile`、`Dockerfile`、脚本与约定。
- 产出物为 **`.pxp` 插件发布包**：不可变、可签名、可回滚；内含 manifest、前后端制品、迁移与契约等，宿主（PowerX）下载/校验/解压/启动即可。:contentReference[oaicite:0]{index=0}

---

## 2. 获取代码并重命名

```bash
# 1) Fork 仓库后，clone 到本地
git clone git@github.com:your-org/PowerXPluginBase.git com.powerx.plugin.example
cd com.powerx.plugin.example

# 2) 全局替换包名/模块名/插件ID
#    - go.mod module 名称
#    - backend/internal/... import 路径
#    - plugin.yaml 的 id/name 等
#    - web-admin app 内的桥接/路由前缀
```

> 约定：插件 ID 建议使用反向域名，例如 `com.powerx.plugin.example`。

---

## 3. 项目目录说明（与现状对齐）

```
.
├── AGENTS.md
├── Dockerfile
├── Makefile
├── backend
│   ├── bin/                 # 后端可执行产物输出（由 make 构建）
│   ├── cmd/                 # 命令入口（database / plugin / tools 等）
│   ├── etc/                 # 运行时配置模板（本地/dev/test）
│   ├── go.mod / go.sum
│   ├── internal/            # 领域实现
│   │   ├── bootstrap/       # 启动初始化（DI、配置、路由装配）
│   │   ├── config/          # 配置结构体与加载
│   │   ├── contracts/       # OpenAPI/事件契约声明
│   │   ├── db/              # DB 连接、迁移、仓储
│   │   ├── domain/          # 领域模型（实体/聚合）
│   │   ├── grpc/            # 可选的 gRPC 服务端/客户端封装
│   │   ├── logger/          # 日志
│   │   ├── middleware/      # Gin 中间件
│   │   ├── router/          # Gin 路由与分组
│   │   ├── services/        # 应用服务
│   │   ├── shared/          # 通用工具/常量
│   │   └── transport/       # HTTP/事件传输层适配
│   └── test_config.go
├── config/                  # 部署/测试用配置（非必须）
├── docs/
│   └── integration/         # 本文档集
├── make-files/              # Makefile 片段（可选）
├── plugin.yaml              # 开发态主清单（打包时转 manifest.yaml）
└── web-admin/               # Nuxt 管理端
    ├── README.md
    ├── app/
    │   ├── app.vue
    │   ├── assets/
    │   ├── bridge/          # 与宿主/Admin 侧的桥接（iframe/proxy）
    │   ├── components/
    │   ├── composables/     # 已有 useAPI/useConfirm 等
    │   ├── layouts/
    │   ├── middleware/
    │   ├── pages/           # 包含 "_p" 与 "templates" 等页
    │   ├── plugins/
    │   ├── server/
    │   ├── stores/
    │   └── utils/
    ├── i18n/
    ├── nuxt.config.ts
    ├── package.json
    └── tsconfig.json
```

---

## 4. `plugin.yaml`（开发态清单）

> `plugin.yaml` 是开发期的主清单；生成 `.pxp` 时会转换为包内 `manifest.yaml`。
> 建议字段对齐 `.pxp` 结构中的 manifest（见 §10）。

示例（按需裁剪）：

```yaml
id: com.powerx.plugin.example
name: Example Plugin
version: 0.1.0
description: 示例插件（Fork 自 PowerXPluginBase）
vendor:
  id: vendor_xxx
  name: Your Company
  website: https://example.com
  email: dev@example.com

runtime:
  type: exec                # exec | docker | http-proxy ...
  entrypoint: ./backend/bin/plugin-example
  health:
    http: /healthz
    interval: 5s

frontends:
  admin:
    base_path: /plugins/com.powerx.plugin.example/admin
    dir: ./web-admin/.output/public   # Nuxt 产物目录（示例）

migrations:
  engine: goose
  dir: ./backend/internal/db/migrations

contracts:
  http: ./backend/internal/contracts/http.yaml
  events:
    publish: [example.v1.events.Created]
    subscribe: [core.v1.events.UserUpdated]

rbac:
  resources:
    - name: example.entity
      actions: [create, read, update, delete]

config_schema: ./backend/internal/config/config.schema.json
```

---

## 5. 本地开发与运行

### 5.1 后端（Go Gin）

```bash
# 安装依赖
cd backend
go mod tidy

# 运行（推荐在仓库根目录方便 Makefile）
cd ..
make backend-dev
# 或手动：
# go run ./backend/cmd/plugin
```

- 约定：后端在 `:8088`（示例）启动；健康检查 `/healthz`。
- 你已内置 `router/middleware/services` 结构，按需填充业务。

### 5.2 数据库迁移

```bash
# 示例（视你的 cmd/database 实现而定）
make migrate-up
# 或：
# go run ./backend/cmd/database up
```

> 建议 goose/sql 迁移脚本放在 `backend/internal/db/migrations`，并在启动前自动检查。

### 5.3 前端（Nuxt）

```bash
cd web-admin
npm i   # 或 npm/yarn
npm run dev
# 本地预览后端代理路径：/_p/com.powerx.plugin.example/admin/ ...
```

---

## 6. 构建产物

### 6.1 后端二进制

```bash
make backend-build
# 输出到 backend/bin/plugin-example（约定名，可在 Makefile 中配置）
```

### 6.2 前端静态产物

```bash
cd web-admin
npm run build
# 产物目录依据 nuxt.config.ts（例如 .output/public 或 dist）
```

---

## 7. 生成 `.pxp` 发布包（无 CLI 版）

> `.pxp` 是一个不可变的 ZIP 包（扩展名 .pxp），内含：
> `manifest.yaml`、后端可执行、前端产物、迁移脚本、契约、LICENSE、SIGNATURE 等。

### 7.1 目录组织（打包前）

将需要打包的内容整理到临时目录 `build/pxp/`（示例）：

```
build/pxp/
├─ manifest.yaml                # 由 plugin.yaml 转换/复制而来
├─ backend/
│  └─ exec/
│     ├─ start.sh               # 统一入口（可选：直接放二进制）
│     └─ plugin-example         # 后端可执行
├─ frontend/
│  └─ admin/                    # Nuxt 构建产物
├─ migrations/
│  └─ 001_init.sql
├─ contracts/
│  ├─ http.yaml
│  └─ events.yaml
├─ LICENSE
└─ (可选) hooks/config.schema.json/SIGNATURE 等
```

> **manifest 对齐建议**：字段与运行方式参见 `.pxp` 规范中的示例（runtime/frontends/migrations/contracts/rbac 等）。

### 7.2 打包与签名（示例 Make 目标）

```bash
# 1) 生成 manifest（可由脚本把 plugin.yaml 复制/校验后重命名）
make manifest

# 2) 打包为 zip（扩展名 .pxp）
make package-pxp
# 等价手动：
# cd build/pxp && zip -r ../com.powerx.plugin.example-0.1.0-linux-amd64.pxp .

# 3) 生成签名（建议 Ed25519/RSA）
make sign-pxp PRIVATE_KEY=./keys/private.pem
# 产出 SIGNATURE / (可选) SIGNATURE.pub
```

> 市场侧/宿主侧会校验 SHA256 与签名链；宿主安装流程：下载→校验→解包→迁移→注册→启动→健康检查→原子切换。

---

## 8. 上传到 Marketplace（开发者视角）

```bash
# 伪流程（按你的 Marketplace API）：
# 1) 申请上传URL
curl -X POST https://market/api/v1/dev/uploads -d '{ ... }'

# 2) PUT 上传 .pxp 至对象存储（返回 storage_key / sha256 / size）
# 3) 版本登记
curl -X POST https://market/api/v1/dev/plugins/:id/versions \
     -d '{ "sha256":"...", "size":1234, "storage_key":"...", "changelog":"..." }'
```

> 市场记录包元数据（sha256/size/签名/公钥），并对宿主提供下载接口。

---

## 9. 运行与路由（与宿主/Admin 的接口约定）

- 后端对外暴露健康检查与 API；宿主通过反向代理或 sidecar 启动你的二进制。
- 管理端前端通过 **代理路径** 暴露，例如：`/_p/<plugin_id>/admin/`（宿主侧统一接入）。
- 若有事件/Agent/MCP，对应契约放在 `backend/internal/contracts/`，并在 `manifest.yaml` 的 `contracts` 字段声明（宿主据此挂载/鉴权）。

---

## 10. `.pxp` 结构与 manifest 字段要点（速查）

- `.pxp = ZIP`，**只读不可变，支持签名与回滚**；建议按 OS/ARCH 分构建。
- `manifest.yaml` 需包含：

  - `id/name/version/min_core/channel/description/categories`
  - `runtime`（`type/entrypoint/health/env`）
  - `frontends`（`admin/web base_path & dir`）
  - `migrations`（引擎与目录）
  - `contracts`（HTTP/事件，含 publish/subscribe）
  - `rbac`（资源与动作）
  - `config_schema`、`secrets`（如需）
  - `signature`（算法与 SIGNATURE 文件位置）

---

## 11. 常见问题（FAQ）

**Q1：必须按 `.pxp` 规范打包吗？**
A：是。宿主的安装器依赖 `.pxp` 的**不可变与签名**语义来实现安全上线与回滚。

**Q2：`plugin.yaml` 与 `manifest.yaml` 关系？**
A：开发态使用 `plugin.yaml`；打包时复制/转换为 `manifest.yaml` 放入 `.pxp`，字段应一致或可推导。

**Q3：签名一定要做吗？**
A：强烈建议。市场与宿主可据此建立可信链：哈希→签名→公钥/证书链校验。

**Q4：能否用 Docker 运行？**
A：可以。将镜像引用写入 `backend/docker/image.txt` 并在 `manifest.runtime.type: docker` 指定；宿主按约定拉起容器。

---

## 12. 参考与后续

- 《pxp 插件压缩包规范》：结构、示例 manifest、安装与可信链说明。  
- 下一篇：《Manifest_and_Metadata.md》将给出字段校验、JSON Schema 与签名策略。
