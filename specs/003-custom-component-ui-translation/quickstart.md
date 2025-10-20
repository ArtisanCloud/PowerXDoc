# Quickstart: Adding and Using UI Translations

**Date**: 2025-10-20
**Audience**: Developer

This guide provides a step-by-step walkthrough for refactoring a Vue component to use the centralized `vue-i18n` translation system.

## Prerequisites

- The `vue-i18n` library is installed and configured in `docs/.vitepress/theme/index.ts`.
- The locale file structure exists at `docs/.vitepress/theme/locales/`.

## Steps

### Step 1: Add a New Translation String

1.  Open the relevant language pack file. For English, this is `docs/.vitepress/theme/locales/en-US.ts`.
2.  Add your new translation key and string. Use a nested object structure to group related strings, for example, under a component or page name.

    ```typescript
    // docs/.vitepress/theme/locales/en-US.ts
    export default {
      home: {
        title: 'Welcome',
        subtitle: 'Hello, World!'
      },
      // Add a new namespace for your component
      myNewComponent: {
        greeting: 'This is a translated greeting!'
      }
    }
    ```

3.  Repeat the process for other languages (e.g., `zh-CN.ts`).

### Step 2: Use the Translation in a Component

1.  In your Vue component (e.g., `MyNewComponent.vue`), import the `useI18n` composable from `vue-i18n`.
2.  Call the composable to get access to the translation function, commonly named `t`.
3.  Use the `t()` function in your template to display the translated string, referencing the key you just added.

    ```vue
    <script setup>
    import { useI18n } from 'vue-i18n'

    const { t } = useI18n()
    </script>

    <template>
      <div>
        <h1>{{ t('myNewComponent.greeting') }}</h1>
      </div>
    </template>
    ```

### Step 3: Refactor Hardcoded Text

Now, apply this pattern to remove existing hardcoded text from a component.

**Before:**

```vue
<template>
  <div>
    <h1>Welcome to My Awesome Home</h1>
    <p>This is a hardcoded paragraph.</p>
  </div>
</template>
```

**After:**

1.  Add the strings to your locale files:

    ```typescript
    // en-US.ts
    export default {
      awesomeHome: {
        title: 'Welcome to My Awesome Home',
        body: 'This is a translated paragraph.'
      }
    }
    ```

2.  Refactor the component to use the `t` function:

    ```vue
    <script setup>
    import { useI18n } from 'vue-i18n'
    const { t } = useI18n()
    </script>

    <template>
      <div>
        <h1>{{ t('awesomeHome.title') }}</h1>
        <p>{{ t('awesomeHome.body') }}</p>
      </div>
    </template>
    ```

By following these steps, you have successfully decoupled the component's text content from its logic, making it fully translatable.
