#!/usr/bin/env node
import { promises as fs } from 'node:fs'
import crypto from 'node:crypto'
import { createInterface } from 'node:readline/promises'
import path from 'node:path'
import process from 'node:process'

const OUTPUT_DEFAULT = path.join('docs/website/_mount/publish-suggestions.json')

function usage() {
  console.log('Usage: node scripts/publish/review-suggestions.mjs [--file <suggestions.json>]')
  process.exit(1)
}

function parseArgs() {
  const args = process.argv.slice(2)
  const result = { file: OUTPUT_DEFAULT }
  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === '--file') {
      result.file = args[++i]
    } else if (args[i] === '--help') {
      usage()
    }
  }
  result.file = path.resolve(result.file)
  return result
}

async function loadSuggestions(filePath) {
  const raw = await fs.readFile(filePath, 'utf8')
  const parsed = JSON.parse(raw)
  if (!parsed || !Array.isArray(parsed.suggestions)) throw new Error('Invalid suggestions file')
  return parsed
}

function isHighRisk(suggestion) {
  return suggestion.riskLevel === 'high' || suggestion.confidence < 0.6
}

async function reviewSuggestion(rl, suggestion) {
  console.log('\n---\n')
  console.log(`Source:    ${suggestion.sourcePath}`)
  console.log(`Target:    ${suggestion.targetPath}`)
  console.log(`Locale:    ${suggestion.locale}`)
  console.log(`Confidence:${suggestion.confidence}`)
  console.log(`Risk:      ${suggestion.riskLevel}`)
  if (suggestion.diffPreview) {
    console.log('Diff preview:')
    console.log(suggestion.diffPreview)
  }

  const defaultDecision = isHighRisk(suggestion) ? 'manual' : 'confirm'
  const decision = await rl.question(`Decision [confirm/dismiss/manual] (default: ${defaultDecision}): `) || defaultDecision

  let note = ''
  let overrides = {}
  if (decision === 'manual') {
    const newTarget = await rl.question('Manual target (relative to docs/website, blank to keep current): ')
    const manualNote = await rl.question('Manual note (optional): ')
    if (newTarget) {
      overrides.targetPath = path.join('docs/website', newTarget)
    }
    note = manualNote
  } else {
    note = await rl.question('Note (optional): ')
  }

  return {
    ...suggestion,
    ...overrides,
    status: decision,
    note,
    decidedAt: new Date().toISOString(),
  }
}

async function writeSession(filePath, session) {
  await fs.writeFile(filePath, JSON.stringify(session, null, 2))
}

async function main() {
  const { file } = parseArgs()
  const data = await loadSuggestions(file)
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  const reviewed = []
  try {
    for (const suggestion of data.suggestions) {
      const result = await reviewSuggestion(rl, suggestion)
      reviewed.push(result)
    }
  } finally {
    rl.close()
  }

  const session = {
    sessionId: crypto.randomUUID(),
    createdAt: data.generatedAt ?? new Date().toISOString(),
    createdBy: process.env.USER ?? 'unknown',
    aiVersion: data.aiVersion ?? 'ai-whitelist-mvp',
    suggestions: reviewed,
  }
  await writeSession(file, session)
  console.log(`Session saved → ${file}`)
}

main().catch((error) => {
  console.error('Suggestion review failed:', error)
  process.exitCode = 1
})
