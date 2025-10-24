#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

import { loadRepos } from '../../../scripts/lib/docmap-utils.mjs';

function usage() {
  console.log(`Usage: derive-docmap-from-scenario --scn-id <ID> [options]

Options:
  --scn-id <ID>           Scenario identifier (required)
  --scenario <path>       Explicit scenario file path (overrides search)
  --scenarios-root <dir>  Root directory for scenario search (default: docs/scenarios)
  --docmap <path>         Existing docmap file (used for lookup / context)
  --repos <path>          repos.yaml path (default: docs/_data/repos.yaml)
  --json                  Emit JSON output (default)
  --yaml                  Emit YAML snippet instead of JSON
  --help, -h              Show this message
`);
}

function parseArgs(argv) {
  const args = {
    scnId: '',
    scenarioPath: '',
    scenariosRoot: 'docs/scenarios',
    docmapPath: '',
    reposPath: 'docs/_data/repos.yaml',
    output: 'json',
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    switch (token) {
      case '--scn-id':
        args.scnId = argv[++i] ?? '';
        break;
      case '--scenario':
        args.scenarioPath = argv[++i] ?? '';
        break;
      case '--scenarios-root':
        args.scenariosRoot = argv[++i] ?? args.scenariosRoot;
        break;
      case '--docmap':
        args.docmapPath = argv[++i] ?? '';
        break;
      case '--repos':
        args.reposPath = argv[++i] ?? args.reposPath;
        break;
      case '--yaml':
        args.output = 'yaml';
        break;
      case '--json':
        args.output = 'json';
        break;
      case '--help':
      case '-h':
        usage();
        process.exit(0);
        break;
      default:
        console.error(`Unknown option: ${token}`);
        usage();
        process.exit(1);
    }
  }

  if (!args.scnId && !args.scenarioPath) {
    console.error('ERROR: --scn-id or --scenario is required.');
    usage();
    process.exit(1);
  }

  return args;
}

async function findScenarioPath(scnId, scenariosRoot) {
  const matches = [];
  async function walk(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const abs = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(abs);
      } else if (entry.isFile() && entry.name === `${scnId}.md`) {
        matches.push(abs);
      }
    }
  }
  await walk(path.resolve(scenariosRoot));
  return matches;
}

function stripBom(content) {
  if (!content) return '';
  if (content.charCodeAt(0) === 0xfeff) {
    return content.slice(1);
  }
  return content;
}

function parseScalar(value) {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  if (trimmed === 'null' || trimmed === '~') return null;
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  if (/^-?\d+$/.test(trimmed)) return Number.parseInt(trimmed, 10);
  if (/^-?\d+\.\d+$/.test(trimmed)) return Number.parseFloat(trimmed);
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    const entries = trimmed
      .slice(1, -1)
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    return entries.map(parseScalar);
  }
  return trimmed;
}

function splitKeyValue(line) {
  const idx = line.indexOf(':');
  if (idx === -1) {
    return [line.trim(), undefined];
  }
  const key = line.slice(0, idx).trim();
  const value = line.slice(idx + 1).trim();
  return [key, value === '' ? undefined : value];
}

function parseIndentedList(lines, startIndex) {
  const entries = [];
  let i = startIndex;
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed) {
      i += 1;
      continue;
    }
    if (!trimmed.startsWith('-')) break;
    const remainder = trimmed.slice(1).trim();
    const entry = {};
    if (remainder) {
      const [key, value] = splitKeyValue(remainder);
      if (value !== undefined) {
        entry[key] = parseScalar(value);
      }
    }
    i += 1;
    while (i < lines.length) {
      const subLine = lines[i];
      const subTrim = subLine.trim();
      if (!subTrim) {
        i += 1;
        continue;
      }
      if (subTrim.startsWith('-')) break;
      if (!subLine.startsWith(' ') && subTrim.includes(':')) break;
      const [subKey, subValue] = splitKeyValue(subTrim);
      if (subValue !== undefined) {
        entry[subKey] = parseScalar(subValue);
      }
      i += 1;
    }
    entries.push(entry);
  }
  return { entries, nextIndex: i };
}

