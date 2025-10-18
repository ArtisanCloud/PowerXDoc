# Quickstart: Localizing PowerX Documentation (Maintainer Role)

1. **Prepare workspace**
   - `pnpm install` to ensure VitePress, Tailwind, and tooling are available.
   - Run `pnpm docs:dev` once to confirm baseline site integrity before changes.

2. **Mirror Chinese structure to English**
   - Execute the localization sync script to create/update `/docs/en/**` placeholders.
   - Commit generated files, verifying paths mirror the Chinese originals.

3. **Translate and review content**
   - Use machine translation for initial drafts, then assign human reviewers.
   - Update frontmatter metadata (`reviewStatus`) to `InReview` → `Approved` once QA passes.

4. **Add review banner**
   - Implement the shared banner component under `.vitepress/theme/components/ReviewBanner.vue`.
   - Import the component into the default layout so only `Placeholder` pages render the banner with a link to the Chinese original.

5. **Configure locales**
   - Extend `docs/.vitepress/config.mts` with `locales` block for `root` and `en`.
   - Localize navigation, sidebar, footer, and edit-link text; ensure `/en/` prefixes exist.

6. **Validate parity and performance**
   - Run the parity crawler to confirm `zh-CN` and `en-US` trees align and banners appear only where required.
   - Measure language switch latency in local dev (goal: <2s) and adjust asset preloading if necessary.

7. **Document and ship**
   - Update the maintainer guide within `powerx_source_docs` to include the localization workflow and review checklist.
   - Capture screenshots or mermaid workflow diagram updates before requesting review.
