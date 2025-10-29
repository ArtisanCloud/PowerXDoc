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
  registerWorkflowRun,
  getRunByToken,
  updateRunStatus,
} from '../lib/workflow-state.mjs';
import { runGit, checkoutBranch, commitAll } from '../lib/git-utils.mjs';
import { buildBranchName, createPullRequest } from '../lib/github-utils.mjs';

const DEFAULT_STATE_DIR = 'reports/_state';

function usage() {
  console.log(`Usage: npm run publish:usecases -- [options]

Options:
  --scn-id <id>              Scenario ID to distribute (required)
  --docmap <file>            Path to docmap.yaml (default: docs/_data/docmap.yaml)
  --repos <file>             Path to repos.yaml (default: docs/_data/repos.yaml)
  --checkout-root <dir>      Base directory containing downstream checkouts (default: repos)
  --report-dir <dir>         Directory for workflow reports (default: reports/usecases)
  --state-dir <dir>          Directory for workflow state ledger (default: reports/_state)
  --dry-run                  Skip git commit/push while still copying files
  --resume-token <token>     Resume a previously failed run
  --quiet                    Suppress informational logs
  --scope <value>            Filter docmap children by scope (repeatable)
  --layer <value>            Filter docmap children by layer (repeatable)
  --domain <value>           Filter docmap children by domain (repeatable)
  --no-website-sync          Skip syncing docs/website content after publish
`);
}

function collectListArg(target, value) {
  if (!value) return target;
  const parts = value.split(',').map((item) => item.trim()).filter(Boolean);
  return target.concat(parts);
}

