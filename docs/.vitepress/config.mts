import { defineConfig } from 'vitepress'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadDocmap } from '../../scripts/lib/docmap-utils.mjs'
import { withMermaid } from 'vitepress-plugin-mermaid'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const powerXRepoDir = path.resolve(__dirname, '../../PowerX')

// ---------------- helpers: filesystem -> sidebar ----------------
const WEBSITE_ROOT = path.resolve(__dirname, '../website')
const DOCMAP_PATH = path.resolve(__dirname, '../_data/docmap.yaml')

const docmapData = await loadDocmap(DOCMAP_PATH).catch(() => ({ scenarios: [] }))
const docmapIndex = new Map<string, any>(
  (docmapData.scenarios ?? []).map((scenario: any) => [scenario.scn_id, scenario])
)
for (const scenario of docmapData.scenarios ?? []) {
  if (Array.isArray(scenario.child_scenarios)) {
    for (const child of scenario.child_scenarios) {
      if (child?.scn_id) {
        docmapIndex.set(child.scn_id, child)
      }
    }
  }
}

function shortenTitle(title: string) {
  if (!title) return ''
  let result = title.replace(/^PowerX\s*/i, '')
  result = result.replace(/[\u2013\u2014-]\s*Usecase.*$/i, '')
  return result.trim()
}

function buildScenarioLabel({
  scenario,
  fallbackTitle,
  locale,
  childCount,
  hasOptional,
}: {
  scenario: any
  fallbackTitle: string
  locale: string
  childCount: number
  hasOptional: boolean
}) {
  const rawTitle =
    locale === 'en'
      ? scenario?.title_en ?? scenario?.title ?? fallbackTitle
      : scenario?.title ?? fallbackTitle
  const short = shortenTitle(rawTitle)
  const alias = short ? (short.length > 14 ? `${short.slice(0, 14)}…` : short) : ''
  const base = scenario?.scn_id ?? fallbackTitle
  let label = base
  if (alias) {
    label += ` · ${alias}`
  }
  if (childCount > 0) {
    if (locale === 'en') {
      const countText = `${childCount} seed${childCount > 1 ? 's' : ''}`
      label += ` (${countText}${hasOptional ? ', optional' : ''})`
    } else {
      const countText = `${childCount} 子用例${hasOptional ? '·含可选' : ''}`
      label += ` (${countText})`
    }
  }
  return label
}

function safeLs(dir: string): string[] {
  try { return fs.readdirSync(dir) } catch { return [] }
}

function isDir(p: string) {
  try { return fs.statSync(p).isDirectory() } catch { return false }
}

function walkMd(dir: string, acc: string[] = []): string[] {
  let entries: fs.Dirent[] = []
  try { entries = fs.readdirSync(dir, { withFileTypes: true }) } catch { return acc }
  for (const e of entries) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walkMd(p, acc)
    else if (e.isFile() && p.endsWith('.md')) acc.push(p)
  }
  return acc
}

