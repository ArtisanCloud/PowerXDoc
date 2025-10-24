#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

import { loadDocmap } from '../../../scripts/lib/docmap-utils.mjs';

function usage() {
  console.log(`Usage: generate-usecase-seed-index [options]

Options:
  --scn-id <ID>           Target scenario identifier (repeatable)
  --all                   Generate index files for every scenario in docmap.yaml
  --docmap <path>         Location of docmap.yaml (default: docs/_data/docmap.yaml)
  --seed-root <dir>       Seed root directory (default: docs/usecases-seeds)
  --output-root <dir>     Index output directory (default: docs/usecases-seeds/scenarios)
  --dry-run               Show actions without writing files
  --force                 Overwrite existing files even if content unchanged
  --help, -h              Display this help message
`);
}

function parseArgs(argv) {
  const args = {
    docmap: 'docs/_data/docmap.yaml',
    seedRoot: 'docs/usecases-seeds',
    outputRoot: 'docs/usecases-seeds/scenarios',
    scnIds: new Set(),
    all: false,
    dryRun: false,
    force: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    switch (token) {
      case '--scn-id': {
        const value = argv[++index];
        if (!value) {
          console.error('ERROR: --scn-id requires a value.');
          process.exit(1);
        }
        args.scnIds.add(value.trim());
        break;
      }
      case '--all':
        args.all = true;
        break;
      case '--docmap':
        args.docmap = argv[++index] ?? args.docmap;
        break;
      case '--seed-root':
        args.seedRoot = argv[++index] ?? args.seedRoot;
        break;
      case '--output-root':
        args.outputRoot = argv[++index] ?? args.outputRoot;
        break;
      case '--dry-run':
        args.dryRun = true;
        break;
      case '--force':
        args.force = true;
        break;
      case '--help':
      case '-h':
        usage();
        process.exit(0);
        break;
      default:
        console.error(`Unknown option: ${token}`);
        usage();
        process.exit(1);
    }
  }

  if (!args.all && args.scnIds.size === 0) {
    console.error('ERROR: Provide at least one --scn-id or use --all.');
    usage();
    process.exit(1);
  }

  return args;
}

async function ensureDir(dirPath, dryRun) {
  if (dryRun) return;
  await fs.mkdir(dirPath, { recursive: true });
}

function escapePipe(value) {
  const text = value ?? '';
  if (typeof text !== 'string') {
    return String(text);
  }
  return text.replace(/\|/g, '\\|');
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function findScenarioDoc(scnId, baseDir = 'docs/scenarios') {
  const queue = [path.resolve(baseDir)];
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
        return path.relative(process.cwd(), entryPath);
      }
    }
  }
  return null;
}

function buildFrontmatter({ scnId, title }) {
  const today = new Date().toISOString().slice(0, 10);
  const lines = [
    '---',
    `title: ${scnId} Usecase Seed Index`,
    `scn_id: ${scnId}`,
    'status: Generated',
    `last_reviewed_at: ${today}`,
    '---',
    '',
  ];
  if (title) {
    lines.push(`# ${title} – Usecase Seed Index`, '');
  } else {
    lines.push(`# ${scnId} – Usecase Seed Index`, '');
  }
  lines.push('> 本文件由 `generate-usecase-seed-index` 自动生成，请勿手工编辑。', '');
  return lines;
}

function formatRelativeLink(fromPath, targetPath) {
  const relative = path.relative(path.dirname(fromPath), targetPath);
  // Ensure unix-style separators for markdown links
  return relative.split(path.sep).join('/');
}

