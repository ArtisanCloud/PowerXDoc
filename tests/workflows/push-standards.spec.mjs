import test from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import { promises as fs } from 'node:fs';
import { spawn } from 'node:child_process';

const CLI_PATH = path.resolve('scripts/publish/push-standards.mjs');

async function createTempWorkspace() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'px-standards-'));
  await fs.mkdir(path.join(root, 'docs/standards'), { recursive: true });
  await fs.writeFile(path.join(root, 'docs/standards/README.md'), '# Standards\n');

  const checkoutRoot = path.join(root, 'repos');
  await fs.mkdir(path.join(checkoutRoot, 'powerx-backend/docs/standards'), { recursive: true });

  await fs.mkdir(path.join(root, 'docs/_data'), { recursive: true });
  await fs.writeFile(
    path.join(root, 'docs/_data/repos.yaml'),
    `repos:\n  - key: powerx-backend\n    slug: ArtisanCloud/PowerX\n    checkout: powerx-backend\n    default_branch: main\n    standards_root: docs/standards\n`,
  );
  return root;
}

function runCli(cwd, args) {
  return new Promise((resolve) => {
    const child = spawn('node', [CLI_PATH, ...args], {
      cwd,
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', (chunk) => {
      stdout += chunk;
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk;
    });
    child.on('close', (code) => resolve({ code, stdout, stderr }));
  });
}

test('push-standards copies standards and writes report', async () => {
  const root = await createTempWorkspace();
  const result = await runCli(root, [
    '--repos',
    'docs/_data/repos.yaml',
    '--checkout-root',
    'repos',
    '--report-dir',
    'reports/standards',
    '--state-dir',
    'reports/_state',
    '--dry-run',
    '--quiet',
  ]);
  assert.equal(result.code, 0, result.stderr);

  const copied = await fs.readFile(
    path.join(root, 'repos/powerx-backend/docs/standards/README.md'),
    'utf8',
  );
  assert.match(copied, /Standards/);

  const reportPath = path.join(root, 'reports/standards/standards_distribution.json');
  const report = JSON.parse(await fs.readFile(reportPath, 'utf8'));
  assert.equal(report.summary.status, 'Completed');

  const rerun = await runCli(root, [
    '--repos',
    'docs/_data/repos.yaml',
    '--checkout-root',
    'repos',
    '--report-dir',
    'reports/standards',
    '--state-dir',
    'reports/_state',
    '--dry-run',
    '--quiet',
  ]);
  assert.notEqual(rerun.code, 0);
  assert.match(rerun.stderr, /already exists/);
});
