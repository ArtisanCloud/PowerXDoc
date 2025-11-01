#!/usr/bin/env node
import path from 'path';
import process from 'process';
import { promises as fs } from 'fs';
import { createHash } from 'crypto';

import {
  loadDocmap,
  loadTaxonomy,
  validateDocmap,
  detectDuplicateIds,
} from '../lib/docmap-utils.mjs';
import {
  readScenario,
  validateScenarioStructure,
  computeScenarioFingerprint,
  renderScenarioMarkdown,
} from '../lib/markdown-utils.mjs';
import {
  appendWorkflowRecord,
  writeWorkflowSummary,
} from '../lib/report-writer.mjs';
import {
  registerWorkflowRun,
  updateRunStatus,
  getRunByToken,
  generateResumeToken,
} from '../lib/workflow-state.mjs';

const DEFAULT_SCENARIO_DIR = path.resolve('docs/scenarios');
const DEFAULT_OUTPUT_DIR = path.resolve('docs/website/scenarios');
const DEFAULT_REPORT_DIR = path.resolve('reports/scenarios');

function usage() {
  console.log(`Usage: npm run publish:scenarios -- [options]

Options:
  --scn-id <id>           Scenario ID (e.g. SCN-PUBLISH-001)
  --docmap <file>         Path to docmap.yaml (default: docs/_data/docmap.yaml)
  --taxonomy <file>       Path to taxonomy.yaml (default: docs/_data/taxonomy.yaml)
  --output-dir <dir>      Output directory (default: docs/website/scenarios)
  --report-dir <dir>      Report directory (default: reports/scenarios)
  --validate-only         Perform validation without writing outputs
  --resume-token <token>  Resume a previous workflow run
  --dry-run               Skip writing rendered scenario (still records report)
  --quiet                 Suppress summary logs
`);
}

function parseArgs(argv) {
  const args = {
    docmap: 'docs/_data/docmap.yaml',
    taxonomy: 'docs/_data/taxonomy.yaml',
    outputDir: DEFAULT_OUTPUT_DIR,
    reportDir: DEFAULT_REPORT_DIR,
    scenarioDir: DEFAULT_SCENARIO_DIR,
    validateOnly: false,
    dryRun: false,
    quiet: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    switch (token) {
      case '--scn-id':
        args.scnId = argv[++i];
        break;
      case '--docmap':
        args.docmap = argv[++i];
        break;
      case '--taxonomy':
        args.taxonomy = argv[++i];
        break;
      case '--output-dir':
        args.outputDir = argv[++i];
        break;
      case '--report-dir':
        args.reportDir = argv[++i];
        break;
      case '--validate-only':
        args.validateOnly = true;
        break;
      case '--dry-run':
        args.dryRun = true;
        break;
      case '--resume-token':
        args.resumeToken = argv[++i];
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
        if (!token.startsWith('--')) {
          args.scenarioDir = token;
        }
    }
  }
  return args;
}

async function ensureDirectory(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function findScenarioPath(scenarioDir, scnId) {
  const fileName = `${scnId}.md`;
  return path.join(scenarioDir, fileName);
}

async function findScenarioPathFromDocmap(docmap, scnId) {
  const entry = docmap.scenarios?.find((s) => s.scn_id === scnId);
  if (entry?.path) {
    return path.resolve(entry.path);
  }
  return findScenarioPath(DEFAULT_SCENARIO_DIR, scnId);
}

function findDocmapEntry(docmap, scnId) {
  return (docmap.scenarios ?? []).find((entry) => entry.scn_id === scnId);
}

async function writeScenarioOutput(outputDir, scnId, rendered) {
  await ensureDirectory(outputDir);
  const target = path.join(outputDir, `${scnId}.md`);
  await fs.writeFile(target, rendered, 'utf8');
  return target;
}

async function writeReport(reportDir, scnId, payload) {
  await ensureDirectory(reportDir);
  const reportPath = path.join(reportDir, `${scnId}.json`);
  await writeWorkflowSummary(reportPath, {
    scnId,
    status: payload.status ?? 'completed',
    generatedAt: new Date().toISOString(),
  });
  await appendWorkflowRecord(reportPath, payload);
  return reportPath;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const [docmap, taxonomy] = await Promise.all([
    loadDocmap(args.docmap),
    loadTaxonomy(args.taxonomy),
  ]);

  const docmapValidation = validateDocmap(docmap, taxonomy);
  if (docmapValidation.errors.length) {
    for (const error of docmapValidation.errors) {
      console.error(`[DOCMAP] ${error.code}: ${error.message}`);
    }
    process.exitCode = 1;
    return;
  }

  if (!args.scnId) {
    console.error('Missing --scn-id. Provide the scenario identifier to publish.');
    process.exitCode = 1;
    return;
  }

  const scenarioPath = await findScenarioPathFromDocmap(docmap, args.scnId);
  let scenario;
  try {
    scenario = await readScenario(scenarioPath);
  } catch (error) {
    console.error(`[SCENARIO] ${error.message}`);
    process.exitCode = 1;
    return;
  }

  try {
    validateScenarioStructure(scenario);
  } catch (error) {
    console.error(`[SCENARIO] ${error.message}`);
    process.exitCode = 1;
    return;
  }

  const docmapEntry = findDocmapEntry(docmap, args.scnId);
  if (!docmapEntry) {
    console.error(`[SCENARIO] docmap.yaml has no entry for ${args.scnId}`);
    process.exitCode = 1;
    return;
  }

  const fingerprint = computeScenarioFingerprint(scenario, docmapEntry);
  const workflowId = `scenario:${args.scnId}`;
  let run;
  try {
    if (args.resumeToken) {
      run = await getRunByToken({ workflowId, resumeToken: args.resumeToken });
      if (!run) {
        throw new Error(`Unknown resume token ${args.resumeToken}`);
      }
    } else {
      run = await registerWorkflowRun({
        workflowId,
        fingerprint,
        status: 'running',
      });
    }
  } catch (error) {
    if (error.name === 'DuplicateWorkflowRunError') {
      console.error(
        `[WORKFLOW] Duplicate fingerprint detected for ${args.scnId}. Use the resume token from the last report to continue.`,
      );
      process.exitCode = 1;
      return;
    }
    console.error(error.message);
    process.exitCode = 1;
    return;
  }

  if (args.validateOnly) {
    if (!args.quiet) {
      console.log(`[VALIDATE] Scenario ${args.scnId} passed validation.`);
    }
    return;
  }

  let renderedPath;
  try {
    if (!args.dryRun) {
      const rendered = renderScenarioMarkdown(scenario, docmapEntry);
      renderedPath = await writeScenarioOutput(args.outputDir, args.scnId, rendered);
    }

    const reportPath = await writeReport(args.reportDir, args.scnId, {
      workflowId,
      status: 'completed',
      resumeToken: run.resumeToken ?? generateResumeToken(),
      fingerprint,
      renderedPath: renderedPath ?? null,
      docmapEntry,
    });

    await updateRunStatus({
      workflowId,
      resumeToken: run.resumeToken,
      status: 'completed',
      metadata: { reportPath, renderedPath },
    });

    if (!args.quiet) {
      console.log(`[PUBLISH] Scenario ${args.scnId} rendered → ${renderedPath}`);
      console.log(`[PUBLISH] Report written → ${reportPath}`);
    }
  } catch (error) {
    await updateRunStatus({
      workflowId,
      resumeToken: run.resumeToken,
      status: 'failed',
      metadata: { error: error.message },
    }).catch(() => {});
    console.error(`[WORKFLOW] Failed: ${error.message}`);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
