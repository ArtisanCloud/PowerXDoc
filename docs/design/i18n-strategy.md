# VitePress Internationalization (i18n) Strategy

This document outlines the design and implementation plan for adding bilingual (Chinese/English) support to the PowerX documentation website.

---

### Step 1: Content Directory Structure

The core principle is to separate content by language into distinct directories. By convention, the default language resides at the root, and other languages are placed in named subdirectories.

1.  **Chinese (Default Language):** All existing Markdown files within the `docs/` directory will serve as the Chinese content. No changes are needed for these files.

2.  **English (New Language):** A new `docs/en/` directory will be created. The internal structure of `docs/en/` MUST exactly mirror the structure of the `docs/` directory to ensure proper page mapping and language switching.

**Example Directory Structure:**

```text
docs/
├── en/                            # English Content
│   ├── index.md
│   └── core-concepts/
│       └── README.md
│
├── index.md                       # Chinese Content
└── core-concepts/
    └── README.md
```

---

### Step 2: VitePress Configuration (`docs/.vitepress/config.mts`)

The configuration file must be updated to inform VitePress of the multi-language setup using the `locales` option. This allows for separate navigation, sidebars, and other text for each language.

**Proposed Configuration:**

```typescript
import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "PowerX Documentation",
  description: "A website to introduce PowerX",

  themeConfig: {
    socialLinks: [
      { icon: 'github', link: 'https://github.com/ArtisanCloud/PowerX' }
    ]
  },

  locales: {
    // Chinese (Default)
    root: {
      label: '简体中文',
      lang: 'zh-CN',
      themeConfig: {
        nav: [
          { text: '首页', link: '/' },
          { text: '文档', link: '/core-concepts/' }
        ],
        sidebar: [ /* Chinese sidebar structure */ ],
        footer: { message: '基于 Apache 2.0 许可发布' },
        editLink: { text: '在 GitHub 上编辑此页' }
      }
    },

    // English
    en: {
      label: 'English',
      lang: 'en-US',
      themeConfig: {
        nav: [
          { text: 'Home', link: '/en/' },
          { text: 'Docs', link: '/en/core-concepts/' }
        ],
        sidebar: [ /* English sidebar structure with /en/ prefixes */ ],
        footer: { message: 'Released under the Apache 2.0 License.' },
        editLink: { text: 'Edit this page on GitHub' }
      }
    }
  }
})
```

*Note: The full sidebar objects are omitted for brevity but will be included in the final implementation, with all links correctly prefixed for the English version.*

---

### Step 3: Content Translation Strategy

This is the most labor-intensive part of the process.

1.  **Source Content:** The existing documentation is primarily in Chinese.
2.  **Translation Workflow:** For every Markdown file in `docs/`, a corresponding translated version must be created in `docs/en/`.
3.  **Tooling Assistance:** An automated script or tool can be used to create placeholder English files by copying the Chinese content. This ensures the site structure is complete. Machine translation can be used for a first pass.
4.  **Human Review:** All machine-translated content, especially for nuanced technical terms, MUST be reviewed and corrected by a human to ensure accuracy and professional quality.

---

### Step 4: User Experience

Once the `locales` configuration is in place, VitePress will automatically add a **language switcher** to the navigation bar. This allows users to seamlessly switch between Chinese and English. VitePress will intelligently link to the corresponding page in the other language if it exists.

---

### Summary of Implementation Steps

1.  Create the `docs/en/` directory and its subdirectories to mirror the root `docs/` structure.
2.  Update `docs/.vitepress/config.mts` with the `locales` configuration as detailed above.
3.  Populate the `docs/en/` directory with translated Markdown files.

---

### Workflow Automation & Tooling

- **Synchronization**: `pnpm run localization:sync` mirrors zh-CN markdown into `docs/en/**`, stamping `partnerSlug` and default `reviewStatus` metadata while updating `docs/localization/manifest.json`.
- **Parity Auditing**: `pnpm run localization:check` walks both locale trees, reporting missing counterparts, placeholder counts, and partner slug mismatches (see `scripts/localization/check-parity.ts`).
- **Review Guard**: `pnpm run localization:review-guard` enforces `reviewStatus: Approved` across all English pages and verifies that every `partnerSlug` resolves to a zh-CN source before release (`pnpm run docs:release` chains the guard with `vitepress build`).
- **Default Locale Smoke Test**: `node scripts/localization/assert-zh-default.mjs` asserts that first-time visits keep zh-CN as the landing experience.

---

### Review Banner UX

- Component: `docs/.vitepress/theme/components/ReviewBanner.vue`
- Auto-renders for English pages whose frontmatter sets `reviewStatus` to `Placeholder` or `InReview`.
- Surfaces status messaging and links back to the zh-CN original via `partnerSlug`, ensuring transparency during editorial cycles.

---

### Visualization

The localization lifecycle mermaid diagram is stored at `design/diagrams/localization-flow.mmd` and referenced throughout maintainer docs to illustrate the sync → translate → review → publish loop.

---

### Step 5: Custom Component UI Translation

While the above steps cover Markdown content and theme-level text, custom Vue components (e.g., a custom homepage) require a robust strategy for their internal UI strings. The approved approach is to use the industry-standard `vue-i18n` library, which provides a complete solution for internationalization.

**1. Dependency Installation:**

The `vue-i18n` library must be added as a project dependency.

```bash
# Using pnpm
pnpm add vue-i18n
```

**2. Directory Structure for Language Packs:**

Create a `locales` directory within the VitePress theme to store translation files. This structure remains the same.

```text
docs/.vitepress/theme/
├── locales/
│   ├── en-US.ts
│   └── zh-CN.ts
├── components/
│   └── MyAwesomeHome.vue
└── index.ts
```

**3. Language Pack Content:**

Each file exports a default object containing the translations. The format is fully compatible with `vue-i18n`.

**Example: `locales/en-US.ts`**
```typescript
export default {
  home: {
    nav: { features: 'Features', products: 'Product Suite', cta: 'Get Started' },
    hero: { welcomePrefix: 'Welcome to', highlight: 'PowerX' },
  }
}
```

**4. Configure `vue-i18n` in VitePress:**

The core of the integration happens in the theme's entry point, where we create a `vue-i18n` instance and install it as a Vue plugin using VitePress's `enhanceApp` hook.

**Example: `docs/.vitepress/theme/index.ts`**
```typescript
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { createI18n } from 'vue-i18n'
import zh from './locales/zh-CN'
import en from './locales/en-US'

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    const i18n = createI18n({
      legacy: false, // Use Composition API
      locale: 'zh-CN', // Default language
      fallbackLocale: 'en-US', // Fallback language
      messages: {
        'zh-CN': zh,
        'en-US': en
      }
    });

    app.use(i18n);
  }
} satisfies Theme
```

**5. Refactor the Vue Component:**

Update the custom component to use the `useI18n` composable provided by `vue-i18n`.

**Example: `MyAwesomeHome.vue`**

```vue

<script setup lang="ts">
  import {useI18n} from 'vue-i18n'

  // Use the vue-i18n composable to get the translation function `t`
  const {t} = useI18n()
</script>

<template>
  <h1>{{ t('home.hero.welcomePrefix') }} {{ t('home.hero.highlight') }}</h1>
  <a href="/docs">{{ t('home.nav.cta') }}</a>
</template>
```

This approach provides a robust, scalable, and maintainable solution for internationalizing all custom components, leveraging the full power of the `vue-i18n` library.
