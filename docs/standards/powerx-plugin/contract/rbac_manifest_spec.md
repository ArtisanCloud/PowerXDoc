# RBAC 与 Manifest 接口规范（RBAC & Manifest Contract）

> 本页目标：说明插件需要向 PowerX 宿主暴露的两个关键接口：
>
> - `/api/v1/admin/manifest`  
> - `/api/v1/admin/rbac`  
>  
> 读者对象：后端开发者 / 插件集成方 / PowerX 平台工程师。

> 📁 **脚手架来源**：`docs/lifecycle/examples/manifest.yaml` 与关联 runbook/模板为权威版本，编辑后通过 `make sync-lifecycle-docs` 发布到本目录。
> 📚 延伸阅读：[`docs/lifecycle/manifest-mapping.md`](../lifecycle/manifest-mapping.md) 与 [`docs/lifecycle/package.md`](../lifecycle/package.md)。

---

## 一、接口概览

| 接口 | 方法 | 功能 | 宿主调用时机 |
|------|------|------|---------------|
| `/api/v1/admin/manifest` | `GET` | 返回插件菜单、入口描述、前端配置等 | 插件安装或启动时 |
| `/api/v1/admin/rbac` | `GET` | 返回插件资源/动作定义 | 插件安装、权限刷新或管理员同步时 |

这两个接口属于插件与宿主间的**管理层契约**，  
由 PowerX Plugin Manager 统一调用。  
插件不需验证租户或用户上下文（宿主以平台身份调用）。

---

## 二、`/api/v1/admin/manifest` 接口规范

### 1️⃣ 请求

