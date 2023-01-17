const nav = [
    {
        text: '产品设计 PRD',
        link: '/zh/prd/start/index',
        activeMatch: `^/zh/(prd)/`
    },
    {
        text: '产品使用手册',
        link: '/zh/manual/start/index',
        // activeMatch: `^\/zh\/(start)\/(?!qa)`
        activeMatch: `^/zh/(manual)/(start)/`
    },
    {
        text: '联系我们',
        link: '/zh/contact/qa'
    }
]

export const sidebar = {
    '/zh/manual': [{
        text: '开始',
        items: [
            {text: '概述', link: '/zh/manual/start/index'},
            {text: '安装', link: '/zh/manual/start/installation'},
            {text: '安装配置', link: '/zh/manual/start/common'},
            {text: '快速开始', link: '/zh/manual/start/quick-start'},
            {text: 'Q&A', link: '/zh/manual/start/qa'}
        ]
    }, {
        text: 'SCRM基础功能',
        items: [
            {text: '入门', link: '/zh/manual/scrm/index'},
            {text: '渠道活码', link: '/zh/manual/scrm/contact-way'},
            {text: '客户群发', link: '/zh/manual/scrm/send-group-message'},
            {text: '客户群群发', link: '/zh/manual/scrm/send-group-chat-message'},
            {text: '客户管理', link: '/zh/manual/scrm/customer'},
            {text: '客户标签', link: '/zh/manual/scrm/customer-tag'},
            {text: '客户迁移', link: '/zh/manual/scrm/customer-migrate'},
            {text: '标签治理', link: '/zh/manual/scrm/tag'},
            {text: '客户群列表', link: '/zh/manual/scrm/customer-group-list'},
            {text: '客户群标签', link: '/zh/manual/scrm/customer-group-tag'},
            {text: '员工管理', link: '/zh/manual/scrm/setting-employee'},
            {text: '权限管理', link: '/zh/manual/scrm/setting-permission'},
            {text: '菜单配置', link: '/zh/manual/scrm/setting-menu'}
        ]
    }
    ],
    '/zh/prd/': [{
        text: '前言',
        items: [
            {text: '写作初衷', link: '/zh/prd/forward/intention'},
            {text: '背后故事', link: '/zh/prd/forward/story'}
        ]
    }, {
        text: 'SCRM',
        collapsible: true,
        collapsed: true,
        items: [
            {
                text: '营销获客',
                collapsible: true,
                collapsed: true,
                // link: '/zh/prd/scrm/user'
                items: [
                    {text: '活码', link: '/zh/prd/scrm/user'},
                ]
            },
            {text: '员工管理', link: '/zh/prd/scrm/user'},
            {text: '客户管理', link: '/zh/prd/scrm/externalContact'},
            {text: '客户群管理', link: '/zh/prd/scrm/user'},
            {text: '数据统计', link: '/zh/prd/scrm/user'},
            {text: '配置中心', link: '/zh/prd/scrm/user'}
        ]
    }, {
        text: '销售',
        collapsible: true,
        items: [
            {text: '产品', link: '/zh/prd/sales/product'},
            {text: '渠道', link: '/zh/prd/sales/channel'},
            {text: '价格', link: '/zh/prd/sales/price'},
            {text: '线索', link: '/zh/prd/sales/lead'},
            {text: '联系人', link: '/zh/prd/sales/contact'},
            {text: '客户', link: '/zh/prd/sales/account'},
            {text: '商机', link: '/zh/prd/sales/opportunity'},
            {text: '报价', link: '/zh/prd/sales/quotation'},
            {text: '合同', link: '/zh/prd/sales/contract'},
            {text: '订单', link: '/zh/prd/sales/order'},
            {text: '支付', link: '/zh/prd/sales/payment'}
        ]
    }, {
        text: '配置中心',
        collapsible: true,
        items: [
            {text: '组织架构', link: '/zh/prd/setting/organization'},
            {text: '权限管理', link: '/zh/prd/setting/authority'},
            {text: '操作日志', link: '/zh/prd/setting/log'},
            {text: '充值中心', link: '/zh/prd/setting/charge'},
        ]
    }
    ]
}

export default {
    themeConfig: {
        logo: "/images/logo-small.png",
        siteTitle: "PowerX",

        nav: nav,
        sidebar: sidebar,

        algolia: {
            indexName: 'powerx',
            appId: 'WWQJSAUFP5',
            apiKey: '970f2d4ae17f79ae0d27d842c330474f',
            searchParameters: {
                facetFilters: ['lang:manual-CN']
            }
        },

        socialLinks: [
            // { icon: 'languages', link: '/translations/' },
            {icon: 'github', link: 'https://github.com/ArtisanCloud/PowerX'}
        ],
        editLink: {
            repo: 'ArtisanCloud/PowerXDocs#master',
            text: 'Edit this page on GitHub'
        },

        footer: {
            message: 'Released under the Apache-2.0 license',
            copyright: `Copyright © 2021-${new Date().getFullYear()} ArtisanCloud`
        }
    },
    title: 'PowerXDoc',
    description: 'PowerX Documentation',


}