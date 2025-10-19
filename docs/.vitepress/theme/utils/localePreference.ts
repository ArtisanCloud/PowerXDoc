import { inBrowser } from 'vitepress'
import manifest from '../../../localization/manifest.json'

export type LocaleKey = string

const STORAGE_KEY = 'powerx:locale-preference'

export const DEFAULT_LOCALE: LocaleKey = manifest.sourceLocale
const TARGET_LOCALES = Array.from(new Set(manifest.targetLocales)) as LocaleKey[]
export const SUPPORTED_LOCALES = Array.from(
  new Set<LocaleKey>([DEFAULT_LOCALE, ...TARGET_LOCALES]),
)

export function isSupportedLocale(locale: unknown): locale is LocaleKey {
  return typeof locale === 'string' && SUPPORTED_LOCALES.includes(locale)
}

export function getStoredLocale(): LocaleKey | null {
  if (!inBrowser) return null
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return isSupportedLocale(stored) ? stored : null
  } catch {
    return null
  }
}

export function rememberLocale(locale: LocaleKey): void {
  if (!inBrowser || !isSupportedLocale(locale)) return
  try {
    window.localStorage.setItem(STORAGE_KEY, locale)
    window.dispatchEvent(
      new CustomEvent('powerx:locale-changed', { detail: { locale } }),
    )
  } catch {
    // Persistent storage may be unavailable (e.g., private mode); ignore.
  }
}

export function ensureLocalePreference(
  currentLocale?: LocaleKey,
): LocaleKey {
  const stored = getStoredLocale()
  if (stored) return stored

  const resolved = isSupportedLocale(currentLocale)
    ? currentLocale
    : DEFAULT_LOCALE

  rememberLocale(resolved)
  return resolved
}

export function syncDocumentLocale(locale: LocaleKey): void {
  if (!inBrowser) return
  document.documentElement.setAttribute('lang', locale)
}
