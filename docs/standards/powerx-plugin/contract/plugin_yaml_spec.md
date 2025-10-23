# plugin.yaml 规范（Plugin Manifest Specification）

> 本页目标：定义 **PowerX 插件清单文件**（`plugin.yaml`）的字段、规则与加载流程。  
> 读者对象：插件开发者 / 平台集成方 / Marketplace 运营人员。

> 📁 **最新脚手架示例**：`docs/lifecycle/examples/plugin.yaml` 为唯一维护点，编辑完成后执行 `make sync-lifecycle-docs` 同步到公开文档。请勿直接修改集成目录下的副本。快速上手请参考 [`docs/lifecycle/quickstart.md`](../lifecycle/quickstart.md) 与 [`docs/lifecycle/bootstrap.md`](../lifecycle/bootstrap.md)。

---

## 一、文件位置与作用

每个插件必须在根目录包含一个 `plugin.yaml` 文件，  
这是 PowerX Plugin Manager 的唯一识别入口，用于：

- 注册插件基本信息；
- 声明后端/前端运行入口；
- 定义权限（RBAC）与菜单；
- 注册 Agent 能力；
- 描述依赖、替代或冲突插件；
- 指导打包与市场分发。

PowerX 在启动时会扫描插件目录：

```

plugins/
├── com.powerx.plugins.crm/
│   └── plugin.yaml
├── com.powerx.plugins.ecommerce/
│   └── plugin.yaml
└── com.powerx.plugins.base/
└── plugin.yaml

````

扫描到后：

1. 验证结构；
2. 注入运行环境变量；
3. 启动后端进程；
4. 挂载前端与反代路径；
5. 拉取 `/admin/manifest` 与 `/admin/rbac` 信息注册到宿主系统。

---

## 二、基本结构

以下为一个完整示例：

```yaml
id: com.powerx.plugins.base
name: Base Template Plugin
version: 0.1.0

description: >
  适配 PowerX 插件生态的最小可运行模板，包含 RLS、多租户、Agent 注册与 RBAC 示例。

author: ArtisanCloud
license: MIT
homepage: https://github.com/ArtisanCloud/PowerX

backend:
  entry: backend/bin/plugin
  port: 8086
  health: /healthz

routes:
  basePath: /v1
  adminManifest: /api/v1/admin/manifest
  rbac: /api/v1/admin/rbac

permissions:
  - resource: base:template
    actions: [read, create, update, delete]

menus:
  - id: "plugins.base"
    title: "menu.base.template"
    icon: "i-heroicons-clipboard-document-check"
    path: "/plugins/base/templates"
    order: 20

assets:
  webAdminPath: web-admin/.output  # 可选

agents:
  - id: "base.assistant"
    name: "Note 助理"
    description: "生成任务计划、执行模板管理"
    default_tools: ["template.template.create"]

tools:
  - id: "template.template.create"
    name: "创建任务"
    transport: "grpc"
    endpoint: "127.0.0.1:51031"

workflows:
  - id: "template.plan.generate"
    name: "生成 Sprint 计划"
    endpoint: "grpc://127.0.0.1:51031/workflows/plan_generate"

dependencies:
  requires:
    - com.powerx.plugins.crm >=0.5.0
  conflicts:
    - com.powerx.plugins.demo
````

---

## 三、字段详解

| 字段            | 类型     | 必填 | 说明                                          |
| ------------- | ------ | -- | ------------------------------------------- |
| `id`          | string | ✅  | 插件唯一标识，命名空间风格：`com.<org>.<category>.<name>` |
| `name`        | string | ✅  | 插件显示名称（多语言通过 i18n 实现）                       |
| `version`     | string | ✅  | 语义化版本号（遵循 semver）                           |
| `description` | string | ☐  | 简要说明                                        |
| `author`      | string | ☐  | 作者或组织名称                                     |
| `license`     | string | ☐  | 开源协议                                        |
| `homepage`    | string | ☐  | 项目主页或文档链接                                   |

---

### 1️⃣ backend（后端运行配置）

| 字段       | 类型     | 说明                    |
| -------- | ------ | --------------------- |
| `entry`  | string | 后端二进制文件路径（相对于插件根目录）   |
| `port`   | int    | 插件服务监听端口              |
| `health` | string | 健康检查路径（HTTP 200 视为存活） |

PowerX 启动插件时执行：

```bash
PLUGIN_ID=com.powerx.plugins.base ./backend/bin/plugin
```

并通过 HTTP 检查：

```
GET http://127.0.0.1:8086/healthz
```

---

### 2️⃣ routes（路由映射）

定义宿主平台与插件后端的接口映射规则：

| 字段              | 说明                    |
| --------------- | --------------------- |
| `basePath`      | 插件自身 API 前缀（建议 `/v1`） |
| `adminManifest` | manifest 上报接口路径       |
| `rbac`          | 权限上报接口路径              |

PowerX 反代挂载：

```
/_p/<plugin-id>/api/* → backend:port
```

并根据 routes 解析 manifest/rbac 信息。

