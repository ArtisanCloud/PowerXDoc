import test from 'node:test'
import assert from 'node:assert/strict'
import { siteProfile, pageMetadata, robotsText, sitemapEntries, hasEquivalentIndex } from '../../docs/.vitepress/seo.mjs'

test('private preview metadata is noindex and uses preview URLs', () => {
  const profile = siteProfile({ VITE_SITE_ENV: 'preview', VITE_SITE_ORIGIN: 'https://docs-preview.example.invalid', VITE_MAIN_SITE_ORIGIN: 'https://company-preview.example.invalid' })
  const head = pageMetadata({ relativePath: 'zh/guides/index.md', title: '开始使用', description: '选择部署方式' }, profile)
  assert.ok(head.some(([tag, attrs]) => tag === 'meta' && attrs.name === 'robots' && attrs.content === 'noindex, nofollow'))
  assert.equal(head.find(([tag, attrs]) => tag === 'link' && attrs.rel === 'canonical')[1].href, `${profile.origin}/zh/guides/`)
  assert.equal(robotsText(profile), 'User-agent: *\nDisallow: /\n')
  assert.equal(JSON.parse(head.find(([tag]) => tag === 'script')[2]).headline, '开始使用 | PowerX')
})

test('production defaults remain indexable and exclude private hosts', () => {
  const profile = siteProfile({})
  assert.equal(profile.origin, 'https://powerx-doc.artisan-cloud.com')
  assert.equal(profile.companyOrigin, 'https://artisan-cloud.com')
  const head = pageMetadata({ relativePath: 'zh/plugins/index.md', title: '插件与方案' }, profile)
  assert.ok(head.some(([, attrs]) => attrs.name === 'robots' && attrs.content === 'index, follow'))
  assert.ok(!JSON.stringify(head).includes('.chatgpt.site'))
  assert.match(robotsText(profile), /Sitemap: https:\/\/powerx-doc.artisan-cloud.com\/sitemap.xml/)
  assert.throws(() => siteProfile({ VITE_SITE_ENV: 'production', VITE_MAIN_SITE_ORIGIN: 'https://private.chatgpt.site' }))
  const archive = pageMetadata({ relativePath: 'zh/reference/legacy/guides.md', title: '历史入口' }, profile)
  assert.ok(archive.some(([, attrs]) => attrs.name === 'robots' && attrs.content === 'noindex, nofollow'))
})


test('profile rejects malformed modes and non-origin URL overrides', () => {
  assert.throws(() => siteProfile({ VITE_SITE_ENV: 'preveiw' }))
  for (const origin of ['https://example.com/?q=test', 'https://example.com/#fragment', 'https://user:password@example.com/', 'http://example.com/']) {
    assert.throws(() => siteProfile({ VITE_SITE_ENV: 'preview', VITE_SITE_ORIGIN: origin, VITE_MAIN_SITE_ORIGIN: 'https://company-preview.example.invalid' }))
  }
})


test('sitemap includes only canonical entry pages without false language equivalents', () => {
  const entries = sitemapEntries([
    { url: 'zh/guides/', links: [{ lang: 'en-US', url: 'en/zh/guides/' }] },
    { url: 'zh/reference/legacy/guides.html' },
    { url: 'en/zh/guides/' }
  ])
  assert.deepEqual(entries, [{ url: 'zh/guides/' }])
})


test('README aliases canonicalize only when a sibling index is confirmed', () => {
  const profile = siteProfile({})
  const page = { relativePath: 'zh/guides/README.md', title: '开始使用' }
  const canonical = head => head.find(([tag, attrs]) => tag === 'link' && attrs.rel === 'canonical')[1].href
  assert.equal(canonical(pageMetadata(page, profile, { indexAlias: true })), `${profile.origin}/zh/guides/`)
  assert.equal(canonical(pageMetadata(page, profile)), `${profile.origin}/zh/guides/README.html`)
})


test('only byte-equivalent README/index pairs are aliases', async () => {
  const { fileURLToPath } = await import('node:url')
  const root = fileURLToPath(new URL('../../docs/website/', import.meta.url))
  assert.equal(hasEquivalentIndex('zh/guides/README.md', root), true)
  assert.equal(hasEquivalentIndex('en/guides/README.md', root), false)
  assert.equal(hasEquivalentIndex('zh/developers/pxip/README.md', root), false)
})


test('preview requires both explicit origins instead of leaking private defaults', () => {
  assert.throws(() => siteProfile({ VITE_SITE_ENV: 'preview' }))
  assert.throws(() => siteProfile({ VITE_SITE_ENV: 'preview', VITE_SITE_ORIGIN: 'https://docs-preview.example.invalid' }))
})
