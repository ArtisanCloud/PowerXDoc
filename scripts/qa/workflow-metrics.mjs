#!/usr/bin/env node
import { promises as fs } from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const DEFAULT_REPORT_DIR = 'reports'

function usage() {
  console.log(`Usage: node scripts/qa/workflow-metrics.mjs [--reports <dir>] [--json]\n\nOptions:\n  --reports <dir>   Root reports directory (default: reports)\n  --json            Output JSON instead of table summary\n`)
}

function parseArgs(argv) {
  const args = { reports: DEFAULT_REPORT_DIR, json: false }
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i]
    if (token === '--reports') {
      args.reports = argv[++i]
    } else if (token === '--json') {
      args.json = true
    } else if (token === '--help' || token === '-h') {
      usage()
      process.exit(0)
    }
  }
  return args
}

async function walkReports(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => [])
  const files = []
  for (const entry of entries) {
    const abs = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      const nested = await walkReports(abs)
      files.push(...nested)
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      files.push(abs)
    }
  }
  return files
}

async function loadReport(filePath) {
  try {
    const raw = await fs.readFile(filePath, 'utf8')
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function extractMetrics(report) {
  if (!report) return []
  const summary = report.summary ?? {}
  const records = report.records ?? []
  const entries = []
  if (summary.workflowId) {
    entries.push({
      workflowId: summary.workflowId,
      status: summary.status ?? 'Unknown',
      generatedAt: summary.generatedAt ?? null,
      processed: summary.processed ?? records.length,
      reportPath: null,
    })
  }
  for (const record of records) {
    entries.push({
      workflowId: record.workflowId ?? summary.workflowId ?? 'unknown',
      status: record.status ?? summary.status ?? 'Unknown',
      generatedAt: record.timestamp ?? summary.generatedAt ?? null,
      processed: Array.isArray(record.records) ? record.records.length : record.processed ?? 0,
      reportPath: null,
    })
  }
  return entries
}

function computeSlaMetrics(entries) {
  const now = Date.now()
  return entries.map(entry => {
    const generatedAt = entry.generatedAt ? Date.parse(entry.generatedAt) : NaN
    const ageMinutes = Number.isNaN(generatedAt) ? null : Math.round((now - generatedAt) / 60000)
    return { ...entry, ageMinutes }
  })
}

function printTable(metrics) {
  if (!metrics.length) {
    console.log('No workflow metrics available.')
    return
  }
  console.log('Workflow Metrics\n')
  console.log('| Workflow | Status | Age (minutes) | Processed |')
  console.log('|----------|--------|---------------|-----------|')
  for (const metric of metrics) {
    const age = metric.ageMinutes != null ? metric.ageMinutes.toString() : 'n/a'
    console.log(`| ${metric.workflowId} | ${metric.status} | ${age} | ${metric.processed} |`)
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const files = await walkReports(path.resolve(args.reports))

  const metrics = []
  for (const file of files) {
    const report = await loadReport(file)
    const entries = extractMetrics(report)
    for (const entry of entries) {
      entry.reportPath = file
      metrics.push(entry)
    }
  }

  const withSla = computeSlaMetrics(metrics)

  if (args.json) {
    console.log(JSON.stringify(withSla, null, 2))
    return
  }
  printTable(withSla)
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
