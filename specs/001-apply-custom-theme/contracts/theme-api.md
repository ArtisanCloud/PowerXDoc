# Contract: VitePress Theme Customization API

This document specifies the contract for developers to customize the VitePress theme.

## 1. CSS Overrides

Developers can apply site-wide CSS overrides by creating a file at `docs/.vitepress/theme/style.css` and importing it into `docs/.vitepress/theme/index.ts`.

**Contract**: Any valid CSS rule placed in this file MUST be applied to the final rendered site.

**Example (`style.css`)**:

```css
/* Change the primary brand color */
:root {
  --vp-c-brand: #646cff;
}

/* Change the font for headings */
h1 {
  font-family: 'Georgia', serif;
}
```

## 2. Homepage Layout Replacement

Developers can replace the default homepage with a custom Vue component.

**Contract**: To activate the custom homepage, the `index.md` file at the root of the `docs` directory MUST contain the following frontmatter:

```yaml
---
layout: home
---
```

The theme MUST be configured to render a custom component when this layout is specified. The theme configuration in `docs/.vitepress/theme/index.ts` will associate the `home` layout with a specific Vue component.

**Example (`index.ts`)**:

```typescript
import DefaultTheme from 'vitepress/theme'
import CustomHome from './CustomHome.vue' // A custom Vue component

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    // Register the custom homepage component globally
    app.component('home', CustomHome)
  }
}
```

## 3. Build-Time Safety

**Contract**: If a page's frontmatter specifies a layout that is not registered in the theme, the build process MUST fail with an error message indicating the missing layout.
