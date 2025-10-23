import test from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'path';
import { promises as fs } from 'fs';
import { spawn } from 'child_process';

const CLI_PATH = path.resolve('scripts/publish/publish-scenarios.mjs');

async function createTmpRepo() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'px-scenarios-'));
  await fs.mkdir(path.join(root, 'docs/scenarios'), { recursive: true });
  await fs.mkdir(path.join(root, 'docs/_data'), { recursive: true });
  await fs.mkdir(path.join(root, 'docs/website/scenarios'), { recursive: true });
  await fs.mkdir(path.join(root, 'reports/scenarios'), { recursive: true });
  return root;
}

async function writeFile(root, relPath, contents) {
  const abs = path.join(root, relPath);
  await fs.mkdir(path.dirname(abs), { recursive: true });
  await fs.writeFile(abs, contents, 'utf8');
  return abs;
}

function runCli(cwd, args = []) {
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
    child.on('close', (code) => {
      resolve({ code, stdout, stderr });
    });
  });
}

async function writeScenarioFixtures(root) {
  await writeFile(
    root,
    'docs/standards/scenarios/_template.md',
    '# template placeholder',
  );

  await writeFile(
    root,
    'docs/scenarios/SCN-PUBLISH-001.md',
    `---
scn_id: SCN-PUBLISH-001
title: Scenario Publish Test
status: Draft
---

# Positioning & Goals

Goal text

# Core Capabilities

- Capability

# Acceptance Criteria

1. Accept

# Validation Workflow

| Step | Owner | Tool |
| --- | --- | --- |
| A | B | C |

# Related Links

- Link

# Architecture Diagram

\`\`\`mermaid
graph TD
  A-->B
\`\`\`
`,
  );

  await writeFile(
    root,
    'docs/_data/docmap.yaml',
    `scenarios:
  - scn_id: SCN-PUBLISH-001
    title: Scenario Publish Test
    children:
      - doc_id: PX-TEST-001
        scope: px
        layer: service
        domain: publish
        optional: false
`,
  );

  await writeFile(root, 'docs/_data/taxonomy.yaml', `scopes: [px]\nlayers: [service]\ndomains: [publish]\n`);
}

test('publish-scenarios renders scenario and writes report', async () => {
  const root = await createTmpRepo();
  await writeScenarioFixtures(root);

  const result = await runCli(root, ['--scn-id', 'SCN-PUBLISH-001']);
  assert.equal(result.code, 0, `CLI exited with ${result.code}: ${result.stderr}`);

  const renderedPath = path.join(root, 'docs/website/scenarios/SCN-PUBLISH-001.md');
  const reportPath = path.join(root, 'reports/scenarios/SCN-PUBLISH-001.json');

  const rendered = await fs.readFile(renderedPath, 'utf8');
  assert.match(rendered, /generated_at:/);
  assert.match(rendered, /children:/);

  const report = JSON.parse(await fs.readFile(reportPath, 'utf8'));
  assert.equal(report.summary.scnId, 'SCN-PUBLISH-001');
  assert.equal(report.records.at(-1).status, 'completed');
});

test('publish-scenarios prevents duplicate runs without resume token', async () => {
  const root = await createTmpRepo();
  await writeScenarioFixtures(root);

  const first = await runCli(root, ['--scn-id', 'SCN-PUBLISH-001', '--quiet']);
  assert.equal(first.code, 0);

  const second = await runCli(root, ['--scn-id', 'SCN-PUBLISH-001', '--quiet']);
  assert.notEqual(second.code, 0);
  assert.match(second.stderr, /Duplicate fingerprint/);
});

test('publish-scenarios fails validation when sections missing', async () => {
  const root = await createTmpRepo();
  await writeFile(
    root,
    'docs/scenarios/SCN-PUBLISH-002.md',
    `---
scn_id: SCN-PUBLISH-002
title: Scenario Publish Test
status: Draft
---

# Positioning & Goals

Goal text
`,
  );

  await writeFile(
    root,
    'docs/_data/docmap.yaml',
    `scenarios:
  - scn_id: SCN-PUBLISH-002
    title: Scenario Publish Test
    children: []
`,
  );

  await writeFile(root, 'docs/_data/taxonomy.yaml', `scopes: []\nlayers: []\ndomains: []\n`);

  const result = await runCli(root, ['--scn-id', 'SCN-PUBLISH-002', '--quiet']);
  assert.notEqual(result.code, 0);
  assert.match(result.stderr, /failed validation/);
});
