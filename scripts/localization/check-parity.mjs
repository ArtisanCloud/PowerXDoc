import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DOCS_ROOT = path.resolve(__dirname, '../../docs/website')
const EN_ROOT = path.join(DOCS_ROOT, 'en')

const EXCLUDE_DIRS = ['.vitepress', 'localization', 'assets', '_mount', 'public']

function isLocalizableMarkdown(file) {
  const segments = file.split(path.sep)
  if (segments.some((segment) => EXCLUDE_DIRS.includes(segment))) {
    return false
  }
  return file.endsWith('.md')
}

async function collectMarkdownFiles(root, ignoreEn = false) {
  const files = []

  async function walk(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        if (ignoreEn && entry.name === 'en') continue
        await walk(fullPath)
      } else if (
        entry.isFile() &&
        isLocalizableMarkdown(path.relative(root, fullPath))
      ) {
        files.push(fullPath)
      }
    }
  }

  await walk(root)
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
  const lines = frontmatter.split('\n')
  for (const rawLine of lines) {
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

function normalizeSlug(relative) {
  return `/${relative.replace(/index\.md$/, '').replace(/\\/g, '/')}`
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

async function main() {
  const zhFiles = await collectMarkdownFiles(DOCS_ROOT, true)
  const enFiles = await collectMarkdownFiles(EN_ROOT)

  const zhSet = new Set(zhFiles.map((file) => path.relative(DOCS_ROOT, file)))
  const enSet = new Set(enFiles.map((file) => path.relative(EN_ROOT, file)))

  const missing = []
  const statusBuckets = {
    Placeholder: [],
    InReview: [],
    Approved: [],
  }
  const missingStatus = []
  const unknownStatus = []
  const missingPartnerSlug = []
  const mismatchedPartnerSlug = []

  for (const relative of zhSet) {
    const enPath = path.join(EN_ROOT, relative)
    try {
      const content = await fs.readFile(enPath, 'utf8')
      const data = parseFrontmatter(content)
      const { status, raw } = normalizeStatus(data.reviewStatus)
      if (status) {
        statusBuckets[status].push(relative)
      } else if (raw === undefined) {
        missingStatus.push(relative)
      } else {
        unknownStatus.push({ file: relative, value: raw })
      }

      const expectedPartner = normalizeSlug(relative)
      if (!data.partnerSlug) {
        missingPartnerSlug.push(relative)
      } else if (data.partnerSlug !== expectedPartner) {
        mismatchedPartnerSlug.push({
          file: relative,
          expected: expectedPartner,
          actual: data.partnerSlug,
        })
      }
    } catch (error) {
      if (error && error.code === 'ENOENT') {
        missing.push(relative)
        continue
      }
      throw error
    }
  }

  const extraEnglish = Array.from(enSet).filter((relative) => !zhSet.has(relative))

  console.log(`Scanned zh-CN pages: ${zhSet.size}`)
  console.log(`Scanned en-US pages: ${enSet.size}`)
  console.log('')

  if (missing.length > 0) {
    console.error('Missing en-US counterparts:')
    for (const file of missing) {
      console.error(` - ${normalizeSlug(file)}`)
    }
    console.error('')
  }

  console.log('Review status distribution:')
  for (const [status, files] of Object.entries(statusBuckets)) {
    console.log(` - ${status}: ${files.length}`)
  }
  if (missingStatus.length > 0) {
    console.log(` - Missing reviewStatus: ${missingStatus.length}`)
  }
  if (unknownStatus.length > 0) {
    console.log(` - Unknown reviewStatus: ${unknownStatus.length}`)
  }
  console.log('')

  if (missingPartnerSlug.length > 0 || mismatchedPartnerSlug.length > 0) {
    console.log('Partner slug issues:')
    for (const file of missingPartnerSlug) {
      console.log(` - ${file}: partnerSlug missing`)
    }
    for (const issue of mismatchedPartnerSlug) {
      console.log(
        ` - ${issue.file}: expected partnerSlug ${issue.expected} but found ${issue.actual}`,
      )
    }
    console.log('')
  }

  if (extraEnglish.length > 0) {
    console.log('Orphan en-US pages (no zh-CN source):')
    for (const file of extraEnglish) {
      console.log(` - ${file}`)
    }
    console.log('')
  }

  if (unknownStatus.length > 0) {
    console.log('Unknown reviewStatus values:')
    for (const issue of unknownStatus) {
      console.log(` - ${issue.file}: ${issue.value}`)
    }
    console.log('')
  }

  const hasErrors = missing.length > 0
  if (hasErrors) {
    process.exitCode = 1
  }
}

await main()
