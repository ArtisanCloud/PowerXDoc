<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useData, useRouter } from 'vitepress'
import FooterBar from './FooterBar.vue'
import VPSwitchAppearance from 'vitepress/dist/client/theme-default/components/VPSwitchAppearance.vue'

type FloatingElement = {
  id: number
  x: number
  y: number
  size: number
  opacity: number
  delay: number
  duration: number
}

type ProductFeature = {
  name: string
  description: string
  image: string
  features: string[]
}

const router = useRouter()
const { theme } = useData()

const gradientOptions = [
  {
    light: ['from-blue-600', 'via-teal-500', 'to-emerald-400'],
    dark: ['dark:from-blue-800', 'dark:via-teal-700', 'dark:to-emerald-600'],
  },
  {
    light: ['from-indigo-600', 'via-cyan-500', 'to-green-400'],
    dark: ['dark:from-indigo-800', 'dark:via-cyan-700', 'dark:to-green-600'],
  },
  {
    light: ['from-purple-600', 'via-blue-500', 'to-teal-400'],
    dark: ['dark:from-purple-800', 'dark:via-blue-700', 'dark:to-teal-600'],
  },
  {
    light: ['from-violet-600', 'via-indigo-500', 'to-cyan-400'],
    dark: ['dark:from-violet-800', 'dark:via-indigo-700', 'dark:to-cyan-600'],
  },
  {
    light: ['from-blue-500', 'via-emerald-500', 'to-green-400'],
    dark: ['dark:from-blue-700', 'dark:via-emerald-700', 'dark:to-green-600'],
  },
  {
    light: ['from-cyan-600', 'via-teal-500', 'to-lime-400'],
    dark: ['dark:from-cyan-800', 'dark:via-teal-700', 'dark:to-lime-600'],
  },
]

const gradientIndex = ref(0)
const particlesVisible = ref(false)
const floatingElements = ref<FloatingElement[]>([])

const gradientClasses = computed(() => {
  const option = gradientOptions[gradientIndex.value] || gradientOptions[0]
  return ['bg-gradient-to-br', ...option.light, ...option.dark]
})

const features = computed(() => [
  {
    icon: '⚡',
    title: '极速部署',
    description: '一键接入智能体运行时，敏捷上线企业级应用。',
  },
  {
    icon: '🎨',
    title: '极致体验',
    description: '以用户为中心的界面设计，打造顺滑的工作流体验。',
  },
  {
    icon: '🔧',
    title: '可视化编排',
    description: '拖拽式流程与动态配置，让复杂业务建模清晰可见。',
  },
  {
    icon: '🛡️',
    title: '安全合规',
    description: '完善的审计与权限体系，保障数据安全与可信治理。',
  },
])

const products = computed<ProductFeature[]>(() => [
  {
    name: 'PowerX Admin',
    description: '集中化管理门户，联通企业级插件、模型与数据能力。',
    image: 'https://dummyimage.com/640x360/0f172a/34d399&text=PowerX+Admin',
    features: ['多租户与权限管理', '可观测的任务编排', '数据资产统一治理', '实时运行态监控'],
  },
  {
    name: 'PowerX Analytics',
    description: '数据驱动的智能分析套件，让业务洞察一目了然。',
    image: 'https://dummyimage.com/640x360/0f172a/38bdf8&text=PowerX+Analytics',
    features: ['实时指标大屏', '可视化报表分享', 'AI 驱动的预测模型', '自定义仪表盘'],
  },
  {
    name: 'PowerX Cloud',
    description: '云原生部署底座，提供弹性算力与统一运维通道。',
    image: 'https://dummyimage.com/640x360/0f172a/60a5fa&text=PowerX+Cloud',
    features: ['托管模型仓库', '跨区域多活集群', '弹性扩缩容', '7x24 专业支持'],
  },
])

