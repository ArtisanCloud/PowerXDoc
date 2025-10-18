import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOCS_ROOT = path.resolve(__dirname, '../../docs');
const TARGET_LOCALE = 'en-US';
const TARGET_ROOT = path.join(DOCS_ROOT, 'en');
const MANIFEST_PATH = path.join(DOCS_ROOT, 'localization', 'manifest.json');

async function loadManifest() {
  const raw = await fs.readFile(MANIFEST_PATH, 'utf8');
  return JSON.parse(raw);
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

function isLocalizableMarkdown(file) {
  const excludeDirs = ['.vitepress', 'en', 'localization', 'assets'];
  const segments = file.split(path.sep);
  if (segments.some((segment) => excludeDirs.includes(segment))) {
    return false;
  }
  return file.endsWith('.md');
}

async function collectSourceFiles() {
  const files = [];

  async function walk(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.isFile() && isLocalizableMarkdown(path.relative(DOCS_ROOT, fullPath))) {
        files.push(fullPath);
      }
    }
  }

  await walk(DOCS_ROOT);
  return files;
}

function buildPlaceholderContent(relativePath, manifest) {
  const normalizedSlug = `/${relativePath.replace(/index\.md$/, '').replace(/\\/g, '/')}`;
  const manifestEntry = manifest.pages[normalizedSlug] ?? manifest.pages[`/${relativePath}`];
  const title = manifestEntry?.title ?? path.basename(relativePath, '.md');
  const partnerSlug = manifestEntry?.partnerSlug ?? normalizedSlug;
  return `---\ntitle: ${JSON.stringify(title)}\nreviewStatus: Placeholder\npartnerSlug: ${JSON.stringify(partnerSlug)}\n---\n\n> ⚠️ This page is awaiting human translation from zh-CN.\n\n- Source: ${partnerSlug}\n- Status: Pending review\n`;
}

async function mirror(manifest) {
  const files = await collectSourceFiles();
  await ensureDir(TARGET_ROOT);
  let manifestMutated = false;

  for (const sourceFile of files) {
    const relative = path.relative(DOCS_ROOT, sourceFile);
    const targetFile = path.join(TARGET_ROOT, relative);
    const targetDir = path.dirname(targetFile);
    await ensureDir(targetDir);

    const normalizedSlug = `/${relative.replace(/index\.md$/, '').replace(/\\/g, '/')}`;
    if (!manifest.pages[normalizedSlug]) {
      manifest.pages[normalizedSlug] = {
        slug: relative.replace(/\.md$/, ''),
        partnerSlug: normalizedSlug,
        title: path.basename(relative, '.md'),
      };
      manifestMutated = true;
    }

    try {
      await fs.access(targetFile);
      continue;
    } catch {
      const content = buildPlaceholderContent(relative, manifest);
      await fs.writeFile(targetFile, content, 'utf8');
    }
  }

  if (manifestMutated) {
    await fs.writeFile(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  }
}

async function main() {
  try {
    const manifest = await loadManifest();
    if (!manifest.targetLocales.includes(TARGET_LOCALE)) {
      throw new Error(`Target locale ${TARGET_LOCALE} missing from manifest`);
    }
    await mirror(manifest);
    console.log('Locale mirror completed successfully.');
  } catch (error) {
    console.error('Failed to mirror locales:', error);
    process.exit(1);
  }
}

await main();
