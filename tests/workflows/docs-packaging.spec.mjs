import test from 'node:test'
import assert from 'node:assert/strict'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { createHash } from 'node:crypto'
import { externalizeHtmlBootstrap, externalizeVitepressBootstrap } from '../../scripts/build/externalize-vitepress-bootstrap.mjs'

const body = 'window.__VP_HASH_MAP__=JSON.parse("{}");window.__VP_SITE_DATA__=JSON.parse("{}");'
const tag = `<script>${body}</script>`
const html = '<html><head><script type="module" src="/assets/app.js"></script><script id="check-dark-mode">dark()</script><script type="application/ld+json">{"name":"PowerX"}</script></head><body><h1>Existing content</h1>' + tag + '</body></html>'

test('externalization changes only the bootstrap tag and preserves synchronous execution', () => {
  const result = externalizeHtmlBootstrap(html)
  const filename = `vp-bootstrap-${createHash('sha256').update(body).digest('hex')}.js`
  const replacement = `<script src="/assets/${filename}" data-vp-bootstrap></script>`
  assert.equal(result.html, html.replace(tag, replacement))
  assert.equal(result.assets.get(filename), body)
  assert.equal(result.replacements, 1)
  assert.doesNotMatch(replacement, /\b(async|defer|type)=/)
  assert.equal(externalizeHtmlBootstrap(result.html).html, result.html)
  assert.ok(externalizeHtmlBootstrap(html, '/docs/assets/').html.includes('src="/docs/assets/'))
})

test('unrecognized bootstrap formats fail explicitly rather than silently breaking hydration', () => {
  assert.throws(() => externalizeHtmlBootstrap('<script>window.__VP_HASH_MAP__={}</script>'))
  assert.throws(() => externalizeHtmlBootstrap('<script type="text/javascript">' + body + '</script>'))
  assert.throws(() => externalizeHtmlBootstrap(tag + tag))
})

test('full output retains every HTML file and shares one exact asset across routes', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'powerx-bootstrap-'))
  try {
    await fs.mkdir(path.join(root, 'zh/guides'), { recursive: true })
    await fs.writeFile(path.join(root, 'index.html'), html)
    await fs.writeFile(path.join(root, 'zh/guides/index.html'), html)
    const result = await externalizeVitepressBootstrap(root)
    assert.equal(result.htmlFiles, 2)
    assert.equal(result.rewritten, 2)
    assert.equal(result.sharedAssets, 1)
    const assets = await fs.readdir(path.join(root, 'assets'))
    assert.equal(assets.length, 1)
    assert.equal(await fs.readFile(path.join(root, 'assets', assets[0]), 'utf8'), body)
    assert.match(await fs.readFile(path.join(root, 'zh/guides/index.html'), 'utf8'), /Existing content/)
    assert.equal((await externalizeVitepressBootstrap(root)).rewritten, 0)
  } finally {
    await fs.rm(root, { recursive: true, force: true })
  }
})
