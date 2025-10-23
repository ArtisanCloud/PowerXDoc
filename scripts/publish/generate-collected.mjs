#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { createHash } from 'node:crypto';

import { loadDocmap } from '../lib/docmap-utils.mjs';
import { loadRepos } from '../lib/docmap-utils.mjs';
import { appendWorkflowRecord, writeWorkflowSummary } from '../lib/report-writer.mjs';
import {
  generateResumeToken,
  getRunByToken,
  registerWorkflowRun,
  updateRunStatus,
} from '../lib/workflow-state.mjs';

const DEFAULT_OUTPUT_DIR = 'docs/website/_collected';
const DEFAULT_REPORT_DIR = 'reports/collected';
const DEFAULT_STATE_DIR = 'reports/_state';

function usage() {
  console.log(`Usage: npm run publish:collected -- [options]

Options:
  --docmap <file>            Path to docmap.yaml (default: docs/_data/docmap.yaml)
  --repos <file>             Path to repos.yaml (default: docs/_data/repos.yaml)
  --scn-id <id>              Only process given scenario (repeatable)
  --scope <value>            Filter child stubs by scope (repeatable)
  --layer <value>            Filter child stubs by layer (repeatable)
  --domain <value>           Filter child stubs by domain (repeatable)
  --output-dir <dir>         Output directory for collected stubs (default: docs/website/_collected)
  --report-dir <dir>         Directory for workflow reports (default: reports/collected)
  --state-dir <dir>          Directory for workflow state ledger (default: reports/_state)
  --dry-run                  Skip writing files (still produces report)
  --resume-token <token>     Resume a previous workflow run
  --quiet                    Suppress informational logs
`);
}

function collectListArg(target, value) {
  if (!value) return target;
  const tokens = value.split(',').map((item) => item.trim()).filter(Boolean);
  return target.concat(tokens);
}

function parseArgs(argv) {
  const args = {
    docmap: 'docs/_data/docmap.yaml',
    repos: 'docs/_data/repos.yaml',
    outputDir: DEFAULT_OUTPUT_DIR,
    reportDir: DEFAULT_REPORT_DIR,
    stateDir: DEFAULT_STATE_DIR,
    dryRun: false,
    quiet: false,
    scnIds: [],
    scopes: [],
    layers: [],
    domains: [],
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    switch (token) {
      case '--docmap':
        args.docmap = argv[++i];
        break;
      case '--repos':
        args.repos = argv[++i];
        break;
      case '--scn-id':
        args.scnIds = collectListArg(args.scnIds, argv[++i]);
        break;
      case '--scope':
        args.scopes = collectListArg(args.scopes, argv[++i]);
        break;
      case '--layer':
        args.layers = collectListArg(args.layers, argv[++i]);
        break;
      case '--domain':
        args.domains = collectListArg(args.domains, argv[++i]);
        break;
      case '--output-dir':
        args.outputDir = argv[++i];
        break;
      case '--report-dir':
        args.reportDir = argv[++i];
        break;
      case '--state-dir':
        args.stateDir = argv[++i];
        break;
      case '--dry-run':
        args.dryRun = true;
        break;
      case '--resume-token':
        args.resumeToken = argv[++i];
        break;
      case '--quiet':
        args.quiet = true;
        break;
      case '--help':
      case '-h':
        usage();
        process.exit(0);
        break;
      default:
        break;
    }
  }

  return args;
}

function filterChildren(children, filters) {
  return children.filter((child) => {
    if (filters.scopes.length && !filters.scopes.includes(child.scope)) return false;
    if (filters.layers.length && !filters.layers.includes(child.layer)) return false;
    if (filters.domains.length && !filters.domains.includes(child.domain)) return false;
    return true;
  });
}

function computeFingerprint(entries) {
  const hash = createHash('sha256');
  const sorted = [...entries].sort((a, b) => a.child.doc_id.localeCompare(b.child.doc_id));
  for (const { scenario, child, repoMeta } of sorted) {
    hash.update(JSON.stringify({ scenario: scenario.scn_id, child, repo: repoMeta?.key }));
  }
  return hash.digest('hex');
}

function ensureTitle(scenario, child) {
  if (child.title) return child.title;
  return `${child.doc_id} · ${scenario.title ?? scenario.scn_id}`;
}

function buildRepoUrl(child, repoMeta) {
  if (!repoMeta?.slug) return null;
  const branch = repoMeta.default_branch ?? 'main';
  const relativePath = child.path ?? '';
  return `https://github.com/${repoMeta.slug}/tree/${branch}/${relativePath}`;
}

function buildScenarioLink(scenario) {
  return `../../scenarios/${scenario.scn_id}`;
}

function buildOptionalLabel(optional) {
  return optional ? '⚠️ Optional' : '✅ Required';
}

async function ensureDir(dirPath, dryRun) {
  if (dryRun) return;
  await fs.mkdir(dirPath, { recursive: true });
}

async function writeStub(targetPath, content, dryRun) {
  if (dryRun) return;
  await fs.writeFile(targetPath, content, 'utf8');
}

