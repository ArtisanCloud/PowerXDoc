import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "PowerX Documentation",
  description: "A website to introduce PowerX",

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

    socialLinks: [
      { icon: 'github', link: 'https://github.com/ArtisanCloud/PowerX' }
    ],

    footer: { message: '基于 MIT 许可发布' },

    editLink: { text: '在 GitHub 上编辑此页' }
  }
})
