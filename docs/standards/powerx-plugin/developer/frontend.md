# 前端结构说明（Frontend Architecture - Nuxt 4 + Nuxt UI 3.3.2）

> 本页目标：说明 PowerX 插件前端在 **Nuxt 4 + Nuxt UI v3.3.2** 环境下的项目结构、运行模式、约定规范与组件用法。  
> 读者对象：前端开发者 / 全栈工程师 / 插件作者。

---

## 一、技术栈

| 模块 | 版本 / 框架 | 说明 |
|------|--------------|------|
| **Nuxt** | v4 (Nitro + Vue 3 Composition API) | 插件前端主框架 |
| **Nuxt UI** | v3.3.2 | 官方 UI 组件库（基于 Tailwind + Radix） |
| **TypeScript** | v5+ | 全量类型支持 |
| **Pinia** | 状态管理 |
| **Vue I18n / Nuxt I18n** | 多语言支持 |
| **ESLint + Prettier** | 代码风格一致化 |
| **Vite / Nitro** | 构建与 SSR/SPA 混合运行支持 |

---

## 二、目录结构（真实项目）

```

web-admin/
├── app/
│   ├── app.vue                 # 全局入口
│   ├── assets/                 # 样式、图标、字体资源
│   ├── bridge/                 # 与 PowerX 后端桥接逻辑（usePluginBridge 等）
│   ├── components/             # 通用组件（UCard、UTable、UButton 等）
│   ├── composables/            # 可复用逻辑函数（useAuth、useTenant 等）
│   ├── layouts/                # 页面布局（default.vue、dashboard.vue 等）
│   ├── middleware/             # 路由中间件（auth.global.ts）
│   ├── pages/                  # 页面入口（intro.vue、templates.vue）
│   ├── plugins/                # 插件注册（如 Pinia、API client）
│   ├── server/                 # 可选：服务端 API（server/api/...）
│   ├── stores/                 # Pinia 状态（useUserStore.ts、useTemplateStore.ts）
│   └── utils/                  # 工具函数（formatDate、logger 等）
│
├── i18n/                       # 国际化
│   ├── zh.yaml
│   └── en.yaml
│
├── public/                     # 静态资源
│
├── eslint.config.mjs
├── tsconfig.json
├── nuxt.config.ts
├── package.json
└── package-lock.json

```

---

## 三、运行模式与反代规则

| 模式 | baseURL | 接口路径 | 说明 |
|------|----------|-----------|------|
| **本地开发** | `/` | `http://127.0.0.1:8086/v1/...` | 直连后端，不需宿主 |
| **宿主反代** | `/_p/<plugin-id>/admin/` | `/_p/<plugin-id>/api/v1/...` | PowerX 注入反代前缀 |

PowerX 在部署时自动代理：

```

/_p/com.powerx.plugins.base/admin/* → web-admin/.output/
/_p/com.powerx.plugins.base/api/*   → backend/:8086

````

---

## 四、Nuxt 4 配置（`nuxt.config.ts`）

```ts
export default defineNuxtConfig({
  ssr: false, // 插件管理端默认 SSG/SPA 模式
  app: {
    baseURL: process.env.POWERX_PROXY
      ? `/_p/${process.env.POWERX_PLUGIN_ID}/admin/`
      : '/',
  },
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.POWERX_PROXY
        ? `/_p/${process.env.POWERX_PLUGIN_ID}/api/v1`
        : 'http://127.0.0.1:8086/v1',
      insidePowerX: !!process.env.POWERX_PROXY,
    },
  },
  modules: ['@nuxt/ui', '@pinia/nuxt', '@nuxtjs/i18n'],
  i18n: {
    locales: ['en', 'zh'],
    defaultLocale: 'zh',
    vueI18n: './i18n/index.ts',
  },
  typescript: { strict: true },
})
````

> ✅ **Nuxt UI 3.3.2 提示**
>
> * 所有颜色类型为：`"primary" | "secondary" | "success" | "info" | "warning" | "error" | "neutral"`
> * 不再提供 `UToggle`，使用 `USwitch` 代替。
> * Modal、Dropdown、Tabs、Button 等支持 `variant="subtle" | "solid" | "outline" | "ghost"`。

---

## 五、API 调用与 Bridge 模式

统一在 `app/plugins/powerx.ts` 定义请求器：

