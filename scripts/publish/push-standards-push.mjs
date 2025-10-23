#!/usr/bin/env node
import path from 'node:path';
import process from 'node:process';

import { loadRepos } from '../lib/docmap-utils.mjs';
import { ensureRemote, pushBranch, runGit } from '../lib/git-utils.mjs';

function usage() {
  console.log(`Usage: node scripts/publish/push-standards-push.mjs --repo <key> --branch <name> [options]

Options:
  --repo <key>           Repository key defined in docs/_data/repos.yaml (required)
  --branch <name>        Local branch to push (required)
  --repos <file>         Path to repos.yaml (default: docs/_data/repos.yaml)
  --checkout-root <dir>  Directory containing downstream checkouts (default: repos)
`);
}

function parseArgs(argv) {
  const args = {
    reposPath: 'docs/_data/repos.yaml',
    checkoutRoot: 'repos',
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    switch (token) {
      case '--repo':
        args.repoKey = argv[++i];
        break;
      case '--branch':
        args.branch = argv[++i];
        break;
      case '--repos':
        args.reposPath = argv[++i];
        break;
      case '--checkout-root':
        args.checkoutRoot = argv[++i];
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

  if (!args.repoKey || !args.branch) {
    usage();
    process.exit(1);
  }

  return args;
}

async function ensureCheckoutExists(repoDir) {
  try {
    await runGit(['status', '--short'], { cwd: repoDir });
  } catch (error) {
    throw new Error(`Missing or invalid checkout at ${repoDir}. Run scripts/setup/downstreams.mjs first.`);
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const reposMeta = await loadRepos(args.reposPath);
  const repoMeta = (reposMeta.repos ?? []).find((repo) => repo.key === args.repoKey);

  if (!repoMeta) {
    throw new Error(`Repository key "${args.repoKey}" not found in ${args.reposPath}`);
  }
  if (!repoMeta.git_url) {
    throw new Error(`Repository "${args.repoKey}" is missing git_url in ${args.reposPath}`);
  }

  const checkoutDir = repoMeta.checkout ?? repoMeta.key;
  const repoDir = path.resolve(args.checkoutRoot, checkoutDir);

  await ensureCheckoutExists(repoDir);
  await ensureRemote('origin', repoMeta.git_url, { cwd: repoDir });

  console.log(`[push] ${repoMeta.key} -> ${repoMeta.git_url} (${args.branch})`);
  await pushBranch('origin', args.branch, { cwd: repoDir });
  console.log('[push] completed');
}

main().catch((error) => {
  console.error(`[push] ${error.message}`);
  process.exitCode = 1;
});
