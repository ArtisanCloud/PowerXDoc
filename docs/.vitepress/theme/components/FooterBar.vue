<template>
  <footer
    class="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-t border-gray-200/60 dark:border-gray-700/60 text-sm text-gray-600 dark:text-gray-300"
  >
    <div class="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
        <span class="font-semibold text-gray-800 dark:text-white">PowerX</span>
        <span>© {{ currentYear }} Artisan Cloud.</span>
        <span class="text-gray-500 dark:text-gray-400">{{ copy.tagline }}</span>
      </div>
      <nav class="flex flex-wrap items-center gap-4">
        <a class="hover:text-emerald-500" :href="copy.links.concepts.href">{{ copy.links.concepts.label }}</a>
        <a class="hover:text-emerald-500" :href="copy.links.guides.href">{{ copy.links.guides.label }}</a>
        <a class="hover:text-emerald-500" :href="copy.links.api.href">{{ copy.links.api.label }}</a>
        <a class="hover:text-emerald-500" :href="copy.links.security.href">{{ copy.links.security.label }}</a>
        <a class="hover:text-emerald-500" href="https://github.com/ArtisanCloud/PowerX" target="_blank" rel="noreferrer">GitHub</a>
      </nav>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'

const currentYear = new Date().getFullYear()
const { lang } = useData()

const localeKey = computed<'zh' | 'en'>(() => (lang.value?.startsWith('en') ? 'en' : 'zh'))

const dictionary = {
  zh: {
    tagline: '文档与产品概览',
    links: {
      concepts: { label: '核心概念', href: '/zh/core-concepts/' },
      guides: { label: '开发者指南', href: '/zh/guides/' },
      api: { label: 'API', href: '/zh/api-and-specifications/' },
      security: { label: '安全治理', href: '/zh/security-and-governance/' },
    },
  },
  en: {
    tagline: 'Documentation & product overview',
    links: {
      concepts: { label: 'Core Concepts', href: '/en/core-concepts/' },
      guides: { label: 'Developer Guides', href: '/en/guides/' },
      api: { label: 'API', href: '/en/api-and-specifications/' },
      security: { label: 'Security & Governance', href: '/en/security-and-governance/' },
    },
  },
} as const

const copy = computed(() => dictionary[localeKey.value])
</script>

<style scoped>
footer {
  transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
}
</style>
