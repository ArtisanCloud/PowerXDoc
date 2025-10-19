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

  const currentPath = normalizePath(router.route.path)
  const activeLocale = detectLocaleFromPath(currentPath)
  const preferredLocale = ensureLocalePreference(activeLocale)

  if (preferredLocale !== activeLocale) {
    const basePath = stripLocalePrefix(currentPath, activeLocale)
    const { path } = resolveLocaleNavigation(basePath, preferredLocale)
    if (path !== currentPath) {
      rememberLocale(preferredLocale)
      syncDocumentLocale(preferredLocale)
      void originalGo(path, true)
    }
  } else {
    syncDocumentLocale(activeLocale)
  }

  router.onAfterRouteChange = async (to) => {
    const normalized = normalizePath(to)
    const locale = detectLocaleFromPath(normalized)
    if (isSupportedLocale(locale)) {
      rememberLocale(locale)
      syncDocumentLocale(locale)
    }
  }

  router.go = async (href: string, replace?: boolean) => {
    const normalizedTarget = normalizePath(href ?? router.route.path)
    const targetLocale = detectLocaleFromPath(normalizedTarget)
    if (isSupportedLocale(targetLocale)) {
      rememberLocale(targetLocale)
      syncDocumentLocale(targetLocale)
    }
    const basePath = stripLocalePrefix(normalizedTarget, targetLocale)
    const { path, fallback } = resolveLocaleNavigation(basePath, targetLocale)

    if (fallback) {
      console.info(`[PowerX][i18n] Redirecting to fallback locale path "${path}".`)
    }

    return originalGo(path, replace)
  }
}