```bash
GET /api/v1/admin/manifest
````

Header：

```
X-PowerX-CTX-JWT: <platform-jwt>
```

宿主以平台级身份访问。

---

### 2️⃣ 响应结构

```json
{
  "id": "com.powerx.plugins.base",
  "name": "Base Template Plugin",
  "version": "0.1.0",
  "menus": [
    {
      "id": "plugins.base.intro",
      "title": "menu.base.intro",
      "icon": "i-heroicons-sparkles",
      "path": "/plugins/base/intro",
      "order": 10
    },
    {
      "id": "plugins.base.templates",
      "title": "menu.base.templates",
      "icon": "i-heroicons-clipboard-document-check",
      "path": "/plugins/base/templates",
      "required_permissions": ["base:template:read"],
      "order": 20
    }
  ],
  "meta": {
    "web_admin_path": "web-admin/.output",
    "api_base": "/_p/com.powerx.plugins.base/api/v1"
  }
}
```

#### 字段说明

| 字段        | 类型     | 说明                      |
| --------- | ------ | ----------------------- |
| `id`      | string | 插件唯一标识（同 `plugin.yaml`） |
| `name`    | string | 插件名称                    |
| `version` | string | 插件版本号                   |
| `menus`   | array  | 插件菜单数组                  |
| `meta`    | object | 额外元信息（路径、环境等）           |

#### 菜单结构

| 字段                     | 类型       | 说明                           |
| ---------------------- | -------- | ---------------------------- |
| `id`                   | string   | 菜单唯一标识（建议以插件 ID 作为前缀）        |
| `title`                | string   | 多语言 key                      |
| `icon`                 | string   | 图标 class（HeroIcons / Lucide） |
| `path`                 | string   | 页面路径                         |
| `order`                | int      | 排序权重（数值越小越靠前）                |
| `required_permissions` | string[] | 打开菜单所需的权限                    |

---

### 3️⃣ 示例（Go Handler）

```go
// GET /api/v1/admin/manifest
func GetManifest(c *gin.Context) {
    c.JSON(200, gin.H{
        "id": "com.powerx.plugins.base",
        "name": "Base Template Plugin",
        "version": "0.1.0",
        "menus": []gin.H{
            {
                "id": "plugins.base.intro",
                "title": "menu.base.intro",
                "icon": "i-heroicons-sparkles",
                "path": "/plugins/base/intro",
                "order": 10,
            },
            {
                "id": "plugins.base.templates",
                "title": "menu.base.templates",
                "path": "/plugins/base/templates",
                "required_permissions": []string{"base:template:read"},
                "order": 20,
            },
        },
        "meta": gin.H{
            "web_admin_path": "web-admin/.output",
            "api_base": "/_p/com.powerx.plugins.base/api/v1",
        },
    })
}
```

---

## 三、`/api/v1/admin/rbac` 接口规范

### 1️⃣ 请求

```bash
GET /api/v1/admin/rbac
```

宿主同样以平台 JWT 访问。

---

### 2️⃣ 响应结构

```json
{
  "resources": [
    {
      "resource": "base:template",
      "label": "任务模板",
      "actions": [
        { "key": "read", "label": "读取" },
        { "key": "create", "label": "创建" },
        { "key": "update", "label": "更新" },
        { "key": "delete", "label": "删除" }
      ],
      "group": "base"
    },
    {
      "resource": "base:settings",
      "label": "基础设置",
      "actions": [
        { "key": "read", "label": "查看设置" },
        { "key": "update", "label": "修改设置" }
      ]
    }
  ]
}
```

#### 字段说明

| 字段         | 类型     | 说明                           |
| ---------- | ------ | ---------------------------- |
| `resource` | string | 资源标识（建议 `<plugin>:<entity>`） |
| `label`    | string | 展示名称                         |
| `group`    | string | 分组（可选，用于 UI 聚合）              |
| `actions`  | array  | 动作数组（key + label）            |

---

### 3️⃣ 响应最简版（仅资源与动作）

```json
{
  "resources": [
    { "resource": "base:template", "actions": ["read", "create", "update", "delete"] }
  ]
}
```

PowerX 会自动填充默认 label。

---

## 四、宿主聚合逻辑（PowerX 端）

PowerX Plugin Manager 会在以下场景调用插件接口：

- 插件 **首次安装**；
- 插件 **版本升级**；
- 管理员点击「刷新插件清单」；
- 系统启动时后台异步同步。

### 聚合结果

- 所有插件的 `menus` 会被合并到统一的导航树；
- 所有插件的 `resources` 会合并到统一的权限仓库；
- 插件菜单的 `required_permissions` 字段可直接与 RBAC 绑定。

---

## 五、接口安全机制

| 机制       | 说明                                       |
| -------- | ---------------------------------------- |
| **签名头**  | 宿主调用时附带平台级 JWT 或 HMAC 签名                 |
| **访问源**  | 默认仅允许宿主内部网访问                             |
| **认证绕过** | 插件内部无需对这两个接口做租户级认证                       |
| **错误处理** | 建议返回 `500` 并包含 `"code"` 与 `"message"` 字段 |

---

## 六、测试示例

```bash
curl "http://localhost:8080/_p/com.powerx.plugins.base/api/v1/admin/manifest"
curl "http://localhost:8080/_p/com.powerx.plugins.base/api/v1/admin/rbac"
```

若返回正常 JSON，说明反代与接口均配置正确。

---

## 七、最佳实践

✅ **manifest 与 plugin.yaml 对齐**

- 菜单 ID 与路径保持一致；
- `version` 字段与 `plugin.yaml.version` 同步。

✅ **使用多语言 key 而非中文**

- 避免 UI 国际化冲突。

✅ **权限资源命名规范**

```
<plugin-short>:<domain-object>[:action]
例：base:template:read, crm:lead:create
```

✅ **不在接口中返回 token / secrets**

- 仅返回静态描述信息。

✅ **支持热更新**

- 插件可在启动后重新生成 manifest / rbac 内容，宿主下次刷新时自动加载新配置。

---

## 八、错误响应格式（建议）

```json
{
  "code": 50001,
  "message": "failed to generate manifest",
  "details": { "error": "missing menu definitions" }
}
```

---

## 九、关联规范

| 主题      | 文档                                      |
| ------- | --------------------------------------- |
| 插件清单结构  | [plugin.yaml 规范](./plugin_yaml_spec.md) |
| 智能体注册   | [Agent Contract](./agent_contract.md)   |
| 上下文签名机制 | [HMAC/JWT 上下文规范](./ctx_signing.md)      |

---

## 十、示例返回（整合示例）

```json
{
  "id": "com.powerx.plugins.ecommerce",
  "name": "E-commerce Plugin",
  "version": "0.9.2",
  "menus": [
    { "id": "ec.orders", "title": "menu.ec.orders", "path": "/plugins/ec/orders" },
    { "id": "ec.products", "title": "menu.ec.products", "path": "/plugins/ec/products" }
  ],
  "resources": [
    { "resource": "ec:order", "actions": ["read", "create", "update", "cancel"] },
    { "resource": "ec:product", "actions": ["read", "create", "update", "delete"] }
  ]
}
```

> 宿主 PowerX 会将其与内置权限合并，并在「系统设置 → 权限管理」中呈现。

---

## 下一步阅读

- 🤖 [Agent Contract 规范](./agent_contract.md)
- 🔐 [上下文签名规范（HMAC / JWT）](./ctx_signing.md)
