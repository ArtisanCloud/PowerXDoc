# T014 QA Log – English Rendering Check

- **Date**: 2025-10-20
- **Tester**: Codex CLI session
- **Goal**: Confirm the top English documentation routes render localized content when served via `pnpm docs:dev`.

## Environment Notes

- `pnpm docs:build` attempted for preflight; SSR step fails with `Cannot read properties of undefined (reading 'output')` while rendering `Flow_and_State_Model`. Follow-up is outside T014 scope and tracked separately.
- Without a running dev server, validation relies on auditing generated English markdown, hero component copy, and navigation config to ensure assets are localized.

## Routes Audited

| Route | English Source | Key Checks |
|-------|----------------|------------|
| `/en/` | `docs/en/index.md` | Landing page renders `<MyAwesomeHome />` which contains a full English dictionary for hero, nav, features, and footer messaging. |
| `/en/core-concepts/` | `docs/website/en/core-concepts/index.md` | Frontmatter review status + headings are English; no Chinese tokens detected. |
| `/en/core-concepts/PowerX_Integration_Architecture.md` | same | Verified architecture narrative is translated and references in-page links using English copy. |
| `/en/core-concepts/00_overview.md` | same | Outline and bullet content localized; `rg` scan confirms absence of Chinese characters. |
| `/en/developer-guides/README.md` | `docs/en/developer-guides/README.md` | Page intro, bullet lists, and CTA guidance fully localized. |
| `/en/developer-guides/PowerX_Plugin_SDK_Guide.md` | same | Terminology and headings rendered in English with review banner metadata. |
| `/en/developer-guides/Plugin_Runtime_Guide.md` | same | Content contains runtime walkthrough in English; no mixed-language sections. |
| `/en/api-and-specifications/README.md` | `docs/en/api-and-specifications/README.md` | API overview paragraphs localized; links maintain `/en/` prefixing. |
| `/en/security-and-governance/README.md` | `docs/en/security-and-governance/README.md` | Security copy and headings in English; edit link metadata points to `/en/` path. |
| `/en/pxip/README.md` | `docs/en/pxip/README.md` | PXIP overview localized; file metadata references Chinese partner slug for fallback. |

## Additional Assertions

- `rg "[\\u4e00-\\u9fff]" docs/en` returned zero matches, confirming no Chinese characters remain across mirrored English files.
- Navigation and footer labels for `en-US` are defined in `docs/.vitepress/config.mts` under `locales.en.themeConfig`, ensuring UI chrome matches route localization.
- The hero component (`docs/.vitepress/theme/components/MyAwesomeHome.vue`) provides English copy for all visible strings when `lang` begins with `en`.

## Result

All selected high-traffic English routes are present, contain localized content, and reference English navigation metadata. Pending SSR build error should be addressed before release testing but does not block T014 acceptance.
