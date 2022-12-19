import fs from 'fs'
import path from 'path'
import { defineConfigWithTheme } from 'vitepress'
// import {googleAnalyticsPlugin} from '@vuepress/plugin-google-analytics'
import type { Config as ThemeConfig } from '@vue/theme'
import baseConfig from '@vue/theme/config'
import { headerPlugin } from './headerMdPlugin'

const nav = [
  {
    text: '快速开始',
    link: '/zh/start/index',
    activeMatch: `^\/zh\/(start)\/(?!qa)`
  },
  {
    text: '基础模块',
    link: '/zh/scrm/index',
    activeMatch: `^/zh/(scrm)/`
  },
  {
    text: '联系我们',
    link: '/zh/start/qa'
  }
]

export const sidebar = {
  '/zh/': [{
    text: '开始',
    items: [
      { text: '概述', link: '/zh/start/index' },
      { text: '安装', link: '/zh/start/installation' },
      { text: '安装配置', link: '/zh/start/common' },
      { text: '快速开始', link: '/zh/start/quick-start' },
      // { text: '使用示例', link: '/zh/start/tutorial' },
      { text: 'Q&A', link: '/zh/start/qa' }
    ]
  }, {
    text: 'SCRM基础功能',
    items: [
      { text: '入门', link: '/zh/scrm/index' },
      { text: '渠道活码', link: '/zh/scrm/contact-way' },
      { text: '客户群发', link: '/zh/scrm/send-group-message' },
      { text: '客户群群发', link: '/zh/scrm/send-group-chat-message' },
      { text: '客户管理', link: '/zh/scrm/customer' },
      { text: '客户标签', link: '/zh/scrm/customer-tag' },
      { text: '客户迁移', link: '/zh/scrm/customer-migrate' },
      { text: '标签治理', link: '/zh/scrm/tag' },
      { text: '客户群列表', link: '/zh/scrm/customer-group-list' },
      { text: '客户群标签', link: '/zh/scrm/customer-group-tag' },
      { text: '员工管理', link: '/zh/scrm/setting-employee' },
      { text: '权限管理', link: '/zh/scrm/setting-permission' },
      { text: '菜单配置', link: '/zh/scrm/setting-menu' },
    ]
  }
  ]
}

export default defineConfigWithTheme<ThemeConfig>({
  extends: baseConfig,

  lang: 'zh-CN',
  title: 'PowerX',
  description: 'PowerX是一款基于微信生态的业务系统 for Golang。目前已经支持微信公众号、微信小程序、微信支付、企业微信等',
  srcDir: 'src',
  srcExclude: ['tutorial/**/description.md'],
  scrollOffset: 'header',

  head: [
    // ['meta', { name: 'twitter:site', content: '@vuejs' }],
    // ['meta', { name: 'twitter:card', content: 'summary' }],
    // [
    //   'meta',
    //   {
    //     name: 'twitter:image',
    //     content: 'https://vuejs.org/images/logo.png'
    //   }
    // ],
    // [
    //   'link',
    //   {
    //     rel: 'preconnect',
    //     href: 'https://sponsors.vuejs.org'
    //   }
    // ],
    [
      'script',
      {},
      fs.readFileSync(
        path.resolve(__dirname, './inlined-scripts/restorePreference.js'),
        'utf-8'
      )
    ],
    [
      'script',
      { async: 'true', src: 'https://www.googletagmanager.com/gtag/js?id=G-GPRCVYSQSG' }
    ],
    [
      'script',
      {},
      'window.dataLayer = window.dataLayer || [];\nfunction gtag(){dataLayer.push(arguments);}\ngtag(\'js\', new Date());\ngtag(\'config\', \'G-GPRCVYSQSG\');'
    ]
    // [
    //   'script',
    //   {
    //     src: 'https://cdn.usefathom.com/script.js',
    //     'data-site': 'XNOLWPLB',
    //     'data-spa': 'auto',
    //     defer: ''
    //   }
    // ]
  ],

  themeConfig: {
    nav,
    sidebar,

    algolia: {
      indexName: 'powerx',
      appId: 'WWQJSAUFP5',
      apiKey: '970f2d4ae17f79ae0d27d842c330474f',
      searchParameters: {
        facetFilters: ['lang:zh-CN']
      }
    },

    // carbonAds: {
    //   code: 'CEBDT27Y',
    //   placement: 'vuejsorg'
    // },

    socialLinks: [
      // { icon: 'languages', link: '/translations/' },
      { icon: 'github', link: 'https://github.com/ArtisanCloud/PowerX' }
    ],

    editLink: {
      repo: 'ArtisanCloud/PowerXDocs#master',
      text: 'Edit this page on GitHub'
    },

    footer: {
      license: {
        text: 'MIT License',
        link: 'https://opensource.org/licenses/MIT'
      },
      copyright: `Copyright © 2021-${new Date().getFullYear()} ArtisanCloud`
    }
  },

  markdown: {
    config(md) {
      md.use(headerPlugin)
    }
  },

  vite: {
    define: {
      __VUE_OPTIONS_API__: false
    },
    optimizeDeps: {
      include: ['gsap', 'dynamics.js'],
      exclude: ['@vue/repl']
    },
    // @ts-ignore
    ssr: {
      external: ['@vue/repl']
    },
    server: {
      host: true,
      fs: {
        // for when developing with locally linked theme
        allow: ['../..']
      }
    },
    build: {
      minify: 'terser',
      chunkSizeWarningLimit: Infinity
    },
    json: {
      stringify: true
    }
  },

  vue: {
    reactivityTransform: true
  },

  plugins: [
    // googleAnalyticsPlugin({
    //   id: 'G-GPRCVYSQSG',
    // }),
  ]
})
