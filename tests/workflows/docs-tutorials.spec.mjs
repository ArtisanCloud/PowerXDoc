import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import { createMarkdownRenderer } from 'vitepress'
import { pageMetadata, siteProfile, sitemapEntries } from '../../docs/.vitepress/seo.mjs'

const root = fileURLToPath(new URL('../../docs/website/', import.meta.url))
const names = ['local-dev', 'xdocker', 'systemd']
const read = name => fs.readFileSync(path.join(root, 'zh/guides', `${name}.md`), 'utf8')

test('Chinese step labels and clickable Setup URLs render without literal Markdown markers', async () => {
  const md = await createMarkdownRenderer(root, { html: true, linkify: true })
  for (const name of names) {
    const html = md.render(read(name)).replace(/<pre\b[^>]*>[\s\S]*?<\/pre>/g, '')
    assert.ok(!html.includes('**'), `${name}: no unrendered emphasis or malformed autolinks`)
    const port = { 'local-dev': 3030, xdocker: 18080, systemd: 3000 }[name]
    assert.ok(html.includes(`href="http://127.0.0.1:${port}/setup"`), `${name}: exact Setup URL`)
  }
})

test('first-install tutorials are self-contained, sequential and reachable from the hub and sidebar', () => {
  const hub = read('index')
  const config = fs.readFileSync(new URL('../../docs/.vitepress/config.mts', import.meta.url), 'utf8')
  for (const name of names) {
    const source = read(name)
    assert.match(hub, new RegExp(`/zh/guides/${name}`))
    assert.match(config, new RegExp(`link: '/zh/guides/${name}'`))
    assert.match(source, /起点：/)
    assert.match(source, /终点：/)
    const steps = [...source.matchAll(/^## (\d+)\./gm)].map(match => Number(match[1]))
    assert.ok(steps.length >= 7, `${name}: explicit steps through login`)
    assert.deepEqual(steps, Array.from({ length: steps.length }, (_, i) => i + 1))
    assert.match(source, /\/setup/)
    assert.match(source, /\/api\/v1\/health/)
    assert.match(source, /install_status/)
    assert.match(source, /管理员.*登录|登录.*管理员/)
    // Source code links belong at the end; readers must not leave for the next step.
    for (const link of source.matchAll(/\]\((https:\/\/github\.com\/[^)]+)\)/g)) {
      assert.ok(link.index > source.indexOf('<summary>版本与源码依据'), `${name}: GitHub is reference only`)
    }
  }
  for (const anchor of ['quickstart', 'local', 'xdocker', 'systemd', 'checklist', 'deployment', 'configuration', 'ops-faq']) {
    assert.ok(hub.includes(`{#${anchor}}`), `preserve existing #${anchor} links`)
  }
})

test('tutorial internal links resolve within the documentation source tree', () => {
  for (const name of [...names, 'index', 'maintenance']) {
    for (const [, href] of read(name).matchAll(/\]\((\/[^)]+)\)/g)) {
      const route = href.split(/[?#]/)[0].replace(/^\//, '')
      const candidates = route.endsWith('/')
        ? [route + 'index.md', route + 'README.md']
        : [route.replace(/\.html$/, '') + '.md', route + '/index.md']
      assert.ok(candidates.some(candidate => fs.existsSync(path.join(root, candidate))), `${name}: ${href}`)
    }
  }
})

test('copyable tutorial shell blocks parse as Bash without executing commands', () => {
  for (const name of names) {
    for (const [index, match] of [...read(name).matchAll(/```bash\n([\s\S]*?)\n```/g)].entries()) {
      const result = spawnSync('/bin/bash', ['-n'], { input: match[1], encoding: 'utf8' })
      assert.equal(result.status, 0, `${name} block ${index + 1}: ${result.stderr}`)
      assert.doesNotMatch(match[1], /(?:make\s+(?:seed|db-refresh)|apps\.sh\s+migrate|switch-release-systemd\.sh)/,
        `${name}: do not mix upgrade/reset commands into a first install`)
      assert.doesNotMatch(match[1], /<your[^>]*>|<已验证SHA>/i, `${name}: no shell redirection placeholders`)
    }
  }
})

test('new guides get production canonicals and sitemap coverage, previews remain noindex', () => {
  const routes = [...names, 'maintenance'].map(name => `zh/guides/${name}.html`)
  const entries = routes.map(url => ({ url, links: [{ lang: 'en', url: 'en/' + url }] }))
  assert.deepEqual(sitemapEntries([...entries, { url: 'zh/reference/legacy/guides.html' }, { url: 'en/zh/guides/local-dev.html' }]), routes.map(url => ({ url })))
  const production = siteProfile({})
  const preview = siteProfile({ VITE_SITE_ENV: 'preview', VITE_SITE_ORIGIN: 'https://docs-preview.example.invalid', VITE_MAIN_SITE_ORIGIN: 'https://main-preview.example.invalid' })
  for (const route of routes) {
    for (const profile of [production, preview]) {
      const head = pageMetadata({ relativePath: route.replace(/\.html$/, '.md'), title: '安装教程' }, profile)
      assert.equal(head.find(([tag]) => tag === 'link')[1].href, `${profile.origin}/${route}`)
      assert.equal(head.find(([, attrs]) => attrs.name === 'robots')[1].content, profile.production ? 'index, follow' : 'noindex, nofollow')
      assert.equal(JSON.parse(head.find(([tag]) => tag === 'script')[2])['@type'], 'TechArticle')
    }
  }
})
