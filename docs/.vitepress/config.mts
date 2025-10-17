import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "PowerX Documentation",
  description: "A website to introduce PowerX",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'PowerX Docs', link: '/gemini/' }
    ],

    sidebar: {
      '/gemini/': [
        {
          text: 'Core Concepts',
          items: [
            { text: 'Introduction', link: '/gemini/core-concepts/README.md' },
            { text: 'Integration Architecture', link: '/gemini/core-concepts/PowerX_Integration_Architecture.md' },
            { text: 'Knowledge Base', link: '/gemini/core-concepts/00_overview.md' },
            { text: 'Agent Lifecycle', link: '/gemini/core-concepts/Agent_Manager_and_Lifecycle_Spec.md' }
          ]
        },
        {
          text: 'Developer Guides',
          items: [
            { text: 'Introduction', link: '/gemini/developer-guides/README.md' },
            { text: 'Plugin SDK Guide', link: '/gemini/developer-guides/PowerX_Plugin_SDK_Guide.md' },
            { text: 'Plugin Runtime Guide', link: '/gemini/developer-guides/Plugin_Runtime_Guide.md' },
            { text: 'Plugin Test and Debug Guide', link: '/gemini/developer-guides/Plugin_Test_and_Debug_Guide.md' },
            { text: 'Agent Developer Guide', link: '/gemini/developer-guides/Agent_Developer_Guide.md' }
          ]
        },
        {
          text: 'API & Specifications',
          items: [
            { text: 'Introduction', link: '/gemini/api-and-specifications/README.md' },
            {
              text: 'Capability',
              items: [
                { text: 'Capability Contract Spec', link: '/gemini/api-and-specifications/02_capability/Capability_Contract_Spec.md' },
                { text: 'Transport Adapter Spec', link: '/gemini/api-and-specifications/02_capability/Transport_Adapter_Spec.md' }
              ]
            },
            {
              text: 'Registry & Router',
              items: [
                { text: 'Capability Registry and Router Design', link: '/gemini/api-and-specifications/03_registry_router/Capability_Registry_and_Router_Design.md' },
                { text: 'Runtime Endpoint Management', link: '/gemini/api-and-specifications/03_registry_router/Runtime_Endpoint_Management.md' }
              ]
            },
            {
              text: 'Orchestration',
              items: [
                { text: 'Flow and State Model', link: '/gemini/api-and-specifications/04_orchestration/Flow_and_State_Model.md' },
                { text: 'Orchestrator Service Interface', link: '/gemini/api-and-specifications/04_orchestration/Orchestrator_Service_Interface.md' },
                { text: 'Realtime Streaming Gateway', link: '/gemini/api-and-specifications/04_orchestration/Realtime_Streaming_Gateway.md' },
                { text: 'Workflow and Agent Orchestration Spec', link: '/gemini/api-and-specifications/04_orchestration/Workflow_and_Agent_Orchestration_Spec.md' }
              ]
            },
            {
              text: 'Gateway',
              items: [
                { text: 'EventBus and Message Fabric', link: '/gemini/api-and-specifications/06_gateway/EventBus_and_Message_Fabric.md' },
                { text: 'Integration API and Admin Interface', link: '/gemini/api-and-specifications/06_gateway/Integration_API_and_Admin_Interface.md' },
                { text: 'MCP Server and Gateway Design', link: '/gemini/api-and-specifications/06_gateway/MCP_Server_and_Gateway_Design.md' }
              ]
            }
          ]
        },
        {
          text: 'Security & Governance',
          items: [
            { text: 'Introduction', link: '/gemini/security-and-governance/README.md' },
            { text: 'Security and Governance', link: '/gemini/security-and-governance/Security_and_Governance.md' },
            { text: 'Capability and Tool Grants Spec', link: '/gemini/security-and-governance/Capability_and_Tool_Grants_Spec.md' },
            { text: 'Agent Security and Isolation Policy', link: '/gemini/security-and-governance/Agent_Security_and_Isolation_Policy.md' }
          ]
        },
        {
          text: 'PXIP',
          items: [
            { text: 'Introduction', link: '/gemini/pxip/README.md' },
            { text: 'PXIP-001', link: '/gemini/pxip/PXIP-001_Unified_Capability_and_Transport_Proposal.md' }
          ]
        }
      ]
    }

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  }
})
