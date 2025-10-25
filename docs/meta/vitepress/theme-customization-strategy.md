# VitePress Theme Customization Strategy

This document outlines the available strategies for customizing the VitePress theme, with a specific plan for integrating an existing custom Vue homepage component.

---

## Part 1: General Customization Methods

VitePress is designed with an extensible default theme, allowing for customization at various levels of complexity.

### Level 1: Simple CSS Overrides (Easiest)

This method is ideal for simple stylistic changes like colors, fonts, and margins.

1.  **Create a custom CSS file:** `docs/.vitepress/theme/style.css`
2.  Any CSS rules in this file will be loaded after the default theme's styles, allowing them to override the defaults.

**Example (`style.css`):**
```css
/* Change the primary brand color */
:root {
  --vp-c-brand-1: #646cff;
  --vp-c-brand-2: #747bff;
}
```

### Level 2: Extending the Default Theme (Most Common & Flexible)

This is the core method for customization, allowing you to replace or enhance specific parts of the theme (like the homepage, navbar, etc.) with your own Vue components using "Layout Slots".

1.  **Create a theme entry file:** `docs/.vitepress/theme/index.ts` (or `.js`)
2.  **Inherit the default theme:** Import `DefaultTheme` from `vitepress` and export an extended theme object.
3.  **Use Slots to Replace Components:** Use the `Layout` property to tell VitePress to render your own components in specific pre-defined slots.

**Example (`index.ts`):**
```typescript
import DefaultTheme from 'vitepress/theme'
import MyCustomComponent from './MyCustomComponent.vue'

export default {
  ...DefaultTheme, // Inherit default theme configuration
  
  // Use the Layout property to extend or replace
  Layout: {
    ...DefaultTheme.Layout,
    // Example: Insert a custom component after the hero section on the homepage
    'home-hero-after': MyCustomComponent 
  }
}
```

### Level 3: Full Custom Theme (Most Complex)

This involves not extending the `DefaultTheme` at all and providing your own root `Layout.vue` component. This is only recommended if the default theme is entirely unsuitable for your needs.

---

## Part 2: Strategy to Apply an Existing Vue Homepage

This plan leverages the "Level 2: Extending" method to replace the default VitePress homepage with a custom Vue component.

### Step 1: Prepare Your Custom Components

- Copy your existing Vue homepage component (e.g., `MyAwesomeHome.vue`) and its related assets (CSS, images) into the `docs/.vitepress/theme/` directory.

### Step 2: Extend `index.ts` with a Frontmatter Switch

Instead of introducing a standalone `Layout.vue`, the current implementation wraps the default layout inside `docs/.vitepress/theme/index.ts`. We read the active page’s frontmatter via `useData()` and swap the entire layout when `layout: landing` is present (the homepage). This keeps the extension lightweight and lets VitePress keep ownership of the default layout elsewhere.

```ts
import { defineComponent, h } from 'vue'
import { useData } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import MyAwesomeHome from './components/MyAwesomeHome.vue'

export default {
  extends: DefaultTheme,
  Layout: defineComponent({
    setup() {
      const { page } = useData()
      return () =>
        page.value.frontmatter.layout === 'landing'
          ? h(MyAwesomeHome)
          : h(DefaultTheme.Layout)
    },
  }),
}
```

### Step 3: Vendor PowerXAdmin Tokens Locally

文档站是独立项目，禁止通过相对路径引用 `PowerXAdmin/app/assets/**`。需要把产品的视觉变量快照复制到 `docs/.vitepress/theme/powerx-admin-theme.css`，并仅在本仓库内引用。

1. 在 PowerXAdmin 仓库导出最新 `theme.css`（必要时删除与 workflow 相关、与文档无关的模块）。
2. 将内容粘贴到 `docs/.vitepress/theme/powerx-admin-theme.css`，加注释注明来源与日期。
3. 在 `style.css` 顶部只保留这一条导入：

```css
@import './powerx-admin-theme.css';
```

这样 VitePress 主题就继承了产品用的颜色/字体，但没有跨 repo 的路径依赖，也不会加载 `workflow.css`。

### Step 4: Configure the Homepage Markdown

The homepage simply opts into the landing layout and mounts the Vue component via the Markdown body.

```yaml
---
layout: landing
title: PowerX 智能体平台
---

<MyAwesomeHome />
```

### Step 5: Reuse Shared Navigation Controls & Branding

The custom landing component surfaces VitePress’s appearance toggle (`VPSwitchAppearance`), draws the GitHub URL from `themeConfig.socialLinks`, and loads the shared logo sprites from `docs/public/images`. This keeps feature parity with the default theme while presenting the bespoke hero/sections.
