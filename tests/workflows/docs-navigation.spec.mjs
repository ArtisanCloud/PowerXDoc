import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'

function loadNavigation() {
  const events = []
  const source = fs.readFileSync(new URL('../../docs/.vitepress/theme/utils/languageSwitch.ts', import.meta.url), 'utf8')
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
  const context = { exports: {}, console: { warn() {}, info() {} }, window: { dispatchEvent() {} }, CustomEvent: class {} }
  context.require = (id) => {
    if (id === 'vitepress') return { inBrowser: true }
    if (id.endsWith('manifest.json')) return { default: { pages: { '/overview/': {}, '/guides/': {} } } }
    return { DEFAULT_LOCALE: 'zh-CN', ensureLocalePreference: () => 'en-US', isSupportedLocale: () => true, rememberLocale: (locale) => events.push(locale), syncDocumentLocale() {} }
  }
  vm.runInNewContext(compiled, context)
  return { api: context.exports, events }
}

test('explicit routes preserve VitePress navigation, fragments and browser history', async () => {
  const { api, events } = loadNavigation()
  const visits = []
  const go = async (...args) => visits.push(args)
  const router = { route: { path: '/zh/guides/' }, go }
  api.installLocaleSwitch(router)
  assert.equal(router.go, go)
  assert.equal(visits.length, 0, 'saved English preference must not override an explicit Chinese URL')
  await router.go('/zh/guides/publish/local-init.html?from=docs#init', true)
  assert.deepEqual(visits[0], ['/zh/guides/publish/local-init.html?from=docs#init', true])
  await router.onAfterRouteChange('/en/guides/')
  assert.equal(events.at(-1), 'en-US')
})

test('locale links preserve supported routes and fall back for untranslated hubs', () => {
  const { api } = loadNavigation()
  assert.equal(api.toLocalePath('/zh/overview/', 'en-US'), '/en/overview/')
  assert.equal(api.toLocalePath('/zh/plugins/', 'en-US'), '/en/')
  assert.equal(api.toLocalePath('/zh/guides/#deployment', 'en-US'), '/en/guides/#deployment')
  assert.equal(api.toLocalePath('/en/overview/', 'zh-CN'), '/zh/overview/')
  assert.equal(api.getBasePath('/zh/guides/publish/local-init.html#init', 'zh-CN'), '/guides/publish/local-init.html#init')
})

test('Tailwind scans source classes, never generated or cached bundles', async () => {
  const { createRequire } = await import('node:module')
  const { tmpdir } = await import('node:os')
  const path = await import('node:path')
  const require = createRequire(import.meta.url)
  const glob = require('fast-glob')
  const config = require('../../tailwind.config.cjs')
  const root = fs.mkdtempSync(path.join(tmpdir(), 'powerx-tailwind-'))
  try {
    for (const name of ['docs/.vitepress/theme/Test.vue', 'docs/website/zh/index.md', 'docs/.vitepress/dist/assets/app.js', 'docs/.vitepress/cache/compiled.js']) {
      const file = path.join(root, name)
      fs.mkdirSync(path.dirname(file), { recursive: true })
      fs.writeFileSync(file, 'test')
    }
    const matched = glob.sync(config.content, { cwd: root, dot: true })
    assert.ok(matched.some(file => file.endsWith('theme/Test.vue')))
    assert.ok(matched.some(file => file.endsWith('zh/index.md')))
    assert.ok(matched.every(file => !file.includes('/dist/') && !file.includes('/cache/')))
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})
