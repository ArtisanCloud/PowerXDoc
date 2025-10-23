import { promises as fs } from 'fs';
import path from 'path';
import { createHash } from 'crypto';

export const REQUIRED_SECTIONS = [
  'Positioning & Goals',
  'Core Capabilities',
  'Acceptance Criteria',
  'Validation Workflow',
  'Related Links',
  'Architecture Diagram',
];

export class ScenarioValidationError extends Error {
  constructor(message, code = 'SCENARIO_VALIDATION') {
    super(message);
    this.name = 'ScenarioValidationError';
    this.code = code;
  }
}

export async function readScenario(filePath) {
  const absolute = path.resolve(filePath);
  const raw = await fs.readFile(absolute, 'utf8');
  const frontmatterMatch = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) {
    throw new ScenarioValidationError(`Scenario ${filePath} missing frontmatter block`, 'MISSING_FRONTMATTER');
  }

  const frontmatterLines = frontmatterMatch[1]
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const frontmatter = {};
  for (const line of frontmatterLines) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (!key) continue;
    if (value.startsWith('[') && value.endsWith(']')) {
      frontmatter[key] = value
        .slice(1, -1)
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
      continue;
    }
    frontmatter[key] = value.replace(/^['"]|['"]$/g, '');
  }

  const body = raw.slice(frontmatterMatch[0].length).trim();
  const sections = parseSections(body);

  return { filePath: absolute, raw, frontmatter, body, sections };
}

function parseSections(markdown) {
  const lines = markdown.split(/\r?\n/);
  const sections = new Map();
  let current = null;
  let buffer = [];

  const flush = () => {
    if (current) {
      sections.set(current, buffer.join('\n').trim());
    }
    buffer = [];
  };

  for (const line of lines) {
    const headingMatch = line.match(/^#\s+(.+?)\s*$/);
    if (headingMatch) {
      flush();
      current = headingMatch[1].trim();
      continue;
    }
    buffer.push(line);
  }
  flush();

  return sections;
}

export function validateScenarioStructure(scenario) {
  const errors = [];

  for (const key of ['scn_id', 'title', 'status']) {
    if (!scenario.frontmatter[key]) {
      errors.push({ code: 'FRONTMATTER_MISSING', message: `Frontmatter missing \`${key}\`` });
    }
  }

  for (const section of REQUIRED_SECTIONS) {
    if (!scenario.sections.has(section)) {
      errors.push({ code: 'SECTION_MISSING', message: `Missing section "${section}"` });
    }
  }

  const diagramContent = scenario.sections.get('Architecture Diagram') ?? '';
  if (!/```mermaid[\s\S]*```/.test(diagramContent)) {
    errors.push({
      code: 'MERMAID_MISSING',
      message: 'Architecture Diagram section must contain a mermaid code block',
    });
  }

  if (errors.length) {
    throw new ScenarioValidationError(
      `Scenario ${scenario.frontmatter.scn_id ?? scenario.filePath} failed validation`,
      'SCENARIO_INVALID',
    );
  }
}

export function computeScenarioFingerprint(scenario, docmapEntry) {
  const hash = createHash('sha256');
  hash.update(scenario.raw);
  hash.update(JSON.stringify(docmapEntry ?? {}));
  return hash.digest('hex');
}

export function renderScenarioMarkdown(scenario, docmapEntry) {
  const frontmatterLines = [
    '---',
    `title: ${JSON.stringify(scenario.frontmatter.title ?? '')}`,
    `scn_id: ${JSON.stringify(scenario.frontmatter.scn_id ?? '')}`,
    `status: ${JSON.stringify(scenario.frontmatter.status ?? 'Draft')}`,
  ];

  if (docmapEntry?.children?.length) {
    frontmatterLines.push('children:');
    for (const child of docmapEntry.children) {
      frontmatterLines.push(`  - doc_id: ${JSON.stringify(child.doc_id ?? '')}`);
      frontmatterLines.push(`    scope: ${JSON.stringify(child.scope ?? '')}`);
      frontmatterLines.push(`    layer: ${JSON.stringify(child.layer ?? '')}`);
      frontmatterLines.push(`    domain: ${JSON.stringify(child.domain ?? '')}`);
      if (child.optional !== undefined) {
        frontmatterLines.push(`    optional: ${child.optional ? 'true' : 'false'}`);
      }
      if (child.repo) {
        frontmatterLines.push(`    repo: ${JSON.stringify(child.repo)}`);
      }
      if (child.path) {
        frontmatterLines.push(`    path: ${JSON.stringify(child.path)}`);
      }
    }
  }

  frontmatterLines.push(`generated_at: ${JSON.stringify(new Date().toISOString())}`);
  frontmatterLines.push('---\n');

  return `${frontmatterLines.join('\n')}${scenario.body.trim()}\n`;
}
