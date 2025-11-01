#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import fsSync from 'node:fs';
import path from 'node:path';
import process from 'node:process';

import { loadDocmap } from '../lib/docmap-utils.mjs';

function usage() {
  console.log(`Usage: node scripts/node/generate-seed-tasks.mjs --scn-id <ID>`);
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

function parseArgs(argv) {
  const args = {
    scnId: '',
    docmap: 'docs/_data/docmap.yaml',
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    switch (token) {
      case '--scn-id':
        args.scnId = argv[++i] ?? '';
        break;
      case '--docmap':
        args.docmap = argv[++i] ?? args.docmap;
        break;
      case '--help':
      case '-h':
        usage();
        process.exit(0);
        break;
      default:
        console.warn(`Unknown option: ${token}`);
        usage();
        process.exit(1);
    }
  }

  if (!args.scnId) {
    usage();
    process.exit(1);
  }

  return args;
}

function defaultScenarioContextPath(scnId) {
  const [, domain] = scnId.split('-');
  const normalizedDomain = (domain ?? '').toLowerCase();
  const candidate = path.join('docs/scenarios', normalizedDomain, `${scnId}.md`);
  if (fsSync.existsSync(candidate)) {
    return candidate;
  }
  return null;
}

function buildTaskSnippet({ seedPath, contexts }) {
  const safeContexts = Array.isArray(contexts) ? contexts : [];
  const lines = ['[usecase-generate-template.md](.specify/templates/usecase-generate-template.md) \\'];

  if (safeContexts.length === 0) {
    lines.push(`  ${seedPath}`);
    return lines.join('\n');
  }

  lines.push(`  ${seedPath} \\`);

  safeContexts.forEach((ctx, index) => {
    const isLast = index === safeContexts.length - 1;
    lines.push(`  --context ${ctx}${isLast ? '' : ' \\'}`);
  });

  return lines.join('\n');
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const docmap = await loadDocmap(args.docmap);

  const scenario =
    docmap.scenarios?.find((entry) => entry?.scn_id === args.scnId) ?? null;
  if (!scenario) {
    console.error(`Scenario ${args.scnId} not found in ${args.docmap}`);
    process.exit(1);
  }

  const seedDir = path.join('docs/usecases-seeds', args.scnId);
  await ensureDir(seedDir);
  const taskFile = path.join(seedDir, 'task.md');

  const [, domainPart] = args.scnId.split('-');
  const domain = (domainPart ?? 'misc').toLowerCase();

  const taskContent = buildScenarioTaskSection({
    scenario,
    domain,
    docmap,
  });

  await fs.writeFile(taskFile, `${taskContent}\n`, 'utf8');
  console.log(`Seed tasks written to ${taskFile}`);
}

function resolveScenarioPath(entry) {
  if (entry?.path) {
    return entry.path;
  }
  if (!entry?.scn_id) return null;
  const [, domain] = entry.scn_id.split('-');
  const normalized = (domain ?? '').toLowerCase();
  const candidate = path.join(
    'docs/scenarios',
    normalized,
    `${entry.scn_id}.md`,
  );
  return candidate;
}

function guessChildScenarioId(child) {
  if (child?.child_scn_id) return child.child_scn_id;
  if (!child?.doc_id) return null;
  const parts = child.doc_id.split('-');
  if (parts.length >= 3) {
    return ['SCN', ...parts.slice(1)].join('-');
  }
  return null;
}

function uniqueContexts(contexts) {
  const seen = new Set();
  const ordered = [];
  for (const ctx of contexts) {
    if (!ctx || seen.has(ctx)) continue;
    seen.add(ctx);
    ordered.push(ctx);
  }
  return ordered;
}

function buildScenarioTaskSection({ scenario, domain, docmap }) {
  const scenarioContext =
    defaultScenarioContextPath(scenario.scn_id) ??
    path.join('docs/scenarios', domain, `${scenario.scn_id}.md`);

  const childScenarios = Array.isArray(scenario.child_scenarios)
    ? scenario.child_scenarios
    : [];
  const childScenarioMap = new Map(
    childScenarios
      .filter((entry) => entry?.scn_id)
      .map((entry) => [entry.scn_id, resolveScenarioPath(entry)]),
  );

  const seeds = Array.isArray(scenario.children) ? scenario.children : [];
  const lines = [
    `# ${scenario.scn_id} Seed 撰写任务`,
    '',
    '本任务文件按子用例列出撰写指引，所有命令均依赖 `.specify/templates/usecase-generate-template.md`，请在仓库根目录执行。',
    '',
  ];

  const sortedSeeds = [...seeds].sort((a, b) =>
    (a.doc_id ?? '').localeCompare(b.doc_id ?? ''),
  );

  for (const child of sortedSeeds) {
    if (!child?.doc_id) continue;

    const seedPath = path.join(
      'docs/usecases-seeds',
      scenario.scn_id,
      `${child.doc_id}.md`,
    );

    const childScenarioId = guessChildScenarioId(child);
    const childScenarioContext = childScenarioId
      ? childScenarioMap.get(childScenarioId)
      : null;

    const contexts = uniqueContexts([
      scenarioContext,
      childScenarioContext,
      'docs/_data/docmap.yaml',
      'docs/_data/repos.yaml',
    ]);

    const labelSegments = [child.scope, child.layer, child.domain]
      .filter(Boolean)
      .join('/');

    lines.push(
      `### ${child.doc_id}${labelSegments ? ` · ${labelSegments}` : ''}`,
    );
    lines.push(
      '完善该 Seed，补充流程、契约、验收指标与团队协作说明：',
    );
    lines.push('');
    lines.push('```bash');
    lines.push(
      buildTaskSnippet({
        seedPath,
        contexts,
      }),
    );
    lines.push('```');
    lines.push('');
  }

  lines.push(
    `> 完成撰写后，可执行 \`npm run publish:usecases -- --scn-id ${scenario.scn_id} --validate-only\` 或 \`node scripts/site/sync-scenario-pages.mjs --scn-id ${scenario.scn_id} --with-seeds --force\` 校验结构并同步站点。`,
  );

  return lines.join('\n');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
