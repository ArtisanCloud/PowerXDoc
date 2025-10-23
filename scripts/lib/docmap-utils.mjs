import { promises as fs } from 'fs';
import path from 'path';

const COMMENT_RE = /^\s*#/;

export class DocmapValidationError extends Error {
  constructor(message, code = 'DOCMAP_VALIDATION') {
    super(message);
    this.name = 'DocmapValidationError';
    this.code = code;
  }
}

function stripComments(content) {
  return content
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+$/, ''))
    .filter((line) => line && !COMMENT_RE.test(line));
}

function parseScalar(value) {
  if (value === 'null' || value === '~') return null;
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (/^-?\d+$/.test(value)) return Number.parseInt(value, 10);
  if (/^-?\d+\.\d+$/.test(value)) return Number.parseFloat(value);
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  return value;
}

function splitKeyValue(line) {
  const idx = line.indexOf(':');
  if (idx === -1) {
    return [line, undefined];
  }
  const key = line.slice(0, idx).trim();
  const value = line.slice(idx + 1).trim();
  return [key, value === '' ? undefined : value];
}

function parseBlock(lines, startIndex, currentIndent) {
  let index = startIndex;
  let result;

  while (index < lines.length) {
    const rawLine = lines[index];
    const indent = rawLine.match(/^\s*/)[0].length;
    const content = rawLine.slice(indent);

    if (indent < currentIndent) {
      break;
    }

    if (content.startsWith('- ')) {
      if (result === undefined) result = [];
      if (!Array.isArray(result)) {
        throw new DocmapValidationError(`Mixed sequence and mapping at line ${index + 1}`, 'DOCMAP_PARSE');
      }
      const remainder = content.slice(2).trim();
      if (remainder) {
        if (remainder.includes(':')) {
          const [key, value] = splitKeyValue(remainder);
          const item = {};
          if (value !== undefined) {
            item[key] = parseScalar(value);
          }
          const { value: nested, nextIndex } = parseBlock(lines, index + 1, indent + 2);
          const progressIndex = Math.max(nextIndex, index + 1);
          if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
            Object.assign(item, nested);
            index = progressIndex;
          } else if (nested !== undefined && nested !== null && !(Array.isArray(nested) && nested.length === 0)) {
            if (value === undefined) {
              item[key] = nested;
            }
            index = progressIndex;
          } else {
            index += 1;
          }
          result.push(item);
        } else {
          result.push(parseScalar(remainder));
          index += 1;
        }
      } else {
        const { value, nextIndex } = parseBlock(lines, index + 1, indent + 2);
        result.push(value);
        index = nextIndex;
      }
      continue;
    }

    if (result === undefined) result = {};
    if (Array.isArray(result)) {
      throw new DocmapValidationError(`Mixed sequence and mapping at line ${index + 1}`, 'DOCMAP_PARSE');
    }

    const [key, value] = splitKeyValue(content);
    if (value === undefined) {
      const { value: nested, nextIndex } = parseBlock(lines, index + 1, indent + 2);
      const progressIndex = Math.max(nextIndex, index + 1);
      result[key] = nested ?? {};
      index = progressIndex;
    } else if (value.startsWith('[') && value.endsWith(']')) {
      const entries = value.slice(1, -1).split(',').map((item) => item.trim()).filter(Boolean);
      result[key] = entries.map(parseScalar);
      index += 1;
    } else {
      result[key] = parseScalar(value);
      index += 1;
    }
  }

  return { value: result, nextIndex: index };
}

function parseSimpleYaml(content) {
  const lines = stripComments(content);
  if (lines.length === 0) return {};
  const { value } = parseBlock(lines, 0, 0);
  return value ?? {};
}

async function readYaml(filePath, defaultValue) {
  try {
    const absolute = path.resolve(filePath);
    const content = await fs.readFile(absolute, 'utf8');
    if (!content.trim()) return defaultValue;
    return parseSimpleYaml(content);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return defaultValue;
    }
    throw error;
  }
}

export async function loadDocmap(docmapPath = 'docs/_data/docmap.yaml') {
  const data = await readYaml(docmapPath, { scenarios: [] });
  if (!Array.isArray(data.scenarios)) {
    throw new DocmapValidationError('`scenarios` must be an array in docmap.yaml');
  }
  return data;
}

export async function loadTaxonomy(taxonomyPath = 'docs/_data/taxonomy.yaml') {
  const data = await readYaml(taxonomyPath, { scopes: [], layers: [], domains: [] });
  return {
    scopes: Array.isArray(data.scopes) ? data.scopes : [],
    layers: Array.isArray(data.layers) ? data.layers : [],
    domains: Array.isArray(data.domains) ? data.domains : [],
  };
}

