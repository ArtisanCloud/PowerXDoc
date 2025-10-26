export default {
  home: {
    nav: {
      features: '产品特性',
      products: '产品矩阵',
      about: '关于我们',
      cta: '立即体验',
    },
    hero: {
      welcomePrefix: '企业 AgentOS',
      highlight: 'PowerX',
      description:
        '让企业的每个系统、每个流程、每个智能体都能自由协作。一套可扩展的企业级插件内核，为多智能体时代构建真正开放的数字操作系统。',
      primaryCta: '了解核心能力',
      secondaryCta: '查看快速开始',
    },
    features: {
      title: '四大产品特性',
      lead: '围绕 “AgentOS + 插件生态 + 开放底座”，PowerX 帮助企业快速落地智能体业务。',
      items: [
        {
          icon: '🤝',
          title: '多智能体协作',
          description: '内置智能体与 Flow 引擎，在同一平台 orchestrate 多智能体协同，审批、客服、文档解析、销售触达均可可视化落地。',
        },
        {
          icon: '🧩',
          title: '插件化互通',
          description: '统一运行时与契约层让能力以插件存在，借助 IAM、RBAC、EventBus 实现跨插件身份与事件共享，快速复用业务能力。',
        },
        {
          icon: '🔓',
          title: '开源可扩展',
          description: '完整开源代码、SDK 与文档，支持企业自由改造、集成与定制，从底层服务到前端控制台均遵循开放标准。',
        },
        {
          icon: '🌐',
          title: '开放协议接入',
          description: '兼容 MCP / gRPC / HTTP，连接 OpenAI、Azure、钉钉、飞书等主流平台，构建企业级智能连接层。',
        },
      ],
    },
    products: {
      title: 'PowerX 产品矩阵',
      lead: '一套统一的企业数字化底座 + 插件生态 + 市场体系。',
      ctaLabel: '查看全部方案',
      badges: {
        core: '核心平台',
        free: '免费使用',
        pro: '专业版',
      },
      list: [
        {
          name: 'PowerX Core Base',
          description: '企业级运行时与治理内核，提供多租户、身份、权限、事件、审计、工作流等基础能力。',
          image: 'https://dummyimage.com/640x360/0f172a/34d399&text=PowerX+Core+Base',
          features: [
            'IAM / RBAC 统一治理',
            'EventBus & Flow Engine',
            '全链路审计与合规',
            '多租户隔离与安全策略',
          ],
        },
        {
          name: 'PowerX Plugin Scaffold',
          description: '插件开发脚手架与工具链，帮助团队 30 分钟生成可运行的企业插件。',
          image: 'https://dummyimage.com/640x360/0f172a/38bdf8&text=PowerX+Plugin+Scaffold',
          features: [
            '标准化目录结构',
            '自动注册 manifest',
            '支持 HTTP / gRPC / MCP',
            '一键打包发布 .pxp',
          ],
        },
        {
          name: 'PowerX Plugin Market',
          description: '官方与第三方插件生态中心，统一管理插件上架、授权、安装与升级。',
          image: 'https://dummyimage.com/640x360/0f172a/60a5fa&text=PowerX+Plugin+Market',
          features: [
            '插件审核与安全签名',
            '版本发布与回滚',
            'License 授权与计费',
            '依赖安装自动管理',
          ],
        },
        {
          name: 'PowerX CRM',
          description: '客户、线索、机会与合同一体化管理，内置自动化触达和协同流程。',
          image: 'https://dummyimage.com/640x360/065f46/34d399&text=PowerX+CRM',
          features: [
            '客户档案全景',
            '销售漏斗监控',
            '自动化跟进提醒',
            '免费使用',
          ],
        },
        {
          name: 'PowerX Commerce',
          description: '多店铺商品、库存、订单、结算全链路管理，支持电商场景快速上线。',
          image: 'https://dummyimage.com/640x360/0b5d4a/34d399&text=PowerX+Commerce',
          features: [
            '多渠道商品同步',
            '库存预警与补货',
            '订单履约追踪',
            '免费使用',
          ],
        },
        {
          name: 'PowerX SCRM',
          description: '社交营销、粉丝运营与私域触达一体化，支持多平台联动。',
          image: 'https://dummyimage.com/640x360/0a4f3c/34d399&text=PowerX+SCRM',
          features: [
            '粉丝分层运营',
            '多渠道内容投放',
            '运营数据看板',
            '免费使用',
          ],
        },
        {
          name: 'PowerX SCRUM',
          description: '敏捷协作与项目管理，覆盖需求、任务、迭代、燃尽图等核心能力。',
          image: 'https://dummyimage.com/640x360/7f1d1d/fca5a5&text=PowerX+SCRUM',
          features: [
            '迭代与任务看板',
            '燃尽图与指标监控',
            '团队协作提醒',
            '专业版',
          ],
        },
        {
          name: 'PowerX Wallet',
          description: '企业钱包与交易结算组件，支持多币种、对账与资金归集。',
          image: 'https://dummyimage.com/640x360/7a1a16/fda4af&text=PowerX+Wallet',
          features: [
            '资金流水与对账',
            '结算自动化',
            '风控告警',
            '专业版',
          ],
        },
        {
          name: 'PowerX MediaX',
          description: '媒体资产管理与内容发布中心，统一素材、授权与分发流程。',
          image: 'https://dummyimage.com/640x360/8b1d3f/fda4af&text=PowerX+MediaX',
          features: [
            '素材仓库与标签',
            '版权与授权管理',
            '多渠道分发',
            '专业版',
          ],
        },
      ],
    },
    about: {
      title: '关于 PowerX',
      subtitle: '我们致力于把多智能体能力真正落地到企业场景，让组织像装 App 一样构建数字化系统。',
      missionTitle: '我们的使命',
      mission: [
        '打造面向企业的 AgentOS 底座，覆盖智能体从设计、开发、测试到运维的全生命周期。',
        '通过统一的插件与能力中心，让多模型协作、工具调用与数据流动形成一致的工作流体验。',
        '提供完备的审计、监控与权限体系，确保在合规前提下快速验证商业价值。',
      ],
      stats: [
        { value: '1000+', label: '服务企业' },
        { value: '50K+', label: '活跃用户' },
        { value: '99.9%', label: '系统可用性' },
      ],
      pillars: [
        {
          title: '企业级实践',
          description: '权限管理、租户隔离、全链路审计一应俱全，为大型组织提供可控、可扩展的智能体底座。',
        },
        {
          title: '持续创新',
          description: '保持开放生态，与社区伙伴共创下一代多智能体运行时。',
        },
        {
          title: '用户至上',
          description: '围绕使用者体验不断迭代产品，让业务团队真正驾驭 AI 能力。',
        },
        {
          title: '卓越交付',
          description: '覆盖实施、培训与运营的全流程服务，帮助企业快速获得可衡量的成果。',
        },
      ],
    },
    finalCta: {
      title: '立即启程，构建下一代智能体平台',
      description: '加入 PowerX 社区或预约体验，了解企业如何基于 PowerX 落地多智能体业务。',
      primary: '预约演示',
      secondary: '阅读更多案例',
    },
  },
} as const
