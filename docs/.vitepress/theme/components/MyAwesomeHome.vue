<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useData, useRouter } from 'vitepress'
import type { LocaleKey } from '../utils/localePreference'
import { toLocalePath } from '../utils/languageSwitch'
import FooterBar from './FooterBar.vue'
import VPSwitchAppearance from 'vitepress/dist/client/theme-default/components/VPSwitchAppearance.vue'
import VPNavBarTranslations from 'vitepress/dist/client/theme-default/components/VPNavBarTranslations.vue'
import VPNavBarSocialLinks from 'vitepress/dist/client/theme-default/components/VPNavBarSocialLinks.vue'

type FloatingElement = {
  id: number; x: number; y: number; size: number; opacity: number; delay: number; duration: number
}
type ProductFeature = { name: string; description: string; image: string; features: string[] }
type HomeCopy = {
  nav: { features: string; products: string; about: string; cta: string }
  hero: { welcomePrefix: string; highlight: string; description: string; primaryCta: string; secondaryCta: string }
  features: { title: string; lead: string; items: { icon: string; title: string; description: string }[] }
  products: { title: string; lead: string; ctaLabel: string; list: ProductFeature[] }
  about: { title: string; subtitle: string; missionTitle: string; mission: string[]; stats: { value: string; label: string }[]; pillars: { title: string; description: string }[] }
  finalCta: { title: string; description: string; primary: string; secondary: string }
}

const router = useRouter()
const { isDark } = useData()
const { locale, tm } = useI18n({ useScope: 'global' })

/* ---------- Debug ---------- */
const enableDebug = ref(false)
if (typeof window !== 'undefined') {
  const u = new URL(window.location.href)
  if (u.searchParams.get('angle_debug') === '1') enableDebug.value = true
}
const dlog = (...a:any[]) => { if (enableDebug.value) console.log('%c[PowerX]', 'color:#10B981;font-weight:bold', ...a) }

/* ---------- 角度与动效：大幅摆动 + 顶部可见 ---------- */
const gradientAngle = ref(120)     // 初始角度
const angleBase     = 20          // 基准（水平）
const angleAmp      = 320           // 摆动幅度（更大！建议 60~100）
const autoDrift     = ref(true)
const followPointer = ref(false)   // 需要时打开
let rafId: number | null = null
const rafTicks = ref(0)

watch(gradientAngle, v => dlog('angle=', v.toFixed(1)))
watch(isDark, v => dlog('isDark=', v))

const startAngleDrift = () => {
  let t0 = performance.now()
  const loop = (t:number) => {
    rafTicks.value++
    if (autoDrift.value) {
      const dt = (t - t0) / 1000
      const a = Math.sin(dt * 0.25) * angleAmp         // 慢频
      const b = Math.sin(dt * 0.62 + 1.1) * (angleAmp*0.35) // 叠加少许
      gradientAngle.value = angleBase + a + b          // 范围约 base±(amp+)
    }
    rafId = requestAnimationFrame(loop)
  }
  rafId = requestAnimationFrame(loop)
}
let pointerRaf = false
const onPointerMove = (e:PointerEvent) => {
  if (!followPointer.value || pointerRaf) return
  pointerRaf = true
  requestAnimationFrame(() => {
    const { innerWidth: w, innerHeight: h } = window
    const dx = (e.clientX - w/2) / (w/2)
    const dy = (e.clientY - h/2) / (h/2)
    const target = 180 + dx*80 - dy*40                 // 跟随范围也很大
    gradientAngle.value = gradientAngle.value*0.87 + target*0.13
    pointerRaf = false
  })
}

/* ---------- Root 动态位移（轻微） ---------- */
const scrollY = ref(0)
const parallax = computed(() => Math.min(30, Math.max(-30, scrollY.value * 0.06)))
const onScroll = () => { scrollY.value = window.scrollY || 0 }

/* ---------- 大画布背景（旋转覆盖满屏） ---------- */
const bgCanvasStyle = computed(() => {
  // 深色：黑 -> 墨绿 -> 科技绿；浅色：清爽蓝绿
  const gradDark  = 'linear-gradient(90deg, #050a12 0%, #072017 40%, #0c2e1d 60%, #16a34a 100%)'
  const gradLight = 'linear-gradient(90deg, #eef6ff 0%, #eafbf5 40%, #ecf3ff 60%, #d9f7ea 100%)'
  return {
    '--rot': `${gradientAngle.value.toFixed(1)}deg`,
    background: isDark.value ? gradDark : gradLight,
    // 画布做得非常大，旋转时保证任何角度都能盖住视口
    width: '480vw',
    height: '480vw',
    transform: 'translate(-50%, -50%) rotate(var(--rot))',
  } as any
})