function renderStub({ scenario, child, repoMeta, repoUrl }) {
  const generatedAt = new Date().toISOString();
  const title = ensureTitle(scenario, child);
  const scenarioLink = buildScenarioLink(scenario);
  const optionalLabel = buildOptionalLabel(Boolean(child.optional));
  const metadataLines = [
    `title: ${JSON.stringify(title)}`,
    `doc_id: ${JSON.stringify(child.doc_id)}`,
    `scn_id: ${JSON.stringify(scenario.scn_id)}`,
    `scope: ${JSON.stringify(child.scope ?? '')}`,
    `layer: ${JSON.stringify(child.layer ?? '')}`,
    `domain: ${JSON.stringify(child.domain ?? '')}`,
    `optional: ${child.optional ? 'true' : 'false'}`,
    `repo: ${JSON.stringify(child.repo ?? '')}`,
    `repo_url: ${JSON.stringify(repoUrl ?? '')}`,
    `generated_at: ${JSON.stringify(generatedAt)}`,
  ];

  const lines = [
    '---',
    ...metadataLines,
    '---',
    '',
    `# ${child.doc_id}`,
    '',
    `- Scenario: [${scenario.title ?? scenario.scn_id}](${scenarioLink})`,
    `- Scope · Layer · Domain: \`${child.scope ?? 'n/a'}\` · \`${child.layer ?? 'n/a'}\` · \`${child.domain ?? 'n/a'}\``,
    `- Optional: ${optionalLabel}`,
    repoUrl ? `- Upstream Path: [${child.path ?? ''}](${repoUrl})` : `- Upstream Path: ${child.path ?? ''}`,
    '',
    '> This stub is auto-generated by generate-collected.mjs for leadership coverage review.',
  ];

  return `${lines.join('\n')}\n`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const [docmap, reposMeta] = await Promise.all([
    loadDocmap(args.docmap),
    loadRepos(args.repos),
  ]);

  const repoIndex = new Map((reposMeta.repos ?? []).map((repo) => [repo.key, repo]));
  const scenarios = (docmap.scenarios ?? []).filter((scenario) => {
    if (!args.scnIds.length) return true;
    return args.scnIds.includes(scenario.scn_id);
  });

  const entries = [];
  for (const scenario of scenarios) {
    const filtered = filterChildren(scenario.children ?? [], {
      scopes: args.scopes,
      layers: args.layers,
      domains: args.domains,
    });
    for (const child of filtered) {
      const repoMeta = repoIndex.get(child.repo);
      if (!repoMeta) {
        console.warn(
          `[WARN] Repo metadata for "${child.repo}" missing; stub for ${child.doc_id} will skip repo link.`,
        );
      }
      entries.push({ scenario, child, repoMeta });
    }
  }

  if (!entries.length) {
    console.error('No docmap children matched the provided filters.');
    process.exitCode = 1;
    return;
  }

  const fingerprint = computeFingerprint(entries);
  const workflowId = args.scnIds.length === 1 ? `collected:${args.scnIds[0]}` : 'collected:all';

  let run;
  try {
    if (args.resumeToken) {
      run = await getRunByToken({
        workflowId,
        resumeToken: args.resumeToken,
        stateDir: args.stateDir,
      });
      if (!run) {
        throw new Error(`Unknown resume token ${args.resumeToken}`);
      }
    } else {
      run = await registerWorkflowRun({
        workflowId,
        fingerprint,
        status: 'running',
        stateDir: args.stateDir,
      });
    }
  } catch (error) {
    console.error(`[WORKFLOW] ${error.message}`);
    process.exitCode = 1;
    return;
  }

  const resumeToken = run?.resumeToken ?? generateResumeToken();
  const records = [];

  await ensureDir(args.outputDir, args.dryRun);
  await fs.mkdir(args.reportDir, { recursive: true });

  for (const entry of entries) {
    const { scenario, child, repoMeta } = entry;
    const repoUrl = buildRepoUrl(child, repoMeta);
    const targetDir = path.join(args.outputDir, child.scope ?? 'unknown', child.layer ?? 'unknown', child.domain ?? 'unknown');
    const targetPath = path.join(targetDir, `${child.doc_id}.md`);
    const content = renderStub({ scenario, child, repoMeta, repoUrl });

    try {
      await ensureDir(targetDir, args.dryRun);
      await writeStub(targetPath, content, args.dryRun);

      records.push({
        docId: child.doc_id,
        scenario: scenario.scn_id,
        scope: child.scope,
        layer: child.layer,
        domain: child.domain,
        optional: Boolean(child.optional),
        repo: child.repo,
        repoUrl,
        stubPath: path.relative('.', targetPath),
        status: 'Success',
        resumeToken,
      });

      if (!args.quiet) {
        console.log(`[STUB] ${child.doc_id} → ${targetPath}`);
      }
    } catch (error) {
      console.error(`[ERROR] Failed to write stub for ${child.doc_id}: ${error.message}`);
      records.push({
        docId: child.doc_id,
        scenario: scenario.scn_id,
        status: 'Failed',
        error: error.message,
        resumeToken,
      });
    }
  }

  const summaryStatus = records.some((record) => record.status === 'Failed') ? 'Failed' : 'Completed';
  const reportPath = path.join(args.reportDir, `${workflowId.replace(/[:/]/g, '_')}.json`);

  await writeWorkflowSummary(reportPath, {
    workflowId,
    status: summaryStatus,
    generatedAt: new Date().toISOString(),
    processed: records.length,
  });
  await appendWorkflowRecord(reportPath, {
    workflowId,
    status: summaryStatus,
    resumeToken,
    records,
  });

  await updateRunStatus({
    workflowId,
    resumeToken,
    stateDir: args.stateDir,
    status: summaryStatus === 'Failed' ? 'failed' : 'completed',
    metadata: { reportPath },
  });

  if (!args.quiet) {
    console.log(`[REPORT] ${reportPath}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
