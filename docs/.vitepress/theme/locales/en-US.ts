export default {
  home: {
    nav: {
      features: 'Features',
      products: 'Product Matrix',
      about: 'About',
      cta: 'Experience Now',
    },
    hero: {
      welcomePrefix: 'Enterprise AgentOS',
      highlight: 'PowerX',
      description:
        'Give every system, every workflow, and every agent the freedom to collaborate. An extensible enterprise plugin core built for the multi-agent era.',
      primaryCta: 'Explore Core Capabilities',
      secondaryCta: 'View Quick Start',
    },
    preview: {
      title: 'PowerX Home Preview',
      description: 'Preview the landing page in your current locale to verify layout and messaging at a glance.',
    },
    marketPreview: {
      title: 'PowerX Marketplace Preview',
      description: 'See how the plugin marketplace landing looks per locale so you can validate navigation and storefront entry points quickly.',
    },
    features: {
      title: 'Four Pillars of PowerX',
      lead: 'AgentOS + plugin ecosystem + open foundation: the blueprint for enterprise-grade agents.',
      items: [
        {
          icon: '🤝',
          title: 'Multi-Agent Collaboration',
          description: 'Native agents and the flow engine orchestrate complex scenarios—approvals, service automation, document analysis, and outreach—through visual, configurable flows.',
        },
        {
          icon: '🧩',
          title: 'Plugin-First Runtime',
          description: 'A unified runtime and contract layer lets every capability ship as a plugin. IAM, RBAC, EventBus, and Flow share identity and events across plugins for rapid reuse.',
        },
        {
          icon: '🔓',
          title: 'Open & Extensible',
          description: 'Full source, SDKs, and documentation empower teams to adapt, integrate, and customize—from backend services to the admin console.',
        },
        {
          icon: '🌐',
          title: 'Open Protocol Connectivity',
          description: 'Native MCP, gRPC, and HTTP support connects OpenAI, Azure, DingTalk, Feishu, and more—delivering an enterprise-grade intelligent connectivity layer.',
        },
      ],
    },
    products: {
      title: 'PowerX Product Matrix',
      lead: 'A unified foundation spanning core runtime, plugin development, marketplace, and ready-to-use apps.',
      ctaLabel: 'View all offerings',
      badges: {
        core: 'Core suite',
        free: 'Free tier',
        pro: 'Professional tier',
      },
      list: [
        {
          name: 'PowerX Core Base',
          description: 'The enterprise runtime and governance kernel delivering multi-tenant, identity, permission, event, audit, and workflow capabilities.',
          image: 'https://dummyimage.com/640x360/0f172a/34d399&text=PowerX+Core+Base',
          features: [
            'Unified IAM / RBAC',
            'EventBus & Flow Engine',
            'End-to-end auditing & compliance',
            'Multi-tenant isolation & security',
          ],
        },
        {
          name: 'PowerX Plugin Scaffold',
          description: 'A development toolkit that lets teams ship production-ready enterprise plugins in under 30 minutes.',
          image: 'https://dummyimage.com/640x360/0f172a/38bdf8&text=PowerX+Plugin+Scaffold',
          features: [
            'Opinionated project layout',
            'Automatic manifest registration',
            'HTTP / gRPC / MCP ready',
            'One-command .pxp packaging',
          ],
        },
        {
          name: 'PowerX Plugin Market',
          description: 'The hub for official and third-party plugins—covering publishing, licensing, installation, and updates.',
          image: 'https://dummyimage.com/640x360/0f172a/60a5fa&text=PowerX+Plugin+Market',
          features: [
            'Plugin review & security signing',
            'Version release & rollback',
            'License management & billing',
            'Automated dependency handling',
          ],
        },
        {
          name: 'PowerX CRM',
          description: 'End-to-end customer, lead, opportunity, and contract management with automation built in.',
          image: 'https://dummyimage.com/640x360/065f46/34d399&text=PowerX+CRM',
          features: [
            '360° customer profiles',
            'Pipeline visibility',
            'Automated follow-ups',
            'Free tier',
          ],
        },
        {
          name: 'PowerX Commerce',
          description: 'Manage catalog, inventory, orders, and settlement across multi-store operations.',
          image: 'https://dummyimage.com/640x360/0b5d4a/34d399&text=PowerX+Commerce',
          features: [
            'Multi-channel catalog sync',
            'Inventory alerts & restock',
            'Order fulfillment tracking',
            'Free tier',
          ],
        },
        {
          name: 'PowerX SCRM',
          description: 'Social marketing, fan operations, and private-domain engagement in one place.',
          image: 'https://dummyimage.com/640x360/0a4f3c/34d399&text=PowerX+SCRM',
          features: [
            'Audience segmentation',
            'Multi-channel content pushes',
            'Campaign analytics',
            'Free tier',
          ],
        },
        {
          name: 'PowerX SCRUM',
          description: 'Agile collaboration for teams—covering backlogs, sprints, boards, and burndown charts.',
          image: 'https://dummyimage.com/640x360/7f1d1d/fca5a5&text=PowerX+SCRUM',
          features: [
            'Sprint & task boards',
            'Burndown & velocity tracking',
            'Collaboration alerts',
            'Professional tier',
          ],
        },
        {
          name: 'PowerX Wallet',
          description: 'Enterprise wallet and settlement module supporting multi-currency reconciliation.',
          image: 'https://dummyimage.com/640x360/7a1a16/fda4af&text=PowerX+Wallet',
          features: [
            'Cashflow & reconciliation',
            'Automated settlement',
            'Risk alerts',
            'Professional tier',
          ],
        },
        {
          name: 'PowerX MediaX',
          description: 'Media asset hub with rights management and multi-channel distribution.',
          image: 'https://dummyimage.com/640x360/8b1d3f/fda4af&text=PowerX+MediaX',
          features: [
            'Asset library & tagging',
            'Rights & license control',
            'Omnichannel publishing',
            'Professional tier',
          ],
        },
      ],
    },
    about: {
      title: 'About PowerX',
      subtitle: 'We help organizations build their agent ecosystems—assembling digital systems like installing apps.',
      missionTitle: 'Our Mission',
      mission: [
        'Deliver an enterprise AgentOS that covers the full lifecycle from design and development to testing and operations.',
        'Unify multimodel orchestration, tool execution, and data flow through a consistent workflow experience.',
        'Provide comprehensive auditing, monitoring, and permission controls so teams can prove business value with confidence.',
      ],
      stats: [
        { value: '1000+', label: 'Enterprises served' },
        { value: '50K+', label: 'Active users' },
        { value: '99.9%', label: 'Platform availability' },
      ],
      pillars: [
        {
          title: 'Enterprise Proven',
          description: 'Permissioning, tenant isolation, and full-stack auditing deliver a controllable and scalable agent foundation.',
        },
        {
          title: 'Continuous Innovation',
          description: 'An open ecosystem where partners co-create the next generation of multi-agent runtime.',
        },
        {
          title: 'User Obsession',
          description: 'Relentlessly improving the experience so business teams can wield AI with confidence.',
        },
        {
          title: 'Excellence Delivered',
          description: 'Implementation, enablement, and operations services that turn investment into measurable outcomes fast.',
        },
      ],
    },
    finalCta: {
      title: 'Launch your next-generation agent platform today',
      description: 'Join the PowerX community or request a guided session to see how enterprises bring multi-agent use cases to life.',
      primary: 'Book a demo',
      secondary: 'Explore success stories',
    },
  },
} as const
