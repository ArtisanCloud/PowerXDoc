#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

import { loadDocmap, loadRepos } from '../../../scripts/lib/docmap-utils.mjs';

function usage() {
  console.log(`Usage: setup-usecase-seeds --scn-id <ID> [options]

Options:
  --scn-id <ID>           Scenario identifier (required)
  --docmap <path>         Path to docmap.yaml (default: docs/_data/docmap.yaml)
  --repos <path>          Path to repos.yaml (default: docs/_data/repos.yaml)
  --template <path>       Seed body template (default: docs/usecases-seeds/_template.md)
  --seed-root <dir>       Output root for generated seeds (default: docs/usecases-seeds)
  --doc-id <id>           Filter to a specific doc_id (repeatable)
  --scope <scope>         Filter children by scope (repeatable)
  --layer <layer>         Filter children by layer (repeatable)
  --domain <domain>       Filter children by domain (repeatable)
  --dry-run               List actions without writing files
  --force                 Overwrite existing seed files
  --json                  Emit JSON summary instead of human-readable output
  --help, -h              Show this message
`);
}

function collect(values, value) {
  if (!value) return values;
  values.add(value);
  return values;
}

function parseArgs(argv) {
  const args = {
    docmap: 'docs/_data/docmap.yaml',
    repos: 'docs/_data/repos.yaml',
    template: 'docs/usecases-seeds/_template.md',
    seedRoot: 'docs/usecases-seeds',
    scnId: '',
    docIds: new Set(),
    scopes: new Set(),
    layers: new Set(),
    domains: new Set(),
    force: false,
    dryRun: false,
    json: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    switch (token) {
      case '--scn-id':
        args.scnId = argv[++i] ?? '';
        break;
      case '--docmap':
        args.docmap = argv[++i] ?? args.docmap;
        break;
      case '--repos':
        args.repos = argv[++i] ?? args.repos;
        break;
      case '--template':
        args.template = argv[++i] ?? args.template;
        break;
      case '--seed-root':
        args.seedRoot = argv[++i] ?? args.seedRoot;
        break;
      case '--doc-id':
        collect(args.docIds, argv[++i]);
        break;
      case '--scope':
        collect(args.scopes, argv[++i]);
        break;
      case '--layer':
        collect(args.layers, argv[++i]);
        break;
      case '--domain':
        collect(args.domains, argv[++i]);
        break;
      case '--force':
        args.force = true;
        break;
      case '--dry-run':
        args.dryRun = true;
        break;
      case '--json':
        args.json = true;
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

  if (!args.scnId) {
    console.error('ERROR: --scn-id is required.');
    usage();
    process.exit(1);
  }

  return args;
}

async function readTemplateBody(templatePath) {
  const absolute = path.resolve(templatePath);
  const content = await fs.readFile(absolute, 'utf8');
  const marker = '\n---\n';
  const idx = content.indexOf(marker);
  if (idx === -1) {
    throw new Error(`Template ${templatePath} is missing body separator ("---").`);
  }
  const body = content.slice(idx + marker.length);
  return body;
}

function buildOwners(repoMeta) {
  const maintainers = repoMeta?.maintainers?.default ?? [];
  if (!Array.isArray(maintainers) || maintainers.length === 0) {
    return [
      {
        name: 'TODO Owner',
        role: 'TODO Role',
        contact: '<todo@example.com>',
      },
    ];
  }
  return maintainers.map((entry) => ({
    name: entry?.name ?? 'TODO Owner',
    role: entry?.role ?? 'TODO Role',
    contact: entry?.contact ?? '<todo@example.com>',
  }));
}

function formatOwners(owners) {
  const lines = ['owners:'];
  for (const owner of owners) {
    lines.push(`  - name: ${owner.name}`);
    if (owner.role) {
      lines.push(`    role: ${owner.role}`);
    } else {
      lines.push('    role: TODO Role');
    }
    if (owner.contact) {
      lines.push(`    contact: ${owner.contact}`);
    } else {
      lines.push('    contact: <todo@example.com>');
    }
  }
  return lines;
}

function buildFrontmatter({ child, scnId, scenarioTitle, repoMeta }) {
  const docId = child.doc_id;
  const scope = child.scope ?? repoMeta?.scope ?? child.repo ?? child.repo_key ?? 'TODO-scope';
  const layer = child.layer ?? 'TODO-layer';
  const domain = child.domain ?? 'TODO-domain';
  const repoKey = child.repo ?? child.repo_key ?? repoMeta?.key ?? scope;
  const title = child.title ?? `${docId} - ${layer}/${domain}`;
  const date = new Date().toISOString().slice(0, 10);
  const owners = formatOwners(buildOwners(repoMeta));

  const lines = [
    `doc_id: ${docId}`,
    `scn_id: ${scnId}`,
    `title: ${title}`,
    'status: Draft',
    'version: v0.1.0',
    `repo_key: ${repoKey}`,
    `scope: ${scope}`,
    `layer: ${layer}`,
    `domain: ${domain}`,
    `scenario_title: "${scenarioTitle ?? ''}"`,
  ];

  lines.push(...owners);
  lines.push('contributors: []');
  lines.push('linked_requirements: []');
  lines.push('code_refs: []');
  if (child.optional === true) {
    lines.push('optional: true');
  }
  lines.push('feature_flags: []');
  lines.push(`last_reviewed_at: ${date}`);

  return lines.join('\n');
}

function matchesFilters(child, filters) {
  if (filters.docIds.size && !filters.docIds.has(child.doc_id)) return false;
  if (filters.scopes.size && (!child.scope || !filters.scopes.has(child.scope))) return false;
  if (filters.layers.size && (!child.layer || !filters.layers.has(child.layer))) return false;
  if (filters.domains.size && (!child.domain || !filters.domains.has(child.domain))) return false;
  return true;
}

async function ensureDirectory(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function writeSeedFile(targetPath, content, { force, dryRun }) {
  const exists = await fs
    .access(targetPath)
    .then(() => true)
    .catch(() => false);

  if (exists && !force) {
    return { status: 'skipped', reason: 'exists' };
  }

  if (!dryRun) {
    await ensureDirectory(path.dirname(targetPath));
    await fs.writeFile(targetPath, content, 'utf8');
  }

  return { status: exists ? 'overwritten' : 'created' };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const repoRoot = process.cwd();

  const [docmap, reposBody, templateBody] = await Promise.all([
    loadDocmap(args.docmap),
    loadRepos(args.repos),
    readTemplateBody(args.template),
  ]);

  const scenario =
    docmap.scenarios?.find((entry) => entry?.scn_id === args.scnId) ??
    docmap.scenarios?.find((entry) => entry?.scnId === args.scnId);

  if (!scenario) {
    console.error(`Scenario ${args.scnId} not found in ${args.docmap}`);
    process.exit(1);
  }

  if (!Array.isArray(scenario.children) || scenario.children.length === 0) {
    console.error(`Scenario ${args.scnId} has no children in docmap.yaml`);
    process.exit(1);
  }

  const repoIndex = new Map();
  for (const repo of reposBody.repos ?? []) {
    if (repo?.key) {
      repoIndex.set(repo.key, repo);
    }
  }

  const results = [];
  const scenarioDir = path.resolve(repoRoot, args.seedRoot, args.scnId);

  for (const child of scenario.children) {
    if (!child?.doc_id) continue;
    if (!matchesFilters(child, args)) continue;

    const repoKey = child.repo ?? child.repo_key ?? child.scope;
    const repoMeta = repoIndex.get(repoKey);

    const target = path.resolve(scenarioDir, `${child.doc_id}.md`);

    const frontmatter = buildFrontmatter({
      child,
      scnId: args.scnId,
      scenarioTitle: scenario.title ?? '',
      repoMeta,
    });

    const content = `${frontmatter}\n\n---\n${templateBody}`;
    const writeResult = await writeSeedFile(target, content, {
      force: args.force,
      dryRun: args.dryRun,
    });

    const relativePath = path.relative(repoRoot, target);
    results.push({
      doc_id: child.doc_id,
      path: relativePath,
      status: writeResult.status,
      optional: child.optional === true,
      scope: child.scope ?? repoMeta?.scope ?? null,
      layer: child.layer ?? null,
      domain: child.domain ?? null,
    });
  }

  if (!results.length) {
    console.warn('No seeds matched the provided filters.');
  }

  if (args.json) {
    console.log(
      JSON.stringify(
        {
          scn_id: args.scnId,
          seed_root: args.seedRoot,
          dry_run: args.dryRun,
          results,
        },
        null,
        2,
      ),
    );
    return;
  }

  console.log(`Scenario ${args.scnId}:`);
  for (const entry of results) {
    console.log(`- [${entry.status}] ${entry.doc_id} → ${entry.path}`);
  }
  if (args.dryRun) {
    console.log('(dry run) No files were written.');
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
