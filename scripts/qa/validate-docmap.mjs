#!/usr/bin/env node
import path from 'path';
import process from 'process';

import { loadDocmap, loadTaxonomy, validateDocmap, summarizeDocmap } from '../lib/docmap-utils.mjs';

function parseArgs(rawArgs) {
  const args = {};
  for (let i = 0; i < rawArgs.length; i += 1) {
    const token = rawArgs[i];
    if (token === '--docmap' || token === '-d') {
      args.docmap = rawArgs[i + 1];
      i += 1;
    } else if (token === '--taxonomy' || token === '-t') {
      args.taxonomy = rawArgs[i + 1];
      i += 1;
    } else if (token === '--quiet' || token === '-q') {
      args.quiet = true;
    }
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const docmapPath = path.resolve(args.docmap ?? 'docs/_data/docmap.yaml');
  const taxonomyPath = path.resolve(args.taxonomy ?? 'docs/_data/taxonomy.yaml');

  const [docmap, taxonomy] = await Promise.all([loadDocmap(docmapPath), loadTaxonomy(taxonomyPath)]);
  const { errors, warnings } = validateDocmap(docmap, taxonomy);

  if (!args.quiet) {
    const summary = summarizeDocmap(docmap);
    console.log(`Docmap summary: ${summary.scenarios} scenarios, ${summary.children} children`);
  }

  if (warnings.length && !args.quiet) {
    console.warn('\nWarnings:');
    for (const warning of warnings) {
      console.warn(`  - [${warning.code}] ${warning.message}`);
    }
  }

  if (errors.length) {
    console.error('\nErrors:');
    for (const error of errors) {
      console.error(`  - [${error.code}] ${error.message}`);
    }
    process.exitCode = 1;
    return;
  }

  if (!args.quiet) {
    console.log('\nValidation passed ✅');
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
