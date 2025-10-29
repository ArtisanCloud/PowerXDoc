#!/usr/bin/env node
import path from 'node:path';
import process from 'node:process';
import fs from 'node:fs';
import { spawn } from 'node:child_process';
import { loadRepos } from '../lib/docmap-utils.mjs';

const rootDir = path.resolve(process.cwd(), '.');
const reposArg = process.argv.slice(2).find(arg => arg.startsWith('--repos='));
const checkoutArg = process.argv.slice(2).find(arg => arg.startsWith('--checkout-root='));
const checkoutRoot = checkoutArg ? checkoutArg.split('=')[1] : path.join(rootDir, 'repos');
const reposFile = reposArg ? reposArg.split('=')[1] : path.join(rootDir, 'docs/_data/repos.yaml');

async function pushRepos() {
  const meta = await loadRepos(reposFile);
  const repos = meta.repos ?? [];
  if (!repos.length) {
    console.warn('[warn] no repositories found in', reposFile);
    return;
  }

  for (const repo of repos) {
    const dirName = repo.checkout ?? repo.key;
    const repoPath = path.resolve(checkoutRoot, dirName);
    if (!fs.existsSync(path.join(repoPath, '.git'))) {
      console.warn(`[skip] ${dirName} (missing checkout)`);
      continue;
    }
    await runGit(repoPath, ['push']);
  }
}

function runGit(cwd, args) {
  return new Promise((resolve, reject) => {
    console.log(`[push] ${path.basename(cwd)} → git ${args.join(' ')}`);
    const child = spawn('git', args, { cwd, stdio: 'inherit' });
    child.on('error', reject);
    child.on('exit', code => {
      if (code === 0) resolve();
      else reject(new Error(`git ${args.join(' ')} failed with code ${code}`));
    });
  });
}

pushRepos().catch(error => {
  console.error('[error]', error.message);
  process.exitCode = 1;
});