function readTitleFromMd(file: string): string {
  try {
    const raw = fs.readFileSync(file, 'utf8')
    const fm = raw.match(/^---\n([\s\S]*?)\n---/)
    if (fm) {
      const m = fm[1].match(/^\s*title:\s*(.+)\s*$/m)
      if (m) return m[1].replace(/^['"]|['"]$/g, '')
    }
    const h1 = raw.match(/^\s*#\s+(.+?)\s*$/m)
    if (h1) return h1[1].trim()
  } catch {}
  return path.basename(file, '.md')
}

function readFrontmatter(file: string): Record<string, any> | null {
  try {
    const raw = fs.readFileSync(file, 'utf8')
    const fm = raw.match(/^---\n([\s\S]*?)\n---/)
    if (!fm) return null
    const lines = fm[1]
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(Boolean)
    const data: Record<string, any> = {}
    for (const line of lines) {
      const idx = line.indexOf(':')
      if (idx === -1) continue
      const key = line.slice(0, idx).trim()
      const value = line.slice(idx + 1).trim()
      if (!key) continue
      if (value === 'true' || value === 'false') {
        data[key] = value === 'true'
      } else if (!Number.isNaN(Number(value))) {
        data[key] = Number(value)
      } else {
        data[key] = value.replace(/^['"]|['"]$/g, '')
      }
    }
    return data
  } catch {
    return null
  }
}

// /scenarios/ : 从 website/scenarios 下的 md 自动生成
type SidebarLocaleOptions = {
  dirPrefix?: string
  linkPrefix?: string
  locale?: string
}

const SCENARIO_SIDEBAR_EXCLUDES = new Set(['index.md', 'usage.md'])

function buildScenariosSidebar(options: SidebarLocaleOptions = {}) {
  const dirPrefix = options.dirPrefix ?? ''
  const linkPrefix = options.linkPrefix ?? (dirPrefix ? `/${dirPrefix}` : '')
  const locale = dirPrefix === 'en' ? 'en' : 'zh'
  const dir = path.join(WEBSITE_ROOT, dirPrefix, 'scenarios')
  const listed = new Set<string>()

  const items = (docmapData.scenarios ?? []).map((scenario: any) => {
    const fileName = `${scenario.scn_id}.md`
    const abs = path.join(dir, fileName)
    listed.add(fileName)
    if (!fs.existsSync(abs)) return null
    const fallbackTitle = readTitleFromMd(abs)
    const scenarioEntry = docmapIndex.get(scenario.scn_id)
    const childSeeds = Array.isArray(scenarioEntry?.children)
      ? [...scenarioEntry.children].sort((a: any, b: any) => a.doc_id.localeCompare(b.doc_id))
      : []
    const childScenarioEntries = Array.isArray(scenarioEntry?.child_scenarios)
      ? [...scenarioEntry.child_scenarios].sort((a: any, b: any) =>
          (a.scn_id ?? '').localeCompare(b.scn_id ?? ''),
        )
      : []
    const childCount = childSeeds.length
    const hasOptional = childSeeds.some((child: any) => child?.optional === true)
    const label = buildScenarioLabel({
      scenario,
      fallbackTitle,
      locale,
      childCount,
      hasOptional,
    })
    const slug = fileName.replace(/\.md$/, '')
    const seedDir = path.join(dir, scenario.scn_id)
    const childScenarioItems = childScenarioEntries
      .map((child: any) => {
        const childPath = path.join(seedDir, `${child.scn_id}.md`)
        if (!fs.existsSync(childPath)) return null
        const childData = docmapIndex.get(child.scn_id) ?? child
        const fallbackChildTitle = readTitleFromMd(childPath)
        const localizedChildTitle =
          locale === 'en'
            ? childData?.title_en ?? fallbackChildTitle
            : childData?.title ?? fallbackChildTitle
        const text =
          localizedChildTitle && localizedChildTitle !== child.scn_id
            ? `${child.scn_id} · ${localizedChildTitle}`
            : child.scn_id
        return {
          text,
          link: `${linkPrefix}/scenarios/${scenario.scn_id}/${child.scn_id}`,
        }
      })
      .filter(Boolean)

    const seedItems = childSeeds
      .map((child: any) => {
        const seedPath = path.join(seedDir, `${child.doc_id}.md`)
        if (!fs.existsSync(seedPath)) return null
        const childLabel =
          locale === 'en'
            ? `${child.doc_id}${child.optional ? ' (optional)' : ''}`
            : `${child.doc_id}${child.optional ? '（可选）' : ''}`
        return {
          text: childLabel,
          link: `${linkPrefix}/scenarios/${scenario.scn_id}/${child.doc_id}`,
        }
      })
      .filter(Boolean)

    const scenarioItems: any[] = [
      {
        text: locale === 'en' ? 'Overview' : '概览',
        link: `${linkPrefix}/scenarios/${slug}`,
      },
    ]

    if (childScenarioItems.length)
      scenarioItems.push({
        text: locale === 'en' ? 'Child Scenarios' : '子场景',
        collapsed: true,
        items: childScenarioItems,
      })

    if (seedItems.length)
      scenarioItems.push({
        text: locale === 'en' ? 'Usecase Seeds' : 'Usecase Seed',
        collapsed: true,
        items: seedItems,
      })

    return {
      text: label,
      collapsed: true,
      items: scenarioItems,
    }
  })

  const result = items.filter(Boolean) as any[]

  const files = safeLs(dir)
    .filter(
      f =>
        f.endsWith('.md') && !listed.has(f) && !SCENARIO_SIDEBAR_EXCLUDES.has(f)
    )
    .sort()
  for (const file of files) {
    result.push({
      text: readTitleFromMd(path.join(dir, file)),
      link: `${linkPrefix}/scenarios/` + file.replace(/\.md$/, ''),
    })
  }
  return result
}

function toNavItems(items: any[] = []): any[] {
  return items.map(item => {
    const navItem: any = { text: item.text }
    if (item.link) navItem.link = item.link
    if (item.items) navItem.items = toNavItems(item.items)
    return navItem
  })
}

function buildScenarioNavItems(locale: 'zh' | 'en') {
  const dirPrefix = locale === 'en' ? 'en' : 'zh'
  const linkPrefix = locale === 'en' ? '/en' : '/zh'
  const sidebarEntries = buildScenariosSidebar({ dirPrefix, linkPrefix, locale })

  return [
    {
      text: locale === 'en' ? 'Scenario Navigator' : '场景导航',
      link: `${linkPrefix}/scenarios/`,
    },
    ...sidebarEntries.map(entry => {
      const [overview, ...rest] = entry.items ?? []
      const navEntry: any = {
        text: entry.text,
        link: overview?.link ?? `${linkPrefix}/scenarios/${entry.text}`,
      }
      if (rest.length) navEntry.items = toNavItems(rest)
      return navEntry
    }),
  ]
}

const zhOperationsSidebar = [
  {
    text: '运营与治理',
    collapsed: false,
    items: [
      { text: '概览', link: '/zh/operations/' },
      { text: '观测与告警', link: '/zh/operations/#observability' },
      { text: '安全治理', link: '/zh/operations/#security' },
      { text: '变更管理', link: '/zh/operations/#change-management' },
      { text: '报告与审计', link: '/zh/operations/#reporting' },
      { text: '安全治理专题', link: '/zh/security-and-governance/' },
    ],
  },
]

const enOperationsSidebar = [
  {
    text: 'Operations & Governance',
    collapsed: false,
    items: [
      { text: 'Overview', link: '/en/operations/' },
      { text: 'Observability', link: '/en/operations/#observability' },
      { text: 'Security', link: '/en/operations/#security' },
      { text: 'Change Management', link: '/en/operations/#change-management' },
      { text: 'Reporting', link: '/en/operations/#reporting' },
      { text: 'Security & Governance Hub', link: '/en/security-and-governance/' },
    ],
  },
]

const zhOverviewSidebar = [
  {
    text: '产品概览',
    collapsed: false,
    items: [
      { text: '愿景与定位', link: '/zh/overview/#vision' },
      { text: '场景蓝本', link: '/zh/overview/#guiding-scenarios' },
      { text: '产品矩阵', link: '/zh/overview/#product-matrix' },
      { text: '市场聚焦', link: '/zh/overview/#gtm-focus' },
      { text: '路线图', link: '/zh/overview/roadmap' },
    ],
  },
  {
    text: '核心概念',
    collapsed: false,
    items: [
      { text: '核心概念索引', link: '/zh/core-concepts/' },
      { text: '集成架构', link: '/zh/core-concepts/PowerX_Integration_Architecture' },
      { text: '多智能体生命周期', link: '/zh/core-concepts/Agent_Manager_and_Lifecycle_Spec' },
      { text: '知识库基础', link: '/zh/core-concepts/00_overview' },
      { text: '工作流与编排概念', link: '/zh/core-concepts/workflow-overview' },
      { text: 'SDD 核心理念', link: '/zh/core-concepts/spec-driven-development' },
    ],
  },
]

const enOverviewSidebar = [
  {
    text: 'Product Overview',
    collapsed: false,
    items: [
      { text: 'Vision & Positioning', link: '/en/overview/#vision' },
      { text: 'Guiding Scenarios', link: '/en/overview/#guiding-scenarios' },
      { text: 'Product Matrix', link: '/en/overview/#product-matrix' },
      { text: 'Go-To-Market Focus', link: '/en/overview/#gtm-focus' },
    ],
  },
  {
    text: 'Core Concepts',
    collapsed: false,
    items: [
      { text: 'Core Concepts Index', link: '/en/core-concepts/' },
      { text: 'Integration Architecture', link: '/en/core-concepts/PowerX_Integration_Architecture' },
      { text: 'Agent Lifecycle', link: '/en/core-concepts/Agent_Manager_and_Lifecycle_Spec' },
      { text: 'Knowledge Base Primer', link: '/en/core-concepts/00_overview' },
      { text: 'Specification-Driven Development', link: '/en/core-concepts/spec-driven-development' },
    ],
  },
]

function buildCollectedSidebar(dirPrefix = '', linkPrefix = '') {
  const root = path.join(WEBSITE_ROOT, dirPrefix, '_collected')
  const scopes = safeLs(root).filter(n => isDir(path.join(root, n)))
  const scopeLabel: Record<string, string> = {
    px: 'PX（PowerX）',
    mkp: 'MKP（Marketplace）',
    plg: 'PLG（Plugin）',
    admin: 'PX-ADMIN（Admin）'
  }

  return scopes.map(scope => {
    const scopeDir = path.join(root, scope)
    const layers = safeLs(scopeDir).filter(n => isDir(path.join(scopeDir, n))).sort()

    const items = layers.flatMap(layer => {
      const layerDir = path.join(scopeDir, layer)
      const domains = safeLs(layerDir).filter(n => isDir(path.join(layerDir, n))).sort()

      return domains.map(domain => {
        const files = walkMd(path.join(layerDir, domain)).sort()
        const children = files.map(abs => ({
          text: (() => {
            const front = readFrontmatter(abs)
            const baseTitle = front?.title ?? readTitleFromMd(abs)
            if (front?.optional) {
              return `${baseTitle}（可选）`
            }
            return baseTitle
          })(),
          link:
            linkPrefix +
            path
              .relative(WEBSITE_ROOT, abs)
              .replace(/\\/g, '/')
              .replace(/\.md$/, '')
        }))
        return { text: `${layer}/${domain}`, items: children }
      })
    })

    return { text: scopeLabel[scope] ?? scope.toUpperCase(), items }
  })
}

function buildUsecaseSeedSidebar(dirPrefix = '', linkPrefix = '') {
  const root = path.join(WEBSITE_ROOT, dirPrefix, 'usecases')
  if (!fs.existsSync(root)) return []
  const groups = safeLs(root)
    .filter(folder => isDir(path.join(root, folder)))
    .sort()

  return groups.map(group => {
    const groupDir = path.join(root, group)
    const files = walkMd(groupDir).sort()
    const children = files.map(abs => ({
      text: readTitleFromMd(abs),
      link:
        linkPrefix +
        path
          .relative(WEBSITE_ROOT, abs)
          .replace(/\\/g, '/')
          .replace(/\.md$/, '')
    }))
    return { text: group, items: children }
  })
}

// ---------------- site config ----------------
export default withMermaid(defineConfig({
  title: 'PowerX Documentation',
  description: 'A website to introduce PowerX',
  srcDir: 'website',
  publicDir: path.resolve(__dirname, '../website/public'),

  locales: {
    // ----- zh-CN -----
    root: {
      label: '简体中文',
      lang: 'zh-CN',
      link: '/zh/',
      themeConfig: {
        siteTitle: 'PowerX 文档中心',
        nav: [
          { text: '产品概览', link: '/zh/overview/', activeMatch: '^/zh/(overview/|core-concepts/)' },
          { text: '使用与部署', link: '/zh/guides/', activeMatch: '^/zh/(guides/)' },
          {
            text: '场景与用例',
            link: '/zh/scenarios/',
            activeMatch: '^/zh/(scenarios/|library/)',
            items: buildScenarioNavItems('zh'),
          },
          { text: '开发与扩展', link: '/zh/developers/', activeMatch: '^/zh/(developers/|api-and-specifications/|pxip/)' },
          { text: '运营与治理', link: '/zh/operations/', activeMatch: '^/zh/(operations/|security-and-governance/)' },
          { text: '资源中心', link: '/zh/resources/', activeMatch: '^/zh/(resources/)' }
        ],
        // 根据路由前缀切换不同侧边栏（静态文档沿用你原有分组）
        sidebar: {
          '/zh/overview/': zhOverviewSidebar,
          '/zh/guides/': [
            {
              text: '使用与部署',
              collapsed: false,
              items: [
                { text: '快速开始', link: '/zh/guides/' },
                { text: '部署指南', link: '/zh/guides/#deployment' },
                { text: '配置与集成', link: '/zh/guides/#configuration' },
                { text: '运维 FAQ', link: '/zh/guides/#ops-faq' }
              ]
            },
            {
              text: '场景与标准分发',
              collapsed: false,
              items: [
                { text: '场景文档生成', link: '/zh/guides/scenarios/scenario-generation' },
                { text: 'Docmap 维护记录', link: '/zh/guides/scenarios/docmap-maintenance' },
                { text: '标准文档分发', link: '/zh/guides/publish/standards-distribution' }
              ]
            },
            {
              text: 'Usecase Seeds',
              collapsed: false,
              items: [
                { text: 'Seed 生成', link: '/zh/guides/usecases/generate-usecase-seeds' },
                { text: 'Seed 发布', link: '/zh/guides/usecases/publish-usecase-seeds' },
                { text: '索引维护', link: '/zh/guides/usecases/seed-index-maintenance' }
              ]
            }
          ],
          '/zh/core-concepts/': zhOverviewSidebar,
          '/zh/scenarios/': [
            {
              text: '导航与流程',
              collapsed: false,
              items: [
                { text: '场景与用例导航', link: '/zh/scenarios/' },
                { text: '场景使用流程', link: '/zh/scenarios/usage' },
              ],
            },
            {
              text: '场景列表',
              collapsed: false,
              items: [
                { text: '总览', link: '/zh/scenarios/#catalog' },
              ].concat(buildScenariosSidebar({ dirPrefix: 'zh', linkPrefix: '/zh', locale: 'zh' }))
            }
          ],
          '/zh/library/': buildCollectedSidebar('', '/'),
          '/zh/developers/': [
            {
              text: '开发与扩展',
              collapsed: false,
              items: [
                { text: 'SDK / API', link: '/zh/developers/#sdk-api' },
                { text: '插件体系', link: '/zh/developers/#plugin-ecosystem' },
                { text: '质量与测试', link: '/zh/developers/#quality-testing' },
                { text: '工具链', link: '/zh/developers/#tooling' }
              ]
            },
            {
              text: '核心文档',
              collapsed: false,
              items: [
                { text: 'API 与规范', link: '/zh/api-and-specifications/' },
                { text: 'PXIP 提案', link: '/zh/pxip/README.md' }
              ]
            }
          ],
          '/zh/api-and-specifications/': [
            {
              text: '概览',
              collapsed: false,
              items: [
                { text: '栏目索引', link: '/zh/api-and-specifications/' },
                { text: '总览', link: '/zh/api-and-specifications/README' },
                { text: 'API 示例', link: '/zh/api-examples' }
              ]
            },
            {
              text: '能力模型与传输',
              collapsed: false,
              items: [
                { text: '能力契约规范', link: '/zh/api-and-specifications/02_capability/Capability_Contract_Spec' },
                { text: '传输适配器规范', link: '/zh/api-and-specifications/02_capability/Transport_Adapter_Spec' }
              ]
            },
            {
              text: '注册与路由',
              collapsed: false,
              items: [
                { text: '能力注册与路由设计', link: '/zh/api-and-specifications/03_registry_router/Capability_Registry_and_Router_Design' },
                { text: '运行时端点管理', link: '/zh/api-and-specifications/03_registry_router/Runtime_Endpoint_Management' }
              ]
            },
            {
              text: '编排与工作流',
              collapsed: false,
              items: [
                { text: '流程与状态模型', link: '/zh/api-and-specifications/04_orchestration/Flow_and_State_Model' },
                { text: '编排服务接口', link: '/zh/api-and-specifications/04_orchestration/Orchestrator_Service_Interface' },
                { text: '实时流式网关', link: '/zh/api-and-specifications/04_orchestration/Realtime_Streaming_Gateway' },
                { text: '工作流与智能体编排规范', link: '/zh/api-and-specifications/04_orchestration/Workflow_and_Agent_Orchestration_Spec' }
              ]
            },
            {
              text: '网关与消息总线',
              collapsed: false,
              items: [
                { text: '事件总线与消息织网', link: '/zh/api-and-specifications/06_gateway/EventBus_and_Message_Fabric' },
                { text: '集成 API 与管理界面', link: '/zh/api-and-specifications/06_gateway/Integration_API_and_Admin_Interface' },
                { text: 'MCP 服务与网关设计', link: '/zh/api-and-specifications/06_gateway/MCP_Server_and_Gateway_Design' }
              ]
            }
          ],
          '/zh/operations/': zhOperationsSidebar,
          '/zh/security-and-governance/': zhOperationsSidebar,
          '/zh/resources/': [
            {
              text: '资源中心',
              collapsed: false,
              items: [
                { text: '下载与工具', link: '/zh/resources/#downloads' },
                { text: '版本与公告', link: '/zh/resources/#release-notes' },
                { text: '术语表', link: '/zh/resources/#glossary' },
                { text: '对外链接', link: '/zh/resources/#links' }
              ]
            }
          ]
        },
        footer: { message: '基于 Apache 2.0 许可发布' },
        editLink: { text: '在 GitHub 上编辑此页' }
      }
    },

    // ----- en-US -----
    en: {
      label: 'English',
      lang: 'en-US',
      link: '/en/',
      themeConfig: {
        siteTitle: 'PowerX Documentation',
        nav: [
          { text: 'Overview', link: '/en/overview/', activeMatch: '^/en/(overview/|core-concepts/)' },
          { text: 'Guides', link: '/en/guides/', activeMatch: '^/en/(guides/)' },
          {
            text: 'Scenarios',
            link: '/en/scenarios/',
            activeMatch: '^/en/(scenarios/|library/)',
            items: buildScenarioNavItems('en'),
          },
          { text: 'Developers', link: '/en/developers/', activeMatch: '^/en/(developers/|api-and-specifications/|pxip/)' },
          { text: 'Operations', link: '/en/operations/', activeMatch: '^/en/(operations/|security-and-governance/)' },
          { text: 'Resources', link: '/en/resources/', activeMatch: '^/en/(resources/)' }
        ],
        sidebar: {
          // Scenarios (auto)
          '/en/overview/': enOverviewSidebar,
          '/en/guides/': [
            {
              text: 'Guides & Deployment',
              collapsed: false,
              items: [
                { text: 'Quick Start', link: '/en/guides/#quickstart' },
                { text: 'Deployment Playbooks', link: '/en/guides/#deployment' },
                { text: 'Configuration & Integration', link: '/en/guides/#configuration' },
                { text: 'Operations FAQ', link: '/en/guides/#ops-faq' }
              ]
            },
            {
              text: 'Usecase Seeds',
              collapsed: false,
              items: [
                { text: 'Generate Seeds', link: '/en/guides/usecases/generate-usecase-seeds' },
                { text: 'Publish Seeds', link: '/en/guides/usecases/publish-usecase-seeds' },
                { text: 'Maintain Indexes', link: '/en/guides/usecases/seed-index-maintenance' }
              ]
            },
            {
              text: 'Scenarios & Standards',
              collapsed: false,
              items: [
                { text: 'Scenario Authoring', link: '/en/guides/scenarios/scenario-generation' },
                { text: 'Docmap Maintenance', link: '/en/guides/scenarios/docmap-maintenance' },
                { text: 'Standards Distribution', link: '/en/guides/publish/standards-distribution' }
              ]
            }
          ],
          '/en/scenarios/': [
            {
              text: 'Navigation & Flow',
              collapsed: false,
              items: [
                { text: 'Scenario & Usecase Navigation', link: '/en/scenarios/' },
                { text: 'Scenario Usage Flow', link: '/en/scenarios/usage' }
              ]
            },
            {
              text: 'Scenario List',
              collapsed: false,
              items: [
                { text: 'Overview', link: '/en/scenarios/#catalog' }
              ].concat(buildScenariosSidebar({ dirPrefix: 'en', linkPrefix: '/en', locale: 'en' }))
            }
          ],
          '/en/core-concepts/': enOverviewSidebar,
          '/en/library/': buildCollectedSidebar('', '/'),
          '/en/developers/': [
            {
              text: 'Developers',
              collapsed: false,
              items: [
                { text: 'SDK / API', link: '/en/developers/#sdk-api' },
                { text: 'Plugin Ecosystem', link: '/en/developers/#plugin-ecosystem' },
                { text: 'Quality & Testing', link: '/en/developers/#quality-testing' },
                { text: 'Tooling', link: '/en/developers/#tooling' }
              ]
            }
          ],
          '/en/api-and-specifications/': [
            {
              text: 'Overview',
              collapsed: false,
              items: [
                { text: 'Section Hub', link: '/en/api-and-specifications/' },
                { text: 'Summary', link: '/en/api-and-specifications/README' },
                { text: 'API Examples', link: '/en/api-examples' }
              ]
            },
            {
              text: 'Capability & Transport',
              collapsed: false,
              items: [
                { text: 'Capability Contract Spec', link: '/en/api-and-specifications/02_capability/Capability_Contract_Spec' },
                { text: 'Transport Adapter Spec', link: '/en/api-and-specifications/02_capability/Transport_Adapter_Spec' }
              ]
            },
            {
              text: 'Registry & Router',
              collapsed: false,
              items: [
                { text: 'Capability Registry & Router Design', link: '/en/api-and-specifications/03_registry_router/Capability_Registry_and_Router_Design' },
                { text: 'Runtime Endpoint Management', link: '/en/api-and-specifications/03_registry_router/Runtime_Endpoint_Management' }
              ]
            },
            {
              text: 'Orchestration & Workflow',
              collapsed: false,
              items: [
                { text: 'Flow & State Model', link: '/en/api-and-specifications/04_orchestration/Flow_and_State_Model' },
                { text: 'Orchestrator Service Interface', link: '/en/api-and-specifications/04_orchestration/Orchestrator_Service_Interface' },
                { text: 'Realtime Streaming Gateway', link: '/en/api-and-specifications/04_orchestration/Realtime_Streaming_Gateway' },
                { text: 'Workflow & Agent Orchestration Spec', link: '/en/api-and-specifications/04_orchestration/Workflow_and_Agent_Orchestration_Spec' }
              ]
            },
            {
              text: 'Gateway & Event Bus',
              collapsed: false,
              items: [
                { text: 'EventBus & Message Fabric', link: '/en/api-and-specifications/06_gateway/EventBus_and_Message_Fabric' },
                { text: 'Integration API & Admin Interface', link: '/en/api-and-specifications/06_gateway/Integration_API_and_Admin_Interface' },
                { text: 'MCP Server & Gateway Design', link: '/en/api-and-specifications/06_gateway/MCP_Server_and_Gateway_Design' }
              ]
            }
          ],
          '/en/operations/': enOperationsSidebar,
          '/en/security-and-governance/': enOperationsSidebar,
          '/en/resources/': [
            {
              text: 'Resource Centre',
              collapsed: false,
              items: [
                { text: 'Downloads & Tools', link: '/en/resources/#downloads' },
                { text: 'Release Notes', link: '/en/resources/#release-notes' },
                { text: 'Glossary', link: '/en/resources/#glossary' },
                { text: 'External Links', link: '/en/resources/#links' }
              ]
            }
          ]
        },
        footer: { message: 'Released under the Apache 2.0 License.' },
        editLink: { text: 'Edit this page on GitHub' }
      }
    }
  },

  themeConfig: {
    logo: {
      light: '/images/logo-s.png',
      dark: '/images/logo-s.png'
    },
    socialLinks: [{ icon: 'github', link: 'https://github.com/ArtisanCloud/PowerX' }]
  },

  vite: {
    server: {
      fs: { allow: [powerXRepoDir] }
    }
  }
}))
