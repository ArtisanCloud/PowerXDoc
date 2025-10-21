#!/usr/bin/env node
import { promises as fs } from 'node:fs'
import path from 'node:path'

const REPO_ROOT = path.resolve(new URL('.', import.meta.url).pathname, '../../')
const WEBSITE_ROOT = path.join(REPO_ROOT, 'docs/website')
const SOURCE_ROOT = path.join(REPO_ROOT, 'docs')
const APPROVED_STATUS = new Set(['Approved'])
const OUTPUT_DEFAULT = path.join(WEBSITE_ROOT, '_mount/publish-suggestions.json')

function usage() {
  console.log(`Usage: node scripts/publish/generate-suggestions.mjs --input <approved.json> [--output <file>]`)
  process.exit(1)
}

function parseArgs() {
  const args = process.argv.slice(2)
  const result = {}
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i]
    if (arg === '--input') {
      result.input = args[++i]
    } else if (arg === '--output') {
      result.output = args[++i]
    } else if (arg === '--help') {
      usage()
    }
  }
  if (!result.input) usage()
  result.output = result.output ? path.resolve(result.output) : OUTPUT_DEFAULT
  result.input = path.resolve(result.input)
  return result
}

async function loadApprovedList(filePath) {
  const raw = await fs.readFile(filePath, 'utf8')
  const parsed = JSON.parse(raw)
  if (!Array.isArray(parsed)) {
    throw new Error('Approved list must be an array of objects with { path, reviewStatus }')
  }
  return parsed
}

function buildTargetPath(sourcePath) {
  const relative = sourcePath.replace(/^docs\//, '')
  return path.join(WEBSITE_ROOT, relative)
}

function inferLocale(relativePath) {
  if (relativePath.startsWith('en/')) return 'en-US'
  return 'zh-CN'
}

function createSuggestion(sourcePath) {
  const relative = sourcePath.replace(/^docs\//, '')
  const websiteTarget = buildTargetPath(sourcePath)
  const targetRelative = websiteTarget.replace(`${WEBSITE_ROOT}/`, '')
  const confidence = relative.startsWith('en/') ? 0.7 : 0.9
  const riskLevel = confidence < 0.8 ? 'elevated' : 'normal'
  return {
    suggestionId: crypto.randomUUID(),
    sourcePath,
    targetPath: path.join('docs/website', targetRelative),
    locale: inferLocale(relative),
    confidence,
    riskLevel,
    status: riskLevel === 'high' ? 'manual' : 'suggested',
  }
}

async function main() {
  const { input, output } = parseArgs()
  const approvedList = await loadApprovedList(input)
  const suggestions = approvedList
    .filter((item) => APPROVED_STATUS.has(item.reviewStatus))
    .map((item) => createSuggestion(item.path))

  await fs.mkdir(path.dirname(output), { recursive: true })
  await fs.writeFile(output, JSON.stringify({ generatedAt: new Date().toISOString(), suggestions }, null, 2))
  console.log(`Generated ${suggestions.length} suggestions → ${output}`)
}

main().catch((error) => {
  console.error('Failed to generate publish suggestions:', error)
  process.exitCode = 1
})
