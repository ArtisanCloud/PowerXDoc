# 插件清单与元数据规范（01_plugin_lifecycle/Manifest_and_Metadata.md）

> 本文档定义 **PowerX 插件清单（plugin.yaml / manifest.yaml）** 的字段、语义与生成策略。  
> 所有基于 **PowerXPluginBase** 的插件（无论 Go / PHP / Node / Rust）均须遵循此约定。

---

## 🧭 一、文档目标

- 统一插件的元数据格式与字段定义；
- 规范开发态 (`plugin.yaml`) 与发布态 (`manifest.yaml`) 的关系；
- 明确签名与验证机制；
- 定义宿主与 Marketplace 对元数据的读取策略；
- 为 `.pxp` 打包与验证提供标准结构依据。

---

## 🧩 二、plugin.yaml 与 manifest.yaml 的关系

| 维度 | plugin.yaml | manifest.yaml |
|------|--------------|----------------|
| **阶段** | 开发态（源代码中） | 发布态（.pxp 包中） |
| **生成方式** | 手工维护 | 打包时由脚本自动复制或扩展 |
| **作用** | 本地构建 / 测试 / 配置 | 宿主安装 / 运行 / 校验 |
| **可编辑性** | 可读写 | 不可变（带签名） |
| **位置** | 仓库根目录 | `.pxp` 包根目录 |

> ⚙️ 在 PowerXPluginBase 中，打包脚本通常会将 `plugin.yaml` 复制为 `manifest.yaml`，  
> 并插入构建信息（hash、build_at、signatures、artifact 列表等）。

---

## 🧱 三、manifest.yaml 字段定义

以下为完整推荐结构（按 `.pxp` 规范 v1）。  
每个字段均应在宿主安装与 Marketplace 校验时可被解析。

```yaml
# --- 基础信息 ---
id: com.powerx.plugin.example           # 插件唯一标识（反向域名）
name: Example Plugin                    # 插件显示名
version: 1.0.0                          # 版本号 (SemVer)
channel: stable                         # stable | beta | alpha
description: 示例插件
categories: [crm, marketing]            # 分类标签
min_core: 0.9.0                         # 要求的 PowerX 内核最低版本

# --- 运行配置 ---
runtime:
  type: exec                            # exec | docker | http-proxy | php-fpm
  entrypoint: ./backend/exec/start.sh   # 启动命令或脚本路径
  health:
    http: /healthz                      # 健康检查 URL
    interval: 5s
  env:
    - name: PLUGIN_MODE
      value: "prod"

# --- 前端定义 ---
frontends:
  admin:
    base_path: /plugins/com.powerx.plugin.example/admin
    dir: ./frontend/admin
  web:
    base_path: /plugins/com.powerx.plugin.example/web
    dir: ./frontend/web

# --- 数据迁移 ---
migrations:
  engine: goose                         # goose | raw-sql
  dir: ./migrations

# --- 合约与权限 ---
contracts:
  http: ./contracts/http.yaml
  events:
    publish: [example.v1.events.Created]
    subscribe: [core.v1.events.UserUpdated]
rbac:
  resources:
    - name: example.entity
      actions: [create, read, update, delete]

# --- 配置与密钥 ---
config_schema: ./config.schema.json
secrets:
  - name: EXAMPLE_API_KEY
    description: "External API key"

# --- 生命周期状态 ---
lifecycle:
  status: active                        # active | deprecated | sunset
  deprecated_at: null
  sunset_at: null

# --- 版本签名与校验 ---
signature:
  algo: ed25519
  file: ./SIGNATURE
  hash: "sha256:2e1c9f2e4e..."          # 可选：文件整体哈希

# --- 发布信息（由构建时注入） ---
build:
  built_at: "2025-10-13T12:00:00Z"
  built_by: "github.com/ArtisanCloud/pipeline"
  os: linux
  arch: amd64
  artifacts:
    - backend/exec/plugin-example
    - frontend/admin/
    - migrations/
````

---

## 🧠 四、字段说明要点

### 1. id / name / version

- `id` 必须全局唯一；
- `name` 用于 Admin/Marketplace 展示；
- `version` 遵循 SemVer，宿主据此判断升级。

### 2. runtime

- 支持多种运行模式：

  - `exec`：宿主拉起子进程；
  - `docker`：宿主按 image.txt 启动容器；
  - `http-proxy`：代理模式，仅转发请求；
  - `php-fpm`：使用 PHP 宿主引擎。
- `health`：宿主会定期探测健康状态，不健康则回滚。

### 3. frontends

- 定义插件在 Admin 或 Web 的前端入口；
- `base_path` 为宿主代理路径；
- `dir` 为构建产物目录。

### 4. migrations

- 声明迁移引擎（Goose、raw-sql、或 SQL 文件夹）；
- 宿主安装时按 manifest 自动迁移。

### 5. contracts

- 定义插件的接口与事件契约；
- 支持 OpenAPI / gRPC / EventBus；
- PowerX 核心用于自动挂载路由与权限映射。

### 6. rbac

- 声明插件的资源与动作；
- 与宿主 RBAC 模块对接时自动注册。

### 7. config_schema

- 指定配置 UI 的 JSON Schema；
- PowerX Admin 根据该文件自动渲染配置表单。

### 8. secrets

- 声明宿主需注入的敏感环境变量；
- PowerX 在安装时创建 Secret 并注入。

### 9. lifecycle

- 插件生命周期状态，与 Marketplace 一致；
- 用于标记 `deprecated/sunset`。
  （参见 [Deprecation_and_Sunset_Policy.md](./Deprecation_and_Sunset_Policy.md)）

### 10. signature / build

- 签名与构建信息用于验证完整性；
- 宿主在安装时执行：

  1. 校验 `.pxp` 包的 `sha256`；
  2. 校验 `SIGNATURE`；
  3. 比对 manifest 内记录的 hash 与 build 信息。

---

## 🔏 五、签名策略与信任链

PowerXPluginBase 采用 **双层校验机制**：

1. **包体签名（外层）**

   - `.pxp` 压缩包整体签名；
   - Marketplace 校验上传时验证 `sha256`；
   - 宿主下载时比对哈希。

2. **manifest 签名（内层）**

   - 插件开发者使用私钥生成 `SIGNATURE`；
   - PowerX 核心或 Marketplace 使用公钥验证；
   - 可使用 Ed25519 或 RSA2048。

示例：

```bash
# 生成签名（开发者侧）
openssl dgst -sha256 -sign private.pem manifest.yaml > SIGNATURE
openssl pkey -in private.pem -pubout -out SIGNATURE.pub
```

manifest 中记录：

```yaml
signature:
  algo: rsa2048
  file: ./SIGNATURE
  pubkey: ./SIGNATURE.pub
