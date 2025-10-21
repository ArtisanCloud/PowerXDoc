#!/usr/bin/env node
import { promises as fs } from 'node:fs'
import path from 'node:path'

const REPO_ROOT = path.resolve(new URL('.', import.meta.url).pathname, '../../')
const DOCS_DIR = path.join(REPO_ROOT, 'docs')
const WEBSITE_DIR = path.join(DOCS_DIR, 'website')
const TARGET_PATTERNS = [
  '/developer-guides/',
  '/core-concepts/README.md',
  '/api-and-specifications/README.md',
]

async function scanFile(filePath) {
  const content = await fs.readFile(filePath, 'utf8')
  const hits = []
  for (const pattern of TARGET_PATTERNS) {
    let index = content.indexOf(pattern)
    while (index !== -1) {
      const line = content.slice(0, index).split('\n').length
      hits.push({ pattern, line })
      index = content.indexOf(pattern, index + pattern.length)
    }
  }
  return hits
}

async function walk(dir, allowWebsite = false) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (!allowWebsite && entry.name === 'website') continue
      if (entry.name === '.vitepress') continue
      await walk(fullPath, allowWebsite || fullPath === WEBSITE_DIR)
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      const hits = await scanFile(fullPath)
      hits.forEach((hit) => {
        console.log(`${path.relative(REPO_ROOT, fullPath)}:${hit.line} contains deprecated reference "${hit.pattern}"`)
      })
    }
  }
}

async function main() {
  await walk(DOCS_DIR)
  console.log('Link scan completed.')
}

main().catch((error) => {
  console.error('Link scan failed:', error)
  process.exitCode = 1
})
