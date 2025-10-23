import { promises as fs } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

export class DuplicateWorkflowRunError extends Error {
  constructor(fingerprint) {
    super(`Workflow run with fingerprint "${fingerprint}" already exists`);
    this.name = 'DuplicateWorkflowRunError';
    this.code = 'WORKFLOW_DUPLICATE';
    this.fingerprint = fingerprint;
  }
}

const DEFAULT_STATE_DIR = path.resolve('reports/_state');

function getStateFilePath(stateDir, workflowId) {
  return path.join(stateDir, `${workflowId}.json`);
}

async function ensureDirectory(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function readStateFile(stateFile) {
  try {
    const content = await fs.readFile(stateFile, 'utf8');
    if (!content.trim()) return { runs: [], tokens: {} };
    return JSON.parse(content);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return { runs: [], tokens: {} };
    }
    throw error;
  }
}

async function writeStateFile(stateFile, data) {
  await ensureDirectory(path.dirname(stateFile));
  const payload = { runs: data.runs ?? [], tokens: data.tokens ?? {} };
  await fs.writeFile(stateFile, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
}

export function generateResumeToken() {
  return randomUUID();
}

export async function registerWorkflowRun({
  workflowId,
  fingerprint,
  stateDir = DEFAULT_STATE_DIR,
  resumeToken = generateResumeToken(),
  status = 'queued',
  metadata = {},
}) {
  if (!workflowId) throw new Error('workflowId is required');
  if (!fingerprint) throw new Error('fingerprint is required');

  const stateFile = getStateFilePath(stateDir, workflowId);
  const state = await readStateFile(stateFile);

  const duplicate = state.runs.find((run) => run.fingerprint === fingerprint);
  if (duplicate) {
    throw new DuplicateWorkflowRunError(fingerprint);
  }

  const run = {
    workflowId,
    fingerprint,
    resumeToken,
    status,
    metadata,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  state.runs.push(run);
  state.tokens[resumeToken] = fingerprint;

  await writeStateFile(stateFile, state);
  return run;
}

export async function getRunByToken({ workflowId, resumeToken, stateDir = DEFAULT_STATE_DIR }) {
  if (!workflowId) throw new Error('workflowId is required');
  if (!resumeToken) throw new Error('resumeToken is required');

  const stateFile = getStateFilePath(stateDir, workflowId);
  const state = await readStateFile(stateFile);
  const fingerprint = state.tokens[resumeToken];
  if (!fingerprint) return undefined;
  return state.runs.find((run) => run.fingerprint === fingerprint);
}

export async function updateRunStatus({
  workflowId,
  resumeToken,
  status,
  stateDir = DEFAULT_STATE_DIR,
  metadata,
}) {
  if (!workflowId) throw new Error('workflowId is required');
  if (!resumeToken) throw new Error('resumeToken is required');

  const stateFile = getStateFilePath(stateDir, workflowId);
  const state = await readStateFile(stateFile);
  const fingerprint = state.tokens[resumeToken];
  if (!fingerprint) {
    throw new Error(`Unknown resume token: ${resumeToken}`);
  }

  const run = state.runs.find((entry) => entry.fingerprint === fingerprint);
  if (!run) {
    throw new Error(`Run not found for fingerprint: ${fingerprint}`);
  }

  if (status) {
    run.status = status;
  }

  if (metadata && typeof metadata === 'object') {
    run.metadata = { ...run.metadata, ...metadata };
  }

  run.updatedAt = new Date().toISOString();

  await writeStateFile(stateFile, state);
  return run;
}

export async function listWorkflowRuns({ workflowId, stateDir = DEFAULT_STATE_DIR }) {
  if (!workflowId) throw new Error('workflowId is required');
  const stateFile = getStateFilePath(stateDir, workflowId);
  const state = await readStateFile(stateFile);
  return [...state.runs];
}

export { DEFAULT_STATE_DIR };
