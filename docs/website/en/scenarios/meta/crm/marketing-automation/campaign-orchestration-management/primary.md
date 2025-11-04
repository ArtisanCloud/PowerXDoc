# Primary Use Case: Campaign Orchestration & Management

## Background Overview

Marketing teams need to plan cross-channel, multi-stage campaigns to ensure consistency in target audience, budget, rhythm, and execution. PowerX CRM's marketing automation module provides visual orchestration, budget control, real-time monitoring, and post-campaign analysis capabilities. This primary use case focuses on "Campaign Orchestration & Management" to achieve full-chain campaign management from planning to review.

## Objectives & Value
- **Visual Orchestration**: Define touchpoints and processes through canvas-based interface.
- **Budget Quota Control**: Automatically manage delivery frequency and budget consumption.
- **Real-time Monitoring**: Real-time execution data display with timely exception handling.
- **Cross-team Collaboration**: Marketing, sales, and customer service share campaign progress.
- **Review Consolidation**: Automatically generate effectiveness reports after campaign end.

## Participating Roles
- **Marketing Operations**: Plans campaigns and configures processes.
- **Sales Team**: Obtains campaign leads and follows up on opportunities.
- **Customer Service Team**: Handles campaign inquiries and issues.
- **Finance/Management**: Focuses on budget and ROI.
- **System Agent**: Executes processes, monitors data, and sends alerts.

## Primary Scenario User Story
> **As a** marketing operations staff, **I want to** uniformly orchestrate and monitor cross-channel campaigns in CRM, **so that** I can improve campaign execution efficiency and effectiveness visualization.

## Sub-scenarios Detailed

### Sub-scenario A: Visual Campaign Design
- **Roles & Triggers**: Operations orchestrate cross-channel campaigns on visual canvas, defining trigger conditions and audience segmentation.
- **Main Process**:
  1. Select campaign template or draw process from scratch.
  2. Set audience segmentation, outreach channels, rhythm, and conditional branches.
  3. Confirm approval with compliance team before launch.
  4. After launch, can view node running status in real-time.
- **Success Criteria**: Correct process configuration; approval passed; smooth node execution.
- **Exception & Risk Control**: Node conflict alerts; forbid launch without approval; version control.
- **Indicators**: Process launch time, node error rate, approval cycle time.

### Sub-scenario B: Budget & Frequency Auto-control
- **Roles & Triggers**: System automatically controls campaign frequency based on budget and quota, preventing excessive outreach.
- **Main Process**:
  1. Set budget cap and per-user outreach frequency for campaign.
  2. System monitors resource consumption in real-time; alerts when approaching threshold.
  3. Auto-pause delivery or switch to backup strategy when exceeding threshold.
  4. Marketing can adjust parameters and re-enable.
- **Success Criteria**: Budget not overspent; reasonable frequency control; timely alerts.
- **Exception & Risk Control**: Budget adjustment requires approval; pause/resume records; abnormal channel deactivation.
- **Indicators**: Budget execution deviation, frequency overrun rate, pause count.

### Sub-scenario C: Execution Monitoring & Alerting
- **Roles & Triggers**: During campaign execution, monitor delivery performance in real-time; abnormal KPIs trigger alerts and contingency strategies.
- **Main Process**:
  1. Dashboard displays exposure, click, conversion, lead quality, and other metrics.
  2. When KPIs decline or channel errors occur, system automatically alerts.
  3. Initiate preset contingency strategies (adjust budget, modify copy, switch channels).
  4. Record disposal process for review.
- **Success Criteria**: Real-time monitoring; accurate alerts; rapid contingency strategy execution.
- **Exception & Risk Control**: False positive correction; contingency strategies require permission; all actions logged.
- **Indicators**: Alert hit rate, disposal time, campaign conversion improvement.

### Sub-scenario D: Campaign Closure & Reporting
- **Roles & Triggers**: After campaign closure, auto-generate effectiveness report and sync to sales and customer service teams.
- **Main Process**:
  1. After campaign end, automatically aggregate core metrics and ROI.
  2. Generate report (PDF/online dashboard) and push to relevant teams.
  3. Mark key learnings and improvement items to form knowledge entries.
  4. Sync lead results to sales for follow-up.
