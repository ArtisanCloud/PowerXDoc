# Data Model: i18n

**Date**: 2025-10-20

This document outlines the key data entities for the UI translation feature, as extracted from the feature specification.

## Entity Definitions

### 1. Translation Pack

-   **Description**: A file that exports a single default object containing all translation strings for a specific language. It serves as a message source for a given locale.
-   **Format**: A TypeScript or JavaScript file (e.g., `en-US.ts`).
-   **Compatibility**: The exported object structure must be compatible with `vue-i18n`'s `messages` format.
-   **Example**:
    ```typescript
    // locales/en-US.ts
    export default {
      home: {
        title: 'Welcome',
        subtitle: 'Hello, World!'
      },
      footer: {
        copyright: '© 2025 PowerX'
      }
    }
    ```

### 2. Translation Namespace

-   **Description**: A top-level key within a Translation Pack object used to group strings for a specific component, page, or logical section.
-   **Type**: `string` (key of the root object)
-   **Convention**: The preferred convention is to use nested objects to group related translations, though `vue-i18n` also supports flattened keys (e.g., `home.title`).
-   **Example**: In the example above, `home` and `footer` are namespaces.

### 3. Translation String

-   **Description**: A key-value pair representing a single piece of translated text.
-   **Type**: The key is a `string`, and the value is a `string`.
-   **Example**: In the example above, `title: 'Welcome'` is a translation string.
