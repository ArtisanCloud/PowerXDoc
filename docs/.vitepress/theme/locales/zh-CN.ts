export default {
  home: {
    nav: {
      features: '产品特性',
      products: '产品矩阵',
      about: '关于我们',
      cta: '开始探索',
    },
    hero: {
      welcomePrefix: '欢迎来到',
      highlight: 'PowerX',
      description:
        'PowerX 是一个面向企业级智能体的工程化落地平台，帮助团队构建、部署与治理复杂的 AI 工作流。',
      primaryCta: '查看核心概念',
      secondaryCta: '查看内容管理员指南',
    },
    features: {
      title: '产品特性',
      lead: '连接模型、插件与业务系统，让智能体从探索走向生产。',
      items: [
        {
          icon: '⚡',
          title: '极速部署',
          description: '一键接入智能体运行时，敏捷上线企业级应用。',
        },
        {
          icon: '🎨',
          title: '极致体验',
          description: '以用户为中心的界面设计，打造顺滑的工作流体验。',
        },
        {
          icon: '🔧',
          title: '可视化编排',
          description: '拖拽式流程与动态配置，让复杂业务建模清晰可见。',
        },
        {
          icon: '🛡️',
          title: '安全合规',
          description: '完善的审计与权限体系，保障数据安全与可信治理。',
        },
      ],
    },
    products: {
      title: '产品矩阵',
      lead: '针对不同场景提供端到端的智能体工程化能力。',
      ctaLabel: '查看详情',
      list: [
        {
          name: 'PowerX Admin',
          description: '集中化管理门户，联通企业级插件、模型与数据能力。',
          image: 'https://dummyimage.com/640x360/0f172a/34d399&text=PowerX+Admin',
          features: [
            '多租户与权限管理',
            '可观测的任务编排',
            '数据资产统一治理',
            '实时运行态监控',
          ],
        },
        {
          name: 'PowerX Analytics',
          description: '数据驱动的智能分析套件，让业务洞察一目了然。',
          image: 'https://dummyimage.com/640x360/0f172a/38bdf8&text=PowerX+Analytics',
          features: [
            '实时指标大屏',
            '可视化报表分享',
            'AI 驱动的预测模型',
            '自定义仪表盘',
          ],
        },
        {
          name: 'PowerX Cloud',
          description: '云原生部署底座，提供弹性算力与统一运维通道。',
          image: 'https://dummyimage.com/640x360/0f172a/60a5fa&text=PowerX+Cloud',
          features: [
            '托管模型仓库',
            '跨区域多活集群',
            '弹性扩缩容',
            '7x24 专业支持',
          ],
        },
      ],
    },
    about: {
      title: '关于 PowerX',
      subtitle: '我们致力于将 AI 能力落地到真实业务场景，让每个组织都能拥有属于自己的智能体生态。',
      missionTitle: '我们的使命',
      mission: [
        'PowerX 聚焦智能体从设计、开发、测试到运维的全生命周期，帮助团队用低成本构建可信赖的 AI 服务。',
        '我们通过统一的插件与能力中心，将多模型协作、工具调用与数据流动整合为一致的工作流体验。',
        '面向企业治理与合规需求，我们提供完善的审计、监控以及多层级权限体系，确保业务连续性。',
      ],
      stats: [
        { value: '1000+', label: '服务企业' },
        { value: '50K+', label: '活跃用户' },
        { value: '99.9%', label: '系统可用性' },
      ],
      pillars: [
        {
          title: '企业级实践',
          description: '从权限管理、租户隔离到全链路审计，PowerX 为大型组织提供可控、可扩展的智能体落地能力。',
        },
        {
          title: '持续创新',
          description: '保持开放生态，与社区伙伴共同打造下一代智能体运行时。',
        },
        {
          title: '用户至上',
          description: '围绕用户体验不断迭代产品，让业务团队轻松驾驭 AI 能力。',
        },
        {
          title: '卓越交付',
          description: '覆盖实施、培训与运营的全流程，确保项目价值快速兑现。',
        },
      ],
    },
    finalCta: {
      title: '立即启程，构建下一代智能体平台',
      description: '注册试用或加入社区，了解 PowerX 如何在真实业务场景中驱动 AI 生产力。',
      primary: '立即开始',
      secondary: '查看示例',
    },
  },
} as const