export async function loadRepos(reposPath = 'docs/_data/repos.yaml') {
  const data = await readYaml(reposPath, { repos: [] });
  if (!Array.isArray(data.repos)) {
    throw new DocmapValidationError('`repos` must be an array in repos.yaml');
  }
  return data;
}

export async function loadStandardsMap(mapPath = 'docs/_data/standards-map.yaml') {
  const data = await readYaml(mapPath, {});
  const normalizeList = (value) => (Array.isArray(value) ? value : []).map(String);

  const defaults = {
    include: normalizeList(data?.defaults?.include),
    exclude: normalizeList(data?.defaults?.exclude),
  };

  const scopes = {};
  if (data?.scopes && typeof data.scopes === 'object') {
    for (const [scope, config] of Object.entries(data.scopes)) {
      scopes[scope] = {
        include: normalizeList(config?.include),
        exclude: normalizeList(config?.exclude),
      };
    }
  }

  const repos = {};
  if (data?.repos && typeof data.repos === 'object') {
    for (const [key, config] of Object.entries(data.repos)) {
      repos[key] = {
        include: normalizeList(config?.include),
        exclude: normalizeList(config?.exclude),
      };
    }
  }

  return { defaults, scopes, repos };
}

function ensureChildArray(children, scnId) {
  if (!Array.isArray(children)) {
    return [
      {
        type: 'error',
        message: `Scenario ${scnId} has non-array \`children\` entries`,
        code: 'DOCMAP_CHILD_SHAPE',
      },
    ];
  }
  return [];
}

export function detectDuplicateIds(docmap) {
  const errors = [];
  const scnIds = new Map();
  const docIds = new Map();

  for (const scenario of docmap.scenarios ?? []) {
    const scnId = scenario.scn_id;
    if (!scnId) {
      errors.push({ code: 'DOCMAP_SCN_ID_MISSING', message: 'Scenario missing `scn_id`' });
      continue;
    }
    const list = scnIds.get(scnId) ?? [];
    list.push(scenario);
    scnIds.set(scnId, list);

    if (scenario.children) {
      for (const child of scenario.children) {
        const docId = child?.doc_id;
        if (!docId) {
          errors.push({
            code: 'DOCMAP_DOC_ID_MISSING',
            message: `Scenario ${scnId} has child without doc_id`,
          });
          continue;
        }
        const childList = docIds.get(docId) ?? [];
        childList.push({ child, parent: scnId });
        docIds.set(docId, childList);
      }
    }
  }

  for (const [id, entries] of scnIds.entries()) {
    if (entries.length > 1) {
      errors.push({
        code: 'DOCMAP_SCN_ID_DUPLICATE',
        message: `Duplicate scn_id detected: ${id}`,
        context: entries,
      });
    }
  }

  for (const [docId, entries] of docIds.entries()) {
    if (entries.length > 1) {
      errors.push({
        code: 'DOCMAP_DOC_ID_DUPLICATE',
        message: `Duplicate doc_id detected: ${docId}`,
        context: entries,
      });
    }
  }

  return errors;
}

export function validateDocmap(docmap, taxonomy = { scopes: [], layers: [], domains: [] }) {
  const errors = [];
  const warnings = [];

  errors.push(...detectDuplicateIds(docmap));

  for (const scenario of docmap.scenarios ?? []) {
    const scnId = scenario.scn_id ?? '<missing>';
    if (!scenario.children) {
      warnings.push({
        code: 'DOCMAP_CHILDREN_EMPTY',
        message: `Scenario ${scnId} has no children listed`,
      });
      continue;
    }

    errors.push(...ensureChildArray(scenario.children, scnId));

    for (const child of scenario.children ?? []) {
      const { scope, layer, domain } = child;
      if (taxonomy.scopes.length && scope && !taxonomy.scopes.includes(scope)) {
        errors.push({
          code: 'DOCMAP_SCOPE_INVALID',
          message: `Child ${child.doc_id ?? '<unknown>'} has invalid scope "${scope}"`,
          context: child,
        });
      }
      if (taxonomy.layers.length && layer && !taxonomy.layers.includes(layer)) {
        errors.push({
          code: 'DOCMAP_LAYER_INVALID',
          message: `Child ${child.doc_id ?? '<unknown>'} has invalid layer "${layer}"`,
          context: child,
        });
      }
      if (taxonomy.domains.length && domain && !taxonomy.domains.includes(domain)) {
        errors.push({
          code: 'DOCMAP_DOMAIN_INVALID',
          message: `Child ${child.doc_id ?? '<unknown>'} has invalid domain "${domain}"`,
          context: child,
        });
      }
    }
  }

  return { errors, warnings };
}

export function summarizeDocmap(docmap) {
  const summary = { scenarios: 0, children: 0 };
  for (const scenario of docmap.scenarios ?? []) {
    summary.scenarios += 1;
    summary.children += Array.isArray(scenario.children) ? scenario.children.length : 0;
  }
  return summary;
}
