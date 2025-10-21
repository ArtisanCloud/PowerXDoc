#!/usr/bin/env node
import { promises as fs } from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

const REPO_ROOT = path.resolve(new URL('.', import.meta.url).pathname, '../../')
const WEBSITE_ROOT = path.join(REPO_ROOT, 'docs/website')
const SOURCE_ROOT = path.join(REPO_ROOT, 'docs')

function usage() {
  console.log('Usage: node scripts/publish/apply-suggestions.mjs --session <file> [--dry-run]')
  process.exit(1)
}

function parseArgs() {
  const args = process.argv.slice(2)
  const result = { dryRun: false }
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i]
    if (arg === '--session') {
      result.session = args[++i]
    } else if (arg === '--dry-run') {
      result.dryRun = true
    } else if (arg === '--help') {
      usage()
    }
  }
  if (!result.session) usage()
  result.session = path.resolve(result.session)
  return result
}

async function loadSession(filePath) {
  const raw = await fs.readFile(filePath, 'utf8')
  const parsed = JSON.parse(raw)
  if (!parsed || !Array.isArray(parsed.suggestions)) throw new Error('Invalid session file')
  return parsed
}

async function ensureDir(targetPath) {
  await fs.mkdir(path.dirname(targetPath), { recursive: true })
}

async function copySuggestion(suggestion, { dryRun }) {
  const sourcePath = path.resolve(REPO_ROOT, suggestion.sourcePath)
  const targetPath = path.resolve(REPO_ROOT, suggestion.targetPath)
  if (!targetPath.startsWith(WEBSITE_ROOT)) {
    throw new Error(`Refusing to write outside docs/website: ${targetPath}`)
  }

  await ensureDir(targetPath)
  if (dryRun) {
    console.log(`[DRY RUN] Would copy ${sourcePath} → ${targetPath}`)
    return
  }
  await fs.copyFile(sourcePath, targetPath)

  // Record checksum for auditing
  const buffer = await fs.readFile(targetPath)
  const checksum = crypto.createHash('sha256').update(buffer).digest('hex')
  return { sourcePath, targetPath, checksum }
}

async function appendAudit(logEntries) {
  const message = logEntries
    .map((entry) => `publish:${entry.targetPath}:${entry.checksum}`)
    .join('\n')

  console.log('AUDIT LOG START\n' + message + '\nAUDIT LOG END')
}

async function main() {
  const { session, dryRun } = parseArgs()
  const data = await loadSession(session)
  const applied = []

  for (const suggestion of data.suggestions) {
    if (!['confirm', 'manual'].includes(suggestion.status)) {
      continue
    }
    const result = await copySuggestion(suggestion, { dryRun })
    if (result) {
      applied.push({ ...result, decisionNote: suggestion.note ?? '' })
    }
  }

  if (applied.length === 0) {
    console.log('No suggestions applied; nothing to do.')
    return
  }

  await appendAudit(applied)
  console.log(`Applied ${applied.length} suggestions.`)
}

main().catch((error) => {
  console.error('Apply suggestions failed:', error)
  process.exitCode = 1
})
