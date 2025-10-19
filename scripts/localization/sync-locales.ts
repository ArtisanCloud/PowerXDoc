#!/usr/bin/env ts-node
import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import type { LocaleManifest } from './types'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DOCS_ROOT = path.resolve(__dirname, '../../docs')
const TARGET_LOCALE = 'en-US'
const TARGET_ROOT = path.join(DOCS_ROOT, 'en')
const MANIFEST_PATH = path.join(DOCS_ROOT, 'localization', 'manifest.json')

async function loadManifest(): Promise<LocaleManifest> {
  const raw = await fs.readFile(MANIFEST_PATH, 'utf8')
  return JSON.parse(raw) as LocaleManifest
}

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true })
}

function isLocalizableMarkdown(file: string) {
  const excludeDirs = ['.vitepress', 'en', 'localization', 'assets']
  const segments = file.split(path.sep)
  if (segments.some((segment) => excludeDirs.includes(segment))) {
    return false
  }
  return file.endsWith('.md')
}

async function collectSourceFiles(): Promise<string[]> {
  const files: string[] = []

  async function walk(dir: string) {
    const entries = await fs.readdir(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        await walk(fullPath)
      } else if (
        entry.isFile() &&
        isLocalizableMarkdown(path.relative(DOCS_ROOT, fullPath))
      ) {
        files.push(fullPath)
      }
    }
  }

  await walk(DOCS_ROOT)
  return files
}

function extractFrontmatter(content: string) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!match) {
    return { frontmatter: '', body: content }
  }
  return { frontmatter: match[1], body: match[2] }
}

function ensureFrontmatterValue(
  block: string,
  key: string,
  value: string,
  { overwrite = true }: { overwrite?: boolean } = {},
) {
  const pattern = new RegExp(`^${key}:`, 'm')
  if (pattern.test(block)) {
    if (!overwrite) {
      return { block, changed: false }
    }
    const currentPattern = new RegExp(`^${key}:\\s*(.*)$`, 'm')
    const match = block.match(currentPattern)
    const currentValue = match ? match[1].trim() : ''
    if (currentValue === value) {
      return { block, changed: false }
    }
    return {
      block: block.replace(currentPattern, `${key}: ${value}`),
      changed: true,
    }
  }

  const prefix = block.trim().length > 0 ? `${block}\n` : ''
  return { block: `${prefix}${key}: ${value}`, changed: true }
}

async function ensureTargetFrontmatter(
  filePath: string,
  partnerSlug: string,
  title: string,
) {
  try {
    const raw = await fs.readFile(filePath, 'utf8')
    const { frontmatter, body } = extractFrontmatter(raw)
    let updatedBlock = frontmatter
    let mutated = false

    if (!/^title:/m.test(frontmatter)) {
      const { block, changed } = ensureFrontmatterValue(
        updatedBlock,
        'title',
        JSON.stringify(title),
      )
      updatedBlock = block
      mutated = mutated || changed
    }

    const { block: withPartner, changed: partnerChanged } =
      ensureFrontmatterValue(
        updatedBlock,
        'partnerSlug',
        JSON.stringify(partnerSlug),
      )
    updatedBlock = withPartner
    mutated = mutated || partnerChanged

    if (!/^reviewStatus:/m.test(updatedBlock)) {
      const { block: withStatus, changed: statusChanged } =
        ensureFrontmatterValue(updatedBlock, 'reviewStatus', 'Placeholder', {
          overwrite: false,
        })
      updatedBlock = withStatus
      mutated = mutated || statusChanged
    }

    if (!mutated) {
      return
    }

    const sanitized = updatedBlock.trimEnd()
    const rebuilt = `---\n${sanitized}\n---\n${
      body.startsWith('\n') ? body : `\n${body}`
    }`
    await fs.writeFile(filePath, rebuilt, 'utf8')
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return
    }
    throw error
  }
}

function buildPlaceholderContent(relativePath: string, manifest: LocaleManifest) {
  const normalizedSlug = `/${relativePath
    .replace(/index\.md$/, '')
    .replace(/\\/g, '/')}`
  const manifestEntry =
    manifest.pages[normalizedSlug] ?? manifest.pages[`/${relativePath}`]
  const title = manifestEntry?.title ?? path.basename(relativePath, '.md')
  const partnerSlug = manifestEntry?.partnerSlug ?? normalizedSlug
  return `---\ntitle: ${JSON.stringify(
    title,
  )}\nreviewStatus: Placeholder\npartnerSlug: ${JSON.stringify(
    partnerSlug,
  )}\n---\n\n> [!] This page is awaiting human translation from zh-CN.\n\n- Source: ${partnerSlug}\n- Status: Pending review\n`
}

function ensureManifestEntry(
  manifest: LocaleManifest,
  normalizedSlug: string,
  relativePath: string,
) {
  let mutated = false
  let entry = manifest.pages[normalizedSlug]
  if (!entry) {
    entry = {
      slug: relativePath.replace(/\.md$/, ''),
      partnerSlug: normalizedSlug,
      title: path.basename(relativePath, '.md'),
    }
    manifest.pages[normalizedSlug] = entry
    mutated = true
  }
  if (!entry.slug) {
    entry.slug = relativePath.replace(/\.md$/, '')
    mutated = true
  }
  if (!entry.partnerSlug) {
    entry.partnerSlug = normalizedSlug
    mutated = true
  }
  if (!entry.title) {
    entry.title = path.basename(relativePath, '.md')
    mutated = true
  }
  return { entry, mutated }
}

async function mirror(manifest: LocaleManifest) {
  const files = await collectSourceFiles()
  await ensureDir(TARGET_ROOT)
  let manifestMutated = false

  for (const sourceFile of files) {
    const relative = path.relative(DOCS_ROOT, sourceFile)
    const targetFile = path.join(TARGET_ROOT, relative)
    const targetDir = path.dirname(targetFile)
    await ensureDir(targetDir)

    const normalizedSlug = `/${relative
      .replace(/index\.md$/, '')
      .replace(/\\/g, '/')}`
    const { entry, mutated } = ensureManifestEntry(
      manifest,
      normalizedSlug,
      relative,
    )
    manifestMutated = manifestMutated || mutated

    try {
      await fs.access(targetFile)
      await ensureTargetFrontmatter(
        targetFile,
        entry.partnerSlug ?? normalizedSlug,
        entry.title ?? path.basename(relative, '.md'),
      )
      continue
    } catch {
      const content = buildPlaceholderContent(relative, manifest)
      await fs.writeFile(targetFile, content, 'utf8')
    }
  }

  if (manifestMutated) {
    await fs.writeFile(
      MANIFEST_PATH,
      `${JSON.stringify(manifest, null, 2)}\n`,
      'utf8',
    )
  }
}

async function main() {
  try {
    const manifest = await loadManifest()
    if (!manifest.targetLocales.includes(TARGET_LOCALE)) {
      throw new Error(`Target locale ${TARGET_LOCALE} missing from manifest`)
    }
    await mirror(manifest)
    console.log('Locale mirror completed successfully.')
  } catch (error) {
    console.error('Failed to mirror locales:', error)
    process.exit(1)
  }
}

await main()
