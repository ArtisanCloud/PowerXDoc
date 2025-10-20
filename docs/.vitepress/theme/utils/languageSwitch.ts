import type { Router } from 'vitepress'
import { inBrowser } from 'vitepress'
import manifest from '../../../localization/manifest.json'
import {
  DEFAULT_LOCALE,
  ensureLocalePreference,
  isSupportedLocale,
  rememberLocale,
  syncDocumentLocale,
  type LocaleKey,
} from './localePreference'

const MANIFEST_PAGES = manifest.pages
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

function detectLocaleFromPath(path: string): LocaleKey {
  const normalized = normalizePath(path)
  for (const [locale, prefix] of Object.entries(LOCALE_PREFIX_MAP)) {
    if (!prefix) continue
    const normalizedPrefix = normalizePath(prefix)
    if (normalized.startsWith(normalizedPrefix)) {
      return locale as LocaleKey
    }
  }
  return DEFAULT_LOCALE
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

function resolveManifestSlug(path: string): string | null {
  const normalized = normalizePath(path)
  const candidates = new Set<string>()

  candidates.add(normalized)

  const trimmed = normalized !== '/' && normalized.endsWith('/')
    ? normalized.slice(0, -1)
    : normalized
  candidates.add(trimmed)

  const extMatch = trimmed.match(/\.(md|html)$/)
  const base = extMatch ? trimmed.slice(0, -extMatch[0].length) : trimmed
  candidates.add(base)

  if (base && base !== '/' && !base.endsWith('/')) {
    candidates.add(`${base}/`)
  }

  if (base && base !== '/') {
    candidates.add(`${base}.md`)
    candidates.add(`${base}.html`)
  }

  for (const candidate of candidates) {
    if (candidate && MANIFEST_PAGES[candidate]) {
      return candidate
    }
  }
  return null
}

function hasManifestEntry(slug: string): boolean {
  return Boolean(resolveManifestSlug(slug))
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

export function installLocaleSwitch(
  router: Router,
  onLocaleChange?: (locale: LocaleKey) => void,
) {
  if (!inBrowser) return
  const originalGo = router.go.bind(router)

  const currentPath = normalizePath(router.route.path)
  const activeLocale = detectLocaleFromPath(currentPath)
  const preferredLocale = ensureLocalePreference(activeLocale)

  const applyLocale = (locale: LocaleKey) => {
    if (isSupportedLocale(locale)) {
      rememberLocale(locale)
      syncDocumentLocale(locale)
      onLocaleChange?.(locale)
    }
  }

  if (preferredLocale !== activeLocale) {
    const basePath = stripLocalePrefix(currentPath, activeLocale)
    const { path } = resolveLocaleNavigation(basePath, preferredLocale)
    if (path !== currentPath) {
      applyLocale(preferredLocale)
      void originalGo(path, true)
    }
  } else {
    applyLocale(activeLocale)
  }

  router.onAfterRouteChange = async (to) => {
    const normalized = normalizePath(to)
    const locale = detectLocaleFromPath(normalized)
    applyLocale(locale)
  }

  router.go = async (href: string, replace?: boolean) => {
    const normalizedTarget = normalizePath(href ?? router.route.path)
    const targetLocale = detectLocaleFromPath(normalizedTarget)
    applyLocale(targetLocale)
    const basePath = stripLocalePrefix(normalizedTarget, targetLocale)
    const { path, fallback } = resolveLocaleNavigation(basePath, targetLocale)

    if (fallback) {
      console.info(`[PowerX][i18n] Redirecting to fallback locale path "${path}".`)
    }

    return originalGo(path, replace)
  }
}

export function toLocalePath(rawPath: string, locale: LocaleKey) {
  const normalizedTarget = normalizePath(rawPath)
  const detectedLocale = detectLocaleFromPath(normalizedTarget)
  const basePath = stripLocalePrefix(normalizedTarget, detectedLocale)
  const { path } = resolveLocaleNavigation(basePath, locale)
  return path
}