function parseFrontmatter(content) {
  const stripped = stripBom(content);
  const lines = stripped.split(/\r?\n/);
  const separatorIndex = lines.findIndex((line) => line.trim() === '---');
  const frontmatterLines = separatorIndex === -1 ? lines : lines.slice(0, separatorIndex);

  const result = {};
  for (let i = 0; i < frontmatterLines.length; ) {
    const line = frontmatterLines[i];
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      i += 1;
      continue;
    }
    if (trimmed.startsWith('-')) {
      // top level list item (unexpected) skip
      i += 1;
      continue;
    }
    if (trimmed.includes(':')) {
      const [key, value] = splitKeyValue(trimmed);
      if (value !== undefined) {
        result[key] = parseScalar(value);
        i += 1;
      } else {
        const { entries, nextIndex } = parseIndentedList(frontmatterLines, i + 1);
        result[key] = entries;
        i = nextIndex;
      }
    } else {
      i += 1;
    }
  }
  return result;
}

function normalizeToken(value) {
  if (!value) return '';
  return value.toString().toLowerCase().replace(/[^a-z0-9]/g, '');
}

function buildTokenSetFromDocId(docId) {
  const raw = Array.isArray(docId) ? docId : String(docId ?? '').split('-');
  const tokens = new Set();
  for (const token of raw) {
    if (!token) continue;
    tokens.add(normalizeToken(token));
  }
  const combined = normalizeToken(String(docId ?? ''));
  if (combined) tokens.add(combined);
  if (raw.length >= 2) {
    const duo = normalizeToken(`${raw[0]}${raw[1]}`);
    const duoDash = normalizeToken(`${raw[0]}-${raw[1]}`);
    if (duo) tokens.add(duo);
    if (duoDash) tokens.add(duoDash);
  }
  return tokens;
}

function indexScenarioRepos(repoList = []) {
  return repoList
    .map((entry) => {
      const normalizedScope = normalizeToken(entry.scope ?? entry.key);
      const normalizedKey = normalizeToken(entry.key);
      return {
        ...entry,
        normalizedScope,
        normalizedKey,
      };
    })
    .filter((entry) => entry.key);
}

function buildRepoIndexFromGlobal(reposMeta) {
  const index = new Map();
  for (const repo of reposMeta.repos ?? []) {
    if (!repo?.key) continue;
    index.set(repo.key, {
      key: repo.key,
      scope: repo.scope ?? repo.key,
      usecase_seed_root: repo.usecase_seed_root ?? 'docs/use_cases/_from_hub',
    });
  }
  return index;
}

function matchScenarioRepo(tokens, scenarioRepos) {
  let best = null;
  let bestScore = -1;
  for (const repo of scenarioRepos) {
    if (!repo) continue;
    let score = 0;
    if (repo.normalizedScope && tokens.has(repo.normalizedScope)) {
      score = Math.max(score, repo.normalizedScope.length);
    }
    if (repo.normalizedKey && tokens.has(repo.normalizedKey)) {
      score = Math.max(score, repo.normalizedKey.length);
    }
    if (score > bestScore) {
      best = repo;
      bestScore = score;
    }
  }
  if (best) return best;
  for (const repo of scenarioRepos) {
    if (repo.normalizedScope && [...tokens].some((token) => repo.normalizedScope.startsWith(token))) {
      return repo;
    }
  }
  return scenarioRepos[0] ?? null;
}

function resolveRepoMeta(matchedRepo, repoIndex) {
  if (!matchedRepo) return null;
  const entry = repoIndex.get(matchedRepo.key);
  if (entry) return entry;
  // fallback: maybe key not direct match, try scope
  for (const value of repoIndex.values()) {
    if (normalizeToken(value.scope) === normalizeToken(matchedRepo.scope)) {
      return value;
    }
  }
  return null;
}

