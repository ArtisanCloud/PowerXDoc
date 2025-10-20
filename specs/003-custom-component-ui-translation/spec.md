# Feature Specification: Custom Component UI Translation

**Feature Branch**: `003-custom-component-ui-translation`
**Created**: 2025-10-20
**Status**: Draft
**Input**: User description: "请针对新增的 @/private/var/www/html/ArtisanCloud/X/PowerX/Core/PowerXDocs/design/i18n-strategy.md 里关于Step 5: Custom Component UI Translation"

## Clarifications

### Session 2025-10-20

- Q: 关于翻译功能的实现，我们应该采用一个成熟的第三方库（如 `vue-i18n`），还是构建一个轻量级的自定义工具？ → A: 使用 `vue-i18n` 这样的成熟库。
- Q: 预期的翻译规模有多大？这会影响我们是否需要为语言包设置按需加载。 → A: 初期规模较小（数百个字符串），但未来可能扩展。
- Q: 如果一个翻译键存在，但其对应的翻译文本是空的（空字符串 ''），应该如何显示？ → A: 显示空字符串，即不显示任何内容。
- Q: 关于缺失翻译的警告，我们应该在哪里记录它们？ → A: 仅在浏览器的开发者控制台。
- Q: 在语言包文件中，我们应该强制使用扁平的键结构（例如 home.title）还是允许使用嵌套的对象结构（例如 home: { title: ... }）？ → A: 允许使用嵌套结构 (e.g., home: { title: ... })。

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Developer Refactors Component (Priority: P1)

As a developer, I want to refactor an existing Vue component with hardcoded strings to use a centralized translation system, so that the component's code is clean and completely separated from its display text.

**Why this priority**: This is the core task required to migrate the existing codebase to the new i18n strategy, improving maintainability.

**Independent Test**: This can be tested by verifying that a specific component (`MyAwesomeHome.vue`) no longer contains hardcoded Chinese or English strings and instead fetches them from an external source. The component should still render the correct language based on the user's selection.

**Acceptance Scenarios**:

1.  **Given** the `MyAwesomeHome.vue` component contains a hardcoded dictionary of translations, **When** a developer applies the refactoring, **Then** the hardcoded dictionary is removed and replaced with a call to a translation utility.
2.  **Given** the component has been refactored, **When** a user views the page in English, **Then** all text within the component is displayed in English.
3.  **Given** the component has been refactored, **When** a user switches the language to Chinese, **Then** all text within the component is displayed in Chinese.

---

### User Story 2 - Content Manager Updates Text (Priority: P2)

As a content manager or translator, I want to update a piece of text on the homepage by only editing a language-specific text file, without needing to understand or modify any component code.

**Why this priority**: This validates the primary benefit of the new strategy: separation of concerns, which empowers non-developers to manage content.

**Independent Test**: This can be tested by changing a string in a language pack file (e.g., `locales/en-US.ts`) and observing the change reflected on the live-reloading documentation site without touching any `.vue` files.

**Acceptance Scenarios**:

1.  **Given** the homepage displays the title "Welcome to PowerX" in English, **When** a content manager changes the corresponding string in the `en-US.ts` file to "Welcome to the PowerX Platform", **Then** the homepage immediately displays the new title.
2.  **Given** a content manager makes a change to a translation file, **When** the site is viewed, **Then** no other part of the site's functionality or layout is broken.

---

### Edge Cases

-   What happens when a translation key is present in one language file but missing in another? The `vue-i18n` instance will be configured to gracefully fall back to the default language (Chinese) and log a warning only in the browser console during development. These warnings should not be sent to a persistent logging service.
-   If a translation key exists but its value is an empty string, the system MUST render an empty string (i.e., nothing) in the UI. It should not fall back or display the key.
-   How does the system handle translation strings that need to contain links or simple formatting? The initial implementation will focus on plain text. Rich text is out of scope for this iteration.

## Requirements *(mandatory)*

### Functional Requirements

-   **FR-001**: The `vue-i18n` library MUST be installed and configured as a dependency for the VitePress theme.
-   **FR-002**: The system MUST provide a directory structure within the theme for storing language-specific translation files (e.g., `locales/en-US.ts`, `locales/zh-CN.ts`).
-   **FR-003**: The system MUST allow defining translations as JavaScript/TypeScript objects compatible with `vue-i18n`. A nested object structure (e.g., `home: { title: ... }`) is the preferred convention for organizing strings.
-   **FR-004**: The system MUST provide a utility (e.g., a Vue composable like `useI18n`) based on the `vue-i18n` library that allows components to easily access the translations for the currently active language.
-   **FR-005**: The `MyAwesomeHome.vue` component MUST be refactored to use this new translation system.
-   **FR-006**: All hardcoded UI strings (Chinese and English) MUST be removed from `MyAwesomeHome.vue`.
-   **FR-007**: The translation utility MUST automatically detect the current language from the VitePress environment and integrate it with the `vue-i18n` instance.

### Non-Functional Requirements

-   **NFR-001**: The initial implementation can load all language packs eagerly, as the initial number of strings is expected to be in the hundreds.
-   **NFR-002**: The solution architecture SHOULD be designed to accommodate future extension, including the ability to switch to lazy-loading of language packs if the translation scale grows significantly (thousands of strings).

### Key Entities

-   **Translation Pack**: A file (e.g., `en-US.ts`) that exports a single default object containing all translation strings for a specific language, compatible with `vue-i18n`'s `messages` format.
-   **Translation Namespace**: A top-level key within a Translation Pack object used to group strings for a specific component or page (e.g., `home`, `footer`).
-   **Translation String**: A key-value pair representing a single piece of translated text.

## Success Criteria *(mandatory)*

### Measurable Outcomes

-   **SC-001**: 100% of the UI text content within the `MyAwesomeHome.vue` component is sourced from external language files.
-   **SC-002**: Modifying a translation string in a language pack file takes effect on the website without requiring any changes to `.vue` component files.
-   **SC-003**: The process for a developer to add a new translated string to a new component takes fewer than 5 steps (as defined in the quickstart guide).
-   **SC-004**: The introduction of the translation system results in a negligible (< 1%) increase in the production JavaScript bundle size for the homepage.
