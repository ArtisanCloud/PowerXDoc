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

### Step 2: Create a Custom Layout Wrapper

Create a new file `docs/.vitepress/theme/Layout.vue`. This component will act as a router, deciding whether to show your custom homepage or the default theme's layout for other pages.

**Example (`Layout.vue`):**
```vue
<script setup>
import { useData } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import MyAwesomeHome from './MyAwesomeHome.vue'

const { frontmatter } = useData()
</script>

<template>
  <!-- If the page's frontmatter has layout: home -->
  <div v-if="frontmatter.layout === 'home'">
    <MyAwesomeHome />
  </div>
  <!-- Otherwise, for all other pages, use the default theme -->
  <div v-else>
    <DefaultTheme.Layout />
  </div>
</template>
```

### Step 3: Configure the Theme Entry File

Create or edit `docs/.vitepress/theme/index.ts` to use your new `Layout.vue` wrapper.

**Example (`index.ts`):**
```typescript
import Layout from './Layout.vue'
import './my-awesome-home-styles.css' // Import custom homepage styles

export default {
  Layout, // Use the custom layout wrapper
  // other theme configurations can go here
}
```

### Step 4: Configure the Homepage Markdown

Finally, edit the homepage markdown file (`docs/index.md`) to specify that it should use the custom `home` layout and to remove the default homepage features.

**Example (`docs/index.md` frontmatter):**
```yaml
---
layout: home
---

# This content will be replaced by the custom layout
```

This setup ensures that only the homepage is replaced with your custom component, while all other documentation pages retain the standard, functional layout of the VitePress default theme.