async function buildScenarioIndex({ scenario, args, outputPath }) {
  const lines = buildFrontmatter({ scnId: scenario.scn_id ?? scenario.scnId, title: scenario.title });

  const scenarioDocPath = await findScenarioDoc(scenario.scn_id ?? scenario.scnId);
  if (scenarioDocPath) {
    const rel = formatRelativeLink(outputPath, path.resolve(scenarioDocPath));
    lines.push(`- 场景文档：[\`${rel}\`](${rel})`);
  } else {
    lines.push('- 场景文档：未找到对应文件');
  }

  const docmapRel = formatRelativeLink(outputPath, path.resolve(args.docmap));
  lines.push(`- docmap 入口：[\`${docmapRel}\`](${docmapRel})`, '');

  if (!Array.isArray(scenario.children) || scenario.children.length === 0) {
    lines.push('> docmap.yaml 中尚未登记子用例。');
    return lines.join('\n');
  }

  const groups = new Map();
  for (const child of scenario.children) {
    if (!child?.doc_id) continue;
    const scope = child.scope ?? child.repo ?? child.repo_key ?? 'unknown-scope';
    if (!groups.has(scope)) {
      groups.set(scope, []);
    }
    groups.get(scope).push(child);
  }

  const sortedScopes = Array.from(groups.keys()).sort((a, b) => a.localeCompare(b));
  for (const scope of sortedScopes) {
    lines.push(`## Scope: ${scope}`, '');
    lines.push('| Doc ID | Layer | Domain | Optional | Seed | Status |');
    lines.push('|--------|-------|--------|----------|------|--------|');

    const entries = groups.get(scope) ?? [];
    entries.sort((a, b) => a.doc_id.localeCompare(b.doc_id));

    for (const child of entries) {
      const docId = child.doc_id;
      const layer = escapePipe(child.layer ?? '—');
      const domain = escapePipe(child.domain ?? '—');
      const optional = child.optional === true ? '是' : '否';

      const seedPath = path.resolve(
        process.cwd(),
        args.seedRoot,
        child.scope ?? scope,
        child.layer ?? 'TODO-layer',
        child.domain ?? 'TODO-domain',
        `${docId}.md`,
      );

      const seedExists = await fileExists(seedPath);
      const relSeed = formatRelativeLink(outputPath, seedPath);
      const seedLink = seedExists ? `[${docId}](${relSeed})` : `\`${docId}\``;
      const status = seedExists ? '已生成' : '缺失';

      lines.push(
        `| ${escapePipe(docId)} | ${layer} | ${domain} | ${optional} | ${seedLink} | ${status} |`,
      );
    }

    lines.push('');
  }

  return lines.join('\n');
}

async function writeFileIfChanged(filePath, content, { dryRun, force }) {
  const existedBefore = await fileExists(filePath);

  if (!force && existedBefore) {
    const existing = await fs.readFile(filePath, 'utf8');
    if (existing === content) {
      return 'unchanged';
    }
  }

  if (dryRun) {
    return existedBefore ? 'would-update' : 'would-create';
  }

  await ensureDir(path.dirname(filePath), dryRun);
  await fs.writeFile(filePath, content, 'utf8');
  return existedBefore ? 'updated' : 'created';
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const docmap = await loadDocmap(args.docmap);

  const targetScenarios = args.all
    ? docmap.scenarios ?? []
    : (docmap.scenarios ?? []).filter((entry) => args.scnIds.has(entry.scn_id ?? entry.scnId));

  if (!targetScenarios.length) {
    const label = args.all ? 'docmap.yaml 中没有场景' : '未找到指定的 scn_id';
    console.error(`ERROR: ${label}。`);
    process.exit(1);
  }

  const results = [];
  for (const scenario of targetScenarios) {
    const scnId = scenario.scn_id ?? scenario.scnId;
    if (!scnId) continue;

    const outputPath = path.resolve(args.outputRoot, `${scnId}.md`);
    const content = await buildScenarioIndex({ scenario, args, outputPath });
    const status = await writeFileIfChanged(outputPath, content, {
      dryRun: args.dryRun,
      force: args.force,
    });

    results.push({
      scnId,
      path: path.relative(process.cwd(), outputPath),
      status,
    });
  }

  for (const entry of results) {
    console.log(`[${entry.status}] ${entry.scnId} → ${entry.path}`);
  }

  if (args.dryRun) {
    console.log('(dry run) 未对文件做出修改。');
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
