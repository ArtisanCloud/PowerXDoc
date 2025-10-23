# 🧩 Plugin Structure & YAML Specification 插件结构与配置规范

> 本文档定义 **PowerX 插件（PowerX Plugin）** 的标准目录结构、`plugin.yaml` 元数据格式、打包与发布规范。  
> 所有插件在提交 Marketplace 前必须通过结构与元数据验证。

---

## 🧱 1. 插件基本概念

| 概念 | 说明 |
|------|------|
| **Plugin（插件）** | 可独立安装、启用、卸载的功能模块，由 Vendor 开发并发布到 Marketplace。 |
| **plugin.yaml** | 插件的「声明文件」，描述其标识、版本、能力、依赖与前后端构成。 |
| **Manifest（清单）** | PowerX 在加载插件时生成的运行态配置（包含 vendor_id、schema、路由等）。 |
| **Plugin Package** | 打包的插件压缩包（zip/tar.gz），内含后端与前端代码。 |

---

## 🗂️ 2. 标准目录结构

以下为 PowerX 插件项目的标准目录结构：

```

com.vendor.plugin_name/
├── plugin.yaml                # 插件声明文件（必需）
├── README.md                  # 插件说明文档（建议）
├── LICENSE                    # 授权文件（建议）
│
├── backend/                   # 后端服务（Go、Rust、Python等）
│   ├── cmd/                   # 启动入口（main.go / main.rs）
│   ├── internal/              # 业务逻辑目录（DDD层）
│   ├── go.mod / Cargo.toml    # 语言依赖声明
│   └── ...
│
├── web-admin/                 # 插件管理端前端（Nuxt / Next / Vue）
│   ├── package.json
│   ├── app/
│   └── dist/                  # 构建输出目录（上传时可选）
│
└── docs/                      # 插件内部文档（API / 安装说明等）
├── API_Reference.md
└── Changelog.md

````

---

## 🧩 3. plugin.yaml 规范

`plugin.yaml` 是插件的核心描述文件。  
PowerX 通过它识别插件的 ID、版本、依赖、提供的能力与配置项。

### ✅ 基本字段定义

```yaml
id: com.vendor.data_forge            # 插件全局唯一 ID
name: Data Forge                     # 插件名称（对外展示）
version: 1.2.0                       # 插件版本（语义化）
vendor:
  id: 0b12-8aaf-4fe9-91d2-2a3cddf84a71
  name: ArtisanCloud Studio
  website: https://artisancloud.com
  contact: dev@artisancloud.com

description: >
  Data Forge 是一款帮助 PowerX 企业用户构建数据可视化报表的插件，
  支持多源连接、图表模板与权限隔离。

license: commercial                  # 许可证类型：free / commercial / custom

entry:
  backend: ./backend/cmd/plugin      # 后端启动入口
  frontend: ./web-admin/dist         # 前端构建输出目录（可选）
  config_schema: ./config/schema.yaml # 可选：配置项结构定义

capabilities:
  provides:
    - name: data-source
      type: api
      description: 提供统一的数据源接口能力
      endpoint: /api/v1/data-source
    - name: visualization
      type: ui
      description: 注册新的报表可视化模块
  consumes:
    - name: media-storage
      type: api
      required: true

dependencies:
  - id: com.powerx.plugin.media_storage
    version: ">=1.0.0"
    optional: false

permissions:
  - resource: data_visualization
    actions: [create, read, update, delete]
    scope: tenant
    description: 数据可视化操作权限

schema:
  isolation: true                    # 是否启用独立数据库 Schema（多租户隔离）
  migrations: ./backend/internal/db/migrations

ui:
  admin:
    route: /admin/data-forge          # 插件后台入口路由
    icon: chart-bar                   # 图标名称（Lucide）
    category: Analytics
    order: 10

events:
  emits:
    - data_forge.report.created
    - data_forge.report.deleted
  listens:
    - media.asset.uploaded

config:
  default:
    storage_driver: s3
    enable_logs: true
````

---

## 🧩 4. 字段说明详解

| 字段               | 类型     | 必需   | 说明                                   |
| ---------------- | ------ | ---- | ------------------------------------ |
| `id`             | string | ✅    | 插件唯一标识符，建议命名为 `com.vendor.plugin` 格式 |
| `name`           | string | ✅    | 插件展示名称                               |
| `version`        | string | ✅    | 语义化版本号（SemVer）                       |
| `vendor`         | object | ✅    | 插件所属 Vendor 信息                       |
| `description`    | string | ✅    | 插件简短描述（支持多行 `>`）                     |
| `license`        | string | ✅    | 授权类型：`free`、`commercial`、`custom`    |
| `entry.backend`  | path   | ✅    | 后端可执行入口                              |
| `entry.frontend` | path   | ⛔ 可选 | 前端构建输出目录                             |
| `capabilities`   | object | ✅    | 提供与消费的能力定义（provides / consumes）      |
| `dependencies`   | array  | ⛔ 可选 | 依赖的其他插件或系统组件                         |
| `permissions`    | array  | ✅    | 插件需要申请的权限（resource/action/scope）     |
| `schema`         | object | ⛔ 可选 | 数据库迁移与隔离配置                           |
| `ui.admin`       | object | ⛔ 可选 | 插件在 PowerX Admin 的 UI 注册信息           |
| `events`         | object | ⛔ 可选 | 事件总线定义（监听与发出）                        |
| `config`         | object | ⛔ 可选 | 默认配置项，可在安装时覆盖                        |

