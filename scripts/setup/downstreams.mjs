#!/usr/bin/env node
import path from 'node:path';
import process from 'node:process';
import { spawn } from 'node:child_process';
import { promises as fs } from 'node:fs';

import { loadRepos } from '../lib/docmap-utils.mjs';

function runGit(args, options) {
  return new Promise((resolve, reject) => {
    const child = spawn('git', args, {
      stdio: 'inherit',
      ...options,
    });
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`git ${args.join(' ')} failed with code ${code}`));
      }
    });
  });
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
    scopes: [],
    reposFilter: [],
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
      case '--scope':
        args.scopes = collectListArg(args.scopes, argv[++i]);
        break;
      case '--repo':
        args.reposFilter = collectListArg(args.reposFilter, argv[++i]);
        break;
      case '--help':
      case '-h':
        console.log(`Usage: node scripts/setup/downstreams.mjs [options]

Options:
  --repos <file>         Path to repos.yaml (default: docs/_data/repos.yaml)
  --checkout-root <dir>  Target directory for downstream checkouts (default: repos)
  --scope <value>        Filter by scope (repeatable or comma separated)
  --repo <key>           Filter by repo key (repeatable or comma separated)
`);
        process.exit(0);
        break;
      default:
        break;
    }
  }

  return args;
}

async function ensureDirectory(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function pathExists(target) {
  try {
    await fs.stat(target);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') return false;
    throw error;
  }
}

async function cloneOrUpdate(repoMeta, checkoutRoot) {
  const gitUrl = repoMeta.git_url;
  if (!gitUrl) {
    console.warn(`[skip] ${repoMeta.key}: missing git_url in repos.yaml`);
    return;
  }

  const checkoutDir = repoMeta.checkout || repoMeta.key;
  const target = path.resolve(checkoutRoot, checkoutDir);
  const gitDir = path.join(target, '.git');

  if (!(await pathExists(target))) {
    console.log(`[clone] ${repoMeta.key} -> ${gitUrl}`);
    await runGit(['clone', gitUrl, target]);
  } else if (!(await pathExists(gitDir))) {
    throw new Error(`[error] ${target} exists but is not a git repository`);
  } else {
    console.log(`[skip] ${repoMeta.key} already exists`);
    const currentUrl = await new Promise((resolve, reject) => {
      const child = spawn('git', ['remote', 'get-url', 'origin'], {
        cwd: target,
        stdio: ['ignore', 'pipe', 'inherit'],
      });
      let stdout = '';
      child.stdout.setEncoding('utf8');
      child.stdout.on('data', (chunk) => { stdout += chunk; });
      child.on('exit', (code) => {
        if (code === 0) {
          resolve(stdout.trim());
        } else {
          reject(new Error(`git remote get-url origin failed for ${repoMeta.key}`));
        }
      });
    });
    if (currentUrl && currentUrl !== gitUrl) {
      console.log(`[remote] updating origin for ${repoMeta.key}`);
      await runGit(['remote', 'set-url', 'origin', gitUrl], { cwd: target });
    }
    await runGit(['fetch', '--prune'], { cwd: target });
  }

  if (repoMeta.default_branch) {
    try {
      await runGit(['checkout', repoMeta.default_branch], { cwd: target });
      await runGit(['pull', '--ff-only', 'origin', repoMeta.default_branch], { cwd: target });
    } catch (error) {
      console.warn(`[warn] ${repoMeta.key}: unable to checkout ${repoMeta.default_branch} (${error.message})`);
    }
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const reposMeta = await loadRepos(args.repos);
  const allRepos = (reposMeta.repos ?? []);
  const filtered = allRepos.filter((repo) => {
    if (args.reposFilter.length && !args.reposFilter.includes(repo.key)) {
      return false;
    }
    if (args.scopes.length) {
      return repo.scope && args.scopes.includes(repo.scope);
    }
    return true;
  });

  if (!filtered.length) {
    console.error('No repositories matched the provided filters.');
    process.exit(1);
  }

  const checkoutRoot = path.resolve(args.checkoutRoot);
  await ensureDirectory(checkoutRoot);

  for (const repoMeta of filtered) {
    try {
      await cloneOrUpdate(repoMeta, checkoutRoot);
    } catch (error) {
      console.error(error.message);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
