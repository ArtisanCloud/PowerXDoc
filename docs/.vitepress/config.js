const version = 'v1'
const baseURI = '/zh/' + version

const nav = [
    {
        text: '业务设计',
        link: baseURI + '/product/start/index',
        activeMatch: '^/zh/' + version + '/(product)/'
    },
    {
        text: '使用手册',
        link: baseURI + '/manual/start/index',
        // activeMatch: `^\/zh\/(start)\/(?!qa)`
        activeMatch: '^' + baseURI + '/(manual)/(start)/'
    },
    {
        text: '联系我们',
        link: baseURI + '/contact/qa'
    },
    {
        text: 'test',
        items: [
            {text: 'v1', link: '/bs/v1/zh'},
            {text: 'v2', link: '/bs/v2/zh'},
        ]
    }
]


export const sidebar = {
    '/zh/v1/manual': [{
        text: '开始',
        items: [
            {text: '概述', link: baseURI + '/manual/start/index'},
            {text: '安装', link: baseURI + '/manual/start/installation'},
            {text: '安装配置', link: baseURI + '/manual/start/common'},
            {text: '快速开始', link: baseURI + '/manual/start/quick-start'},
            {text: 'Q&A', link: baseURI + '/manual/start/qa'}
        ]
    }, {
        text: 'SCRM基础功能',
        items: [
            {text: '入门', link: baseURI + '/manual/scrm/index'},
            {text: '渠道活码', link: baseURI + '/manual/scrm/contact-way'},
            {text: '客户群发', link: baseURI + '/manual/scrm/send-group-message'},
            {text: '客户群群发', link: baseURI + '/manual/scrm/send-group-chat-message'},
            {text: '客户管理', link: baseURI + '/manual/scrm/customer'},
            {text: '客户标签', link: baseURI + '/manual/scrm/customer-tag'},
            {text: '客户迁移', link: baseURI + '/manual/scrm/customer-migrate'},
            {text: '标签治理', link: baseURI + '/manual/scrm/tag'},
            {text: '客户群列表', link: baseURI + '/manual/scrm/customer-group-list'},
            {text: '客户群标签', link: baseURI + '/manual/scrm/customer-group-tag'},
            {text: '员工管理', link: baseURI + '/manual/scrm/setting-employee'},
            {text: '权限管理', link: baseURI + '/manual/scrm/setting-permission'},
            {text: '菜单配置', link: baseURI + '/manual/scrm/setting-menu'}
        ]
    }
    ],
    '/zh/v1/product': [{
        text: '前言',
        items: [
            {text: '写作初衷', link: baseURI + '/product/forward/intention'},
            {text: '背后故事', link: baseURI + '/product/forward/story'}
        ]
    }, {
        text: '战略规划',
        collapsible: true,
        collapsed: true,

        items: [
            {text: '战略概述', link: baseURI + '/product/strategy/overview'},
            {
                text: '战略设计',
                link: baseURI + '/product/strategy/design',
                items: [
                    {
                        text: '通用分析模型',
                        link: baseURI + '/product/strategy/design/general',
                        items: [
                            {text: 'SWOT分析', link: baseURI + '/product/strategy/design/general/swot'},
                            {text: 'PEST分析', link: baseURI + '/product/strategy/design/general/pest'},
                        ]
                    },
                    {
                        text: '竞争性角度模型',
                        link: baseURI + '/product/strategy/design/competitor',
                        items: [
                            {
                                text: '波特五力模型',
                                link: baseURI + '/product/strategy/design/competitor/porter'
                            },
                            {
                                text: '波特钻石模型',
                                link: baseURI + '/product/strategy/design/competitor/porter-diamond'
                            },
                        ]
                    },
                    {
                        text: '差异性角度模型',
                        link: baseURI + '/product/strategy/design/differentiation',
                        items: [
                            {
                                text: '蓝海战略',
                                link: baseURI + '/product/strategy/design/differentiation/blue-ocean'
                            },
                        ]
                    },
                    {text: '破坏性创新模型', link: baseURI + '/product/strategy/design/destructive'},
                ]
            },
            {
                text: '目标设定',
                link: baseURI + '/product/strategy/target',
                items: [
                    {text: '收获', link: baseURI + '/product/strategy/target/income'},
                    {text: '支出', link: baseURI + '/product/strategy/target/cost'},
                    {text: '风险', link: baseURI + '/product/strategy/target/risk'},
                ]
            },
            {text: '机会的评估模型', link: baseURI + '/product/strategy/opportunity'},
            {text: '战略实施', link: baseURI + '/product/strategy/implement'},
        ]
    }, {
        text: '解决方案',
        collapsible: true,
        collapsed: false,
        items: [
            {text: '方案概述', link: baseURI + '/product/solution/overview'},
            {text: '梳理涉众', link: baseURI + '/product/solution/stakeholder'},
            {
                text: '涉众期望',
                link: baseURI + '/product/solution/expectation',
                items: [
                    {text: '工作职责简表', link: baseURI + '/product/solution/expectation/list'},
                    {text: '工作职责详情', link: baseURI + '/product/solution/expectation/detail'},
                    {text: '期望调查表', link: baseURI + '/product/solution/expectation/requirement'},
                    {text: '期望的差异', link: baseURI + '/product/solution/expectation/difference'},
                ]
            },
            {
                text: '产品价值',
                link: baseURI + '/product/solution/product-value',
                items: [
                    {text: '提升人效', link: baseURI + '/product/solution/product-value/enhance-effect'},
                    {text: '降低成本', link: baseURI + '/product/solution/product-value/reduce-cost'},
                    {text: '改善服务', link: baseURI + '/product/solution/product-value/improve-service'},
                    {text: '减少差错', link: baseURI + '/product/solution/product-value/reduce-error'},
                    {text: '提升业绩', link: baseURI + '/product/solution/product-value/improve-performance'},
                ]

            },
            {text: '价值方案', link: baseURI + '/product/solution/value-solution'},
            {text: '需求排期', link: baseURI + '/product/solution/requirement-schedule'},
        ]
    },
        {
            text: '产品设计',
            collapsible: true,
            items: [
                {
                    text: '用例',
                    items: [
                        {text: '介绍', link: baseURI + '/product/scrm/user'}
                    ]
                },
                {
                    text: 'PRD',
                    items: [
                        {text: '介绍', link: baseURI + '/product/scrm/user'}
                    ]
                },

            ]
        }, {
            text: '产品管理',
            collapsible: true,
            items: [
                {text: '需求管理', link: baseURI + '/product/scrm/user'},
                {text: '目标管理', link: baseURI + '/product/scrm/user'},
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