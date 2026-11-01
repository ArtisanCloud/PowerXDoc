import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { spawnSync } from 'node:child_process'

test('release resolver and inspectable download stay identical', () => {
  assert.equal(fs.readFileSync('scripts/tutorials/resolve-release.py', 'utf8'), fs.readFileSync('docs/website/public/downloads/resolve-powerx-release.py', 'utf8'))
  const snippet = fs.readFileSync('docs/_snippets/latest-release.md', 'utf8')
  assert.ok(snippet.includes('python3 resolve-powerx-release.py'))
  assert.ok(!snippet.includes('import json'))
})

test('latest Release resolver validates pairing, checksums and fails closed', () => {
  const result = spawnSync('python3', ['tests/workflows/test_release_resolver.py'], { encoding: 'utf8' })
  assert.equal(result.status, 0, result.stdout + result.stderr)
})
