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
        footer: { message: '基于 MIT 许可发布' },
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
        footer: { message: 'Released under the MIT License.' },
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
