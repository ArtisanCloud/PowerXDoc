# Research: `vue-i18n` Integration with VitePress

**Date**: 2025-10-20

## Objective

To determine the best practice for integrating the `vue-i18n` library into the existing VitePress documentation site to enable custom component UI translation, as specified in `spec.md`.

## Findings

### Decision: Use Standard Vue 3 Plugin Integration

The recommended and most robust method is to leverage the standard Vue 3 plugin integration pattern within the VitePress theme's entry point.

### Rationale

- **VitePress Compatibility**: VitePress is built on Vue 3 and Vite. Its theming system exposes a hook, `enhanceApp`, which provides direct access to the Vue app instance. This is the designated entry point for installing any Vue plugin, including `vue-i18n`.
- **Maintainability**: Following the official `vue-i18n` installation pattern for Vue 3 ensures long-term maintainability and compatibility with future updates to both VitePress and `vue-i18n`.
- **Full Feature Support**: This approach enables the full feature set of `vue-i18n`, including composables like `useI18n`, global properties like `$t`, and integration with Vue's reactivity system.

### Implementation Summary

1.  **Create i18n instance**: An instance of `vue-i18n` will be created using `createI18n`.
2.  **Load Locales**: Translation messages will be imported from `*.ts` files (e.g., `locales/en-US.ts`).
3.  **Install Plugin**: The created instance will be installed into the Vue app via `app.use(i18n)` inside the `docs/.vitepress/theme/index.ts` file's `enhanceApp` function.

### Alternatives Considered

-   **Manual/Custom Store**: A custom, lightweight translation store could be built using Vue's `reactive` or `ref`. This was rejected because it would reinvent the wheel, missing critical features `vue-i18n` provides (e.g., pluralization, locale fallback, robust message formatting) and would introduce a maintenance burden.
-   **Component-Level Imports**: Importing translations directly into each component. This was rejected as it violates the principle of separation of concerns and does not scale, coupling content with component logic.
