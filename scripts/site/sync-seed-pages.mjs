#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';
import { loadDocmap } from '../lib/docmap-utils.mjs';

const SOURCE_ROOT = path.resolve('docs/usecases-seeds');
const WEBSITE_ROOT = path.resolve('docs/website');
const SUPPORTED_LOCALES = new Map([
  [
    'zh',
    {
      dir: 'zh',
      async buildContent({ sourcePath }) {
        return fs.readFile(sourcePath, 'utf8');
      },
      async buildIndexContent({ sourcePath }) {
        return fs.readFile(sourcePath, 'utf8');
      },
    },
  ],
  [
    'en',
    {
      dir: 'en',
      async buildContent({ docId, partnerPath }) {
        const title = `${docId} (Pending Translation)`;
        const normalizedPartner = partnerPath.startsWith('/')
          ? partnerPath
          : `/${partnerPath}`;
        return `---\ntitle: ${JSON.stringify(title)}\nreviewStatus: Placeholder\npartnerSlug: ${JSON.stringify(
          normalizedPartner,
        )}\n---\n\n> This usecase seed still awaits translation. Refer to the Chinese version: [${normalizedPartner}](${normalizedPartner}).\n`;
      },
      async buildIndexContent({ scnId, partnerPath }) {
        const title = `${scnId} Seed Index (Pending Translation)`;
        const normalizedPartner = partnerPath.startsWith('/')
          ? partnerPath
          : `/${partnerPath}`;
        return `---\ntitle: ${JSON.stringify(title)}\nreviewStatus: Placeholder\npartnerSlug: ${JSON.stringify(
          normalizedPartner,
        )}\n---\n\n> This index is pending translation. Refer to the Chinese page: [${normalizedPartner}](${normalizedPartner}).\n`;
      },
    },
  ],
]);

function usage(message) {
  if (message) {
    console.error(`Error: ${message}`);
  }
  console.log(`Usage: sync-seed-pages.mjs --scn-id <ID> [--locale <locale>] [--force]

Options:
  --scn-id <ID>      Scenario identifier (required)
  --locale <locale>  Target locale to sync (repeatable, default: zh, en)
  --force            Overwrite existing files
  --help             Show this message
`);
  process.exit(message ? 1 : 0);
}

function parseArgs(argv) {
  const args = {
    scnId: '',
    locales: [],
    force: false,
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

function buildSeedSourceCandidates({ scnId, child }) {
  const candidates = [];

  if (scnId) {
    candidates.push(path.join(SOURCE_ROOT, scnId, `${child.doc_id}.md`));
  }

  if (child.path) {
    candidates.push(path.resolve(process.cwd(), child.path));
  } else if (child.scope && child.layer && child.domain) {
    candidates.push(
      path.join(
        SOURCE_ROOT,
        child.scope,
        child.layer,
        child.domain,
        `${child.doc_id}.md`,
      ),
    );
  }

  return candidates;
}

function buildTargetPath(localeConfig, scnId, docId) {
  return path.join(
    WEBSITE_ROOT,
    localeConfig.dir,
    'scenarios',
    scnId,
    `${docId}.md`,
  );
}

function buildIndexSourceCandidates({ scnId }) {
  return [path.join(SOURCE_ROOT, scnId, 'index.md')];
}

function buildIndexTargetPath(localeConfig, scnId) {
  return path.join(WEBSITE_ROOT, localeConfig.dir, 'scenarios', scnId, 'index.md');
}

export async function syncSeedPages({ scnId, locales, force }) {
  const docmap = await loadDocmap();
  const scenario = (docmap.scenarios ?? []).find((entry) => entry.scn_id === scnId);
  if (!scenario) {
    throw new Error(`Scenario ${scnId} not found in docmap.`);
  }

  const children = scenario.children ?? [];

  for (const locale of locales) {
    const localeConfig = SUPPORTED_LOCALES.get(locale);
    if (!localeConfig) continue;

    for (const child of children) {
      const candidates = buildSeedSourceCandidates({ scnId, child });
      let sourcePath = null;

      for (const candidate of candidates) {
        try {
          await fs.access(candidate);
          sourcePath = candidate;
          break;
        } catch {
          // try next candidate
        }
      }

      if (!sourcePath) {
        console.warn(
          `[${locale}] seed missing for ${child.doc_id}. Checked: ${candidates.join(
            ', ',
          )}`,
        );
        continue;
      }

      const targetPath = buildTargetPath(localeConfig, scnId, child.doc_id);
      await ensureDir(path.dirname(targetPath));

      const exists = await fs
        .access(targetPath)
        .then(() => true)
        .catch(() => false);

      if (exists && !force) {
        console.log(`[skip] ${locale}:${child.doc_id} (exists)`);
        continue;
      }

      const partnerPath = `/zh/scenarios/${scnId}/${child.doc_id}.html`;
      const rawContent = await localeConfig.buildContent({
        scnId,
        docId: child.doc_id,
        sourcePath,
        partnerPath,
      });

      const content = sanitizeDynamicPlaceholders(rawContent);

      await fs.writeFile(targetPath, ensureFrontmatter(content), 'utf8');
      console.log(`${exists ? '[update]' : '[create]'} ${locale}:${targetPath}`);
    }

    const indexCandidates = buildIndexSourceCandidates({ scnId });
    let indexSource = null;
    for (const candidate of indexCandidates) {
      try {
        await fs.access(candidate);
        indexSource = candidate;
        break;
      } catch {
        // try next
      }
    }

    if (!indexSource) {
      console.warn(
        `[${locale}] seed index missing for ${scnId}. Checked: ${indexCandidates.join(', ')}`,
      );
      continue;
    }

    const indexTarget = buildIndexTargetPath(localeConfig, scnId);
    await ensureDir(path.dirname(indexTarget));

    const indexExists = await fs
      .access(indexTarget)
      .then(() => true)
      .catch(() => false);

    if (indexExists && !force) {
      console.log(`[skip] ${locale}:index (exists)`);
    } else {
      const partnerPath = `/zh/scenarios/${scnId}/index.html`;
      const rawIndex = await localeConfig.buildIndexContent({
        scnId,
        sourcePath: indexSource,
        partnerPath,
      });
      const content = sanitizeDynamicPlaceholders(rawIndex);
      await fs.writeFile(indexTarget, ensureFrontmatter(content), 'utf8');
      console.log(`${indexExists ? '[update]' : '[create]'} ${locale}:${indexTarget}`);
    }
  }
}

function ensureFrontmatter(raw) {
  const trimmed = raw.trimStart();
  if (trimmed.startsWith('---')) {
    return raw;
  }
  return `---\n${raw}`;
}

function sanitizeDynamicPlaceholders(raw) {
  const TOKENS = [
    '<层名称>',
    '<pkg/...>',
    '<repo/entrypoint>',
    '<service/component>',
    '<config or script>',
    '<调用方/触发者>',
    '<被调用方/处理者>',
    '<下游/附加参与者>',
    '<触发请求或事件>',
    '<链路调用或副作用>',
    '<响应或反馈>',
    '<最终结果>',
    '<风险或跟进项>',
    '<潜在影响>',
    '<缓解方案或依赖>',
    '<负责人>',
    '<ETA>'
  ];

  let result = raw;
  for (const token of TOKENS) {
    const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    result = result.replace(new RegExp(escaped, 'g'), token.replace(/</g, '&lt;').replace(/>/g, '&gt;'));
  }
  return result;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  await syncSeedPages(args);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
