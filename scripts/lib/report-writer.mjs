import { promises as fs } from 'fs';
import path from 'path';

export class ReportWriterError extends Error {
  constructor(message, code = 'REPORT_WRITER') {
    super(message);
    this.name = 'ReportWriterError';
    this.code = code;
  }
}

async function ensureDirectory(filePath) {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
}

async function readJsonFile(filePath, fallback) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    if (!content.trim()) return fallback;
    return JSON.parse(content);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return fallback;
    }
    throw error;
  }
}

async function writeJsonFile(filePath, payload) {
  await ensureDirectory(filePath);
  const content = `${JSON.stringify(payload, null, 2)}\n`;
  await fs.writeFile(filePath, content, 'utf8');
}

export async function appendWorkflowRecord(reportPath, record) {
  if (!record || typeof record !== 'object') {
    throw new ReportWriterError('Record must be an object', 'REPORT_RECORD_INVALID');
  }

  const existing = await readJsonFile(reportPath, { summary: {}, records: [] });
  existing.records.push({
    ...record,
    timestamp: record.timestamp ?? new Date().toISOString(),
  });
  await writeJsonFile(reportPath, existing);
  return existing;
}

export async function writeWorkflowSummary(reportPath, summary) {
  if (!summary || typeof summary !== 'object') {
    throw new ReportWriterError('Summary must be an object', 'REPORT_SUMMARY_INVALID');
  }
  const existing = await readJsonFile(reportPath, { summary: {}, records: [] });
  existing.summary = { ...existing.summary, ...summary };
  await writeJsonFile(reportPath, existing);
  return existing;
}

export async function loadWorkflowReport(reportPath) {
  return readJsonFile(reportPath, { summary: {}, records: [] });
}
