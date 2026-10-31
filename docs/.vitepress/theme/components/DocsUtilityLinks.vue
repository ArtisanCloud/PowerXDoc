<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
const { lang, theme } = useData()
const english = computed(() => lang.value.startsWith('en'))
</script>

<template>
  <nav class="docs-utility-links" :aria-label="english ? 'Related websites and references' : '官网与参考资料'">
    <a :href="`${theme.companyOrigin}/`">{{ english ? 'Artisan Cloud website' : 'Artisan Cloud 官网' }}</a>
    <a :href="`${theme.companyOrigin}/products/powerx-base`">{{ english ? 'PowerX product' : 'PowerX 产品介绍' }}</a>
    <a :href="english ? '/en/resources/' : '/zh/reference/'">{{ english ? 'Resources' : '参考资料' }}</a>
  </nav>
</template>

<style scoped>
.docs-utility-links { display: flex; flex-wrap: wrap; gap: 8px 20px; margin-top: 32px; padding-top: 20px; border-top: 1px solid var(--vp-c-divider); font-size: 13px; }
.docs-utility-links a { text-decoration: underline; text-underline-offset: 3px; }
</style>
