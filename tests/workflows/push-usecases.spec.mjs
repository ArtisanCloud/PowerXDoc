import test from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import { promises as fs } from 'node:fs';
import { spawn } from 'node:child_process';

const CLI_PATH = path.resolve('scripts/publish/push-usecases.mjs');

async function createTempWorkspace() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'px-usecases-'));
  const checkoutRoot = path.join(root, 'repos');
  await fs.mkdir(checkoutRoot, { recursive: true });
  const repos = ['powerx', 'powerx-plugin', 'powerx-marketplace'];
  for (const name of repos) {
    const repoDir = path.join(checkoutRoot, name);
    await fs.mkdir(path.join(repoDir, 'docs/use_cases/_from_hub'), { recursive: true });
  }
  await fs.mkdir(path.join(root, 'docs/usecases-seeds/powerx/service/publish'), { recursive: true });
  await fs.writeFile(
    path.join(root, 'docs/usecases-seeds/powerx/service/publish/PX-PUBLISH-001.md'),
    '# Usecase seed\n',
  );

  await fs.mkdir(path.join(root, 'docs/_data'), { recursive: true });
  await fs.writeFile(
    path.join(root, 'docs/_data/docmap.yaml'),
    `scenarios:\n  - scn_id: SCN-PUBLISH-001\n    children:\n      - doc_id: PX-PUBLISH-001\n        scope: powerx\n        layer: service\n        domain: publish\n        repo: powerx\n        path: docs/use_cases/_from_hub/SCN-PUBLISH-001/PX-PUBLISH-001.md\n`,
  );
  await fs.writeFile(
    path.join(root, 'docs/_data/repos.yaml'),
    `repos:\n  - key: powerx\n    slug: ArtisanCloud/PowerX\n    checkout: powerx\n    default_branch: main\n    usecase_seed_root: docs/use_cases/_from_hub\n`,
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

test('push-usecases copies seed and creates report', async () => {
  const root = await createTempWorkspace();
  const result = await runCli(root, [
    '--scn-id',
    'SCN-PUBLISH-001',
    '--docmap',
    'docs/_data/docmap.yaml',
    '--repos',
    'docs/_data/repos.yaml',
    '--checkout-root',
    'repos',
    '--report-dir',
    'reports/usecases',
    '--state-dir',
    'reports/_state',
    '--dry-run',
    '--quiet',
  ]);
  assert.equal(result.code, 0, result.stderr);

  const target = path.join(
    root,
    'repos/powerx/docs/use_cases/_from_hub/SCN-PUBLISH-001/PX-PUBLISH-001.md',
  );
  const copied = await fs.readFile(target, 'utf8');
  assert.match(copied, /Usecase seed/);

  const reportPath = path.join(root, 'reports/usecases/usecases_SCN-PUBLISH-001.json');
  const report = JSON.parse(await fs.readFile(reportPath, 'utf8'));
  assert.equal(report.summary.status, 'Completed');
  assert.equal(report.records[0].records[0].repoKey, 'powerx');

  const rerun = await runCli(root, [
    '--scn-id',
    'SCN-PUBLISH-001',
    '--docmap',
    'docs/_data/docmap.yaml',
    '--repos',
    'docs/_data/repos.yaml',
    '--checkout-root',
    'repos',
    '--report-dir',
    'reports/usecases',
    '--state-dir',
    'reports/_state',
    '--dry-run',
    '--quiet',
  ]);
  assert.notEqual(rerun.code, 0);
  assert.match(rerun.stderr, /already exists/);
});
