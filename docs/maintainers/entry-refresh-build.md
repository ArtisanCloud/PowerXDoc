# Entry refresh: build and release profiles

Base: `dev/michaelhu` at `91e8b1342ac5187c350b2f0a2f4aa49dbaffd4ad`.
Working branch: `feat/docs-clear-start`. This is a documentation-only refresh.

```sh
npm ci
npm run lint
npm run test:workflows
# Owner-private preview (required for the preview artifact)
VITE_SITE_ENV=preview \
VITE_SITE_ORIGIN=https://docs-preview.example.invalid \
VITE_MAIN_SITE_ORIGIN=https://company-preview.example.invalid \
npm run docs:build
```

Static output: `docs/.vitepress/dist`. Serve the complete directory, not only
`index.html`. VitePress generates page HTML plus route/search assets.

Replace the example origins above with the authorized private preview origins
at build time. Preview builds require both `VITE_SITE_ORIGIN` (this docs site)
and `VITE_MAIN_SITE_ORIGIN` (company site); private links are not stored in source. `preview` emits noindex
metadata and disallows crawling; **access control is still the hosting layer's
responsibility**. Robots rules are not a privacy boundary.

Existing build commands remain production-profile by default to avoid silently
shipping noindex to the existing public site. Production is a separate,
authorized release step, not part of this branch's private review:

```sh
VITE_SITE_ENV=production npm run docs:build
```

Production defaults: `https://powerx-doc.artisan-cloud.com` and
`https://artisan-cloud.com`. Private `*.chatgpt.site` origins are rejected in
production. Coordinate release with the company site so `/products/powerx-base`,
`/products/crm` and `/products/mediax` exist before production crosslinks go live.
Never publish the preview artifact to production. Verify robots, canonical,
Open Graph and company-link targets in the final artifact before uploading.

The production sitemap intentionally lists only the refreshed Chinese entry
pages, not every historical PRD/spec. No hreflang is emitted for non-equivalent
translations. Existing English pages remain accessible; the language picker
returns to the selected language's home. New Chinese hubs are not passed off as
English translations. Localization parity already fails on the base revision;
this bounded refresh does not bulk-generate translations.

Original overview/guides/developer entry copy is retained in
`zh/reference/legacy/`, labeled historical and excluded from search/indexing.
All existing deeper source pages and URL paths remain in place. Local search
indexes zh/en homepage, overview, guides, plugins, operations, developer entry
and reference entry only. Generated scenarios/usecase seeds, collected content,
README aliases with a byte-equivalent sibling index, API/PXIP design references and
historical archives remain browsable but are not
indexed. This keeps beginner searches out of stale duplicated planning material
rather than mixing product guides with planning material.
Search is local;
there are no analytics, trackers or new external fonts.

Build note: Tailwind content globs intentionally scan source only. The previous
`docs/.vitepress/**/*.{js,ts,vue}` glob also scanned generated/minified `dist`
assets during the server bundle and caused a CPU-bound extractor stall. Do not
reintroduce output/cache directories into Tailwind content scanning.
