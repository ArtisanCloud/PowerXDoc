export default {
  home: {
    nav: {
      features: 'Features',
      products: 'Product Suite',
      about: 'About',
      cta: 'Get Started',
    },
    hero: {
      welcomePrefix: 'Welcome to',
      highlight: 'PowerX',
      description:
        'PowerX is an enterprise-grade platform for designing, deploying, and governing complex AI agent workflows.',
      primaryCta: 'Explore Core Concepts',
      secondaryCta: 'Review the Content Manager Guide',
    },
    features: {
      title: 'Key Capabilities',
      lead: 'Connect models, plugins, and business systems to bring agents from pilot to production.',
      items: [
        {
          icon: '⚡',
          title: 'Rapid Launch',
          description: 'Go live quickly with a one-click runtime integration for enterprise agents.',
        },
        {
          icon: '🎨',
          title: 'Delightful UX',
          description: 'Human-centered experiences ensure smooth journeys for every role.',
        },
        {
          icon: '🔧',
          title: 'Visual Orchestration',
          description: 'Drag-and-drop workflows and dynamic configuration keep complex logic clear.',
        },
        {
          icon: '🛡️',
          title: 'Secure & Compliant',
          description: 'Auditing and granular permissions safeguard data and governance.',
        },
      ],
    },
    products: {
      title: 'Solution Portfolio',
      lead: 'End-to-end capabilities tailored for diverse AI agent scenarios.',
      ctaLabel: 'View details',
      list: [
        {
          name: 'PowerX Admin',
          description: 'A central command center unifying enterprise plugins, models, and capabilities.',
          image: 'https://dummyimage.com/640x360/0f172a/34d399&text=PowerX+Admin',
          features: [
            'Multi-tenant access control',
            'Observable workflow orchestration',
            'Unified data governance',
            'Real-time runtime monitoring',
          ],
        },
        {
          name: 'PowerX Analytics',
          description: 'Data-driven analytics that make business insights effortless.',
          image: 'https://dummyimage.com/640x360/0f172a/38bdf8&text=PowerX+Analytics',
          features: [
            'Live KPI dashboards',
            'Visual report sharing',
            'AI-assisted forecasting',
            'Customizable workspaces',
          ],
        },
        {
          name: 'PowerX Cloud',
          description: 'Cloud-native foundation delivering elastic compute and unified operations.',
          image: 'https://dummyimage.com/640x360/0f172a/60a5fa&text=PowerX+Cloud',
          features: [
            'Managed model registry',
            'Cross-region active-active',
            'Elastic scaling',
            '24/7 expert support',
          ],
        },
      ],
    },
    about: {
      title: 'About PowerX',
      subtitle: 'We help every organization build its own agent ecosystem with confidence.',
      missionTitle: 'Our Mission',
      mission: [
        'PowerX supports the full lifecycle of enterprise agents—from design and development to testing and operations.',
        'A unified capability hub aligns multimodel orchestration, tool usage, and data flows into one intuitive experience.',
        'Robust auditing, monitoring, and layered permissions protect mission-critical operations and compliance needs.',
      ],
      stats: [
        { value: '1000+', label: 'Enterprise customers' },
        { value: '50K+', label: 'Active users' },
        { value: '99.9%', label: 'Platform availability' },
      ],
      pillars: [
        {
          title: 'Enterprise Proven',
          description: 'Permissioning, tenant isolation, and end-to-end auditing deliver trustworthy agent operations.',
        },
        {
          title: 'Continuous Innovation',
          description: 'An open ecosystem where partners co-create the next generation of agent runtime.',
        },
        {
          title: 'User Obsession',
          description: 'Relentless refinement of the product experience so business teams can wield AI confidently.',
        },
        {
          title: 'Excellence Delivered',
          description: 'Implementation, enablement, and operations services ensure measurable outcomes fast.',
        },
      ],
    },
    finalCta: {
      title: 'Launch your next-generation agent platform today',
      description: 'Join our community or request a guided tour to see how PowerX accelerates real-world AI outcomes.',
      primary: 'Start now',
      secondary: 'View examples',
    },
  },
} as const