---

### 3️⃣ permissions（权限声明）

插件自定义权限树。
宿主 PowerX 会聚合所有插件的声明，统一呈现在「系统设置 / 权限管理」中。

```yaml
permissions:
  - resource: base:template
    actions: [read, create, update, delete]
  - resource: base:settings
    actions: [read, update]
```

> 插件只需声明自身资源与动作，不需保存角色绑定。
> PowerX 会在运行时注入授权结果（permissions 数组）。

---

### 4️⃣ menus（菜单注册）

插件的前端入口在 PowerX 后台侧边栏中显示：

| 字段      | 类型     | 说明                                     |
| ------- | ------ | -------------------------------------- |
| `id`    | string | 菜单唯一标识                                 |
| `title` | string | 菜单标题键（多语言 key，例如 `menu.base.template`） |
| `icon`  | string | 图标标识（HeroIcons / Lucide）               |
| `path`  | string | 前端访问路径                                 |
| `order` | int    | 排序权重（越小越靠上）                            |

示例：

```yaml
menus:
  - id: "plugins.base.intro"
    title: "menu.base.intro"
    icon: "i-heroicons-sparkles"
    path: "/plugins/base/intro"
    order: 10
```

---

### 5️⃣ assets（前端构建产物）

```yaml
assets:
  webAdminPath: web-admin/.output
```

说明：

- 指向前端打包产物路径；
- 若为空，则插件为纯后端插件；
- PowerX 反代规则：

  ```
  /_p/<plugin-id>/admin/* → <webAdminPath>
  ```

---

### 6️⃣ agents / tools / workflows（Agent 能力注册）

详见 👉 [Agent Contract 规范](./agent_contract.md)

示例：

```yaml
agents:
  - id: base.assistant
    name: Note 助理
tools:
  - id: template.template.create
    transport: grpc
    endpoint: 127.0.0.1:51031
```

PowerX 会在安装或启用插件时自动注册到 Agent Hub。

---

### 7️⃣ dependencies（依赖与冲突）

| 字段          | 说明             |
| ----------- | -------------- |
| `requires`  | 插件依赖（需先安装）     |
| `conflicts` | 冲突插件（不可共存）     |
| `replaces`  | 替代插件（升级或迁移时使用） |

示例：

```yaml
dependencies:
  requires:
    - com.powerx.plugins.crm >=0.5.0
  conflicts:
    - com.powerx.plugins.demo
```

---

## 四、平台加载流程

```text
PowerX 启动
  ├─ 扫描 plugins/<id>/plugin.yaml
  ├─ 解析 backend/port/routes
  ├─ 启动插件进程
  ├─ 反代注册 (/_p/:id/api/*, /_p/:id/admin/*)
  ├─ 调用 /api/v1/admin/manifest
  ├─ 调用 /api/v1/admin/rbac
  ├─ 聚合菜单与权限
  └─ 注册 Agent 能力
```

---

## 五、最佳实践

✅ **语义化版本号**
版本应遵循 semver 规则（`MAJOR.MINOR.PATCH`）。

✅ **多语言菜单**
菜单标题应使用多语言 key，而非硬编码文字。

✅ **路径前缀统一**
后端所有业务接口挂载在 `/v1/...`，管理接口统一 `/api/v1/admin/...`。

✅ **独立 schema**
后端数据库 schema 建议命名为 `px_com_powerx_<plugin>_<module>`。

✅ **权限与菜单联动**
菜单项可通过 `required_permissions` 字段绑定权限。

```yaml
menus:
  - id: "plugins.base.templates"
    title: "menu.base.templates"
    path: "/plugins/base/templates"
    required_permissions: ["base:template:read"]
```

---

## 六、示例清单结构（目录模式）

```
dist/
  0.1.0/
    plugin.yaml
    backend/bin/plugin
    web-admin/.output/
    README.md
```

---

## 七、验证与调试

验证清单结构：

```bash
make check-plugin
```

手动测试：

```bash
curl http://localhost:8080/_p/com.powerx.plugins.base/api/v1/admin/manifest
```

---

## 八、常见错误与排查

| 错误               | 原因                          | 解决方案                       |
| ---------------- | --------------------------- | -------------------------- |
| Plugin 启动失败      | `backend.entry` 路径错误        | 检查二进制文件是否存在                |
| /manifest 返回 404 | 插件未正确注册 admin 路由            | 检查 `router.go` 路由注册        |
| 前端访问空白页          | `webAdminPath` 缺失或未构建       | 执行 `make frontend-build`   |
| 权限未显示            | `/admin/rbac` 无返回或结构错误      | 返回需包含 `resource + actions` |
| Agent 未注册        | 未在 manifest 声明 agents/tools | 检查 YAML 与注册 API            |

---

## 下一步阅读

- 🔐 [RBAC Manifest 规范](./rbac_manifest_spec.md)
- 🤖 [Agent Contract 规范](./agent_contract.md)
- ⚙️ [上下文签名规范（HMAC / JWT）](./ctx_signing.md)