```ts
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const base = config.public.apiBaseUrl

  const request = $fetch.create({
    baseURL: base,
    headers: {
      'X-PowerX-CTX-JWT': useCookie('powerx_token').value || '',
    },
  })

  return {
    provide: {
      api: {
        listTemplates: () => request('/templates'),
        createTemplate: (body: any) => request('/templates', { method: 'POST', body }),
      },
    },
  }
})
```

页面中直接使用：

```vue
<script setup lang="ts">
const { $api } = useNuxtApp()
const { data } = await useAsyncData(() => $api.listTemplates())
</script>
```

---

## 六、UI 组件示例（Nuxt UI v3.3.2）

### 1️⃣ 按钮

```vue
<UButton label="保存" color="primary" variant="solid" />
<UButton label="取消" color="neutral" variant="outline" />
```

### 2️⃣ 模态框（`UModal`）

```vue
<script setup lang="ts">
const open = ref(false)
</script>

<template>
  <UButton label="打开" color="primary" @click="open = true" />

  <UModal v-model:open="open" title="示例对话框" :ui="{ footer: 'justify-end' }">
    <template #body>
      <p class="p-4">这是一个使用 Nuxt UI 3.3.2 的模态框。</p>
    </template>

    <template #footer="{ close }">
      <UButton label="关闭" color="neutral" variant="outline" @click="close" />
      <UButton label="确定" color="primary" />
    </template>
  </UModal>
</template>
```

> ✅ 可使用 `useOverlay()` 进行程序化调用：
> 详见 Nuxt UI 官方文档 → [Modal Composable](https://ui.nuxt.com/components/modal)。

### 3️⃣ 开关（`USwitch`）

```vue
<USwitch v-model="enabled" color="success" label="启用状态" />
```

---

## 七、状态管理（Pinia）

```ts
// app/stores/useTemplateStore.ts
import { defineStore } from 'pinia'

export const useTemplateStore = defineStore('template', {
  state: () => ({
    list: [] as any[],
  }),
  actions: {
    async fetch() {
      const { $api } = useNuxtApp()
      this.list = await $api.listTemplates()
    },
  },
})
```

---

## 八、国际化示例

`i18n/zh.yaml`：

```yaml
menu:
  base:
    intro: 插件概览
    templates: 模板列表
button:
  save: 保存
  cancel: 取消
```

页面：

```vue
<UButton :label="$t('button.save')" color="primary" />
```

---

## 九、本地开发与构建

### 开发模式

```bash
npm install
npm run dev
```

默认访问 [http://localhost:3000](http://localhost:3000)
直连后端 `:8086/v1`。

### 构建

```bash
npm run build
```

输出到 `.output/`，由 `plugin.yaml` 声明：

```yaml
assets:
  webAdminPath: web-admin/.output
```

---

## 十、最佳实践与 Nuxt 规范要点

| 类别           | 建议                                                          |           |         |      |         |       |           |
| ------------ | ----------------------------------------------------------- | --------- | ------- | ---- | ------- | ----- | --------- |
| **目录结构**     | 遵循 `app/` 统一结构（Nuxt 4 推荐），避免 src/ 或 pages/ 平级目录。            |           |         |      |         |       |           |
| **组件命名**     | 采用 PascalCase，例如 `TemplateList.vue`。                        |           |         |      |         |       |           |
| **UI 一致性**   | 所有组件优先使用 Nuxt UI 组件（`UButton`, `UCard`, `UForm`, `UModal`）。 |           |         |      |         |       |           |
| **交互逻辑**     | 业务状态放入 Pinia，不直接在页面保存数据。                                    |           |         |      |         |       |           |
| **权限控制**     | 菜单与按钮展示基于 RBAC 权限数组动态判断。                                    |           |         |      |         |       |           |
| **样式体系**     | Tailwind 默认主题，局部自定义通过 `:ui` prop 或 CSS variables。           |           |         |      |         |       |           |
| **颜色与语义**    | 使用标准颜色：`primary                                             | secondary | success | info | warning | error | neutral`。 |
| **Modal 控制** | 推荐使用 `v-model:open` 或 `useOverlay()`，不要自己写 `v-if` 切换。       |           |         |      |         |       |           |
| **代码组织**     | 全局逻辑放在 composables、插件桥接逻辑放在 bridge/。                        |           |         |      |         |       |           |

---

## 下一步阅读

* ⚙️ [Makefile 与运行任务说明](./makefile_tasks.md)
* 🧩 [plugin.yaml 规范](../contract/plugin_yaml_spec.md)
* 🚀 [部署与 Docker 指南](../deploy/docker_guide.md)
