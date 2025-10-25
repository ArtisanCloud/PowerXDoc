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

function buildTaskSnippet({ seed, scenarioContext, extraContexts = [] }) {
  const contexts = [scenarioContext, ...extraContexts]
    .filter(Boolean)
    .map((item) => `  --context ${item}`)
    .join(' \\\n');

  return [
    `.codex/prompts/speckit.implement.md \\`,
    `  ${seed.filePath} \\`,
    contexts,
    '',
  ].join('\n');
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

  const [, domainPart] = args.scnId.split('-');
  const domain = (domainPart ?? 'misc').toLowerCase();
  const taskDir = path.join('docs/scenarios', domain);
  await ensureDir(taskDir);
  const taskFile = path.join(taskDir, 'task.md');

  const scenarioContext = defaultScenarioContextPath(args.scnId);

  const taskLines = [
    `# ${args.scnId} Seed 撰写任务清单`,
    '',
    '以下命令可逐一触发 `speckit.implement`，将 Seed 模板写成完整文档。',
    '',
    '```bash',
  ];

  const seeds = Array.isArray(scenario.children) ? scenario.children : [];
  const childScenarios = Array.isArray(scenario.child_scenarios)
    ? scenario.child_scenarios
    : [];
  const childScenarioMap = new Map(
    childScenarios
      .filter((entry) => entry?.scn_id)
      .map((entry) => [entry.scn_id, resolveScenarioPath(entry)])
  );

  for (const child of seeds) {
    if (!child?.doc_id) continue;

    const filePath = path.join(
      'docs/usecases-seeds',
      child.scope ?? 'TODO-scope',
      child.layer ?? 'TODO-layer',
      child.domain ?? 'TODO-domain',
      `${child.doc_id}.md`,
    );

    const contexts = [];
    if (scenarioContext) {
      contexts.push(scenarioContext);
    } else {
      contexts.push('docs/scenarios/publish/' + `${args.scnId}.md`);
    }
    contexts.push('docs/_data/docmap.yaml');
    contexts.push('docs/_data/repos.yaml');
    const childScenarioContext = childScenarioMap.get(child?.child_scn_id ?? '');
    if (childScenarioContext) {
      contexts.unshift(childScenarioContext);
    }

    const snippet = buildTaskSnippet({
      seed: { filePath },
      scenarioContext: contexts.shift(),
      extraContexts: contexts,
    });
    taskLines.push(`# ${child.doc_id}`);
    taskLines.push(snippet);
  }

  taskLines.push('```');
  taskLines.push(
    '',
    `> 完成全部 Seed 撰写后，可执行 \`npm run publish:usecases -- --scn-id ${args.scnId} --validate-only\` 或 \`node scripts/site/sync-scenario-pages.mjs --scn-id ${args.scnId} --with-seeds --force\` 进行校验与同步。`,
  );

  await fs.writeFile(taskFile, taskLines.join('\n'), 'utf8');
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

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
