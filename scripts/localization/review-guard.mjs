import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DOCS_ROOT = path.resolve(__dirname, '../../docs/website')
const EN_ROOT = path.join(DOCS_ROOT, 'en')
const EXCLUDE_DIRS = ['.vitepress', 'localization', 'assets', '_mount', 'public']

function isMarkdown(file) {
  return file.endsWith('.md')
}

function isLocalizable(relative) {
  const segments = relative.split(path.sep)
  if (segments.some((segment) => EXCLUDE_DIRS.includes(segment))) {
    return false
  }
  return isMarkdown(relative)
}

async function collectEnglishFiles() {
  const files = []

  async function walk(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        await walk(fullPath)
      } else if (entry.isFile()) {
        const relative = path.relative(EN_ROOT, fullPath)
        if (isLocalizable(relative)) {
          files.push(relative)
        }
      }
    }
  }

  await walk(EN_ROOT)
  return files
}

function extractFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?/)
  if (!match) return ''
  return match[1]
}

function parseFrontmatter(content) {
  const frontmatter = extractFrontmatter(content)
  if (!frontmatter) return {}
  const data = {}
  for (const rawLine of frontmatter.split('\n')) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const colonIndex = line.indexOf(':')
    if (colonIndex === -1) continue
    const key = line.slice(0, colonIndex).trim()
    let value = line.slice(colonIndex + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    data[key] = value
  }
  return data
}

function normalizeStatus(value) {
  if (!value) return { status: null, raw: value }
  const normalized = value.trim().toLowerCase()
  if (normalized === 'placeholder') return { status: 'Placeholder', raw: value }
  if (normalized === 'inreview' || normalized === 'in_review') {
    return { status: 'InReview', raw: value }
  }
  if (normalized === 'approved') return { status: 'Approved', raw: value }
  return { status: null, raw: value }
}

function expectedPartnerSlug(relative) {
  return `/${relative.replace(/index\.md$/, '').replace(/\\/g, '/')}`
}

async function ensureChineseSource(relative) {
  const zhPath = path.join(DOCS_ROOT, relative)
  try {
    await fs.access(zhPath)
    return true
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      return false
    }
    throw error
  }
}

async function main() {
  const englishFiles = await collectEnglishFiles()
  const failures = []

  for (const relative of englishFiles) {
    const filePath = path.join(EN_ROOT, relative)
    const content = await fs.readFile(filePath, 'utf8')
    const data = parseFrontmatter(content)
    const { status, raw } = normalizeStatus(data.reviewStatus)

    if (!status) {
      failures.push(
        `${relative}: reviewStatus missing or unrecognized (${raw ?? 'undefined'})`,
      )
    } else if (status !== 'Approved') {
      failures.push(`${relative}: reviewStatus=${status}`)
    }

    if (!data.partnerSlug) {
      failures.push(`${relative}: partnerSlug missing`)
    } else {
      const expected = expectedPartnerSlug(relative)
      if (data.partnerSlug !== expected) {
        failures.push(
          `${relative}: partnerSlug mismatch (expected ${expected}, found ${data.partnerSlug})`,
        )
      }
    }

    const hasSource = await ensureChineseSource(relative)
    if (!hasSource) {
      failures.push(`${relative}: missing zh-CN source counterpart`)
    }
  }

  if (failures.length > 0) {
    console.error('Review guard failed. Resolve the following issues before publishing:')
    for (const failure of failures) {
      console.error(` - ${failure}`)
    }
    process.exit(1)
  }

  console.log(
    `Review guard passed. ${englishFiles.length} en-US pages confirmed with reviewStatus=Approved.`,
  )
}

await main()
