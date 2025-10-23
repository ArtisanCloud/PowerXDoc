#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

function usage() {
  console.log(`Usage: npm run publish:notify -- --workflow <usecases|standards> [options]

Options:
  --report <file>          Path to workflow report (default derived from workflow)
  --hours <number>         Reminder threshold in hours (default: 72)
  --quiet                  Suppress reminder messages
`);
}

function parseArgs(argv) {
  const args = { hours: 72, quiet: false };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    switch (token) {
      case '--workflow':
        args.workflow = argv[++i];
        break;
      case '--report':
        args.report = argv[++i];
        break;
      case '--hours':
        args.hours = Number.parseInt(argv[++i], 10);
        break;
      case '--quiet':
        args.quiet = true;
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

function defaultReportPath(workflow) {
  if (workflow === 'usecases') return path.resolve('reports/usecases/usecases_SCN.json');
  if (workflow === 'standards') return path.resolve('reports/standards/standards_distribution.json');
  return null;
}

async function loadReport(reportPath) {
  const raw = await fs.readFile(reportPath, 'utf8');
  return JSON.parse(raw);
}

function staleRecords(report, hours) {
  const cutoff = Date.now() - hours * 60 * 60 * 1000;
  const stale = [];
  for (const record of report.records ?? []) {
    const updatedAt = Date.parse(record.updatedAt ?? record.timestamp ?? report.generatedAt ?? 0);
    if (Number.isNaN(updatedAt)) continue;
    if (updatedAt <= cutoff && record.status && record.status.toLowerCase() !== 'completed') {
      stale.push(record);
    }
  }
  return stale;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.workflow && !args.report) {
    console.error('Specify --workflow or --report to locate a report file.');
    process.exitCode = 1;
    return;
  }

  const reportPath = args.report ?? defaultReportPath(args.workflow);
  if (!reportPath) {
    console.error('Unable to derive report path. Provide --report explicitly.');
    process.exitCode = 1;
    return;
  }

  const report = await loadReport(reportPath);
  const overdue = staleRecords(report, args.hours);

  if (overdue.length === 0) {
    if (!args.quiet) {
      console.log('No outstanding reviews require reminders.');
    }
    return;
  }

  for (const record of overdue) {
    const repoKey = record.repoKey ?? 'unknown-repo';
    const prUrl = record.prUrl ?? '(pending PR)';
    console.log(`[REMINDER] ${repoKey}: follow up on ${prUrl}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
