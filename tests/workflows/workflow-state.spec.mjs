import test from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'path';
import { promises as fs } from 'fs';

import {
  DEFAULT_STATE_DIR,
  DuplicateWorkflowRunError,
  generateResumeToken,
  getRunByToken,
  listWorkflowRuns,
  registerWorkflowRun,
  updateRunStatus,
} from '../../scripts/lib/workflow-state.mjs';

async function createTempStateDir() {
  const base = await fs.mkdtemp(path.join(os.tmpdir(), 'px-workflow-'));
  return path.join(base, '_state');
}

test('registerWorkflowRun prevents duplicate fingerprints', async (t) => {
  const stateDir = await createTempStateDir();
  const workflowId = 'scenarios';

  await registerWorkflowRun({
    workflowId,
    fingerprint: 'scenario-001',
    stateDir,
    status: 'queued',
  });

  await assert.rejects(
    () =>
      registerWorkflowRun({
        workflowId,
        fingerprint: 'scenario-001',
        stateDir,
      }),
    (error) => error instanceof DuplicateWorkflowRunError,
    'Expected duplicate registration to throw DuplicateWorkflowRunError',
  );

  const runs = await listWorkflowRuns({ workflowId, stateDir });
  assert.equal(runs.length, 1);
  assert.equal(runs[0].fingerprint, 'scenario-001');
});

test('resume tokens map back to workflow runs', async (t) => {
  const stateDir = await createTempStateDir();
  const workflowId = 'usecases';
  const resumeToken = generateResumeToken();

  const run = await registerWorkflowRun({
    workflowId,
    fingerprint: 'usecase-abc',
    stateDir,
    resumeToken,
    status: 'running',
  });

  const fetched = await getRunByToken({ workflowId, resumeToken, stateDir });
  assert.ok(fetched);
  assert.equal(fetched.resumeToken, run.resumeToken);
  assert.equal(fetched.fingerprint, 'usecase-abc');
});

test('updateRunStatus merges metadata and status', async (t) => {
  const stateDir = await createTempStateDir();
  const workflowId = 'standards';
  const resumeToken = generateResumeToken();

  await registerWorkflowRun({
    workflowId,
    fingerprint: 'standards-001',
    stateDir,
    resumeToken,
    status: 'queued',
    metadata: { attempt: 1 },
  });

  const updated = await updateRunStatus({
    workflowId,
    resumeToken,
    stateDir,
    status: 'completed',
    metadata: { filesChanged: 3 },
  });

  assert.equal(updated.status, 'completed');
  assert.deepEqual(updated.metadata, { attempt: 1, filesChanged: 3 });

  const runs = await listWorkflowRuns({ workflowId, stateDir });
  assert.equal(runs[0].status, 'completed');
});
