#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { createHash } from 'node:crypto';

import { loadRepos, loadStandardsMap } from '../lib/docmap-utils.mjs';
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
  --repo <key>               Limit to specific repository (repeatable)
  --standards-map <file>     Path to standards map (default: docs/_data/standards-map.yaml)
  --checkout-root <dir>      Base directory containing downstream checkouts (default: repos)
  --report-dir <dir>         Directory for workflow reports (default: reports/standards)
  --state-dir <dir>          Directory for workflow state ledger (default: reports/_state)
  --dry-run                  Skip git commit/push while still copying files
  --resume-token <token>     Resume a previously failed run
  --quiet                    Suppress informational logs
  --scope <value>            Filter repositories by scope (repeatable)
  --include <glob>           Include only matching files/dirs (repeatable; relative to docs/standards/)
  --exclude <glob>           Exclude matching files/dirs (repeatable; relative to docs/standards/)
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
    standardsMap: 'docs/_data/standards-map.yaml',
    checkoutRoot: 'repos',
    reportDir: 'reports/standards',
    stateDir: DEFAULT_STATE_DIR,
    dryRun: false,
    quiet: false,
    scopes: [],
    reposFilter: [],
    includes: [],
    excludes: [],
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    switch (token) {
      case '--repos':
        args.repos = argv[++i];
        break;
      case '--repo':
        args.reposFilter = collectListArg(args.reposFilter, argv[++i]);
        break;
      case '--standards-map':
        args.standardsMap = argv[++i];
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
      case '--include':
        args.includes = collectListArg(args.includes, argv[++i]);
        break;
      case '--exclude':
        args.excludes = collectListArg(args.excludes, argv[++i]);
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

async function copySelectedFiles(sourceDir, targetDir, files) {
  for (const relative of files) {
    const sourcePath = path.join(sourceDir, relative);
    const targetPath = path.join(targetDir, relative);
    await fs.mkdir(path.dirname(targetPath), { recursive: true });
    await fs.copyFile(sourcePath, targetPath);
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

function toPosix(filepath) {
  return filepath.split(path.sep).join('/');
}

function normalizePattern(pattern) {
  if (!pattern) return '';
  let normalized = pattern.trim().replace(/\\/g, '/');
  normalized = normalized.replace(/^\.?\/*/, '');
  if (normalized.startsWith('docs/standards/')) {
    normalized = normalized.slice('docs/standards/'.length);
  }
  return normalized.replace(/^\/+/, '');
}

function compilePatterns(patterns) {
  return patterns
    .map(normalizePattern)
    .filter(Boolean)
    .map((pattern) => {
      const hasWildcard = /[*?]/.test(pattern);
      if (!hasWildcard) {
        const prefix = pattern.endsWith('/') ? pattern.slice(0, -1) : pattern;
        return { type: 'prefix', prefix };
      }
      return { type: 'glob', regex: globToRegExp(pattern) };
    });
}

function globToRegExp(glob) {
  let regex = '^';
  for (let i = 0; i < glob.length; i += 1) {
    const char = glob[i];
    if (char === '*') {
      if (glob[i + 1] === '*') {
        const hasSlash = glob[i + 2] === '/';
        regex += '.*';
        if (hasSlash) i += 1;
        i += 1;
      } else {
        regex += '[^/]*';
      }
    } else if (char === '?') {
      regex += '[^/]';
    } else if ('\\.[]{}()+-^$|'.includes(char)) {
      regex += `\\${char}`;
    } else {
      regex += char;
    }
  }
  regex += '$';
  return new RegExp(regex);
}

function createMatcher(patterns) {
  if (!patterns.length) return () => false;
  return (file) =>
    patterns.some((pattern) => {
      if (pattern.type === 'prefix') {
        if (pattern.prefix === '') return true;
        return file === pattern.prefix || file.startsWith(`${pattern.prefix}/`);
      }
      return pattern.regex.test(file);
    });
}

async function listFilesRelative(rootDir, currentDir = rootDir, acc = []) {
  const entries = await fs.readdir(currentDir, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = path.join(currentDir, entry.name);
    if (entry.isDirectory()) {
      await listFilesRelative(rootDir, entryPath, acc);
    } else if (entry.isFile()) {
      const relative = toPosix(path.relative(rootDir, entryPath));
      acc.push(relative);
    }
  }
  return acc;
}

async function resolveFilesToSync(sourceDir, includePatterns, excludePatterns, options = {}) {
  const allFiles = await listFilesRelative(sourceDir);
  const includeMatchers = compilePatterns(includePatterns);
  const excludeMatchers = compilePatterns(excludePatterns);
  let selected = allFiles;
  const { allowEmpty = false } = options;

  if (includeMatchers.length) {
    const matchInclude = createMatcher(includeMatchers);
    selected = selected.filter((file) => matchInclude(file));
    if (!selected.length) {
      if (allowEmpty) return [];
      throw new Error(
        `No files matched include patterns: ${includePatterns.join(', ')}`,
      );
    }
  }

  if (excludeMatchers.length) {
    const matchExclude = createMatcher(excludeMatchers);
    selected = selected.filter((file) => !matchExclude(file));
  }

  if (!selected.length) {
    if (allowEmpty) return [];
    throw new Error('No files selected for synchronization after applying filters.');
  }

  return selected;
}

function buildPatternConfig(repoMeta, args, standardsMap) {
  const includeSet = new Set();
  const excludeSet = new Set();

  const addAll = (set, patterns = []) => {
    for (const pattern of patterns) {
      if (pattern && typeof pattern === 'string') {
        set.add(pattern);
      }
    }
  };

  if (args.includes.length) {
    addAll(includeSet, args.includes);
  } else {
    addAll(includeSet, standardsMap.defaults.include);
    if (repoMeta.scope && standardsMap.scopes[repoMeta.scope]) {
      addAll(includeSet, standardsMap.scopes[repoMeta.scope].include);
    }
    if (standardsMap.repos[repoMeta.key]) {
      addAll(includeSet, standardsMap.repos[repoMeta.key].include);
    }
    if (!includeSet.size) {
      includeSet.add('**');
    }
  }

  addAll(excludeSet, standardsMap.defaults.exclude);
  if (repoMeta.scope && standardsMap.scopes[repoMeta.scope]) {
    addAll(excludeSet, standardsMap.scopes[repoMeta.scope].exclude);
  }
  if (standardsMap.repos[repoMeta.key]) {
    addAll(excludeSet, standardsMap.repos[repoMeta.key].exclude);
  }
  addAll(excludeSet, args.excludes);

  return {
    includes: Array.from(includeSet),
    excludes: Array.from(excludeSet),
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  await fs.mkdir(args.reportDir, { recursive: true });

  const reposMeta = await loadRepos(args.repos);
  const standardsMap = await loadStandardsMap(args.standardsMap);
  const repositories = (reposMeta.repos ?? []).filter((repo) => {
    if (args.reposFilter.length && !args.reposFilter.includes(repo.key)) {
      return false;
    }
    if (args.scopes.length) {
      return repo.scope && args.scopes.includes(repo.scope);
    }
    return true;
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
      const repoExplicit =
        (args.reposFilter.length && args.reposFilter.includes(repoMeta.key)) ||
        (!args.reposFilter.length &&
          args.scopes.length &&
          repoMeta.scope &&
          args.scopes.includes(repoMeta.scope)) ||
        (!args.reposFilter.length && !args.scopes.length && args.includes.length === 0);

      const patternConfig = buildPatternConfig(repoMeta, args, standardsMap);
      const filesToSync = await resolveFilesToSync(
        path.resolve('docs/standards'),
        patternConfig.includes,
        patternConfig.excludes,
        { allowEmpty: !repoExplicit && args.includes.length > 0 },
      );

      if (!filesToSync.length) {
        if (!args.quiet) {
          console.log(`[${repoMeta.key}] No files matched filters; skipping`);
        }
        continue;
      }

      const targetDir = path.join(
        repoDir,
        repoMeta.standards_root ?? 'docs/standards',
      );
      await ensureGitContext(repoDir, branchName, args.dryRun);
      await copySelectedFiles(path.resolve('docs/standards'), targetDir, filesToSync);
      filesChanged.push(
        ...filesToSync.map((file) => `docs/standards/${file}`),
      );

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
    console.log(`[WORKFLOW] resumeToken: ${resumeToken}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
