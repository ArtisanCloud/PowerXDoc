// https://vitepress.dev/guide/custom-theme
import { defineComponent, h, onMounted, watch } from 'vue'
import type { Theme } from 'vitepress'
import { useData, useRouter } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { createI18n } from 'vue-i18n'
import MyAwesomeHome from './components/MyAwesomeHome.vue'
import ReviewBanner from './components/ReviewBanner.vue'
import './style.css'
import { installLocaleSwitch } from './utils/languageSwitch'
import enUS from './locales/en-US'
import zhCN from './locales/zh-CN'

const FALLBACK_LOCALE = 'zh-CN'

;(globalThis as any).__VUE_PROD_DEVTOOLS__ ??= false
;(globalThis as any).__INTLIFY_PROD_DEVTOOLS__ ??= false

const messages = {
  'en-US': enUS,
  'zh-CN': zhCN,
} as const

export const i18n = createI18n({
  legacy: false,
  locale: FALLBACK_LOCALE,
  fallbackLocale: FALLBACK_LOCALE,
  missingWarn: import.meta.env.DEV,
  fallbackWarn: import.meta.env.DEV,
  messages,
})

const setLocale = (locale?: string) => {
  const nextLocale = (locale && locale in messages
    ? (locale as keyof typeof messages)
    : FALLBACK_LOCALE)

  if (i18n.global.locale.value !== nextLocale) {
    i18n.global.locale.value = nextLocale
  }
}

const defaultEnhanceApp = DefaultTheme.enhanceApp?.bind(DefaultTheme)

export default {
  ...DefaultTheme,
  async enhanceApp(ctx) {
    if (defaultEnhanceApp) {
      await defaultEnhanceApp(ctx)
    }

    const { app, router } = ctx
    if (!(app as any).__POWERX_I18N__) {
      app.use(i18n)
      ;(app as any).__POWERX_I18N__ = true
    }
    setLocale(router.route.data?.lang)
  },
  Layout: defineComponent({
    setup() {
      const { page } = useData()
      const router = useRouter()

      onMounted(() => {
        installLocaleSwitch(router, setLocale)
      })

      watch(
        () => page.value.lang,
        (lang) => {
          setLocale(lang)
        },
        { immediate: true },
      )

      return () => {
        if (page.value.frontmatter.layout === 'landing') {
          return h(MyAwesomeHome)
        }

        return h(DefaultTheme.Layout, undefined, {
          'doc-before': () => h(ReviewBanner),
        })
      }
    },
  }),
} satisfies Theme