/* ---------- 纹理与高光（固定叠加，极轻） ---------- */
const textureStyle = computed(() => ({
  backgroundImage: isDark.value
    ? 'radial-gradient(900px 700px at 18% 12%, rgba(16,185,129,0.20), transparent 60%), radial-gradient(800px 600px at 82% 88%, rgba(147,51,234,0.14), transparent 60%)'
    : 'radial-gradient(900px 700px at 20% 12%, rgba(59,130,246,0.18), transparent 60%), radial-gradient(800px 600px at 82% 88%, rgba(16,185,129,0.14), transparent 60%)',
}))
const sheenStyle = computed(() => ({
  backgroundImage: isDark.value
    ? 'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(16,185,129,0.0) 40%, rgba(16,185,129,0.16) 55%, rgba(16,185,129,0.0) 70%, rgba(16,185,129,0.10) 100%)'
    : 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.0) 40%, rgba(255,255,255,0.22) 55%, rgba(255,255,255,0.0) 70%, rgba(255,255,255,0.14) 100%)',
}))

/* ---------- 粒子 ---------- */
const floatingElements = ref<FloatingElement[]>([])
const particlesVisible = ref(false)
const glowPalettes = {
  light: ['rgba(147,197,253,0.32)','rgba(196,181,253,0.28)','rgba(125,211,252,0.28)','rgba(167,243,208,0.24)'],
  dark:  ['rgba(16,185,129,0.18)','rgba(59,130,246,0.14)','rgba(124,58,237,0.12)','rgba(45,212,191,0.16)'],
} as const
const generateFloating = (): FloatingElement[] => {
  const arr: FloatingElement[] = []
  for (let i=0;i<6;i++){
    const sizeBoost = isDark.value ? 1.15 : 1
    arr.push({
      id:i,
      x:Math.random()*100,
      y:Math.random()*100,
      size:(Math.random()*160+140)*sizeBoost,
      opacity:Math.random()*0.22+0.14,
      delay:Math.random()*5,
      duration:Math.random()*10+16,
    })
  }
  if (enableDebug.value) {
    console.table(arr.slice(0,2).map(e=>({id:e.id, x:e.x.toFixed(1), y:e.y.toFixed(1), size:Math.round(e.size), opacity:+e.opacity.toFixed(2)})))
    dlog('floatingElements count =', arr.length)
  }
  return arr
}

/* ---------- 文案数据（来自 i18n） ---------- */
const copy = computed<HomeCopy>(() => tm('home') as HomeCopy)
const features = computed(() => copy.value.features.items)
const products = computed<ProductFeature[]>(() => copy.value.products.list)

/* ---------- 生命周期 ---------- */
onMounted(() => {
  dlog('mounted. debug=', enableDebug.value, 'isDark=', isDark.value, 'angle=', gradientAngle.value)
  floatingElements.value = generateFloating()
  particlesVisible.value = true
  startAngleDrift()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('pointermove', onPointerMove, { passive: true })
})
onUnmounted(() => {
  if (rafId) cancelAnimationFrame(rafId)
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('pointermove', onPointerMove)
})

/* ---------- 导航 ---------- */
const navigateTo = (p: string) => {
  const currentLocale = locale.value as LocaleKey
  const normalized = p.startsWith('/') ? p : `/${p}`
  const localizedPath = toLocalePath(normalized, currentLocale)
  router.go(localizedPath)
}
</script>