---

## ⚙️ 5. 打包与发布规范

### 5.1 打包命令

插件应被打包为 `.zip` 或 `.tar.gz` 格式：

```bash
# 示例（在插件根目录下）
tar -czvf com.vendor.data_forge-1.2.0.tar.gz \
  plugin.yaml README.md LICENSE backend web-admin/dist
```

### 5.2 包结构要求

| 路径                 | 说明          |
| ------------------ | ----------- |
| `/plugin.yaml`     | 必须位于包根目录    |
| `/backend/`        | 后端源代码或可执行文件 |
| `/web-admin/dist/` | 前端构建结果（若存在） |
| `/docs/`           | 可选文档目录      |
| `/LICENSE`         | 推荐包含授权说明    |

### 5.3 校验逻辑

PowerX Marketplace 在上传时会自动执行以下验证：

1. **YAML 格式校验**（必需字段、类型一致性）
2. **ID 唯一性检测**（防止重复冲突）
3. **依赖验证**（确保依赖插件可用）
4. **安全扫描**（检测恶意文件与风险依赖）
5. **版本检查**（不允许覆盖相同版本号）

---

## 🔐 6. plugin.yaml 与 CoreX Manifest 的关系

在插件安装后，PowerX CoreX 会根据 `plugin.yaml` 生成运行态 `manifest`，
用于管理插件生命周期、依赖关系与安全隔离：

| 来源              | 用途               |
| --------------- | ---------------- |
| `plugin.yaml`   | 开发者声明（静态）        |
| `manifest.json` | CoreX 运行态生成（动态）  |
| 作用              | 插件加载、权限分配、事件路由注册 |

> 例如，当用户安装插件时：
> CoreX 会从 Marketplace 拉取 plugin.yaml → 校验 vendor_id → 生成 manifest → 注册运行环境。

---

## 🧠 7. 示例：最小可运行插件

---

### 🔧 Plugins 配置块说明（backend/etc/config.yaml）

开发/运营在部署 CLI 与后台服务时，可以通过 `backend/etc/config.yaml` 中的 `plugins` 配置块统一控制下列行为：

| 字段 | 作用 |
|------|------|
| `artifact_prefix` / `cas_prefix` | 控制插件打包产物与内容寻址二进制在对象存储中的路径前缀，`px plugin build/package`、后台发布流程会按此前缀写入并复用已有 blob。 |
| `sandbox.*` | `px plugin test --sandbox` 的默认配置路径与清理超时，方便本地/CI 直接调用，无需每次手动传参。 |
| `security.*` | 离线漏洞缓存目录、缓存有效期、阻断严重级别。CLI 安全扫描与后台 gating 会读取这里的阈值（默认 High 及以上阻断）。 |
| `feature_flags.*` | 切换契约注册、打包流水线、兼容性矩阵、安全门禁等能力，可按环境逐步启用或临时关闭。 |

> 提示：可通过环境变量 `PLUGINS_*` 覆盖默认值，例如 `PLUGINS_SECURITY_SEVERITY_BLOCK_LEVEL=critical` 将阻断级别改为仅 Critical。

```yaml
id: com.vendor.hello_world
name: Hello World
version: 0.1.0
vendor:
  id: a1b2-c3d4
  name: Example Studio
description: 一个展示 Hello World 页面的小插件。
license: free

entry:
  backend: ./backend/cmd/plugin
  frontend: ./web-admin/dist

capabilities:
  provides:
    - name: hello
      type: api
      description: 提供 /api/v1/hello 接口

permissions:
  - resource: hello
    actions: [read]
    scope: tenant

ui:
  admin:
    route: /admin/hello
    icon: smile
    category: Demo
```

---

## 📦 8. 验证与调试

Marketplace CLI（开发中）将提供验证命令：

```bash
# 校验 YAML
powerx plugin validate ./plugin.yaml

# 构建插件包
powerx plugin build .

# 本地运行测试（Sandbox）
powerx plugin run --sandbox
```

---

## 🪶 9. 最佳实践

| 类别        | 建议                                |
| --------- | --------------------------------- |
| **ID 命名** | 遵循反向域名格式：`com.vendor.plugin_name` |
| **版本管理**  | 使用语义化版本（major.minor.patch）        |
| **隔离策略**  | 对多租户数据开启 schema isolation         |
| **权限最小化** | 仅声明必要的资源操作                        |
| **文档清晰**  | 提供 README 与 changelog             |
| **测试覆盖**  | 上架前在 Sandbox 环境完整测试               |

---

## 📘 10. 下一步阅读

* 👉 [Capability & API Design](./Capability_and_API_Design.md)
* 👉 [Submission & Review 审核流程](../03_listing_and_lifecycle/Submission_and_Review.md)
* 👉 [PowerX Plugin Manifest 对接规范](../06_integration_with_powerx/PowerX_Plugin_Manifest.md)

---

> ✅ **总结一句话：**
> `plugin.yaml` 是 PowerX 插件的「身份证」。
> 没有合规的声明文件，插件无法被 Marketplace 或 CoreX 正确识别与运行。

### Plugins 配置详解
