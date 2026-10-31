import fs from 'node:fs'
import path from 'node:path'

/** Explicit release profile: legacy build commands remain production; private previews explicitly select preview. */
export function siteProfile(env = process.env) {
  const mode = env.VITE_SITE_ENV || 'production'
  if (!['preview', 'production'].includes(mode)) throw new Error('VITE_SITE_ENV must be preview or production')
  const production = mode === 'production'
  if (!production && (!env.VITE_SITE_ORIGIN || !env.VITE_MAIN_SITE_ORIGIN)) {
    throw new Error('Preview builds require VITE_SITE_ORIGIN and VITE_MAIN_SITE_ORIGIN')
  }
  const origin = (env.VITE_SITE_ORIGIN || 'https://powerx-doc.artisan-cloud.com').replace(/\/$/, '')
  const companyOrigin = (env.VITE_MAIN_SITE_ORIGIN || 'https://artisan-cloud.com').replace(/\/$/, '')
  for (const value of [origin, companyOrigin]) {
    const url = new URL(value)
    if (url.protocol !== 'https:' || url.pathname !== '/' || url.search || url.hash || url.username || url.password) throw new Error('Site origins must be HTTPS origins without a path')
    if (production && url.hostname.endsWith('.chatgpt.site')) throw new Error('Production metadata must not reference private preview origins')
  }
  return { production, origin, companyOrigin }
}

export function pageMetadata(page, profile, { indexAlias = false } = {}) {
  const relativePath = indexAlias ? page.relativePath.replace(/README\.md$/, 'index.md') : page.relativePath
  const english = page.relativePath.startsWith('en/')
  const path = '/' + relativePath.replace(/index\.md$/, '').replace(/\.md$/, '.html')
  const url = profile.origin + (relativePath === 'index.md' ? '/zh/' : path)
  const archived = page.relativePath.includes('/reference/legacy/')
  const title = `${page.title || (english ? 'Documentation' : '文档')} | PowerX`
  const description = page.description || (english
    ? 'PowerX documentation for business plugins, deployment, integration and AI agents.'
    : 'PowerX 文档：了解业务插件与 AI 底座，选择部署方式，开始插件开发与集成。')
  const noindex = !profile.production || archived
  const schema = {
    '@context': 'https://schema.org', '@type': /(^|\/)index\.md$/.test(relativePath) ? 'WebPage' : 'TechArticle',
    headline: title, description, url,
    inLanguage: english ? 'en-US' : 'zh-CN',
    isPartOf: { '@type': 'WebSite', name: 'PowerX Documentation', url: profile.origin },
    publisher: { '@type': 'Organization', name: 'Artisan Cloud', url: 'https://artisan-cloud.com' },
    about: { '@type': 'SoftwareApplication', name: 'PowerX', applicationCategory: 'BusinessApplication', softwareHelp: { '@type': 'CreativeWork', url: profile.origin + '/zh/' } }
  }
  return [
    ['link', { rel: 'canonical', href: url }],
    ['meta', { name: 'robots', content: noindex ? 'noindex, nofollow' : 'index, follow' }],
    ['meta', { property: 'og:type', content: 'article' }],
    ['meta', { property: 'og:site_name', content: 'PowerX Documentation' }],
    ['meta', { property: 'og:title', content: title }],
    ['meta', { property: 'og:description', content: description }],
    ['meta', { property: 'og:url', content: url }],
    ['meta', { property: 'og:locale', content: english ? 'en_US' : 'zh_CN' }],
    ['meta', { name: 'twitter:card', content: 'summary' }],
    ['meta', { name: 'twitter:title', content: title }],
    ['meta', { name: 'twitter:description', content: description }],
    ['script', { type: 'application/ld+json' }, JSON.stringify(schema).replace(/</g, '\\u003c')]
  ]
}

export function robotsText(profile) {
  return profile.production
    ? `User-agent: *\nAllow: /\nSitemap: ${profile.origin}/sitemap.xml\n`
    : 'User-agent: *\nDisallow: /\n'
}

export function sitemapEntries(items) {
  return items
    .filter(item => /^zh\/(?:overview\/|guides\/|guides\/(?:local-dev|xdocker|systemd|maintenance)\.html|plugins\/|developers\/|reference\/)?$/.test(item.url))
    .map(item => {
      const entry = { ...item }
      // The inherited localization tree includes en/zh duplicate pages. Never
      // advertise them as equivalent translations of the rewritten entry pages.
      delete entry.links
      return entry
    })
}


export function hasEquivalentIndex(relativePath, root) {
  if (!relativePath.endsWith('/README.md')) return false
  const readme = path.join(root, relativePath)
  const index = path.join(path.dirname(readme), 'index.md')
  return fs.existsSync(index) && fs.existsSync(readme) &&
    fs.readFileSync(readme, 'utf8') === fs.readFileSync(index, 'utf8')
}