<template>
  <div class="relative min-h-screen w-full overflow-hidden">
    <!-- 背景画布：超大 + 旋转 → 全角度覆盖 -->
    <div
      class="bg-canvas"
      :style="bgCanvasStyle"
      aria-hidden="true"
    />
    <!-- 纹理与高光（极轻） -->
    <div class="bg-texture" :style="textureStyle" aria-hidden="true"></div>
    <div class="bg-sheen" :style="sheenStyle" aria-hidden="true"></div>

    <!-- 粒子 -->
    <div v-if="particlesVisible" class="absolute inset-0 pointer-events-none">
      <div
        v-for="e in floatingElements"
        :key="e.id"
        class="absolute rounded-full glow-drift"
        :style="{
          left: e.x + '%',
          top: e.y + '%',
          width: e.size + 'px',
          height: e.size + 'px',
          opacity: e.opacity,
          animationDelay: e.delay + 's',
          animationDuration: e.duration + 's'
        }"
      />
    </div>

    <!-- Debug HUD -->
    <div v-if="enableDebug" class="fixed bottom-3 right-3 z-[9999] rounded-md bg-black/70 px-3 py-2 text-xs text-white space-y-1">
      <div>angle: <b>{{ gradientAngle.toFixed(1) }}°</b></div>
      <div>isDark: <b>{{ isDark ? 'true' : 'false' }}</b></div>
      <div>rAF ticks: <b>{{ rafTicks }}</b></div>
      <div>particles: <b>{{ floatingElements.length }}</b></div>
    </div>

    <!-- 内容区：全部透明，不叠半透明底 -->
    <div class="relative z-10">
      <nav class="sticky top-0 z-50 border-b border-white/10 bg-white text-slate-800 dark:border-slate-800/70 dark:bg-slate-900 dark:text-slate-100/95 transition-colors duration-500">
        <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <a class="flex items-center space-x-3" href="#">
            <span class="flex h-10 w-10 items-center justify-center">
              <img src="/images/logo-m.png" alt="PowerX" class="h-10 w-10 transition-transform duration-300 hover:scale-110" />
            </span>
            <span class="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-2xl font-bold text-transparent">PowerX</span>
          </a>
          <div class="hidden space-x-4 text-sm font-medium md:flex">
            <a class="nav-link" href="#features">{{ copy.nav.features }}</a>
            <a class="nav-link" href="#products">{{ copy.nav.products }}</a>
            <a class="nav-link" href="#about">{{ copy.nav.about }}</a>
          </div>
          <div class="flex items-center gap-2 sm:gap-3">
            <VPNavBarTranslations class="hidden md:flex" />
            <VPSwitchAppearance class="flex rounded-full bg-white p-1 text-slate-600 shadow-sm transition hover:bg-white hover:text-emerald-500 hover:scale-110 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-800" />
            <VPNavBarSocialLinks class="hidden md:flex" />
            <button class="btn-primary" type="button" @click="navigateTo('/guides/')">
              {{ copy.nav.cta }}
            </button>
          </div>
        </div>
      </nav>

      <!-- Hero -->
      <section class="px-4 py-20 sm:px-6 lg:px-8">
        <div class="mx-auto max-w-4xl text-center will-change-transform" :style="{ transform: `translateY(${(parallax * -0.2)}px)` }">
          <h1 class="mb-6 text-4xl font-bold text-slate-900 dark:text-white md:text-6xl animate-fade-up">
            {{ copy.hero.welcomePrefix }}
            <span class="bg-gradient-to-r from-emerald-300 to-teal-200 bg-clip-text text-transparent">{{ copy.hero.highlight }}</span>
          </h1>
          <p class="mx-auto mb-8 max-w-2xl text-lg text-slate-700 dark:text-emerald-100 animate-fade-up delay-150">{{ copy.hero.description }}</p>
          <div class="flex flex-col items-center justify-center gap-4 sm:flex-row animate-fade-up delay-300">
            <button class="btn-ghost" type="button" @click="navigateTo('/core-concepts/')">{{ copy.hero.primaryCta }}</button>
            <button class="btn-outline" type="button" @click="navigateTo('/guides/PowerX_Plugin_SDK_Guide')">{{ copy.hero.secondaryCta }}</button>
          </div>
        </div>
      </section>

      <!-- Features -->
      <section id="features" class="px-4 py-20 sm:px-6 lg:px-8">
        <div class="mx-auto max-w-6xl">
          <div class="mb-16 text-center">
            <h2 class="mb-4 text-3xl font-bold text-slate-900 dark:text-white md:text-4xl animate-fade-up">{{ copy.features.title }}</h2>
            <p class="mx-auto max-w-2xl text-lg text-slate-700 dark:text-emerald-100 animate-fade-up delay-150">{{ copy.features.lead }}</p>
          </div>
          <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            <article v-for="(f, i) in features" :key="f.title" class="card" :style="{ animationDelay: (i * 90 + 200) + 'ms' }">
              <div class="mb-4 text-4xl">{{ f.icon }}</div>
              <h3 class="mb-2 text-xl font-semibold text-slate-900 dark:text-white">{{ f.title }}</h3>
              <p class="text-slate-700 dark:text-emerald-100">{{ f.description }}</p>
            </article>
          </div>
        </div>
      </section>

      <!-- Products -->
      <section id="products" class="px-4 py-20 sm:px-6 lg:px-8">
        <div class="mx-auto max-w-6xl">
          <div class="mb-16 text-center">
            <h2 class="mb-4 text-3xl font-bold text-slate-900 dark:text-white md:text-4xl animate-fade-up">{{ copy.products.title }}</h2>
            <p class="mx-auto max-w-2xl text-lg text-slate-700 dark:text-emerald-100 animate-fade-up delay-150">{{ copy.products.lead }}</p>
          </div>
          <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <article v-for="(p, i) in products" :key="p.name" class="card overflow-hidden" :style="{ animationDelay: (i * 90 + 260) + 'ms' }">
              <div class="h-48 w-full bg-gradient-to-r from-slate-900/10 to-slate-900/20">
                <img :alt="`${p.name} preview`" :src="p.image" class="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.02]" loading="lazy" />
              </div>
              <div class="flex flex-1 flex-col p-6">
                <h3 class="mb-2 text-xl font-semibold text-slate-900 dark:text-white">{{ p.name }}</h3>
                <p class="mb-4 text-slate-700 dark:text-emerald-100">{{ p.description }}</p>
                <ul class="mb-6 space-y-2">
                  <li v-for="ft in p.features" :key="ft" class="flex items-center text-sm text-slate-700 dark:text-emerald-200">
                    <span class="mr-2 h-2 w-2 rounded-full bg-emerald-400"></span>{{ ft }}
                  </li>
                </ul>
                <button class="btn-primary mt-auto" type="button" @click="navigateTo('/guides/')">{{ copy.products.ctaLabel }}</button>
              </div>
            </article>
          </div>
        </div>
      </section>

      <!-- About -->
      <section id="about" class="px-4 py-20 sm:px-6 lg:px-8">
        <div class="mx-auto max-w-6xl">
          <div class="mb-16 text-center">
            <h2 class="mb-4 text-3xl font-bold text-slate-900 dark:text-white md:text-4xl animate-fade-up">{{ copy.about.title }}</h2>
            <p class="mx-auto max-w-2xl text-lg text-slate-700 dark:text-emerald-100 animate-fade-up delay-150">{{ copy.about.subtitle }}</p>
          </div>
          <div class="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
            <div class="space-y-4 text-slate-700 dark:text-emerald-100">
              <h3 class="text-2xl font-semibold text-slate-900 dark:text-white animate-fade-up">{{ copy.about.missionTitle }}</h3>
              <p v-for="paragraph in copy.about.mission" :key="paragraph" class="animate-fade-up delay-150">{{ paragraph }}</p>
            </div>
            <div class="space-y-6">
              <div class="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div v-for="stat in copy.about.stats" :key="stat.label" class="card text-center hover:scale-[1.02]">
                  <div class="text-3xl font-bold text-emerald-500 dark:text-emerald-300">{{ stat.value }}</div>
                  <div class="text-slate-700 dark:text-emerald-100">{{ stat.label }}</div>
                </div>
              </div>
              <div class="card">
                <h4 class="mb-3 text-xl font-semibold text-slate-900 dark:text-white">{{ copy.about.pillars[0].title }}</h4>
                <p class="text-slate-700 dark:text-emerald-100">{{ copy.about.pillars[0].description }}</p>
              </div>
            </div>
          </div>
          <div class="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            <div v-for="pillar in copy.about.pillars.slice(1)" :key="pillar.title" class="text-center text-slate-700 dark:text-emerald-100 animate-fade-up">
              <h4 class="mb-3 text-xl font-semibold text-slate-900 dark:text-white">{{ pillar.title }}</h4>
              <p>{{ pillar.description }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Final CTA -->
      <section class="relative px-4 py-20 sm:px-6 lg:px-8">
        <div class="relative z-10 mx-auto max-w-4xl text-center text-slate-900 dark:text-white">
          <h2 class="mb-6 text-3xl font-bold md:text-4xl animate-fade-up">{{ copy.finalCta.title }}</h2>
          <p class="mx-auto mb-10 max-w-2xl text-lg text-slate-700 dark:text-emerald-100 animate-fade-up delay-150">{{ copy.finalCta.description }}</p>
          <div class="flex flex-col justify-center gap-4 sm:flex-row animate-pop-in">
            <button class="btn-ghost" type="button" @click="navigateTo('/guides/Agent_Developer_Guide')">{{ copy.finalCta.primary }}</button>
            <button class="btn-outline" type="button" @click="navigateTo('/markdown-examples')">{{ copy.finalCta.secondary }}</button>
          </div>
        </div>
      </section>

      <FooterBar />
    </div>
  </div>
</template>

<style scoped>
/* ==== 背景三层：仅 root 内部，一次性覆盖 ==== */
.bg-canvas,
.bg-texture,
.bg-sheen {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

/* 旋转大画布：真正承载线性渐变，确保任意角度完全覆盖 */
.bg-canvas {
  top: 50%;
  left: 50%;
  /* 宽高由内联 style 传入：320vw x 320vh */
  transform-origin: center center;
  will-change: transform;
  transition: transform 0s; /* rAF 驱动，无需额外过渡 */
  filter: none;
}

/* 轻微位置摇摆（给纹理和高光层一点位移感） */
@keyframes bg-pan-soft {
  0%   { background-position: 50% 10%; }
  50%  { background-position: 60% 25%; }
  100% { background-position: 50% 10%; }
}
.bg-texture,
.bg-sheen {
  animation: bg-pan-soft 30s ease-in-out infinite;
  background-repeat: no-repeat;
  background-size: 140% 140%;
}

/* 粒子（很克制） */
.glow-drift {
  background-image: radial-gradient(circle, rgba(255,255,255,0.14) 0%, transparent 65%);
  filter: blur(40px);
  animation: glow 18s ease-in-out infinite;
  pointer-events: none;
  transform: translate3d(-50%, -50%, 0);
  mix-blend-mode: screen;
  will-change: transform, opacity;
}
@keyframes glow {
  0%   { transform: translate3d(-50%,-50%,0) scale(1);    opacity: 0.24; }
  40%  { transform: translate3d(-46%,-54%,0) scale(1.05); opacity: 0.34; }
  75%  { transform: translate3d(-54%,-46%,0) scale(0.95); opacity: 0.20; }
  100% { transform: translate3d(-50%,-50%,0) scale(1);    opacity: 0.24; }
}

/* 透明卡片与动效（与你之前一致） */
.card {
  border: 1px solid rgba(255,255,255,0.18);
  background: transparent;
  backdrop-filter: none;
  border-radius: 16px;
  padding: 24px;
  transition: transform .35s ease, box-shadow .35s ease, border-color .35s ease;
  animation: fade-up .9s ease both;
}
.card:hover { transform: translateY(-4px); box-shadow: 0 8px 28px rgba(16,185,129,0.14); border-color: rgba(16,185,129,0.35); }

@keyframes fade-up { from { opacity:0; transform: translate3d(0,16px,0);} to { opacity:1; transform: translate3d(0,0,0);} }
.animate-fade-up { animation: fade-up .9s ease both; }
.delay-150 { animation-delay: .15s !important; }
.delay-300 { animation-delay: .3s !important; }

@keyframes pop-in { 0%{opacity:0; transform:scale(.97);} 60%{opacity:1; transform:scale(1.02);} 100%{transform:scale(1);} }
.animate-pop-in { animation: pop-in .9s ease both; }

/* 按钮 / 导航 */
.btn-primary { @apply rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:from-emerald-600 hover:to-teal-600 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-300; }
.btn-ghost   { @apply rounded-xl bg-white px-8 py-3 text-lg font-semibold text-emerald-600 shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-emerald-400/40 dark:bg-slate-800 dark:text-emerald-400; }
.btn-outline { @apply rounded-xl border-2 border-white/70 px-8 py-3 text-lg font-semibold text-slate-700 transition-all duration-300 hover:-translate-y-0.5 hover:border-white hover:bg-white/20 dark:text-white dark:border-slate-600; }
.nav-link    { @apply rounded-md px-3 py-2 text-gray-700 transition-all duration-300 hover:text-emerald-500 hover:scale-105 dark:text-gray-300 dark:hover:text-emerald-400; }
</style>
