# Data Model: VitePress Theme Configuration

This document defines the data model for the VitePress theme configuration object, which is the primary interface for customizing the documentation site's appearance and layout.

## ThemeConfig Object

The `ThemeConfig` object is the default export of `docs/.vitepress/theme/index.ts`. It extends the default theme configuration from VitePress.

```typescript
import type { DefaultTheme } from 'vitepress'

export interface ThemeConfig extends DefaultTheme.Config {
  // No custom properties are added in this iteration.
  // Future properties for theme-level settings would be defined here.
}
```

## Layout Overrides

The primary mechanism for customization is by providing a custom `Layout` component or by using frontmatter in markdown files.

### Custom Layout Component

A custom layout component can be provided in the theme configuration:

```typescript
import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import MyAwesomeHome from './MyAwesomeHome.vue'

export default {
  ...DefaultTheme,
  Layout: () => {
    // Custom layout logic to switch between default and custom components
    // based on frontmatter.
    return h(DefaultTheme.Layout, null, {
      'home-hero-before': () => h(MyAwesomeHome)
    })
  }
}
```

### Frontmatter Configuration

A page can specify a custom layout using its frontmatter:

```markdown
---
layout: home
---
```

This requires the theme to be able to resolve and render the `home` layout.