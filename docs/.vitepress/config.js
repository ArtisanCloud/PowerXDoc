const version = 'v1'

const nav = [
    {
        text: '业务设计',
        link: '/zh/' + version + '/product/start/index',
        activeMatch: '^/zh/' + version + '/(product)/'
    },
    {
        text: '使用手册',
        link: '/zh/' + version + '/manual/start/index',
        // activeMatch: `^\/zh\/(start)\/(?!qa)`
        activeMatch: '^/zh/' + version + '/(manual)/(start)/'
    },
    {
        text: '联系我们',
        link: '/zh/' + version + '/contact/qa'
    }
]


export const sidebar = {
    '/zh/v1/manual': [{
        text: '开始',
        items: [
            {text: '概述', link: '/zh/' + version + '/manual/start/index'},
            {text: '安装', link: '/zh/' + version + '/manual/start/installation'},
            {text: '安装配置', link: '/zh/' + version + '/manual/start/common'},
            {text: '快速开始', link: '/zh/' + version + '/manual/start/quick-start'},
            {text: 'Q&A', link: '/zh/' + version + '/manual/start/qa'}
        ]
    }, {
        text: 'SCRM基础功能',
        items: [
            {text: '入门', link: '/zh/' + version + '/manual/scrm/index'},
            {text: '渠道活码', link: '/zh/' + version + '/manual/scrm/contact-way'},
            {text: '客户群发', link: '/zh/' + version + '/manual/scrm/send-group-message'},
            {text: '客户群群发', link: '/zh/' + version + '/manual/scrm/send-group-chat-message'},
            {text: '客户管理', link: '/zh/' + version + '/manual/scrm/customer'},
            {text: '客户标签', link: '/zh/' + version + '/manual/scrm/customer-tag'},
            {text: '客户迁移', link: '/zh/' + version + '/manual/scrm/customer-migrate'},
            {text: '标签治理', link: '/zh/' + version + '/manual/scrm/tag'},
            {text: '客户群列表', link: '/zh/' + version + '/manual/scrm/customer-group-list'},
            {text: '客户群标签', link: '/zh/' + version + '/manual/scrm/customer-group-tag'},
            {text: '员工管理', link: '/zh/' + version + '/manual/scrm/setting-employee'},
            {text: '权限管理', link: '/zh/' + version + '/manual/scrm/setting-permission'},
            {text: '菜单配置', link: '/zh/' + version + '/manual/scrm/setting-menu'}
        ]
    }
    ],
    '/zh/v1/product': [{
        text: '前言',
        items: [
            {text: '写作初衷', link: '/zh/' + version + '/product/forward/intention'},
            {text: '背后故事', link: '/zh/' + version + '/product/forward/story'}
        ]
    }, {
        text: '战略规划',
        collapsible: true,
        collapsed: true,

        items: [
            {text: '战略概述', link: '/zh/' + version + '/product/strategy/overview'},
            {
                text: '战略设计',
                link: '/zh/' + version + '/product/strategy/design',
                items: [
                    {
                        text: '通用分析模型',
                        link: '/zh/' + version + '/product/strategy/design/general',
                        items: [
                            {text: 'SWOT分析', link: '/zh/' + version + '/product/strategy/design/general/swot'},
                            {text: 'PEST分析', link: '/zh/' + version + '/product/strategy/design/general/pest'},
                        ]
                    },
                    {
                        text: '竞争性角度模型',
                        link: '/zh/' + version + '/product/strategy/design/competitor',
                        items: [
                            {
                                text: '波特五力模型',
                                link: '/zh/' + version + '/product/strategy/design/competitor/porter'
                            },
                            {
                                text: '波特钻石模型',
                                link: '/zh/' + version + '/product/strategy/design/competitor/porter-diamond'
                            },
                        ]
                    },
                    {
                        text: '差异性角度模型',
                        link: '/zh/' + version + '/product/strategy/design/differentiation',
                        items: [
                            {
                                text: '蓝海战略',
                                link: '/zh/' + version + '/product/strategy/design/differentiation/blue-ocean'
                            },
                        ]
                    },
                    {text: '破坏性创新模型', link: '/zh/' + version + '/product/strategy/design/destructive'},
                ]
            },
            {
                text: '目标设定',
                link: '/zh/' + version + '/product/strategy/target',
                items: [
                    {text: '收获', link: '/zh/' + version + '/product/strategy/target/income'},
                    {text: '支出', link: '/zh/' + version + '/product/strategy/target/cost'},
                    {text: '风险', link: '/zh/' + version + '/product/strategy/target/risk'},
                ]
            },
            {text: '机会的评估模型', link: '/zh/' + version + '/product/strategy/opportunity'},
            {text: '战略实施', link: '/zh/' + version + '/product/strategy/implement'},
        ]
    }, {
        text: '解决方案',
        collapsible: true,
        items: [
            {text: '方案概述', link: '/zh/' + version + '/product/solution/overview'},
            {text: '梳理涉众', link: '/zh/' + version + '/product/solution/stakeholder'},
            {text: '涉众期望', link: '/zh/' + version + '/product/solution/expectation'},
            {text: '产品价值', link: '/zh/' + version + '/product/solution/product-value'},
            {text: '价值方案', link: '/zh/' + version + '/product/solution/value-solution'},
            {text: '需求排期', link: '/zh/' + version + '/product/solution/requirement-schedule'},
        ]
    },
        {
            text: '产品设计',
            collapsible: true,
            items: [
                {
                    text: '用例',
                    items: [
                        {text: '介绍', link: '/zh/' + version + '/product/scrm/user'}
                    ]
                },
                {
                    text: 'PRD',
                    items: [
                        {text: '介绍', link: '/zh/' + version + '/product/scrm/user'}
                    ]
                },

            ]
        }, {
            text: '产品管理',
            collapsible: true,
            items: [
                {text: '需求管理', link: '/zh/' + version + '/product/scrm/user'},
                {text: '目标管理', link: '/zh/' + version + '/product/scrm/user'},
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