- **Success Criteria**: Accurate and timely reports; knowledge consolidation; timely lead handover.
- **Exception & Risk Control**: Recalculate missing data; report permission control; knowledge entries require review.
- **Indicators**: Report delivery timeliness, sales follow-up rate, knowledge reuse rate.

## Scenario-level Test Cases

> Test Preparation: Enable visual orchestrator, budget control, real-time monitoring, and reporting module. Prepare two channels (email/ads), budget cap 500K, alert thresholds, and contingency strategies.

### Use Case A-1: Canvas Process Publishing (Positive)
- **Preconditions**: Process includes audience filter, email send, ad retargeting, SMS follow-up nodes.
- **Steps**:
  1. Complete configuration in canvas and submit for approval.
  2. Launch process after approval.
- **Expected Results**:
  - Approval chain all passed; process version recorded as V1.0.
  - After launch, all nodes show status "Running."
  - Error nodes highlighted in real-time.

### Use Case B-1: Budget Threshold Alert (Positive)
- **Preconditions**: Total budget 500K; alert threshold 80%.
- **Steps**:
  1. Simulate ad consumption 400K.
  2. Observe budget panel and notifications.
- **Expected Results**:
  - Auto-send alert email and in-app message when budget reaches 80%.
  - Can one-click adjust budget or pause related nodes.
  - Budget log records adjustment reasons.

### Use Case C-1: KPI Anomaly Alert (Positive)
- **Preconditions**: Trigger alert when click rate below 1%.
- **Steps**:
  1. Simulate daily click rate 0.5%.
  2. Check alert center and contingency strategy execution.
- **Expected Results**:
  - Alert center displays anomaly; auto-enable backup copy AB version.
  - Operations receive suggestion "increase discount intensity."
  - Handling actions written to operation logs.

### Use Case D-1: Campaign Closure Report (Positive)
- **Preconditions**: Campaign runs for 14 days then ends.
- **Steps**:
  1. Click "Generate Report" in closure console.
  2. Check reports shared with sales and customer service teams.
- **Expected Results**:
  - Report includes exposure, lead count, conversion rate, ROI, channel comparison.
  - Auto-push to sales and customer service; remind to follow up leads.
  - Key insights written to knowledge base.

### Use Case D-2: Closure Report Permission Control (Negative)
- **Preconditions**: Financial metrics only visible to finance and executives.
- **Steps**:
  1. Regular operations try to view financial tab.
- **Expected Results**:
  - Prompts "no permission to view metric"; data not displayed.
  - Audit log records access attempt.

---

## Related Resources

### Business Domain: [Marketing Automation](/en/scenarios/meta/crm/marketing-automation/)
- [Lead Nurturing](./lead-nurturing/primary.md) - Journey design, content delivery, and human intervention
- [Content & Channel Outreach](./content-channel-outreach/primary.md) - Template management, multi-language support, and channel scheduling
- [Lead Scoring & Assignment](./lead-scoring-assignment/primary.md) - Scoring models, distribution rules, and fairness analysis
- [Testing & Conversion Optimization](./testing-conversion-optimization/primary.md) - A/B testing, funnel analysis, and best practice promotion

### Other CRM Business Domains
- [Customer Management](/en/scenarios/meta/crm/customer-management/) - Customer lifecycle, segmentation, and lead management
- [Membership & Loyalty](/en/scenarios/meta/crm/membership-loyalty/) - Member tiers, points, and engagement
- [Sales Process](/en/scenarios/meta/crm/sales-process/) - Opportunity management, quoting, and sales activities
- [Customer Success](/en/scenarios/meta/crm/customer-success/) - Case management, service delivery, and renewal operations
- [Analytics & Revenue Intelligence](/en/scenarios/meta/crm/analytics-revenue-intelligence/) - Sales forecasting, customer value analysis, and performance settlement
- [Admin & Integration](/en/scenarios/meta/crm/admin-integration/) - Access control, workflow automation, and system integration

---
