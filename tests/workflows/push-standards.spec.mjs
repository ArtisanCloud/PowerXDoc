import test from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import { promises as fs } from 'node:fs';
import { spawn } from 'node:child_process';

const CLI_PATH = path.resolve('scripts/publish/push-standards.mjs');

async function createTempWorkspace() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'px-standards-'));
  await fs.mkdir(path.join(root, 'docs/standards/_shared'), { recursive: true });
  await fs.mkdir(path.join(root, 'docs/standards/powerx-backend'), { recursive: true });
  await fs.mkdir(path.join(root, 'docs/standards/powerx-marketplace'), { recursive: true });
  await fs.writeFile(path.join(root, 'docs/standards/README.md'), '# Standards\n');
  await fs.writeFile(path.join(root, 'docs/standards/_shared/common.md'), '# Common\n');
  await fs.writeFile(path.join(root, 'docs/standards/powerx-backend/backend.md'), '# Backend\n');
  await fs.writeFile(path.join(root, 'docs/standards/powerx-marketplace/market.md'), '# Market\n');

  const checkoutRoot = path.join(root, 'repos');
  await fs.mkdir(path.join(checkoutRoot, 'powerx-backend/docs/standards'), { recursive: true });
  await fs.mkdir(path.join(checkoutRoot, 'powerx-marketplace/docs/standards'), { recursive: true });

  await fs.mkdir(path.join(root, 'docs/_data'), { recursive: true });
  await fs.writeFile(
    path.join(root, 'docs/_data/repos.yaml'),
    `repos:\n  - key: powerx-backend\n    slug: ArtisanCloud/PowerX\n    checkout: powerx-backend\n    default_branch: main\n    scope: powerx-backend\n    standards_root: docs/standards\n  - key: powerx-marketplace\n    slug: ArtisanCloud/PowerXMarketplace\n    checkout: powerx-marketplace\n    default_branch: main\n    scope: powerx-marketplace\n    standards_root: docs/standards\n`,
  );
  await fs.writeFile(
    path.join(root, 'docs/_data/standards-map.yaml'),
    `defaults:\n  include:\n    - '*.md'\n    - _shared/**\nscopes:\n  powerx-backend:\n    include:\n      - powerx-backend/**\n  powerx-marketplace:\n    include:\n      - powerx-marketplace/**\n`,
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
    '--repo',
    'powerx-backend',
    '--repo',
    'powerx-marketplace',
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

  const backendShared = await fs.readFile(
    path.join(root, 'repos/powerx-backend/docs/standards/_shared/common.md'),
    'utf8',
  );
  assert.match(backendShared, /Common/);

  const backendSpecific = await fs.readFile(
    path.join(root, 'repos/powerx-backend/docs/standards/powerx-backend/backend.md'),
    'utf8',
  );
  assert.match(backendSpecific, /Backend/);

  const marketplaceSpecific = await fs.readFile(
    path.join(root, 'repos/powerx-marketplace/docs/standards/powerx-marketplace/market.md'),
    'utf8',
  );
  assert.match(marketplaceSpecific, /Market/);

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

test('push-standards supports include filter', async () => {
  const root = await createTempWorkspace();
  await fs.writeFile(path.join(root, 'docs/standards/shared.md'), '# Shared\n');

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
    '--include',
    'README.md',
  ]);
  assert.equal(result.code, 0, result.stderr);

  const included = await fs.readFile(
    path.join(root, 'repos/powerx-backend/docs/standards/README.md'),
    'utf8',
  );
  assert.match(included, /Standards/);

  const includedMarketplace = await fs.readFile(
    path.join(root, 'repos/powerx-marketplace/docs/standards/README.md'),
    'utf8',
  );
  assert.match(includedMarketplace, /Standards/);

  const sharedExists = await fs
    .stat(path.join(root, 'repos/powerx-backend/docs/standards/shared.md'))
    .then(() => true)
    .catch(() => false);
  assert.equal(sharedExists, false);

  const backendSpecificExists = await fs
    .stat(path.join(root, 'repos/powerx-backend/docs/standards/powerx-backend/backend.md'))
    .then(() => true)
    .catch(() => false);
  assert.equal(backendSpecificExists, false);

  const marketplaceSpecificExists = await fs
    .stat(
      path.join(root, 'repos/powerx-marketplace/docs/standards/powerx-marketplace/market.md'),
    )
    .then(() => true)
    .catch(() => false);
  assert.equal(marketplaceSpecificExists, false);
});

test('push-standards auto-detects repos from include list', async () => {
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
    '--include',
    'powerx-marketplace/market.md',
  ]);
  assert.equal(result.code, 0, result.stderr);

  const copied = await fs.readFile(
    path.join(root, 'repos/powerx-marketplace/docs/standards/powerx-marketplace/market.md'),
    'utf8',
  );
  assert.match(copied, /Market/);

  const backendExists = await fs
    .stat(path.join(root, 'repos/powerx-backend/docs/standards/powerx-backend/backend.md'))
    .then(() => true)
    .catch(() => false);
  assert.equal(backendExists, false);
});

test('push-standards respects standards map by scope', async () => {
  const root = await createTempWorkspace();
  await fs.writeFile(
    path.join(root, 'docs/_data/standards-map.yaml'),
    `defaults:\n  include:\n    - README.md\n    - _shared/**\nscopes:\n  powerx:\n    include:\n      - powerx/**\n  powerx-marketplace:\n    include:\n      - powerx-marketplace/**\n`,
  );

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

  const shared = await fs.readFile(
    path.join(root, 'repos/powerx-backend/docs/standards/_shared/common.md'),
    'utf8',
  );
  assert.match(shared, /Common/);

  const readme = await fs.readFile(
    path.join(root, 'repos/powerx-backend/docs/standards/README.md'),
    'utf8',
  );
  assert.match(readme, /Standards/);

  const backend = await fs.readFile(
    path.join(root, 'repos/powerx-backend/docs/standards/powerx-backend/backend.md'),
    'utf8',
  );
  assert.match(backend, /Backend/);

  const marketplaceExists = await fs
    .stat(path.join(root, 'repos/powerx-backend/docs/standards/powerx-marketplace/market.md'))
    .then(() => true)
    .catch(() => false);
  assert.equal(marketplaceExists, false);

  const marketplaceFile = await fs.readFile(
    path.join(root, 'repos/powerx-marketplace/docs/standards/powerx-marketplace/market.md'),
    'utf8',
  );
  assert.match(marketplaceFile, /Market/);
});
