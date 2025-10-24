#!/usr/bin/env node

/**
 * Scenario generator for PowerX publish flow.
 * This script copies prepared templates into docs/scenarios/publish/.
 *
 * Usage:
 *   node .specify/scripts/node/generate-scenarios.mjs <source-file> [--force]
 *
 * The <source-file> is currently used only for existence validation.
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const TEMPLATE_MAP = [
  {
    template: '.specify/templates/scenario-publish-hub.md',
    output: 'docs/scenarios/publish/SCN-PUBLISH-HUB-001.md',
  },
  {
    template: '.specify/templates/scenario-publish-dev-hotload.md',
    output: 'docs/scenarios/publish/SCN-DEV-HOTLOAD-001.md',
  },
  {
    template: '.specify/templates/scenario-publish-offline.md',
    output: 'docs/scenarios/publish/SCN-PUBLISH-OFFLINE-001.md',
  },
  {
    template: '.specify/templates/scenario-publish-online.md',
    output: 'docs/scenarios/publish/SCN-PUBLISH-ONLINE-001.md',
  },
];

function usage() {
  console.log('Usage: generate-scenarios.mjs <source-file> [--force]');
}

function resolveSource(arg) {
  if (!arg) return '';
  if (arg.startsWith('@')) {
    return path.resolve(process.cwd(), arg.slice(1));
  }
  return path.resolve(process.cwd(), arg);
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function readTemplate(templatePath) {
  const absolute = path.resolve(templatePath);
  return fs.readFile(absolute, 'utf8');
}

async function writeFile(targetPath, content, { force }) {
  const absolute = path.resolve(targetPath);
  const exists = await fs
    .access(absolute)
    .then(() => true)
    .catch(() => false);

  if (exists && !force) {
    console.log(`SKIP   ${targetPath} (exists, use --force to overwrite)`);
    return;
  }

  await ensureDir(path.dirname(absolute));
  await fs.writeFile(absolute, content, 'utf8');
  console.log(`${exists ? 'UPDATE' : 'CREATE'} ${targetPath}`);
}

function injectDate(templateContent, date) {
  return templateContent.replace(/{{LAST_REVIEWED_AT}}/g, date);
}

async function main() {
  const args = process.argv.slice(2);
  if (!args.length || args.includes('--help')) {
    usage();
    process.exit(args.includes('--help') ? 0 : 1);
  }

  const force = args.includes('--force');
  const filtered = args.filter((arg) => arg !== '--force');
  const sourcePath = resolveSource(filtered[0]);

  if (!sourcePath) {
    console.error('ERROR: missing source file argument');
    usage();
    process.exit(1);
  }

  try {
    await fs.access(sourcePath);
  } catch (error) {
    console.error(`ERROR: source file not found: ${sourcePath}`);
    process.exit(1);
  }

  const date = new Date().toISOString().slice(0, 10);

  for (const entry of TEMPLATE_MAP) {
    const template = await readTemplate(entry.template);
    const rendered = injectDate(template, date);
    await writeFile(entry.output, rendered, { force });
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
