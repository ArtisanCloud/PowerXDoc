import { inBrowser } from 'vitepress'
import manifest from '../../../website/localization/manifest.json'

export type LocaleKey = string

const STORAGE_KEY = 'powerx:locale-preference'
const COOKIE_KEY = 'px_lang'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 year

export const DEFAULT_LOCALE: LocaleKey = manifest.sourceLocale
const TARGET_LOCALES = Array.from(new Set(manifest.targetLocales)) as LocaleKey[]
export const SUPPORTED_LOCALES = Array.from(
  new Set<LocaleKey>([DEFAULT_LOCALE, ...TARGET_LOCALES]),
)

const readCookie = (name: string): string | null => {
  if (!inBrowser) return null
  const cookie = document.cookie
  if (!cookie) return null
  const match = cookie
    .split(';')
    .map(part => part.trim())
    .find(part => part.startsWith(`${name}=`))
  if (!match) return null
  try {
    return decodeURIComponent(match.slice(name.length + 1))
  } catch {
    return null
  }
}

const writeCookie = (name: string, value: string) => {
  if (!inBrowser) return
  try {
    const secure = window.location.protocol === 'https:' ? ';secure' : ''
    document.cookie = `${name}=${encodeURIComponent(value)};path=/;max-age=${COOKIE_MAX_AGE};samesite=lax${secure}`
  } catch {
    // Ignore cookie write errors
  }
}

export function isSupportedLocale(locale: unknown): locale is LocaleKey {
  return typeof locale === 'string' && SUPPORTED_LOCALES.includes(locale)
}

const getLocaleFromStorage = (): LocaleKey | null => {
  if (!inBrowser) return null
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return isSupportedLocale(stored) ? stored : null
  } catch {
    return null
  }
}

const getLocaleFromCookie = (): LocaleKey | null => {
  const cookieLocale = readCookie(COOKIE_KEY)
  return isSupportedLocale(cookieLocale) ? cookieLocale : null
}

export function getStoredLocale(): LocaleKey | null {
  return getLocaleFromStorage() ?? getLocaleFromCookie()
}

export function rememberLocale(locale: LocaleKey): void {
  if (!inBrowser || !isSupportedLocale(locale)) return
  try {
    window.localStorage.setItem(STORAGE_KEY, locale)
  } catch {
    // Persistent storage may be unavailable (e.g., private mode); ignore.
  }
  writeCookie(COOKIE_KEY, locale)
  window.dispatchEvent(
    new CustomEvent('powerx:locale-changed', { detail: { locale } }),
  )
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