```

---

## 🧮 六、manifest 的生成与注入逻辑（示例流程）

在 PowerXPluginBase 中，可通过 Makefile 或构建脚本自动生成 manifest：

```bash
# 1. 校验 plugin.yaml 格式
yq eval '.id, .version, .runtime' plugin.yaml

# 2. 复制为 manifest.yaml
cp plugin.yaml build/pxp/manifest.yaml

# 3. 注入构建元信息
yq eval -i '.build.built_at = env(BUILD_TIME)' build/pxp/manifest.yaml
yq eval -i '.build.os = env(GOOS)' build/pxp/manifest.yaml
yq eval -i '.build.arch = env(GOARCH)' build/pxp/manifest.yaml
```

打包后 `.pxp` 内部结构示例：

```
├─ manifest.yaml
├─ backend/
├─ frontend/
├─ migrations/
├─ contracts/
├─ LICENSE
└─ SIGNATURE
```

---

## 🧩 七、宿主与 Marketplace 的读取规则

| 读取方               | 文件来源                   | 校验要点                                  | 行为           |
| ----------------- | ---------------------- | ------------------------------------- | ------------ |
| **Marketplace**   | `.pxp` 上传包             | 校验 `sha256`、`SIGNATURE`、`version` 唯一性 | 登记版本元数据      |
| **PowerX 宿主**     | 解包后 manifest.yaml      | 校验签名与依赖                               | 注册插件能力与配置 UI |
| **Admin 前端**      | 从宿主 API 拉取 manifest 摘要 | 显示插件信息、配置项、前端入口                       | 渲染设置页        |
| **PluginBase 自身** | 开发态读取 plugin.yaml      | 加载运行参数与 metadata                      | 运行调试模式       |

---

## 🧠 八、最佳实践

- 在 manifest 中记录完整的构建元信息；
- 使用 JSON Schema 校验 plugin.yaml；
- 在打包流程中自动生成 `build_at`、`hash`；
- 保证 manifest 与 `.pxp` 一致，不可手动修改；
- 每次发布新版本必须重新签名；
- 不允许宿主修改 manifest 字段（只读）。

---

## 🧩 九、常见问题（FAQ）

| 问题                                 | 答案                                        |
| ---------------------------------- | ----------------------------------------- |
| plugin.yaml 和 manifest.yaml 可以共存吗？ | ✅ 可以，前者开发用，后者发布用。                         |
| 能在运行时修改 manifest 吗？                | ❌ 不可以，`.pxp` 被视为不可变制品。                    |
| 可以省略签名吗？                           | ⚠️ 不推荐。生产插件必须签名以确保可追溯性。                   |
| 可以在 manifest 加自定义字段吗？              | ✅ 可以，但必须使用 `x-*` 命名，例如 `x-ai-tools:`。     |
| 宿主如何获取 manifest 信息？                | PowerX 内核自动解析 `.pxp` 包根目录的 manifest.yaml。 |

---

## 📚 延伸阅读

- [Create_and_Init_Project.md](./Create_and_Init_Project.md)
- [Versioning_and_Publishing.md](./Versioning_and_Publishing.md)
- [Deprecation_and_Sunset_Policy.md](./Deprecation_and_Sunset_Policy.md)
- [02_capabilities_and_schema/Capability_Design_Guide.md](../02_capabilities_and_schema/Capability_Design_Guide.md)

---

> **文档版本：** v1.0.0
> **适用范围：** PowerX ≥ 0.9.0
> **维护团队：** PluginBase 核心组
> **最后更新：** 2025-10
