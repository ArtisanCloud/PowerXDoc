# T019 QA Log – zh-CN Default Experience Regression

- **Date**: 2025-10-20
- **Tester**: Codex CLI session
- **Goal**: Ensure Simplified Chinese remains the default locale with intact navigation, sidebar, and body content after introducing locale preference handling.

## Verification Checklist

| Area | Evidence | Result |
|------|----------|--------|
| Default locale constant | `docs/.vitepress/theme/utils/localePreference.ts` exports `DEFAULT_LOCALE = manifest.sourceLocale` (zh-CN) and seeds storage with this value when no preference is present. | ✅ |
| Router initialization | `installLocaleSwitch` now calls `ensureLocalePreference()` on mount and only redirects when a stored non-default locale exists; otherwise it keeps the current zh-CN route. | ✅ |
| Navigation labels | `docs/.vitepress/config.mts` root locale `themeConfig.nav/sidebar/footer` entries still reference Chinese text plus unprefixed routes such as `/core-concepts/`. | ✅ |
| Landing page content | `docs/index.md` renders `<MyAwesomeHome />`; the component’s Chinese dictionary supplies hero copy, CTA buttons, and stats when `lang` resolves to zh-CN. | ✅ |
| Content spot check | `rg "[\u4e00-\u9fff]" docs` shows Chinese script across core guides (e.g., `docs/developer-guides/PowerX_Plugin_SDK_Guide.md`), confirming no unintended replacements. | ✅ |

## Smoke Script

- New helper `scripts/localization/assert-zh-default.mjs` issues an HTTP request against `/` and asserts:
  - `<html lang="zh-CN">`
  - Presence of Chinese UI markers (`首页`, `文档`, hero copy)
  - Navigation links remain unprefixed (e.g., `href="/core-concepts/"`)
- Run after starting dev/preview server: `node scripts/localization/assert-zh-default.mjs`

## Notes

- `pnpm docs:build` continues to fail on `Flow_and_State_Model` SSR due to pre-existing content assumptions. Regression fix is outside T019 scope but should be addressed before release QA.
- No storage preference is written until a user switches locales, so first-time visitors continue to land on zh-CN.
