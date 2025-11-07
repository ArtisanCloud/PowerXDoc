#!/usr/bin/env node
import path from 'node:path';
import process from 'node:process';
import { spawn } from 'node:child_process';
import { promises as fs } from 'node:fs';

import { loadDocmap } from '../lib/docmap-utils.mjs';

function collectArg(list, value) {
  if (!value) return list;
  const parts = value.split(',').map(item => item.trim()).filter(Boolean);
  return list.concat(parts);
}

function parseArgs(argv) {
  const args = {
    docmap: 'docs/_data/docmap.yaml',
    stateDir: 'reports/_state',
    repos: 'docs/_data/repos.yaml',
    checkoutRoot: 'repos',
    scnIds: [],
    dryRun: false,
    quiet: false,
    useDefaultBranch: true,
    resetState: true,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    switch (token) {
      case '--docmap':
        args.docmap = argv[++i];
        break;
      case '--state-dir':
        args.stateDir = argv[++i];
        break;
      case '--repos':
        args.repos = argv[++i];
        break;
      case '--checkout-root':
        args.checkoutRoot = argv[++i];
        break;
      case '--scn-id':
        args.scnIds = collectArg(args.scnIds, argv[++i]);
        break;
      case '--dry-run':
        args.dryRun = true;
        break;
      case '--no-use-default-branch':
        args.useDefaultBranch = false;
        break;
      case '--no-reset-state':
        args.resetState = false;
        break;
      case '--quiet':
        args.quiet = true;
        break;
      case '--help':
      case '-h':
        console.log(`Usage: node scripts/publish/publish-usecases-batch.mjs [options]

Options:
  --docmap <file>             docmap.yaml path (default: docs/_data/docmap.yaml)
  --state-dir <dir>           workflow state directory (default: reports/_state)
  --repos <file>              repos.yaml path (default: docs/_data/repos.yaml)
  --checkout-root <dir>       downstream checkout root (default: repos)
  --scn-id <value>[,<value>]  limit to specific SCN IDs (repeatable)
  --dry-run                   propagate dry-run flag to push-usecases
  --no-use-default-branch     skip committing on default branch (keep PR workflow)
  --no-reset-state            keep existing workflow state records
  --quiet                     suppress per-repo info logs
`);
        process.exit(0);
        break;
      default:
        break;
    }
  }

  return args;
}

async function removeState(stateDir, scnId) {
  const filePath = path.resolve(stateDir, `usecases:${scnId}.json`);
  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}

async function runPushUsecases(options) {
  const {
    docmap,
    stateDir,
    repos,
    checkoutRoot,
    scnId,
    dryRun,
    quiet,
    useDefaultBranch,
  } = options;

  const scriptPath = path.resolve('scripts/publish/push-usecases.mjs');
  const args = [
    scriptPath,
    '--scn-id',
    scnId,
    '--docmap',
    docmap,
    '--state-dir',
    stateDir,
    '--repos',
    repos,
    '--checkout-root',
    checkoutRoot,
  ];

  if (dryRun) args.push('--dry-run');
  if (quiet) args.push('--quiet');
  if (useDefaultBranch) args.push('--use-default-branch');

  await new Promise((resolve, reject) => {
    const child = spawn('node', args, { stdio: 'inherit' });
    child.on('error', reject);
    child.on('exit', code => {
      if (code === 0) resolve();
      else reject(new Error(`publish:usecases failed for ${scnId} (exit ${code})`));
    });
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const docmap = await loadDocmap(args.docmap);
  let scnIds = args.scnIds;

  if (!scnIds.length) {
    scnIds = (docmap.scenarios ?? []).map(entry => entry.scn_id);
  }

  for (const scnId of scnIds) {
    if (args.resetState) {
      await removeState(args.stateDir, scnId);
    }
    console.log(`\n[publish] Syncing usecases for ${scnId}${args.dryRun ? ' (dry-run)' : ''}`);
    await runPushUsecases({
      docmap: args.docmap,
      stateDir: args.stateDir,
      repos: args.repos,
      checkoutRoot: args.checkoutRoot,
      scnId,
      dryRun: args.dryRun,
      quiet: args.quiet,
      useDefaultBranch: args.useDefaultBranch,
    });
  }
}

main().catch(error => {
  console.error('[error]', error.message);
  process.exitCode = 1;
});
