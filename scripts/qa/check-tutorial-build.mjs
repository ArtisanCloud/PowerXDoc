import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { pageMetadata, siteProfile, robotsText } from '../../docs/.vitepress/seo.mjs'

// Check the built site, including its real local-search index. Never runs install commands.
const root = path.resolve(process.argv[2] || fileURLToPath(new URL('../../docs/.vitepress/dist/', import.meta.url)))
const profile = siteProfile()
const names = ['local-dev', 'xdocker', 'systemd', 'maintenance']
const files = fs.readdirSync(root, { recursive: true }).filter(name => fs.statSync(path.join(root, name)).isFile())
const searchFile = files.find(name => /@localSearchIndexroot\.[^/]+\.js$/.test(name))
assert.ok(searchFile, 'Chinese local-search index is built')
const search = fs.readFileSync(path.join(root, searchFile), 'utf8')
const reports = []
for (const name of names) {
  const route = `/zh/guides/${name}.html`
  const html = fs.readFileSync(path.join(root, route), 'utf8')
  const expected = pageMetadata({ relativePath: route.slice(1).replace(/\.html$/, '.md') }, profile)
  const canonical = expected.find(([tag]) => tag === 'link')[1].href
  assert.ok(html.includes(`rel="canonical" href="${canonical}"`), `${route}: canonical`)
  const robots = profile.production ? 'index, follow' : 'noindex, nofollow'
  assert.ok(html.includes(`name="robots" content="${robots}"`), `${route}: robots`)
  assert.ok(html.includes('"@type":"TechArticle"'), `${route}: structured data`)
  assert.ok(search.includes(route), `${route}: present in Chinese search`)
  assert.ok(html.includes('data-vp-bootstrap'), `${route}: shared bootstrap preserved`)
  assert.ok(!html.includes('window.__VP_SITE_DATA__='), `${route}: no duplicated site-data payload`)
  if (name !== 'maintenance') assert.ok(html.includes('class="copy"'), `${route}: copy controls`)
  reports.push({ route, canonical, robots, search: true })
}
assert.equal(fs.readFileSync(path.join(root, 'robots.txt'), 'utf8'), robotsText(profile))
const sitemapFile = path.join(root, 'sitemap.xml')
if (profile.production) {
  const sitemap = fs.readFileSync(sitemapFile, 'utf8')
  for (const name of names) assert.ok(sitemap.includes(`${profile.origin}/zh/guides/${name}.html`))
  for (const file of files.filter(name => /\.(?:html|js|xml|txt|css|json)$/.test(name))) {
    assert.ok(!fs.readFileSync(path.join(root, file), 'utf8').includes('.chatgpt.site'), `no private origin: ${file}`)
  }
} else {
  assert.ok(!fs.existsSync(sitemapFile), 'preview does not publish a sitemap')
}
console.log(JSON.stringify({ profile: profile.production ? 'production' : 'preview', htmlPages: files.filter(name => name.endsWith('.html')).length, tutorials: reports }, null, 2))
