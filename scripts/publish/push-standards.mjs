#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { createHash } from 'node:crypto';

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
  console.log(`Usage: npm run publish:standards -- [options]

Options:
  --repos <file>             Path to repos.yaml (default: docs/_data/repos.yaml)
  --checkout-root <dir>      Base directory containing downstream checkouts (default: repos)
  --report-dir <dir>         Directory for workflow reports (default: reports/standards)
  --state-dir <dir>          Directory for workflow state ledger (default: reports/_state)
  --dry-run                  Skip git commit/push while still copying files
  --resume-token <token>     Resume a previously failed run
  --quiet                    Suppress informational logs
  --scope <value>            Filter repositories by scope (repeatable)
`);
}

function collectListArg(target, value) {
  if (!value) return target;
  const tokens = value.split(',').map((item) => item.trim()).filter(Boolean);
  return target.concat(tokens);
}

function parseArgs(argv) {
  const args = {
    repos: 'docs/_data/repos.yaml',
    checkoutRoot: 'repos',
    reportDir: 'reports/standards',
    stateDir: DEFAULT_STATE_DIR,
    dryRun: false,
    quiet: false,
    scopes: [],
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    switch (token) {
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

function computeFingerprint(sourceDir) {
  const hash = createHash('sha256');
  const walk = async (dir) => {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const entryPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(entryPath);
      } else if (entry.isFile()) {
        hash.update(entryPath);
        const content = await fs.readFile(entryPath);
        hash.update(content);
      }
    }
  };
  return walk(sourceDir).then(() => hash.digest('hex'));
}

async function copyStandards(sourceDir, targetDir) {
  const entries = await fs.readdir(sourceDir, { withFileTypes: true });
  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);
    if (entry.isDirectory()) {
      await fs.mkdir(targetPath, { recursive: true });
      await copyStandards(sourcePath, targetPath);
    } else if (entry.isFile()) {
      await fs.mkdir(path.dirname(targetPath), { recursive: true });
      await fs.copyFile(sourcePath, targetPath);
    }
  }
}

async function ensureGitContext(repoDir, branchName, dryRun) {
  if (dryRun) return;
  await checkoutBranch(branchName, { cwd: repoDir }).catch(async () => {
    await runGit(['checkout', '-b', branchName], { cwd: repoDir });
  });
}

async function finalizeGit(repoDir, message, dryRun) {
  if (dryRun) return { skipped: true };
  return commitAll(message, { cwd: repoDir });
}

async function writeReport(reportDir, workflowId, summary, record) {
  const filePath = path.join(reportDir, `${workflowId.replace(/[:/]/g, '_')}.json`);
  await writeWorkflowSummary(filePath, summary);
  await appendWorkflowRecord(filePath, record);
  return filePath;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  await fs.mkdir(args.reportDir, { recursive: true });

  const reposMeta = await loadRepos(args.repos);
  const repositories = (reposMeta.repos ?? []).filter((repo) => {
    if (!args.scopes.length) return true;
    return repo.scope && args.scopes.includes(repo.scope);
  });

  if (!repositories.length) {
    console.error('No repositories matched the filters provided.');
    process.exitCode = 1;
    return;
  }

  const fingerprint = await computeFingerprint(path.resolve('docs/standards'));
  const workflowId = 'standards:distribution';

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

  const resumeToken = run?.resumeToken ?? generateResumeToken();
  const records = [];

  for (const repoMeta of repositories) {
    const repoDir = path.resolve(args.checkoutRoot, repoMeta.checkout ?? repoMeta.key);
    const branchName = buildBranchName('docs/hub/standards', repoMeta.key);
    const filesChanged = [];
    let status = 'Success';
    let errorMessage = null;

    try {
      const targetDir = path.join(
        repoDir,
        repoMeta.standards_root ?? 'docs/standards',
      );
      await ensureGitContext(repoDir, branchName, args.dryRun);
      await copyStandards(path.resolve('docs/standards'), targetDir);
      filesChanged.push('docs/standards/**');

      const commitResult = await finalizeGit(
        repoDir,
        'docs: sync standards from PowerXDocs',
        args.dryRun,
      );

      let prUrl = null;
      if (!args.dryRun) {
        prUrl = (
          await createPullRequest({
            repo: repoMeta,
            title: 'docs: sync standards from PowerXDocs',
            body: 'Automated distribution of standards from PowerXDocs hub.',
            head: branchName,
            base: repoMeta.default_branch ?? 'main',
            reviewers: repoMeta.default_reviewers ?? [],
          })
        ).url;
      } else {
        prUrl = `dry-run://${repoMeta.slug ?? repoMeta.key}/${branchName}`;
      }

      records.push({
        repoKey: repoMeta.key,
        branchName,
        status,
        filesChanged,
        prUrl,
        resumeToken,
        commitSkipped: commitResult?.skipped ?? false,
      });

      if (!args.quiet) {
        console.log(
          `[${repoMeta.key}] Standards copied to ${targetDir} (${args.dryRun ? 'dry-run' : 'ready for PR'})`,
        );
      }
    } catch (error) {
      status = 'Failed';
      errorMessage = error.message;
      records.push({
        repoKey: repoMeta.key,
        branchName,
        status,
        filesChanged,
        error: errorMessage,
        resumeToken,
      });
      console.error(`[${repoMeta.key}] ${errorMessage}`);
    }
  }

  const reportPath = await writeReport(
    args.reportDir,
    workflowId,
    {
      workflowId,
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

  if (!args.quiet) {
    console.log(`[REPORT] ${reportPath}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
