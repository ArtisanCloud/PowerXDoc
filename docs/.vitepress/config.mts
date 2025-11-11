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
      { text: '端口矩阵', link: '/zh/operations/service-port-matrix' },
      { text: '安全治理专题', link: '/zh/security-and-governance/' },
    ],
  },
]

const zhDevelopersSidebar = [
  {
    text: '开发者中心',
    collapsed: false,
    items: [
      { text: '总览', link: '/zh/developers/' },
      { text: 'API 与规范', link: '/zh/developers/api-and-specifications/' },
      { text: 'PXIP 提案', link: '/zh/developers/pxip/README' },
      { text: 'API 示例', link: '/zh/developers/api-examples' },
    ],
  },
  {
    text: '能力模型与传输',
    collapsed: false,
    items: [
      { text: '能力契约规范', link: '/zh/developers/api-and-specifications/02_capability/Capability_Contract_Spec' },
      { text: '传输适配器规范', link: '/zh/developers/api-and-specifications/02_capability/Transport_Adapter_Spec' },
    ],
  },
  {
    text: '注册与路由',
    collapsed: false,
    items: [
      { text: '能力注册与路由设计', link: '/zh/developers/api-and-specifications/03_registry_router/Capability_Registry_and_Router_Design' },
      { text: '运行时端点管理', link: '/zh/developers/api-and-specifications/03_registry_router/Runtime_Endpoint_Management' },
    ],
  },
  {
    text: '编排与工作流',
    collapsed: false,
    items: [
      { text: '流程与状态模型', link: '/zh/developers/api-and-specifications/04_orchestration/Flow_and_State_Model' },
      { text: '编排服务接口', link: '/zh/developers/api-and-specifications/04_orchestration/Orchestrator_Service_Interface' },
      { text: '实时流式网关', link: '/zh/developers/api-and-specifications/04_orchestration/Realtime_Streaming_Gateway' },
      { text: '工作流与智能体编排规范', link: '/zh/developers/api-and-specifications/04_orchestration/Workflow_and_Agent_Orchestration_Spec' },
    ],
  },
  {
    text: '网关与消息总线',
    collapsed: false,
    items: [
      { text: '事件总线与消息织网', link: '/zh/developers/api-and-specifications/06_gateway/EventBus_and_Message_Fabric' },
      { text: '集成 API 与管理界面', link: '/zh/developers/api-and-specifications/06_gateway/Integration_API_and_Admin_Interface' },
      { text: 'MCP 服务与网关设计', link: '/zh/developers/api-and-specifications/06_gateway/MCP_Server_and_Gateway_Design' },
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
      { text: 'Port Matrix', link: '/en/operations/service-port-matrix' },
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
  ignoreDeadLinks: true,

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
          { text: '开发与扩展', link: '/zh/developers/', activeMatch: '^/zh/developers/' },
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
              text: '插件发布机制',
              collapsed: false,
              items: [
                { text: '发布机制索引', link: '/zh/guides/publish/' },
                { text: '插件本地初始化', link: '/zh/guides/publish/local-init' },
                { text: '离线发布与导入', link: '/zh/guides/publish/offline-publish' },
                { text: '插件本地调试实践', link: '/zh/guides/publish/local-dev-debug' },
                { text: '在线发布与上架', link: '/zh/guides/publish/online-publish' },
                { text: '插件元数据说明', link: '/zh/guides/publish/plugin-metadata' },
                { text: '版本兼容性与治理', link: '/zh/guides/publish/version-compatibility' },
                { text: '标准分发要求', link: '/zh/guides/publish/standards-distribution' }
              ]
            },
            {
              text: '插件安装与运维',
              collapsed: false,
              items: [
                { text: '插件运行态指南', link: '/zh/guides/Plugin_Runtime_Guide' },
                { text: '插件测试与调试', link: '/zh/guides/Plugin_Test_and_Debug_Guide' }
              ]
            },
            {
              text: '扩展与二次开发',
              collapsed: false,
              items: [
                { text: '插件 SDK 指南', link: '/zh/guides/PowerX_Plugin_SDK_Guide' },
                { text: '智能体开发入门', link: '/zh/guides/Agent_Developer_Guide' },
                { text: '前往开发者中心', link: '/zh/developers/' }
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
              text: '业务场景文档',
              collapsed: false,
              items: [
                { text: '总览', link: '/zh/scenarios/meta/' },
                {
                  text: 'PowerX 平台',
                  collapsed: true,
                  items: [
                    { text: '介绍', link: '/zh/scenarios/meta/powerx/' },
                    { text: '智能体与自动化', link: '/zh/scenarios/meta/powerx/agent-and-automation/' },
                    { text: '核心平台', link: '/zh/scenarios/meta/powerx/core-platform/' },
                    { text: '市场与业务', link: '/zh/scenarios/meta/powerx/marketplace-and-business/' },
                    { text: '插件生态', link: '/zh/scenarios/meta/powerx/plugin-ecosystem/' },
                    { text: 'Web 管理与小程序', link: '/zh/scenarios/meta/powerx/admin-web-miniapp/' },
                  ]
                },
                {
                  text: '电商业务',
                  collapsed: true,
                  items: [
                    { text: '介绍', link: '/zh/scenarios/meta/ecommerce/' },
                    { text: '购物车与结算', link: '/zh/scenarios/meta/ecommerce/cart_checkout/' },
                    { text: '订单履约', link: '/zh/scenarios/meta/ecommerce/order_fulfillment/' },
                    { text: '定价与促销', link: '/zh/scenarios/meta/ecommerce/pricing_promotion/' },
                    { text: '商品与内容', link: '/zh/scenarios/meta/ecommerce/catalog_and_content/' },
                    { text: '数据分析', link: '/zh/scenarios/meta/ecommerce/data_analytics/' },
                    { text: '渠道与门店', link: '/zh/scenarios/meta/ecommerce/channels_stores/' },
                    { text: '会员与营销', link: '/zh/scenarios/meta/ecommerce/membership_marketing/' },
                    { text: '支付与账单', link: '/zh/scenarios/meta/ecommerce/payment_billing/' },
                    { text: '库存与仓储', link: '/zh/scenarios/meta/ecommerce/inventory_warehouse/' },
                    { text: '财务结算', link: '/zh/scenarios/meta/ecommerce/finance_settlement/' },
                    { text: '平台运营', link: '/zh/scenarios/meta/ecommerce/platform_ops/' },
                    { text: '风险与合规', link: '/zh/scenarios/meta/ecommerce/risk_compliance/' },
                    { text: '售后服务', link: '/zh/scenarios/meta/ecommerce/after_sales_customer_service/' },
                  ]
                },
                {
                  text: 'CRM',
                  collapsed: true,
                  items: [
                    { text: '介绍', link: '/zh/scenarios/meta/crm/' },
                    { text: '客户与线索管理', link: '/zh/scenarios/meta/crm/customer-management/' },
                    { text: '销售流程与商机', link: '/zh/scenarios/meta/crm/sales-process/' },
                    { text: '沟通与协同', link: '/zh/scenarios/meta/crm/communication-collaboration/' },
                    { text: '客户服务与成功', link: '/zh/scenarios/meta/crm/customer-success/' },
                    { text: '会员与忠诚度', link: '/zh/scenarios/meta/crm/membership-loyalty/' },
                    { text: '营销自动化', link: '/zh/scenarios/meta/crm/marketing-automation/' },
                    { text: '数据洞察与营收预测', link: '/zh/scenarios/meta/crm/analytics-revenue-intelligence/' },
                    { text: '系统配置与生态集成', link: '/zh/scenarios/meta/crm/admin-integration/' },
                  ]
                },
                {
                  text: 'SCRM',
                  collapsed: true,
                  items: [
                    { text: '介绍', link: '/zh/scenarios/meta/scrm/' },
                    { text: '社交触点接入与账号治理', link: '/zh/scenarios/meta/scrm/social_channel_governance/' },
                    { text: '系统集成与数据流转', link: '/zh/scenarios/meta/scrm/system_integration_data_orchestration/' },
                    { text: '线索获取与智能分配', link: '/zh/scenarios/meta/scrm/lead_capture_smart_assignment/' },
                    { text: '社群与客户运营', link: '/zh/scenarios/meta/scrm/community_customer_engagement/' },
                    { text: '智能标签与客户分群', link: '/zh/scenarios/meta/scrm/smart_tagging_customer_segmentation/' },
                    { text: '内容分发与互动自动化', link: '/zh/scenarios/meta/scrm/content_engagement_automation/' },
                    { text: '社交交易与分销闭环', link: '/zh/scenarios/meta/scrm/social_commerce_distribution/' },
                    { text: '社交销售助手与外勤协同', link: '/zh/scenarios/meta/scrm/social_selling_field_collab/' },
                    { text: '客户服务与协同闭环', link: '/zh/scenarios/meta/scrm/customer_service_collaboration_loop/' },
                    { text: '数据分析与洞察', link: '/zh/scenarios/meta/scrm/analytics_insights/' },
                    { text: '移动前线能力', link: '/zh/scenarios/meta/scrm/mobile_frontline_capabilities/' },
                    { text: 'AIGC 与智能化应用', link: '/zh/scenarios/meta/scrm/aigc_automation_intelligence/' },
                    { text: '平台生态与开放能力', link: '/zh/scenarios/meta/scrm/platform_ecosystem_extensibility/' },
                    { text: '合规、安全与风控', link: '/zh/scenarios/meta/scrm/compliance_security_risk_control/' },
                  ]
                },
              ]
            },
            {
              text: '开发用例列表',
              collapsed: false,
              items: [
                { text: '总览', link: '/zh/scenarios/#catalog' },
              ].concat(buildScenariosSidebar({ dirPrefix: 'zh', linkPrefix: '/zh', locale: 'zh' }))
            }
          ],
          '/zh/library/': buildCollectedSidebar('', '/'),
          '/zh/developers/': zhDevelopersSidebar,
          '/zh/developers/api-and-specifications/': zhDevelopersSidebar,
          '/zh/developers/pxip/': zhDevelopersSidebar,
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
              text: 'Plugin Operations',
              collapsed: false,
              items: [
                { text: 'Plugin Runtime Guide', link: '/en/guides/Plugin_Runtime_Guide' },
                { text: 'Plugin Test & Debug', link: '/en/guides/Plugin_Test_and_Debug_Guide' }
              ]
            },
            {
              text: 'Extend & Develop',
              collapsed: false,
              items: [
                { text: 'Plugin SDK Guide', link: '/en/guides/PowerX_Plugin_SDK_Guide' },
                { text: 'Agent Developer Guide', link: '/en/guides/Agent_Developer_Guide' },
                { text: 'Visit Developer Hub', link: '/en/developers/' }
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
              text: 'Business Scenarios',
              collapsed: false,
              items: [
                { text: 'Overview', link: '/en/scenarios/meta/' },
                {
                  text: 'PowerX Platform',
                  collapsed: true,
                  items: [
                    { text: 'Agent & Automation', link: '/en/scenarios/meta/powerx/agent-and-automation/introduction/' },
                    { text: 'Core Platform', link: '/en/scenarios/meta/powerx/core-platform/introduction/' },
                    { text: 'Marketplace & Business', link: '/en/scenarios/meta/powerx/marketplace-and-business/introduction/' },
                    { text: 'Plugin Ecosystem', link: '/en/scenarios/meta/powerx/plugin-ecosystem/introduction/' },
                    { text: 'Admin Web & MiniApp', link: '/en/scenarios/meta/powerx/admin-web-miniapp/introduction/' },
                  ]
                },
                {
                  text: 'Ecommerce',
                  collapsed: true,
                  items: [
                    { text: 'Cart & Checkout', link: '/en/scenarios/meta/ecommerce/cart_checkout/introduction/' },
                    { text: 'Order Fulfillment', link: '/en/scenarios/meta/ecommerce/order_fulfillment/introduction/' },
                    { text: 'Pricing & Promotion', link: '/en/scenarios/meta/ecommerce/pricing_promotion/introduction/' },
                    { text: 'Catalog & Content', link: '/en/scenarios/meta/ecommerce/catalog_and_content/introduction/' },
                    { text: 'Data Analytics', link: '/en/scenarios/meta/ecommerce/data_analytics/introduction/' },
                    { text: 'Channels & Stores', link: '/en/scenarios/meta/ecommerce/channels_stores/introduction/' },
                    { text: 'Membership & Marketing', link: '/en/scenarios/meta/ecommerce/membership_marketing/introduction/' },
                    { text: 'Payment & Billing', link: '/en/scenarios/meta/ecommerce/payment_billing/introduction/' },
                    { text: 'Inventory & Warehouse', link: '/en/scenarios/meta/ecommerce/inventory_warehouse/introduction/' },
                    { text: 'Finance Settlement', link: '/en/scenarios/meta/ecommerce/finance_settlement/introduction/' },
                    { text: 'Platform Ops', link: '/en/scenarios/meta/ecommerce/platform_ops/introduction/' },
                    { text: 'Risk & Compliance', link: '/en/scenarios/meta/ecommerce/risk_compliance/introduction/' },
                    { text: 'After Sales', link: '/en/scenarios/meta/ecommerce/after_sales_customer_service/introduction/' },
                  ]
                },
                {
                  text: 'CRM',
                  collapsed: true,
                  items: [
                    { text: 'Overview', link: '/en/scenarios/meta/crm/' },
                    { text: 'Customer & Lead Management', link: '/en/scenarios/meta/crm/customer-management/' },
                    { text: 'Sales Pipeline & Opportunity', link: '/en/scenarios/meta/crm/sales-process/' },
                    { text: 'Communication & Collaboration', link: '/en/scenarios/meta/crm/communication-collaboration/' },
                    { text: 'Customer Service & Success', link: '/en/scenarios/meta/crm/customer-success/' },
                    { text: 'Membership & Loyalty', link: '/en/scenarios/meta/crm/membership-loyalty/' },
                    { text: 'Marketing Automation', link: '/en/scenarios/meta/crm/marketing-automation/' },
                    { text: 'Analytics & Revenue Intelligence', link: '/en/scenarios/meta/crm/analytics-revenue-intelligence/' },
                    { text: 'Admin & Integration', link: '/en/scenarios/meta/crm/admin-integration/' },
                  ]
                },
                {
                  text: 'SCRM',
                  collapsed: true,
                  items: [
                    { text: 'Overview', link: '/en/scenarios/meta/scrm/' },
                    { text: 'Social Channel Onboarding & Governance', link: '/en/scenarios/meta/scrm/social_channel_governance/' },
                    { text: 'System Integration & Data Orchestration', link: '/en/scenarios/meta/scrm/system_integration_data_orchestration/' },
                    { text: 'Lead Capture & Smart Assignment', link: '/en/scenarios/meta/scrm/lead_capture_smart_assignment/' },
                    { text: 'Community & Customer Engagement', link: '/en/scenarios/meta/scrm/community_customer_engagement/' },
                    { text: 'Smart Tagging & Customer Segmentation', link: '/en/scenarios/meta/scrm/smart_tagging_customer_segmentation/' },
                    { text: 'Content Distribution & Engagement Automation', link: '/en/scenarios/meta/scrm/content_engagement_automation/' },
                    { text: 'Social Commerce & Distribution', link: '/en/scenarios/meta/scrm/social_commerce_distribution/' },
                    { text: 'Social Selling Assistant & Field Collaboration', link: '/en/scenarios/meta/scrm/social_selling_field_collab/' },
                    { text: 'Customer Service & Collaboration Loop', link: '/en/scenarios/meta/scrm/customer_service_collaboration_loop/' },
                    { text: 'Analytics & Insights', link: '/en/scenarios/meta/scrm/analytics_insights/' },
                    { text: 'Mobile Frontline Capabilities', link: '/en/scenarios/meta/scrm/mobile_frontline_capabilities/' },
                    { text: 'AIGC-driven Automation & Intelligence', link: '/en/scenarios/meta/scrm/aigc_automation_intelligence/' },
                    { text: 'Platform Ecosystem & Extensibility', link: '/en/scenarios/meta/scrm/platform_ecosystem_extensibility/' },
                    { text: 'Compliance, Security & Risk Control', link: '/en/scenarios/meta/scrm/compliance_security_risk_control/' },
                  ]
                },
              ]
            },
            {
              text: 'Dev Usecase List',
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
              text: 'Developer Hub',
              collapsed: false,
              items: [
                { text: 'Overview', link: '/en/developers/' },
                { text: 'Plugin Quickstart', link: '/en/developers/quickstart' },
                { text: 'Plugin Framework & Roadmap', link: '/en/developers/plugin-framework' },
                { text: 'Tooling & Quality Practices', link: '/en/developers/tooling-and-quality' }
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
