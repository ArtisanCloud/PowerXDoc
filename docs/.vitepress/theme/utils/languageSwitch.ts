import type { Router } from 'vitepress'
import { inBrowser } from 'vitepress'
import manifest from '../../../localization/manifest.json'

type LocaleKey = string

const MANIFEST_PAGES = manifest.pages
export const DEFAULT_LOCALE = manifest.sourceLocale
export const LOCALE_PREFIX_MAP: Record<LocaleKey, string> = {
  'en-US': '/en',
}

function normalizePath(path: string): string {
  if (!path.startsWith('/')) {
    path = `/${path}`
  }
  if (path === '/') {
    return '/'
  }
  if (path.endsWith('.html')) {
    path = path.replace(/\.html$/, '/')
  }
  if (!path.endsWith('/')) {
    path = `${path}/`
  }
  return path
}

function stripLocalePrefix(path: string, locale: LocaleKey): string {
  const prefix = LOCALE_PREFIX_MAP[locale]
  if (!prefix || locale === DEFAULT_LOCALE) {
    return normalizePath(path)
  }
  if (path.startsWith(prefix)) {
    const stripped = path.slice(prefix.length) || '/'
    return normalizePath(stripped)
  }
  return normalizePath(path)
}

function buildLocalePath(basePath: string, targetLocale: LocaleKey): string {
  const prefix = LOCALE_PREFIX_MAP[targetLocale]
  if (!prefix || targetLocale === DEFAULT_LOCALE) {
    return normalizePath(basePath)
  }
  if (basePath === '/') {
    return `${prefix}/`
  }
  return normalizePath(`${prefix}${basePath === '/' ? '' : basePath}`)
}

function hasManifestEntry(slug: string): boolean {
  return Boolean(MANIFEST_PAGES[slug])
}

function recordFallback(slug: string, targetLocale: LocaleKey) {
  if (!inBrowser) return
  const message = `[PowerX][i18n] Missing locale mapping for "${slug}" -> ${targetLocale}. Falling back to default.`
  console.warn(message)
  window.dispatchEvent(
    new CustomEvent('powerx:i18n-fallback', {
      detail: { slug, targetLocale, timestamp: Date.now() },
    }),
  )
}

export function resolveLocaleNavigation(basePath: string, targetLocale: LocaleKey) {
  const targetPath = buildLocalePath(basePath, targetLocale)

  if (targetLocale === DEFAULT_LOCALE) {
    return { path: targetPath, fallback: false }
  }

  if (!hasManifestEntry(basePath)) {
    recordFallback(basePath, targetLocale)
    return { path: buildLocalePath('/', targetLocale), fallback: true }
  }

  return { path: targetPath, fallback: false }
}

export function getBasePath(currentPath: string, currentLocale: LocaleKey) {
  return stripLocalePrefix(normalizePath(currentPath), currentLocale)
}

export function installLocaleSwitch(router: Router) {
  if (!inBrowser) return
  const originalGo = router.go.bind(router)

  router.go = async (href: string, replace?: boolean) => {
    const normalizedTarget = normalizePath(href)
    const targetLocale = normalizedTarget.startsWith('/en/') ? 'en-US' : DEFAULT_LOCALE
    const basePath = stripLocalePrefix(normalizedTarget, targetLocale)
    const { path, fallback } = resolveLocaleNavigation(basePath, targetLocale)

    if (fallback) {
      console.info(`[PowerX][i18n] Redirecting to fallback locale path "${path}".`)
    }

    return originalGo(path, replace)
  }
}
