#!/usr/bin/env node

/**
 * Sync scenario pages into docs/website/<locale>/scenarios.
 * - Copies usecase seed index from docs/usecases-seeds/<SCN_ID>/index.md
 * - Copies child scenarios defined in docmap.yaml (child_scenarios)
 * - Optionally copies usecase seeds (via sync-seed-pages)
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';
import { loadDocmap } from '../lib/docmap-utils.mjs';

const SOURCE_SEEDS_ROOT = path.resolve('docs/usecases-seeds');
const SOURCE_SCENARIOS_ROOT = path.resolve('docs/scenarios');
const WEBSITE_ROOT = path.resolve('docs/website');

const SUPPORTED_LOCALES = new Map([
  [
    'zh',
    {
      dir: 'zh',
      renderIndex: ({ sourceContent }) => prettifyMarkdownLinks(sourceContent),
      renderChildScenario: ({ sourceContent }) => sourceContent,
    },
  ],
  [
    'en',
    {
      dir: 'en',
      renderIndex: ({ scnId, sourceTitle, partnerPath }) => {
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
      renderChildScenario: ({ childId, partnerPath }) => {
        return `---\ntitle: "${childId} (Pending Translation)"\nreviewStatus: Placeholder\npartnerSlug: "${partnerPath}"\n---\n\n> This scenario document still awaits translation. Refer to the Chinese version: [${partnerPath}](${partnerPath}).\n`;
      },
    },
  ],
]);

function usage(message) {
  if (message) {
    console.error(`Error: ${message}`);
  }
  console.log(`Usage: sync-scenario-pages.mjs --scn-id <ID> [--locale <locale>] [--force] [--with-seeds]
\nOptions:
  --scn-id <ID>      Scenario identifier (required)
  --locale <locale>  Target locale to sync (repeatable, default: zh, en)
  --force            Overwrite existing files
  --with-seeds       Also sync child usecase seeds
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

function ensureFrontmatter(content) {
  const trimmed = content.trimStart();
  if (trimmed.startsWith('---')) {
    return content;
  }
  return `---\n${content}`;
}

async function findScenarioDoc(scnId, baseDir = SOURCE_SCENARIOS_ROOT) {
  const queue = [baseDir];
  while (queue.length) {
    const current = queue.shift();
    let entries = [];
    try {
      entries = await fs.readdir(current, { withFileTypes: true });
    } catch (error) {
      if (error.code === 'ENOENT') {
        continue;
      }
      throw error;
    }

    for (const entry of entries) {
      const entryPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        queue.push(entryPath);
      } else if (entry.isFile() && entry.name === `${scnId}.md`) {
        return entryPath;
      }
    }
  }
  return null;
}

async function readScenarioSource(scnId) {
  const seedIndexPath = path.join(SOURCE_SEEDS_ROOT, scnId, 'index.md');
  if (await fileExists(seedIndexPath)) {
    return seedIndexPath;
  }
  const scenarioPath = await findScenarioDoc(scnId);
  if (scenarioPath) {
    return scenarioPath;
  }
  return null;
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function syncScenarioPages({ scnId, locales, force, withSeeds = false }) {
  const sourcePath = await readScenarioSource(scnId);
  if (!sourcePath) {
    throw new Error(`Source scenario not found for ${scnId}`);
  }
  const sourceContent = await fs.readFile(sourcePath, 'utf8');
  const { fields } = extractFrontmatter(sourceContent);
  const sourceTitle = fields.title ?? scnId;
  const partnerPath = `/zh/scenarios/${scnId}.html`;

  const docmap = await loadDocmap().catch(() => ({ scenarios: [] }));
  const scenarioEntry = docmap.scenarios?.find((entry) => entry?.scn_id === scnId) ?? null;

  for (const locale of locales) {
    const localeConfig = SUPPORTED_LOCALES.get(locale);
    if (!localeConfig) continue;
    const targetDir = path.join(WEBSITE_ROOT, localeConfig.dir, 'scenarios');
    await ensureDir(targetDir);
    const targetPath = path.join(targetDir, `${scnId}.md`);

    const exists = await fileExists(targetPath);
    if (exists && !force) {
      console.log(`[skip] ${locale}:${scnId} (exists)`);
      continue;
    }

    const rendered = localeConfig.renderIndex({
      scnId,
      sourceContent,
      sourceTitle,
      partnerPath,
    });

    await fs.writeFile(targetPath, ensureFrontmatter(rendered), 'utf8');
    console.log(`${exists ? '[update]' : '[create]'} ${locale}:${targetPath}`);

    await syncChildScenarios({
      scnId,
      locales: [locale],
      force,
      scenarioEntry,
    });
  }

  if (withSeeds) {
    const { syncSeedPages } = await import('./sync-seed-pages.mjs');
    await syncSeedPages({ scnId, locales, force });
  }
}

async function syncChildScenarios({ scnId, locales, force, scenarioEntry }) {
  const childScenarios = Array.isArray(scenarioEntry?.child_scenarios)
    ? scenarioEntry.child_scenarios
    : [];
  if (!childScenarios.length) return;

  for (const child of childScenarios) {
    const childId = child?.scn_id;
    if (!childId) continue;

    const childSourcePath = child?.path
      ? path.resolve(child.path)
      : await findScenarioSource(childId);
    if (!childSourcePath) {
      console.warn(`[child-scenario] missing source for ${childId}`);
      continue;
    }

    let sourceContent;
    try {
      sourceContent = await fs.readFile(childSourcePath, 'utf8');
    } catch (error) {
      console.warn(`[child-scenario] failed to read ${childSourcePath}: ${error.message}`);
      continue;
    }

    for (const locale of locales) {
      const localeConfig = SUPPORTED_LOCALES.get(locale);
      if (!localeConfig) continue;

      const targetDir = path.join(
        WEBSITE_ROOT,
        localeConfig.dir,
        'scenarios',
        scnId,
      );
      await ensureDir(targetDir);
      const targetPath = path.join(targetDir, `${childId}.md`);

      const exists = await fileExists(targetPath);
      if (exists && !force) {
        console.log(`[skip] ${locale}:${childId} (exists)`);
        continue;
      }

      let rendered;
      if (locale === 'zh') {
        rendered = sourceContent;
      } else {
        const partner = `/zh/scenarios/${scnId}/${childId}.html`;
        rendered = localeConfig.renderChildScenario({
          childId,
          partnerPath: partner,
          sourceContent,
        });
      }

      await fs.writeFile(targetPath, ensureFrontmatter(rendered), 'utf8');
      console.log(`${exists ? '[update]' : '[create]'} ${locale}:${targetPath}`);
    }
  }
}

async function findScenarioSource(scnId) {
  const searchRoot = SOURCE_SCENARIOS_ROOT;
  const targetFile = `${scnId}.md`;
  const stack = [searchRoot];
  while (stack.length) {
    const current = stack.pop();
    let entries = [];
    try {
      entries = await fs.readdir(current, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      const entryPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(entryPath);
      } else if (entry.isFile() && entry.name === targetFile) {
        return entryPath;
      }
    }
  }
  return null;
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
