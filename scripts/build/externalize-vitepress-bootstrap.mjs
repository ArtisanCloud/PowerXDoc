import { promises as fs } from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'

const INLINE_BOOTSTRAP = /<script>(window\.__VP_HASH_MAP__=[\s\S]*?)<\/script>/g
const EXTERNAL_MARKER = 'data-vp-bootstrap'

/** Replace only VitePress's repeated globals, leaving all other HTML unchanged. */
export function externalizeHtmlBootstrap(html, assetBase = '/assets/') {
  const assets = new Map()
  let replacements = 0
  const output = html.replace(INLINE_BOOTSTRAP, (tag, body) => {
    if (!body.includes('window.__VP_SITE_DATA__=')) {
      throw new Error('Unrecognized VitePress bootstrap: missing site data')
    }
    const hash = createHash('sha256').update(body).digest('hex')
    const filename = `vp-bootstrap-${hash}.js`
    assets.set(filename, body)
    replacements += 1
    // A classic synchronous script at the original position executes before the
    // deferred module app. Do not add async/defer/type=module or move this tag.
    return `<script src="${assetBase}${filename}" ${EXTERNAL_MARKER}></script>`
  })
  if (replacements > 1) throw new Error('Unexpected multiple VitePress bootstrap blocks')
  if (!replacements && html.includes('window.__VP_HASH_MAP__')) {
    throw new Error('Unrecognized inline VitePress bootstrap format')
  }
  return { html: output, assets, replacements }
}

export async function externalizeVitepressBootstrap(outDir, base = '/') {
  const assetBase = `${base.replace(/\/$/, '')}/assets/`
  const assets = new Map()
  let htmlFiles = 0
  let rewritten = 0
  let savedBytes = 0
  async function visit(dir) {
    for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
      const filename = path.join(dir, entry.name)
      if (entry.isDirectory()) await visit(filename)
      else if (entry.isFile() && entry.name.endsWith('.html')) {
        htmlFiles += 1
        const original = await fs.readFile(filename, 'utf8')
        const result = externalizeHtmlBootstrap(original, assetBase)
        if (!result.replacements) continue
        for (const [asset, body] of result.assets) assets.set(asset, body)
        savedBytes += Buffer.byteLength(original) - Buffer.byteLength(result.html)
        await fs.writeFile(filename, result.html)
        rewritten += 1
      }
    }
  }
  await visit(outDir)
  await fs.mkdir(path.join(outDir, 'assets'), { recursive: true })
  for (const [filename, body] of assets) {
    await fs.writeFile(path.join(outDir, 'assets', filename), body)
    savedBytes -= Buffer.byteLength(body)
  }
  return { htmlFiles, rewritten, sharedAssets: assets.size, savedBytes }
}
