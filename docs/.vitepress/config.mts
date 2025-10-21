import { defineConfig } from 'vitepress'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const powerXAdminDir = path.resolve(__dirname, '../../PowerXAdmin')

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "PowerX Documentation",
  description: "A website to introduce PowerX",
  srcDir: 'website',
  publicDir: path.resolve(__dirname, '../website/public'),
  locales: {
    root: {
      label: '简体中文',
      lang: 'zh-CN',
      themeConfig: {
        nav: [
          { text: '首页', link: '/' },
          { text: '文档', link: '/core-concepts/' }
        ],
        sidebar: [
          {
            text: '核心概念',
            items: [
              { text: '介绍', link: '/core-concepts/README.md' },
              { text: '集成架构', link: '/core-concepts/PowerX_Integration_Architecture.md' },
              { text: '知识库', link: '/core-concepts/00_overview.md' },
              { text: '智能体生命周期', link: '/core-concepts/Agent_Manager_and_Lifecycle_Spec.md' }
            ]
          },
          {
            text: '开发者指南',
            items: [
              { text: '介绍', link: '/developer-guides/README.md' },
              { text: '插件 SDK 指南', link: '/developer-guides/PowerX_Plugin_SDK_Guide.md' },
              { text: '插件运行时指南', link: '/developer-guides/Plugin_Runtime_Guide.md' },
              { text: '插件测试与调试', link: '/developer-guides/Plugin_Test_and_Debug_Guide.md' },
              { text: '智能体开发指南', link: '/developer-guides/Agent_Developer_Guide.md' }
            ]
          },
          {
            text: 'API 与规范',
            items: [
              { text: '介绍', link: '/api-and-specifications/README.md' }
            ]
          },
          {
            text: '安全与治理',
            items: [
              { text: '介绍', link: '/security-and-governance/README.md' }
            ]
          },
          {
            text: 'PXIP',
            items: [
              { text: '介绍', link: '/pxip/README.md' },
              { text: 'PXIP-001', link: '/pxip/PXIP-001_Unified_Capability_and_Transport_Proposal.md' }
            ]
          }
        ],
        footer: { message: '基于 Apache 2.0 许可发布' },
        editLink: { text: '在 GitHub 上编辑此页' }
      }
    },
    en: {
      label: 'English',
      lang: 'en-US',
      themeConfig: {
        nav: [
          { text: 'Home', link: '/en/' },
          { text: 'Docs', link: '/en/core-concepts/' }
        ],
        sidebar: [
          {
            text: 'Core Concepts',
            items: [
              { text: 'Overview', link: '/en/core-concepts/README.md' },
              { text: 'Integration Architecture', link: '/en/core-concepts/PowerX_Integration_Architecture.md' },
              { text: 'Knowledge Base', link: '/en/core-concepts/00_overview.md' },
              { text: 'Agent Lifecycle', link: '/en/core-concepts/Agent_Manager_and_Lifecycle_Spec.md' }
            ]
          },
          {
            text: 'Developer Guides',
            items: [
              { text: 'Overview', link: '/en/developer-guides/README.md' },
              { text: 'Plugin SDK Guide', link: '/en/developer-guides/PowerX_Plugin_SDK_Guide.md' },
              { text: 'Runtime Guide', link: '/en/developer-guides/Plugin_Runtime_Guide.md' },
              { text: 'Testing & Debugging', link: '/en/developer-guides/Plugin_Test_and_Debug_Guide.md' },
              { text: 'Agent Developer Guide', link: '/en/developer-guides/Agent_Developer_Guide.md' }
            ]
          },
          {
            text: 'API & Specifications',
            items: [
              { text: 'Overview', link: '/en/api-and-specifications/README.md' }
            ]
          },
          {
            text: 'Security & Governance',
            items: [
              { text: 'Overview', link: '/en/security-and-governance/README.md' }
            ]
          },
          {
            text: 'PXIP',
            items: [
              { text: 'Overview', link: '/en/pxip/README.md' },
              { text: 'PXIP-001', link: '/en/pxip/PXIP-001_Unified_Capability_and_Transport_Proposal.md' }
            ]
          }
        ],
        footer: { message: 'Released under the Apache 2.0 License.' },
        editLink: { text: 'Edit this page on GitHub' }
      }
    }
  },
  themeConfig: {
    logo: {
      light: '/images/logo-s.png',
      dark: '/images/logo-s.png',
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/ArtisanCloud/PowerX' }
    ]
  },
  vite: {
    server: {
      fs: {
        allow: [powerXAdminDir],
      },
    },
  },
})