const generateFloatingElements = (): FloatingElement[] => {
  const elements: FloatingElement[] = []
  if (typeof window === 'undefined') {
    return elements
  }
  for (let i = 0; i < 12; i += 1) {
    elements.push({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 15 + 8,
      opacity: Math.random() * 0.6 + 0.2,
      delay: Math.random() * 2,
      duration: Math.random() * 3 + 2,
    })
  }
  return elements
}

const scrollToSection = (id: string) => {
  if (typeof window === 'undefined') return
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

const navigateTo = (path: string) => {
  router.go(path)
}

const handleResize = () => {
  floatingElements.value = generateFloatingElements()
}

onMounted(() => {
  if (typeof window === 'undefined') {
    return
  }
  gradientIndex.value = Math.floor(Math.random() * gradientOptions.length)
  floatingElements.value = generateFloatingElements()
  window.setTimeout(() => {
    particlesVisible.value = true
  }, 300)
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (typeof window === 'undefined') {
    return
  }
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <div class="relative min-h-screen w-full overflow-hidden" :class="gradientClasses">
    <div
      class="absolute inset-0 opacity-20 dark:opacity-10"
      style="
        background-image: radial-gradient(
          circle at 1px 1px,
          rgba(255, 255, 255, 0.3) 1px,
          transparent 0
        );
        background-size: 60px 60px;
      "
    ></div>

    <div v-if="particlesVisible" class="absolute inset-0 pointer-events-none">
      <div
        v-for="element in floatingElements"
        :key="element.id"
        class="absolute rounded-full bg-gradient-to-r from-emerald-400/20 to-teal-400/20 dark:from-emerald-400/20 dark:to-teal-400/20 animate-float"
        :style="{
          left: `${element.x}%`,
          top: `${element.y}%`,
          width: `${element.size}px`,
          height: `${element.size}px`,
          animationDelay: `${element.delay}s`,
          animationDuration: `${element.duration}s`,
          opacity: element.opacity,
        }"
      ></div>
    </div>

    <div
      class="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-gradient-to-r from-emerald-500/15 to-teal-500/15 blur-3xl animate-pulse-slow"
    ></div>
    <div
      class="absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-gradient-to-r from-teal-500/15 to-cyan-500/15 blur-3xl animate-pulse-slow delay-1000"
    ></div>
    <div
      class="absolute top-1/2 right-0 h-64 w-64 rounded-full bg-gradient-to-r from-cyan-500/15 to-green-500/15 blur-3xl animate-pulse-slow delay-2000"
    ></div>

    <div class="relative z-10 min-h-screen bg-white/10 backdrop-blur-md transition-all duration-500 dark:bg-gray-900/20">
      <nav
        class="sticky top-0 z-50 border-b border-gray-300/30 bg-white/40 backdrop-blur-md transition-all duration-500 dark:border-white/10 dark:bg-gray-900/40"
      >
        <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <a class="flex items-center space-x-3" href="#">
            <span class="flex h-10 w-10 items-center justify-center">
              <img
                src="/images/logo-m.png"
                alt="PowerX"
                class="h-10 w-10"
              />
            </span>
            <span class="bg-gradient-to-r from-blue-200 to-emerald-200 bg-clip-text text-2xl font-bold text-transparent">
              PowerX
            </span>
          </a>
          <div class="hidden space-x-4 text-sm font-medium md:flex">
            <button
              class="rounded-md px-3 py-2 text-gray-700 transition-colors duration-300 hover:text-emerald-500 dark:text-gray-300 dark:hover:text-emerald-400"
              type="button"
              @click="scrollToSection('features')"
            >
              产品特性
            </button>
            <button
              class="rounded-md px-3 py-2 text-gray-700 transition-colors duration-300 hover:text-emerald-500 dark:text-gray-300 dark:hover:text-emerald-400"
              type="button"
              @click="scrollToSection('products')"
            >
              产品矩阵
            </button>
            <button
              class="rounded-md px-3 py-2 text-gray-700 transition-colors duration-300 hover:text-emerald-500 dark:text-gray-300 dark:hover:text-emerald-400"
              type="button"
              @click="scrollToSection('about')"
            >
              关于我们
            </button>
          </div>
          <div class="flex items-center gap-2 sm:gap-3">
            <VPSwitchAppearance class="flex rounded-full bg-white/70 p-1 text-slate-600 shadow-sm backdrop-blur transition hover:bg-white hover:text-emerald-500 dark:bg-gray-800/70 dark:text-gray-200 dark:hover:bg-gray-800" />
            <a
              :href="githubLink"
              class="items-center gap-2 rounded-lg border border-white/60 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-white hover:bg-white hover:text-emerald-600 dark:border-gray-700 dark:bg-gray-800/60 dark:text-gray-200 dark:hover:border-gray-500 dark:hover:bg-gray-800"
              target="_blank"
              rel="noreferrer"
            >
              <span class="vpi-github text-base" />
              GitHub
            </a>
            <button
              class="rounded-lg bg-gradient-to-r from-blue-600 via-teal-500 to-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-emerald-400/40 focus:outline-none focus:ring-2 focus:ring-emerald-300 dark:from-blue-500 dark:via-teal-400 dark:to-emerald-400"
              type="button"
              @click="navigateTo('/developer-guides/')"
            >
              开始探索
            </button>
          </div>
        </div>
      </nav>

      <section class="relative px-4 py-20 sm:px-6 lg:px-8">
        <div class="mx-auto max-w-4xl text-center">
          <h1 class="mb-6 text-4xl font-bold text-slate-900 dark:text-white md:text-6xl">
            欢迎来到
            <span class="bg-gradient-to-r from-emerald-300 to-teal-200 bg-clip-text text-transparent">PowerX</span>
          </h1>
          <p class="mx-auto mb-8 max-w-2xl text-lg text-slate-600 transition-colors duration-500 dark:text-emerald-100">
            PowerX 是一个面向企业级智能体的工程化落地平台，帮助团队构建、部署与治理复杂的 AI 工作流。
          </p>
          <div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              class="rounded-xl bg-white/90 px-8 py-3 text-lg font-semibold text-emerald-600 shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-emerald-400/40 dark:text-emerald-500"
              type="button"
              @click="navigateTo('/core-concepts/')"
            >
              查看核心概念
            </button>
            <button
              class="rounded-xl border-2 border-white/70 px-8 py-3 text-lg font-semibold text-slate-700 transition-all duration-300 hover:-translate-y-0.5 hover:border-white hover:bg-white/20 dark:text-white"
              type="button"
              @click="navigateTo('/developer-guides/PowerX_Plugin_SDK_Guide')"
            >
              阅读开发者指南
            </button>
          </div>
        </div>
      </section>

      <section id="features" class="px-4 py-20 sm:px-6 lg:px-8">
        <div class="mx-auto max-w-6xl">
          <div class="mb-16 text-center">
            <h2 class="mb-4 text-3xl font-bold text-slate-900 dark:text-white md:text-4xl">产品特性</h2>
            <p class="mx-auto max-w-2xl text-lg text-slate-600 transition-colors duration-500 dark:text-emerald-100">
              连接模型、插件与业务系统，让智能体从探索走向生产。
            </p>
          </div>
          <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            <article
              v-for="(feature, index) in features"
              :key="feature.title"
              class="rounded-xl border border-white/20 bg-white/10 p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:bg-white/20 dark:border-gray-700/40 dark:bg-gray-900/30 dark:hover:bg-gray-900/40"
              :style="{ animationDelay: `${index * 100 + 300}ms` }"
            >
              <div class="mb-4 text-4xl">{{ feature.icon }}</div>
              <h3 class="mb-2 text-xl font-semibold text-slate-900 dark:text-white">{{ feature.title }}</h3>
              <p class="text-slate-600 transition-colors duration-500 dark:text-emerald-100">{{ feature.description }}</p>
            </article>
          </div>
        </div>
      </section>

      <section id="products" class="px-4 py-20 sm:px-6 lg:px-8">
        <div class="mx-auto max-w-6xl">
          <div class="mb-16 text-center">
            <h2 class="mb-4 text-3xl font-bold text-slate-900 dark:text-white md:text-4xl">产品矩阵</h2>
            <p class="mx-auto max-w-2xl text-lg text-slate-600 transition-colors duration-500 dark:text-emerald-100">
              针对不同场景提供端到端的智能体工程化能力。
            </p>
          </div>
          <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <article
              v-for="(product, index) in products"
              :key="product.name"
              class="flex h-full flex-col overflow-hidden rounded-xl border border-white/20 bg-white/10 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:bg-white/20 dark:border-gray-700/40 dark:bg-gray-900/30 dark:hover:bg-gray-900/40"
              :style="{ animationDelay: `${index * 100 + 400}ms` }"
            >
              <div class="h-48 w-full bg-gradient-to-r from-slate-900/10 to-slate-900/20">
                <img
                  :alt="`${product.name} preview`"
                  :src="product.image"
                  class="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <div class="flex flex-1 flex-col p-6">
                <h3 class="mb-2 text-xl font-semibold text-slate-900 dark:text-white">{{ product.name }}</h3>
                <p class="mb-4 text-slate-600 transition-colors duration-500 dark:text-emerald-100">
                  {{ product.description }}
                </p>
                <ul class="mb-6 space-y-2">
                  <li
                    v-for="feature in product.features"
                    :key="feature"
                    class="flex items-center text-sm text-slate-600 transition-colors duration-500 dark:text-emerald-200"
                  >
                    <span class="mr-2 h-2 w-2 rounded-full bg-emerald-400"></span>
                    {{ feature }}
                  </li>
                </ul>
                <button
                  class="mt-auto w-full rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:from-emerald-600 hover:to-teal-600"
                  type="button"
                  @click="navigateTo('/developer-guides/')"
                >
                  查看详情
                </button>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section id="about" class="px-4 py-20 sm:px-6 lg:px-8">
        <div class="mx-auto max-w-6xl">
          <div class="mb-16 text-center">
            <h2 class="mb-4 text-3xl font-bold text-slate-900 dark:text-white md:text-4xl">关于 PowerX</h2>
            <p class="mx-auto max-w-2xl text-lg text-slate-600 transition-colors duration-500 dark:text-emerald-100">
              我们致力于将 AI 能力落地到真实业务场景，让每个组织都能拥有属于自己的智能体生态。
            </p>
          </div>
          <div class="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
            <div class="space-y-4 text-slate-600 transition-colors duration-500 dark:text-emerald-100">
              <h3 class="text-2xl font-semibold text-slate-900 dark:text-white">我们的使命</h3>
              <p>
                PowerX 聚焦智能体从设计、开发、测试到运维的全生命周期，帮助团队用低成本构建可信赖的 AI 服务。
              </p>
              <p>
                我们通过统一的插件与能力中心，将多模型协作、工具调用与数据流动整合为一致的工作流体验。
              </p>
              <p>
                面向企业治理与合规需求，我们提供完善的审计、监控以及多层级权限体系，确保业务连续性。
              </p>
            </div>
            <div class="space-y-6">
              <div class="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div class="rounded-xl border border-white/20 bg-white/10 p-4 text-center backdrop-blur-md dark:border-gray-700/40 dark:bg-gray-900/30">
                  <div class="text-3xl font-bold text-emerald-500 dark:text-emerald-300">1000+</div>
                  <div class="text-slate-600 dark:text-emerald-100">服务企业</div>
                </div>
                <div class="rounded-xl border border-white/20 bg-white/10 p-4 text-center backdrop-blur-md dark:border-gray-700/40 dark:bg-gray-900/30">
                  <div class="text-3xl font-bold text-emerald-500 dark:text-emerald-300">50K+</div>
                  <div class="text-slate-600 dark:text-emerald-100">活跃用户</div>
                </div>
                <div class="rounded-xl border border-white/20 bg-white/10 p-4 text-center backdrop-blur-md dark:border-gray-700/40 dark:bg-gray-900/30">
                  <div class="text-3xl font-bold text-emerald-500 dark:text-emerald-300">99.9%</div>
                  <div class="text-slate-600 dark:text-emerald-100">系统可用性</div>
                </div>
              </div>
              <div class="rounded-xl border border-white/20 bg-white/10 p-6 backdrop-blur-md dark:border-gray-700/40 dark:bg-gray-900/30">
                <h4 class="mb-3 text-xl font-semibold text-slate-900 dark:text-white">企业级实践</h4>
                <p class="text-slate-600 transition-colors duration-500 dark:text-emerald-100">
                  从权限管理、租户隔离到全链路审计，PowerX 为大型组织提供可控、可扩展的智能体落地能力。
                </p>
              </div>
            </div>
          </div>
          <div class="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            <div class="text-center text-slate-600 transition-colors duration-500 dark:text-emerald-100">
              <h4 class="mb-3 text-xl font-semibold text-slate-900 dark:text-white">持续创新</h4>
              <p>保持开放生态，与社区伙伴共同打造下一代智能体运行时。</p>
            </div>
            <div class="text-center text-slate-600 transition-colors duration-500 dark:text-emerald-100">
              <h4 class="mb-3 text-xl font-semibold text-slate-900 dark:text-white">用户至上</h4>
              <p>围绕用户体验不断迭代产品，让业务团队轻松驾驭 AI 能力。</p>
            </div>
            <div class="text-center text-slate-600 transition-colors duration-500 dark:text-emerald-100">
              <h4 class="mb-3 text-xl font-semibold text-slate-900 dark:text-white">卓越交付</h4>
              <p>覆盖实施、培训与运营的全流程，确保项目价值快速兑现。</p>
            </div>
          </div>
        </div>
      </section>

      <section class="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
        <div class="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20"></div>
        <div
          class="absolute inset-0 opacity-30"
          style="
            background-image: radial-gradient(
              circle at 2px 2px,
              rgba(255, 255, 255, 0.4) 1px,
              transparent 0
            );
            background-size: 60px 60px;
          "
        ></div>
        <div class="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl animate-pulse"></div>
        <div class="absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl animate-pulse delay-1000"></div>
        <div class="relative z-10 mx-auto max-w-4xl text-center text-slate-900 dark:text-white">
          <h2 class="mb-6 text-3xl font-bold md:text-4xl">立即启程，构建下一代智能体平台</h2>
          <p class="mx-auto mb-10 max-w-2xl text-lg text-slate-600 transition-colors duration-500 dark:text-emerald-100">
            注册试用或加入社区，了解 PowerX 如何在真实业务场景中驱动 AI 生产力。
          </p>
          <div class="flex flex-col justify-center gap-4 sm:flex-row">
            <button
              class="rounded-xl bg-white/95 px-8 py-4 text-lg font-semibold text-emerald-600 shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-emerald-400/40 dark:text-emerald-500"
              type="button"
              @click="navigateTo('/developer-guides/Agent_Developer_Guide')"
            >
              立即开始
            </button>
            <button
              class="rounded-xl border-2 border-white/70 px-8 py-4 text-lg font-semibold text-slate-700 transition-all duration-300 hover:-translate-y-0.5 hover:border-white hover:bg-white/20 dark:text-white"
              type="button"
              @click="navigateTo('/markdown-examples')"
            >
              查看示例
            </button>
          </div>
        </div>
      </section>

      <FooterBar />
    </div>
  </div>
</template>

<style scoped>
@keyframes float {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  33% {
    transform: translateY(-10px) rotate(1deg);
  }
  66% {
    transform: translateY(5px) rotate(-1deg);
  }
}

@keyframes pulse-slow {
  0%,
  100% {
    opacity: 0.35;
  }
  50% {
    opacity: 0.65;
  }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

.animate-pulse-slow {
  animation: pulse-slow 4s ease-in-out infinite;
}
</style>
const githubLink = computed(() => {
  const links = theme.value?.socialLinks ?? []
  const github = links.find((link) => link.icon === 'github')
  return github?.link ?? 'https://github.com/ArtisanCloud/PowerX'
})
