<script setup lang="ts">
import { useData } from 'vitepress'
const { theme } = useData()
defineProps<{ products?: boolean }>()
</script>

<template>
  <div class="company-links">
    <p>
      <strong>从产品了解价值，在文档里开始动手。</strong>
      <a :href="`${theme.companyOrigin}/`">Artisan Cloud 官网</a>
      · <a :href="`${theme.companyOrigin}/products/powerx-base`">PowerX 产品介绍</a>
    </p>
    <p v-if="products">
      产品详情：<a :href="`${theme.companyOrigin}/products/crm`">CRM</a>
      · <a :href="`${theme.companyOrigin}/products/mediax`">MediaXStudio</a>
    </p>
  </div>
</template>

<style scoped>
.company-links { margin: 28px 0; padding: 20px 24px; border: 1px solid var(--vp-c-divider); border-radius: 12px; background: var(--vp-c-bg-soft); font-size: 14px; line-height: 1.9; }
.company-links p { margin: 0; }
.company-links strong { display: block; font-weight: 500; }
.company-links a { text-decoration: underline; text-underline-offset: 3px; }
</style>
