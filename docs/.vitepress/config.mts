import { defineConfig } from 'vitepress'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const powerXAdminDir = path.resolve(__dirname, '../../PowerXAdmin')

// ---------------- helpers: filesystem -> sidebar ----------------
const WEBSITE_ROOT = path.resolve(__dirname, '../website')

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

// /scenarios/ : 从 website/scenarios 下的 md 自动生成
function buildScenariosSidebar(localePrefix = '') {
  const dir = path.join(WEBSITE_ROOT, localePrefix ? localePrefix.slice(1) : '', 'scenarios')
  const files = safeLs(dir).filter(f => f.endsWith('.md')).sort()
  return files.map(f => ({
    text: readTitleFromMd(path.join(dir, f)),
    link: `${localePrefix}/scenarios/` + f.replace(/\.md$/, '')
  }))
}

// /library/ : 从 website/_collected 下按 px/mkp/plg/admin → layer → domain 分组
function buildLibrarySidebar(localePrefix = '') {
  const root = path.join(WEBSITE_ROOT, localePrefix ? localePrefix.slice(1) : '', '_collected')
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
          text: readTitleFromMd(abs),
          link:
            '/' +
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

// 一个“用例库”着陆页（可在 website/library.md 与 website/en/library.md 放简单介绍）
function libraryLanding(localePrefix = '') {
  return [{ text: '用例库 / Library', link: `${localePrefix}/library/` }]
}

// ---------------- site config ----------------
export default defineConfig({
  title: 'PowerX Documentation',
  description: 'A website to introduce PowerX',
  srcDir: 'website',
  publicDir: path.resolve(__dirname, '../website/public'),

  locales: {
    // ----- zh-CN -----
    root: {
      label: '简体中文',
      lang: 'zh-CN',
      themeConfig: {
        nav: [
          { text: '首页', link: '/' },
          { text: '场景用例', link: '/scenarios/' },
          { text: '用例库', link: '/library/' },
          { text: '文档', link: '/core-concepts/' }
        ],
        // 根据路由前缀切换不同侧边栏（静态文档沿用你原有分组）
        sidebar: {
          // 场景用例（自动）
          '/scenarios/': buildScenariosSidebar(''),
          // 用例库（自动）
          '/library/': buildLibrarySidebar(''),
          // 你的现有静态文档分组
          '/core-concepts/': [
            {
              text: '核心概念',
              items: [
                { text: '介绍', link: '/core-concepts/README.md' },
                { text: '集成架构', link: '/core-concepts/PowerX_Integration_Architecture.md' },
                { text: '知识库', link: '/core-concepts/00_overview.md' },
                { text: '智能体生命周期', link: '/core-concepts/Agent_Manager_and_Lifecycle_Spec.md' }
              ]
            }
          ],
          '/guides/': [
            {
              text: '开发者指南',
              items: [
                { text: '介绍', link: '/guides/README.md' },
                { text: '插件 SDK 指南', link: '/guides/PowerX_Plugin_SDK_Guide.md' },
                { text: '插件运行时指南', link: '/guides/Plugin_Runtime_Guide.md' },
                { text: '插件测试与调试', link: '/guides/Plugin_Test_and_Debug_Guide.md' },
                { text: '智能体开发指南', link: '/guides/Agent_Developer_Guide.md' }
              ]
            }
          ],
          '/api-and-specifications/': [
            { text: 'API 与规范', items: [{ text: '介绍', link: '/api-and-specifications/README.md' }] }
          ],
          '/security-and-governance/': [
            { text: '安全与治理', items: [{ text: '介绍', link: '/security-and-governance/README.md' }] }
          ],
          '/pxip/': [
            {
              text: 'PXIP',
              items: [
                { text: '介绍', link: '/pxip/README.md' },
                { text: 'PXIP-001', link: '/pxip/PXIP-001_Unified_Capability_and_Transport_Proposal.md' }
              ]
            }
          ],
          // 用例库着陆页侧边栏（简单一项，避免为空）
          '/library': libraryLanding('')
        },
        footer: { message: '基于 Apache 2.0 许可发布' },
        editLink: { text: '在 GitHub 上编辑此页' }
      }
    },

    // ----- en-US -----
    en: {
      label: 'English',
      lang: 'en-US',
      themeConfig: {
        nav: [
          { text: 'Home', link: '/en/' },
          { text: 'Scenarios', link: '/en/scenarios/' },
          { text: 'Library', link: '/en/library/' },
          { text: 'Docs', link: '/en/core-concepts/' }
        ],
        sidebar: {
          // Scenarios (auto)
          '/en/scenarios/': buildScenariosSidebar('/en'),
          // Library (auto)
          '/en/library/': buildLibrarySidebar('/en'),
          // Your static groups (EN)
          '/en/core-concepts/': [
            {
              text: 'Core Concepts',
              items: [
                { text: 'Overview', link: '/en/core-concepts/README.md' },
                { text: 'Integration Architecture', link: '/en/core-concepts/PowerX_Integration_Architecture.md' },
                { text: 'Knowledge Base', link: '/en/core-concepts/00_overview.md' },
                { text: 'Agent Lifecycle', link: '/en/core-concepts/Agent_Manager_and_Lifecycle_Spec.md' }
              ]
            }
          ],
          '/en/guides/': [
            {
              text: 'Developer Guides',
              items: [
                { text: 'Overview', link: '/en/guides/README.md' },
                { text: 'Plugin SDK Guide', link: '/en/guides/PowerX_Plugin_SDK_Guide.md' },
                { text: 'Runtime Guide', link: '/en/guides/Plugin_Runtime_Guide.md' },
                { text: 'Testing & Debugging', link: '/en/guides/Plugin_Test_and_Debug_Guide.md' },
                { text: 'Agent Developer Guide', link: '/en/guides/Agent_Developer_Guide.md' }
              ]
            }
          ],
          '/en/api-and-specifications/': [
            { text: 'API & Specifications', items: [{ text: 'Overview', link: '/en/api-and-specifications/README.md' }] }
          ],
          '/en/security-and-governance/': [
            { text: 'Security & Governance', items: [{ text: 'Overview', link: '/en/security-and-governance/README.md' }] }
          ],
          '/en/pxip/': [
            {
              text: 'PXIP',
              items: [
                { text: 'Overview', link: '/en/pxip/README.md' },
                { text: 'PXIP-001', link: '/en/pxip/PXIP-001_Unified_Capability_and_Transport_Proposal.md' }
              ]
            }
          ],
          '/en/library': libraryLanding('/en')
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
      fs: { allow: [powerXAdminDir] }
    }
  }
})
