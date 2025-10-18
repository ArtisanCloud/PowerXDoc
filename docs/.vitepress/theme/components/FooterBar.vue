<template>
  <footer
    class="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-t border-gray-200/60 dark:border-gray-700/60 text-sm text-gray-600 dark:text-gray-300"
  >
    <div class="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
        <span class="font-semibold text-gray-800 dark:text-white">PowerX</span>
        <span>© {{ currentYear }} Artisan Cloud.</span>
        <span class="text-gray-500 dark:text-gray-400">Documentation &amp; product overview</span>
      </div>
      <nav class="flex flex-wrap items-center gap-4">
        <a class="hover:text-emerald-500" href="/core-concepts/">核心概念</a>
        <a class="hover:text-emerald-500" href="/developer-guides/">开发者指南</a>
        <a class="hover:text-emerald-500" href="/api-and-specifications/">API</a>
        <a class="hover:text-emerald-500" href="/security-and-governance/">安全治理</a>
        <a class="hover:text-emerald-500" href="https://github.com/ArtisanCloud/PowerX" target="_blank" rel="noreferrer">GitHub</a>
      </nav>
    </div>
  </footer>
</template>

<script setup lang="ts">
const currentYear = new Date().getFullYear()
</script>

<style scoped>
footer {
  transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
}
</style>
