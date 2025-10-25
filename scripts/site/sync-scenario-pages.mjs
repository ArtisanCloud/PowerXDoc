#!/usr/bin/env node

/**
 * Sync scenario seed index pages from docs/usecases-seeds/scenarios/**
 * into the VitePress website directories under docs/website/<locale>/scenarios/.
 *
 * Usage:
 *   node scripts/site/sync-scenario-pages.mjs --scn-id SCN-PUBLISH-HUB-001 [--locale zh] [--locale en] [--force]
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const SOURCE_ROOT = path.resolve('docs/usecases-seeds/scenarios');
const WEBSITE_ROOT = path.resolve('docs/website');
const SUPPORTED_LOCALES = new Map([
  [
    'zh',
    {
      dir: 'zh',
      buildContent: ({ sourceContent }) => prettifyMarkdownLinks(sourceContent),
    },
  ],
  [
    'en',
    {
      dir: 'en',
      buildContent: ({ scnId, sourceTitle, partnerPath }) => {
        const title = sourceTitle
          ? `${sourceTitle} (Pending Translation)`
          : `${scnId} (Pending Translation)`;
        const normalizedPartner = partnerPath.startsWith('/')
          ? partnerPath
          : `/${partnerPath}`;

        return `---\ntitle: ${JSON.stringify(title)}\nreviewStatus: Placeholder\npartnerSlug: ${JSON.stringify(
          normalizedPartner,
        )}\n---\n\n> This scenario index still awaits translation. Refer to the Chinese version: [${normalizedPartner}](${normalizedPartner}).\n`;
      },
    },
  ],
]);

function usage(message) {
  if (message) {
    console.error(`Error: ${message}`);
  }
  console.log(`Usage: sync-scenario-pages.mjs --scn-id <ID> [--locale <locale>] [--force]

Options:
  --scn-id <ID>      Scenario identifier (required)
  --locale <locale>  Target locale to sync (repeatable, default: zh, en)
  --force            Overwrite existing files
  --with-seeds       Also sync all child usecase seeds
  --help             Show this message
`);
  process.exit(message ? 1 : 0);
}

function parseArgs(argv) {
  const args = {
    scnId: '',
    locales: [],
    force: false,
    withSeeds: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    switch (token) {
      case '--scn-id':
        args.scnId = argv[++i] ?? '';
        break;
      case '--locale':
        args.locales.push(argv[++i] ?? '');
        break;
      case '--force':
        args.force = true;
        break;
      case '--with-seeds':
        args.withSeeds = true;
        break;
      case '--help':
      case '-h':
        usage();
        break;
      default:
        usage(`Unknown option: ${token}`);
    }
  }

  if (!args.scnId) {
    usage('--scn-id is required');
  }

  const selectedLocales =
    args.locales.length > 0 ? args.locales : Array.from(SUPPORTED_LOCALES.keys());

  for (const locale of selectedLocales) {
    if (!SUPPORTED_LOCALES.has(locale)) {
      usage(`Unsupported locale: ${locale}`);
    }
  }

  return { ...args, locales: selectedLocales };
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

function extractFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { fields: {}, body: content };

  const [, rawFields, body] = match;
  const fields = {};

  for (const line of rawFields.split(/\r?\n/)) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (!key) continue;
    fields[key] = value.replace(/^['"]|['"]$/g, '');
  }

  return { fields, body: body ?? '' };
}

export async function syncScenarioPages({ scnId, locales, force, withSeeds = false }) {
  const sourcePath = path.join(SOURCE_ROOT, `${scnId}.md`);
  let sourceContent;
  try {
    sourceContent = await fs.readFile(sourcePath, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`Source scenario not found: ${sourcePath}`);
    }
    throw error;
  }

  const { fields } = extractFrontmatter(sourceContent);
  const sourceTitle = fields.title ?? scnId;
  const partnerPath = `/zh/scenarios/${scnId}.html`;

  for (const locale of locales) {
    const localeConfig = SUPPORTED_LOCALES.get(locale);
    if (!localeConfig) continue;
    const targetDir = path.join(WEBSITE_ROOT, localeConfig.dir, 'scenarios');
    await ensureDir(targetDir);
    const targetPath = path.join(targetDir, `${scnId}.md`);

    const exists = await fs
      .access(targetPath)
      .then(() => true)
      .catch(() => false);

    if (exists && !force) {
      console.log(`[skip] ${locale}:${scnId} (exists)`);
      continue;
    }

    const rendered = localeConfig.buildContent({
      scnId,
      sourceContent,
      sourceTitle,
      partnerPath,
    });

    await fs.writeFile(targetPath, rendered, 'utf8');
    console.log(`${exists ? '[update]' : '[create]'} ${locale}:${targetPath}`);
  }

  if (withSeeds) {
    const { syncSeedPages } = await import('./sync-seed-pages.mjs');
    await syncSeedPages({ scnId, locales, force });
  }
}

function extractPathBase(url) {
  if (!url) return '';
  const normalized = url.replace(/[#?].*$/, '');
  const segments = normalized.split('/').filter(Boolean);
  if (!segments.length) return normalized.replace(/^\.*\//, '');
  return segments[segments.length - 1] || normalized;
}

function prettifyMarkdownLinks(markdown) {
  return markdown.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, label, url) => {
    const cleanLabel = label.replace(/`/g, '');
    const needsSimplify =
      cleanLabel.includes('/') ||
      cleanLabel.includes('..') ||
      cleanLabel.startsWith('./') ||
      cleanLabel.trim() === '' ||
      /^\s*$/.test(cleanLabel);
    if (!needsSimplify) {
      return match;
    }
    const baseName = extractPathBase(url);
    if (!baseName) {
      return match;
    }
    return `[${baseName}](${url})`;
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  await syncScenarioPages(args);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
import { pathToFileURL } from 'node:url';
