<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { fetchLatestPowerXRelease, POWERX_RELEASES_URL, ReleaseLookupError, type PowerXRelease } from '../utils/powerxReleases'

const phase = ref<'loading' | 'ready' | 'error'>('loading')
const release = ref<PowerXRelease | null>(null)
const errorMessage = ref('')
const copyMessage = ref('')
const copying = ref(false)
let requestId = 0
let activeController: AbortController | undefined
let timeout: ReturnType<typeof setTimeout> | undefined
const publication = computed(() => release.value?.publishedAt.slice(0, 16).replace('T', ' ') + ' UTC')

async function refresh() {
  const id = ++requestId
  activeController?.abort()
  clearTimeout(timeout)
  const controller = new AbortController()
  activeController = controller
  release.value = null
  phase.value = 'loading'
  errorMessage.value = ''
  copyMessage.value = ''
  copying.value = false
  timeout = setTimeout(() => controller.abort(), 15000)
  try {
    const result = await fetchLatestPowerXRelease({ signal: controller.signal })
    if (id !== requestId) return
    release.value = result
    phase.value = 'ready'
  } catch (error) {
    if (id !== requestId) return
    errorMessage.value = error instanceof ReleaseLookupError ? error.message
      : controller.signal.aborted ? '获取超时，请检查网络后重新获取，或打开官方 Releases。'
        : '无法连接 GitHub，请检查网络后重新获取，或打开官方 Releases。'
    phase.value = 'error'
  } finally {
    if (id === requestId) clearTimeout(timeout)
  }
}

async function copyCommand() {
  if (phase.value !== 'ready' || !release.value || copying.value) return
  const id = requestId
  const command = release.value.cloneCommand
  copying.value = true
  try {
    await navigator.clipboard.writeText(command)
    if (id === requestId) copyMessage.value = '已复制克隆命令'
  } catch {
    if (id === requestId) copyMessage.value = '复制失败，请选中下方命令手动复制。'
  } finally {
    if (id === requestId) copying.value = false
  }
}

// SSR and the initial hydration both show the same loading state. No API
// requests happen during a build, and no release is frozen into static HTML.
onMounted(refresh)
onBeforeUnmount(() => {
  requestId++
  activeController?.abort()
  clearTimeout(timeout)
})
</script>

<template>
  <section class="latest-powerx-release" aria-label="最新 Release 克隆命令" :aria-busy="phase === 'loading'">
    <div class="release-toolbar">
      <span class="release-title">最新可用容器 Release</span>
      <button class="release-retry" type="button" @click="refresh">重新获取</button>
    </div>
    <p v-if="phase === 'loading'" role="status">正在从 GitHub 获取最新发布信息（含预发布）…</p>
    <p v-else-if="phase === 'error'" class="release-error" role="alert">{{ errorMessage }}</p>
    <template v-else-if="release">
      <div class="release-metadata">
        <a :href="release.url" target="_blank" rel="noopener noreferrer"><code>{{ release.tag }}</code></a>
        <span class="release-badge">{{ release.prerelease ? '预发布' : '正式版' }}</span>
        <time :datetime="release.publishedAt">发布于 {{ publication }}</time>
      </div>
      <pre class="release-clone-code" tabindex="0" aria-label="克隆最新 Release 的命令"><code>{{ release.cloneCommand }}</code></pre>
      <div class="release-copy-row">
        <button class="release-copy" type="button" :disabled="copying" @click="copyCommand">{{ copying ? '正在复制…' : '复制克隆命令' }}</button>
        <span role="status" aria-live="polite">{{ copyMessage }}</span>
      </div>
    </template>
    <p class="release-source"><a :href="POWERX_RELEASES_URL" target="_blank" rel="noopener noreferrer">官方 Releases ↗</a></p>
  </section>
</template>

<style scoped>
.latest-powerx-release {
  min-width: 0;
  margin: 20px 0;
  padding: 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  font-size: 14px;
}
.release-toolbar, .release-copy-row, .release-metadata { display: flex; align-items: center; flex-wrap: wrap; gap: 10px 14px; }
.release-toolbar { justify-content: space-between; }
.release-title { font-size: 16px; font-weight: 500; }
.release-retry { color: var(--vp-c-brand-1); text-decoration: underline; text-underline-offset: 3px; }
.release-metadata { margin-top: 14px; }
.release-metadata a { min-width: 0; overflow-wrap: anywhere; }
.release-metadata time { color: var(--vp-c-text-2); }
.release-badge { padding: 0 7px; border: 1px solid var(--vp-c-divider); border-radius: 6px; white-space: nowrap; }
.latest-powerx-release .release-clone-code { margin: 16px 0; padding: 14px; overflow-x: auto; max-width: 100%; background: var(--vp-c-bg); border-radius: 8px; line-height: 1.7; }
.release-clone-code code { white-space: pre; font-size: 13px; }
.release-copy { padding: 7px 12px; background: #16734d; color: #fff; border-radius: 8px; }
.release-copy:hover { background: #11613f; }
.release-copy:disabled { opacity: .65; cursor: wait; }
.release-copy-row span, .release-source { font-size: 13px; }
.latest-powerx-release .release-source { margin: 14px 0 0; }
.release-error { color: var(--vp-c-danger-1); }
button:focus-visible, pre:focus-visible { outline: 2px solid var(--vp-c-brand-1); outline-offset: 3px; }
@media (max-width: 639px) { .latest-powerx-release { padding: 16px; } }
</style>