function deriveChildren({ scenarioMeta, repoIndex }) {
  const children = [];
  const warnings = [];
  const scenarioRepos = indexScenarioRepos(scenarioMeta.repos ?? []);
  const related = scenarioMeta.related_usecases ?? scenarioMeta.relatedUsecases ?? scenarioMeta.related ?? [];

  for (const item of related) {
    if (!item) continue;
    const docId = item.doc_id ?? item.docId;
    if (!docId) {
      warnings.push('Found related_usecases entry without doc_id');
      continue;
    }
    const layer = item.layer ?? 'TODO-layer';
    const domain = item.domain ?? 'TODO-domain';
    const optional = item.optional === true;
    const tokens = buildTokenSetFromDocId(docId);
    const matchedScenarioRepo = matchScenarioRepo(tokens, scenarioRepos);
    const repoMeta = resolveRepoMeta(matchedScenarioRepo, repoIndex);

    const repoKey = repoMeta?.key ?? matchedScenarioRepo?.key ?? null;
    const scope = repoMeta?.scope ?? matchedScenarioRepo?.scope ?? repoKey ?? 'TODO-scope';
    const seedRoot = repoMeta?.usecase_seed_root ?? 'docs/use_cases/_from_hub';
    const pathSuffix = [layer, domain, `${docId}.md`].join('/');
    const targetPath = `${seedRoot.replace(/\/?$/, '')}/${pathSuffix}`;

    if (!repoKey) {
      warnings.push(`Unable to resolve repository for doc_id ${docId}`);
    }

    children.push({
      doc_id: docId,
      scope,
      layer,
      domain,
      repo: repoKey ?? 'TODO-repo-key',
      optional,
      path: targetPath,
      title: item.title ?? null,
    });
  }

  return { children, warnings };
}

function buildYamlSnippet({ scnId, title, children }) {
  const lines = [`- scn_id: ${scnId}`, `  title: ${title ?? 'TODO title'}`, '  children:'];
  for (const child of children) {
    lines.push(`    - doc_id: ${child.doc_id}`);
    lines.push(`      scope: ${child.scope}`);
    lines.push(`      layer: ${child.layer}`);
    lines.push(`      domain: ${child.domain}`);
    if (child.optional) {
      lines.push('      optional: true');
    }
    if (child.repo) {
      lines.push(`      repo: ${child.repo}`);
    }
    lines.push(`      path: ${child.path}`);
    if (child.title) {
      lines.push(`      title: ${child.title}`);
    }
  }
  return lines.join('\n');
}

async function loadScenarioMeta(scenarioPath) {
  const content = await fs.readFile(scenarioPath, 'utf8');
  return parseFrontmatter(content);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  let scenarioPath = args.scenarioPath;

  if (!scenarioPath) {
    if (!args.scnId) {
      console.error('ERROR: Unable to resolve scenario path without --scn-id');
      process.exit(1);
    }
    const matches = await findScenarioPath(args.scnId, args.scenariosRoot);
    if (matches.length === 0) {
      console.error(`Scenario file for ${args.scnId} not found under ${args.scenariosRoot}`);
      process.exit(1);
    }
    if (matches.length > 1) {
      console.warn(`Found multiple matches for ${args.scnId}, using first: ${matches[0]}`);
    }
    scenarioPath = matches[0];
  }

  const absoluteScenarioPath = path.resolve(scenarioPath);
  const repoRoot = process.cwd();
  const relativeScenario = path.relative(repoRoot, absoluteScenarioPath);

  const scenarioMeta = await loadScenarioMeta(absoluteScenarioPath);
  const scnId = scenarioMeta.scn_id ?? scenarioMeta.scnId ?? args.scnId;
  if (!scnId) {
    console.error('Scenario frontmatter missing scn_id');
    process.exit(1);
  }

  const reposMeta = await loadRepos(args.reposPath);
  const repoIndex = buildRepoIndexFromGlobal(reposMeta);

  const { children, warnings } = deriveChildren({ scenarioMeta, repoIndex });
  const title = scenarioMeta.title ?? null;
  const yamlSnippet = buildYamlSnippet({ scnId, title, children });

  if (args.output === 'yaml') {
    console.log(yamlSnippet);
    if (warnings.length) {
      console.error('\nWarnings:');
      for (const warn of warnings) {
        console.error(`- ${warn}`);
      }
    }
    return;
  }

  console.log(
    JSON.stringify(
      {
        scn_id: scnId,
        title,
        scenario_path: relativeScenario,
        children,
        warnings,
        yaml: yamlSnippet,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
