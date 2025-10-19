<script setup lang="ts">
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'

type ReviewStatus = 'Placeholder' | 'InReview' | 'Approved'

const { frontmatter, lang } = useData()

const status = computed<ReviewStatus>(() => {
  const value = frontmatter.value.reviewStatus
  return typeof value === 'string' ? (value as ReviewStatus) : 'Approved'
})

const partnerSlug = computed<string | null>(() => {
  const slug = frontmatter.value.partnerSlug
  return typeof slug === 'string' && slug.length > 0 ? slug : null
})

const locale = computed(() => lang.value ?? 'zh-CN')
const showBanner = computed(
  () => locale.value.startsWith('en') && status.value !== 'Approved',
)

const statusLabel = computed(() => {
  if (status.value === 'Placeholder') return 'Placeholder Translation'
  if (status.value === 'InReview') return 'In Review'
  return 'Approved'
})

const statusDescription = computed(() => {
  if (status.value === 'Placeholder') {
    return 'This page contains machine-translated content. A human review is still pending.'
  }
  if (status.value === 'InReview') {
    return 'A reviewer is currently editing this page. Expect copy updates soon.'
  }
  return 'This page has passed human review.'
})

const severityClasses = computed(() => {
  if (status.value === 'Placeholder') {
    return 'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-500/60 dark:bg-amber-500/10 dark:text-amber-100'
  }
  if (status.value === 'InReview') {
    return 'border-sky-300 bg-sky-50 text-sky-900 dark:border-sky-500/60 dark:bg-sky-500/10 dark:text-sky-100'
  }
  return 'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-500/60 dark:bg-emerald-500/10 dark:text-emerald-100'
})

const partnerHref = computed(() => {
  if (!partnerSlug.value) return null
  return withBase(partnerSlug.value)
})
</script>

<template>
  <div
    v-if="showBanner"
    :class="`mb-6 rounded-lg border px-4 py-3 shadow-sm transition ${severityClasses}`"
  >
    <div class="flex flex-wrap items-start gap-3">
      <div
        class="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-black/5 dark:bg-white/10"
        aria-hidden="true"
      >
        <span v-if="status === 'Placeholder'" class="text-lg font-bold">!</span>
        <span v-else class="text-lg font-bold">~</span>
      </div>
      <div class="flex-1">
        <p class="mb-1 font-semibold leading-6">
          {{ statusLabel }}
        </p>
        <p class="mb-3 text-sm leading-5">
          {{ statusDescription }}
        </p>
        <div class="flex flex-wrap items-center gap-3 text-sm font-medium">
          <span class="inline-flex items-center rounded-full bg-black/10 px-3 py-1 text-xs uppercase tracking-wide dark:bg-white/10">
            {{ locale.startsWith('en') ? 'English preview' : locale }}
          </span>
          <a
            v-if="partnerHref"
            :href="partnerHref"
            class="inline-flex items-center gap-1 text-sm underline decoration-2 underline-offset-4 hover:text-current"
          >
            View the original zh-CN page
            <span aria-hidden="true">-></span>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
