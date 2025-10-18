// https://vitepress.dev/guide/custom-theme
import { defineComponent, h } from 'vue'
import type { Theme } from 'vitepress'
import { useData } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import MyAwesomeHome from './components/MyAwesomeHome.vue'
import './style.css'

export default {
  extends: DefaultTheme,
  Layout: defineComponent({
    setup() {
      const { page } = useData()
      return () =>
        page.value.frontmatter.layout === 'landing'
          ? h(MyAwesomeHome)
          : h(DefaultTheme.Layout)
    },
  }),
} satisfies Theme
