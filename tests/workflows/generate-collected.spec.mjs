import test from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import { promises as fs } from 'node:fs';
import { spawn } from 'node:child_process';

const CLI_PATH = path.resolve('scripts/publish/generate-collected.mjs');

async function createWorkspace() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'px-collected-'));
  await fs.mkdir(path.join(root, 'docs/website/_collected'), { recursive: true });
  await fs.mkdir(path.join(root, 'docs/_data'), { recursive: true });

  const docmap = `scenarios:\n  - scn_id: SCN-PUBLISH-001\n    title: 插件发布后目录同步\n    children:\n      - doc_id: PX-PUBLISH-001\n        scope: powerx\n        layer: service\n        domain: publish\n        repo: powerx\n        optional: false\n        path: docs/use_cases/_from_hub/service/publish/PX-PUBLISH-001.md\n      - doc_id: PX-ADMIN-PUBLISH-001\n        scope: powerx\n        layer: ui\n        domain: publish\n        repo: powerx\n        optional: true\n        path: docs/use_cases/_from_hub/ui/publish/PX-ADMIN-PUBLISH-001.md\n`;
  await fs.writeFile(path.join(root, 'docs/_data/docmap.yaml'), docmap, 'utf8');

  const repos = `repos:\n  - key: powerx\n    slug: ArtisanCloud/PowerX\n    default_branch: main\n`;
  await fs.writeFile(path.join(root, 'docs/_data/repos.yaml'), repos, 'utf8');

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

test('generate-collected produces stubs and report', async () => {
  const root = await createWorkspace();
  const result = await runCli(root, [
    '--docmap',
    'docs/_data/docmap.yaml',
    '--repos',
    'docs/_data/repos.yaml',
    '--output-dir',
    'docs/website/_collected',
    '--report-dir',
    'reports/collected',
    '--state-dir',
    'reports/_state',
    '--scn-id',
    'SCN-PUBLISH-001',
    '--quiet',
  ]);
  assert.equal(result.code, 0, result.stderr);

  const stubPath = path.join(
    root,
    'docs/website/_collected/powerx/service/publish/PX-PUBLISH-001.md',
  );
  const stub = await fs.readFile(stubPath, 'utf8');
  assert.match(stub, /scn_id: \"SCN-PUBLISH-001\"/);
  assert.match(stub, /Optional: ✅ Required/);

  const optionalStub = await fs.readFile(
    path.join(root, 'docs/website/_collected/powerx/ui/publish/PX-ADMIN-PUBLISH-001.md'),
    'utf8',
  );
  assert.match(optionalStub, /Optional: ⚠️ Optional/);

  const reportPath = path.join(root, 'reports/collected/collected_SCN-PUBLISH-001.json');
  const report = JSON.parse(await fs.readFile(reportPath, 'utf8'));
  assert.equal(report.summary.processed, 2);

  const rerun = await runCli(root, [
    '--docmap',
    'docs/_data/docmap.yaml',
    '--repos',
    'docs/_data/repos.yaml',
    '--output-dir',
    'docs/website/_collected',
    '--report-dir',
    'reports/collected',
    '--state-dir',
    'reports/_state',
    '--scn-id',
    'SCN-PUBLISH-001',
    '--quiet',
  ]);
  assert.notEqual(rerun.code, 0);
  assert.match(rerun.stderr, /already exists/);
});
