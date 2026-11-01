import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { spawnSync } from 'node:child_process'
import ts from 'typescript'

const source = fs.readFileSync(new URL('../../docs/.vitepress/theme/utils/powerxReleases.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText
const { selectLatestContainerRelease, fetchLatestPowerXRelease, POWERX_RELEASES_API } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`)
const fixture = JSON.parse(fs.readFileSync(new URL('../fixtures/releases/public-release-list.json', import.meta.url), 'utf8'))
const base = fixture[0]
const release = changes => ({ ...structuredClone(base), ...changes })
const json = (body, headers = {}) => new Response(JSON.stringify(body), { headers })

test('public API fixture selects the latest published container prerelease rather than the old stable release', () => {
  const selected = selectLatestContainerRelease(fixture)
  assert.equal(selected.tag, 'docker-dev-f99333ccd80e')
  assert.equal(selected.prerelease, true)
  assert.equal(selected.publishedAt, '2026-10-28T01:54:55.000Z')
  assert.equal(selected.cloneCommand, "git clone --depth 1 --branch 'docker-dev-f99333ccd80e' https://github.com/ArtisanCloud/PowerX.git ~/powerx-local")
})

test('a future semantic stable container release is selected without changing the implementation', () => {
  const selected = selectLatestContainerRelease([release({ tag_name: 'v2.0.0', prerelease: false, published_at: '2027-01-01T00:00:00Z' }), ...fixture])
  assert.equal(selected.tag, 'v2.0.0')
  assert.equal(selected.prerelease, false)
  assert.equal(selected.url, 'https://github.com/ArtisanCloud/PowerX/releases/tag/v2.0.0')
  assert.ok(selected.cloneCommand.includes("--branch 'v2.0.0'"))
})

test('selection follows publication time, not API order, creation time or version spelling', () => {
  const older = release({ id: 1, tag_name: 'v99.0.0', published_at: '2026-10-01T00:00:00Z', created_at: '2026-10-30T00:00:00Z' })
  const newer = release({ id: 2, tag_name: 'v2.0.0', published_at: '2026-10-29T00:00:00Z', created_at: '2026-01-01T00:00:00Z' })
  const records = [older, newer]
  assert.equal(selectLatestContainerRelease(records).tag, 'v2.0.0')
  assert.deepEqual(records, [older, newer], 'does not mutate source records')
})

test('drafts, SDK releases and unfinished or empty container assets do not qualify', () => {
  const future = { published_at: '2027-01-01T00:00:00Z' }
  const incomplete = release(future)
  incomplete.assets.find(asset => asset.name === 'powerx-docker.tar.gz').state = 'starter'
  const empty = release(future)
  empty.assets.find(asset => asset.name === 'powerx-docker.tar.gz').size = 0
  const missingChecksum = release(future)
  missingChecksum.assets = missingChecksum.assets.filter(asset => asset.name !== 'powerx-docker.tar.gz.sha256')
  assert.equal(selectLatestContainerRelease([
    release({ ...future, draft: true }), release({ ...future, tag_name: 'sdk/v99', assets: [] }),
    incomplete, empty, missingChecksum, base,
  ]).tag, base.tag_name)
})

test('release tags are preserved and safely quoted as a single shell argument', () => {
  const selected = selectLatestContainerRelease([release({ tag_name: "v2.0.0'$(id)" })])
  assert.ok(selected.cloneCommand.includes("--branch 'v2.0.0'\\''$(id)'"))
  assert.equal(spawnSync('/bin/bash', ['-n'], { input: selected.cloneCommand }).status, 0)
  for (const tag of ['--upload-pack=bad', 'bad tag', 'bad\ntag', 'bad..tag', '../bad', 'bad.lock']) {
    assert.throws(() => selectLatestContainerRelease([release({ tag_name: tag })]), { code: 'response' })
  }
})

test('all pages are read before selecting, including a newer publication on a later page', async () => {
  const calls = []
  const newer = release({ tag_name: 'v2.0.0', published_at: '2027-01-01T00:00:00Z' })
  const selected = await fetchLatestPowerXRelease({ fetchImpl: async (url, options) => {
    calls.push(url)
    assert.equal(options.credentials, 'omit')
    assert.equal(options.cache, 'no-store')
    assert.equal(Object.keys(options.headers).some(key => key.toLowerCase() === 'authorization'), false)
    return json(calls.length === 1 ? Array(100).fill(base) : [newer])
  } })
  assert.deepEqual(calls, [`${POWERX_RELEASES_API}?per_page=100&page=1`, `${POWERX_RELEASES_API}?per_page=100&page=2`])
  assert.equal(selected.tag, 'v2.0.0')
})

test('Link pagination is honored and a confirmed full final page needs no extra request', async () => {
  let calls = 0
  await fetchLatestPowerXRelease({ fetchImpl: async () => {
    calls++
    return calls === 1 ? json([base], { link: '<https://api.github.com/repos/ArtisanCloud/PowerX/releases?page=2>; rel="next"' })
      : json(Array(100).fill(base), { link: '<https://api.github.com/repos/ArtisanCloud/PowerX/releases?page=1>; rel="prev"' })
  } })
  assert.equal(calls, 2)
})

test('a page budget or later-page failure never returns a partial-history "latest" version', async () => {
  await assert.rejects(fetchLatestPowerXRelease({ maxPages: 2, fetchImpl: async () => json(Array(100).fill(base)) }), { code: 'pagination' })
  let calls = 0
  await assert.rejects(fetchLatestPowerXRelease({ fetchImpl: async () => {
    if (++calls === 1) return json(Array(100).fill(base))
    throw new TypeError('offline')
  } }), /offline/)
})

test('HTTP errors, API rate limits, invalid JSON and malformed records fail explicitly', async () => {
  for (const status of [403, 404, 500]) {
    await assert.rejects(fetchLatestPowerXRelease({ fetchImpl: async () => new Response('', { status }) }), { code: 'http' })
  }
  for (const [status, headers] of [[429, {}], [403, { 'x-ratelimit-remaining': '0' }]]) {
    await assert.rejects(fetchLatestPowerXRelease({ fetchImpl: async () => new Response('', { status, headers }) }), { code: 'rate-limit' })
  }
  await assert.rejects(fetchLatestPowerXRelease({ fetchImpl: async () => new Response(JSON.stringify({ message: 'You have exceeded a secondary rate limit.' }), { status: 403 }) }), { code: 'rate-limit' })
  for (const response of [() => new Response('not JSON'), () => json({ message: 'unexpected' })]) {
    await assert.rejects(fetchLatestPowerXRelease({ fetchImpl: async () => response() }), { code: 'response' })
  }
  assert.throws(() => selectLatestContainerRelease([release({ published_at: 'invalid' }), base]), { code: 'response' })
  assert.throws(() => selectLatestContainerRelease([]), { code: 'empty' })
})

test('aborted loads do not resolve a selected release, even if a response arrived', async () => {
  const controller = new AbortController()
  controller.abort()
  await assert.rejects(fetchLatestPowerXRelease({ signal: controller.signal, fetchImpl: () => { throw new Error('must not fetch') } }), { name: 'AbortError' })
  const during = new AbortController()
  await assert.rejects(fetchLatestPowerXRelease({ signal: during.signal, fetchImpl: async () => {
    during.abort()
    return json([base])
  } }), { name: 'AbortError' })
})
