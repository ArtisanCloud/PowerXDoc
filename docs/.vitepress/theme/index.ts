// https://vitepress.dev/guide/custom-theme
import { defineComponent, h, onMounted } from 'vue'
import type { Theme } from 'vitepress'
import { useData, useRouter } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import MyAwesomeHome from './components/MyAwesomeHome.vue'
import './style.css'
import { installLocaleSwitch } from './utils/languageSwitch'

export default {
  extends: DefaultTheme,
  Layout: defineComponent({
    setup() {
      const { page } = useData()
       const router = useRouter()

      onMounted(() => {
        installLocaleSwitch(router)
      })

      return () =>
        page.value.frontmatter.layout === 'landing'
          ? h(MyAwesomeHome)
          : h(DefaultTheme.Layout)
    },
  }),
} satisfies Theme