function parseArgs(argv) {
  const args = {
    docmap: 'docs/_data/docmap.yaml',
    repos: 'docs/_data/repos.yaml',
    checkoutRoot: 'repos',
    reportDir: 'reports/usecases',
    stateDir: DEFAULT_STATE_DIR,
    dryRun: false,
    quiet: false,
    scopes: [],
    layers: [],
    domains: [],
    syncWebsite: true,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    switch (token) {
      case '--scn-id':
        args.scnId = argv[++i];
        break;
      case '--docmap':
        args.docmap = argv[++i];
        break;
      case '--repos':
        args.repos = argv[++i];
        break;
      case '--checkout-root':
        args.checkoutRoot = argv[++i];
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
      case '--scope':
        args.scopes = collectListArg(args.scopes, argv[++i]);
        break;
      case '--layer':
        args.layers = collectListArg(args.layers, argv[++i]);
        break;
      case '--domain':
        args.domains = collectListArg(args.domains, argv[++i]);
        break;
      case '--no-website-sync':
        args.syncWebsite = false;
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

async function copyUsecaseSeed(child, repoMeta, options) {
  const source = path.resolve(
    'docs/usecases-seeds',
    child.scope,
    child.layer,
    child.domain,
    `${child.doc_id}.md`,
  );
  const checkoutRoot = path.resolve(options.checkoutRoot ?? 'repos');
  const repoDir = path.resolve(checkoutRoot, repoMeta.checkout ?? repoMeta.key);
  const relativeTarget =
    child.path ??
    path.posix.join(
      repoMeta.usecase_seed_root ?? 'docs/use_cases/_from_hub',
      options.scnId ?? 'UNKNOWN_SCN',
      `${child.doc_id}.md`,
    );
  const target = path.join(repoDir, relativeTarget);

  await fs.access(source);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.copyFile(source, target);
  return target;
}

async function computeFingerprint(children, seedsRoot = 'docs/usecases-seeds') {
  const hash = createHash('sha256');
  const sorted = [...children].sort((a, b) => a.doc_id.localeCompare(b.doc_id));
  for (const child of sorted) {
    const seedPath = path.join(
      seedsRoot,
      child.scope,
      child.layer,
      child.domain,
      `${child.doc_id}.md`,
    );
    hash.update(seedPath);
    try {
      const contents = await fs.readFile(path.resolve(seedPath));
      hash.update(contents);
    } catch (error) {
      hash.update(`missing:${seedPath}`);
    }
  }
  return hash.digest('hex');
}

async function ensureGitContext(repoDir, branchName, dryRun) {
  if (dryRun) return;
  await checkoutBranch(branchName, { cwd: repoDir }).catch(async () => {
    await runGit(['checkout', '-b', branchName], { cwd: repoDir });
  });
}

async function finalizeGit(repoDir, message, dryRun) {
  if (dryRun) return { skipped: true };
  const commitResult = await commitAll(message, { cwd: repoDir });
  return commitResult;
}

async function writeReport(reportDir, workflowId, summary, record) {
  const filePath = path.join(reportDir, `${workflowId.replace(/[:/]/g, '_')}.json`);
  await writeWorkflowSummary(filePath, summary);
  await appendWorkflowRecord(filePath, record);
  return filePath;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.scnId) {
    console.error('Missing --scn-id');
    process.exitCode = 1;
    return;
  }

  const [docmap, reposMeta] = await Promise.all([loadDocmap(args.docmap), loadRepos(args.repos)]);
  const scenario = (docmap.scenarios ?? []).find((entry) => entry.scn_id === args.scnId);
  if (!scenario) {
    console.error(`Scenario ${args.scnId} not found in docmap.`);
    process.exitCode = 1;
    return;
  }

  const filteredChildren = filterChildren(scenario.children ?? [], {
    scopes: args.scopes,
    layers: args.layers,
    domains: args.domains,
  });

  if (!filteredChildren.length) {
    console.error('No matching docmap children after applying filters.');
    process.exitCode = 1;
    return;
  }

  const fingerprint = await computeFingerprint(filteredChildren);
  const workflowId = `usecases:${args.scnId}`;

  let run;
  try {
    if (args.resumeToken) {
      run = await getRunByToken({
        workflowId,
        resumeToken: args.resumeToken,
        stateDir: args.stateDir,
      });
      if (!run) throw new Error(`Unknown resume token ${args.resumeToken}`);
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

  const repoIndex = new Map((reposMeta.repos ?? []).map((repo) => [repo.key, repo]));
  const grouped = new Map();
  for (const child of filteredChildren) {
    const repoKey = child.repo;
    const repoMeta = repoIndex.get(repoKey);
    if (!repoMeta) {
      console.warn(`Skipping child ${child.doc_id}: repo "${repoKey}" missing in repos.yaml`);
      continue;
    }
    if (!grouped.has(repoKey)) grouped.set(repoKey, { repoMeta, children: [] });
    grouped.get(repoKey).children.push(child);
  }

  if (!grouped.size) {
    console.error('No downstream repositories matched the selection.');
    process.exitCode = 1;
    return;
  }

  await fs.mkdir(args.reportDir, { recursive: true });

  const resumeToken = run?.resumeToken ?? generateResumeToken();
  const records = [];

  for (const [repoKey, { repoMeta, children }] of grouped.entries()) {
    const repoDir = path.resolve(args.checkoutRoot, repoMeta.checkout ?? repoMeta.key);
    const branchName = buildBranchName('docs/hub', args.scnId);
    const filesChanged = [];

    let recordStatus = 'Success';
    let errorMessage = null;

    try {
      await ensureGitContext(repoDir, branchName, args.dryRun);

      for (const child of children) {
        const target = await copyUsecaseSeed(child, repoMeta, {
          checkoutRoot: args.checkoutRoot,
          scnId: args.scnId,
        });
        filesChanged.push(path.relative(repoDir, target));
      }

      const commitResult = await finalizeGit(
        repoDir,
        `docs: sync usecase seeds for ${args.scnId}`,
        args.dryRun,
      );

      let prUrl = null;
      if (!args.dryRun) {
        prUrl = (
          await createPullRequest({
            repo: repoMeta,
            title: `docs: sync usecase seeds for ${args.scnId}`,
            body: `Automated distribution of usecase templates for **${args.scnId}**.`,
            head: branchName,
            base: repoMeta.default_branch ?? 'main',
            reviewers: repoMeta.default_reviewers ?? [],
          })
        ).url;
      } else {
        prUrl = `dry-run://${repoMeta.slug ?? repoMeta.key}/${branchName}`;
      }

      records.push({
        repoKey,
        branchName,
        status: recordStatus,
        filesChanged,
        prUrl,
        resumeToken,
        commitSkipped: commitResult?.skipped ?? false,
      });

      if (!args.quiet) {
        console.log(
          `[${repoKey}] ${filesChanged.length} files prepared on branch ${branchName} (${args.dryRun ? 'dry-run' : 'ready for PR'})`,
        );
      }
    } catch (error) {
      recordStatus = 'Failed';
      errorMessage = error.message;
      records.push({
        repoKey,
        branchName,
        status: recordStatus,
        filesChanged,
        error: errorMessage,
        resumeToken,
      });
      console.error(`[${repoKey}] ${errorMessage}`);
    }
  }

  const reportPath = await writeReport(
    args.reportDir,
    workflowId,
    {
      workflowId,
      scenario: args.scnId,
      status: records.some((r) => r.status === 'Failed') ? 'Failed' : 'Completed',
      generatedAt: new Date().toISOString(),
    },
    {
      workflowId,
      status: records.some((r) => r.status === 'Failed') ? 'Failed' : 'Completed',
      resumeToken,
      records,
    },
  );

  await updateRunStatus({
    workflowId,
    resumeToken,
    stateDir: args.stateDir,
    status: records.some((r) => r.status === 'Failed') ? 'failed' : 'completed',
    metadata: { reportPath },
  });

  const workflowFailed = records.some((r) => r.status === 'Failed');
  if (!args.dryRun && args.syncWebsite && !workflowFailed) {
    try {
      const { syncScenarioPages } = await import('../site/sync-scenario-pages.mjs');
      await syncScenarioPages({
        scnId: args.scnId,
        locales: ['zh', 'en'],
        force: true,
        withSeeds: true,
      });
      if (!args.quiet) {
        console.log(`[site] synced website pages for ${args.scnId}`);
      }
    } catch (error) {
      console.error(`[site] failed to sync website pages: ${error.message}`);
    }
  }

  if (!args.quiet) {
    console.log(`[REPORT] ${reportPath}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
