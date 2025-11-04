# Primary Use Case: Testing & Conversion Optimization

## Background Overview

Marketing effectiveness requires continuous experimentation and optimization. PowerX CRM combines A/B testing, conversion funnels, heatmaps, and other capabilities with marketing automation to help teams quickly validate hypotheses and promote best practices. This primary use case focuses on "Testing & Conversion Optimization."

## Objectives & Value
- **Unified Experiment Framework**: Manage experiment populations, versions, and goals in CRM.
- **Real-time Data**: Quickly see conversion, click, and other metric changes.
- **Auto-promotion**: After experiment ends, automatically recommend and one-click promote best solution.
- **Funnel Insights**: Visualize conversion funnels and heatmaps to locate problems.
- **Knowledge Accumulation**: Experiment results consolidated as reusable strategies.

## Participating Roles
- **Marketing Operations**: Initiates tests and monitors results.
- **Data Analyst**: Evaluates statistical significance and provides suggestions.
- **Product/Content Team**: Provides different version solutions.
- **System Agent**: Executes traffic splitting, calculates metrics, and promotes results.

## Primary Scenario User Story
> **As a** marketing operations staff, **I want to** validate marketing strategies through a robust experiment framework, **so that** I can continuously improve conversion rates.

## Sub-scenarios Detailed

### Sub-scenario A: A/B Testing Modeling
- **Roles & Triggers**: Marketing operations creates A/B testing plans defining test population, versions, and target metrics.
- **Main Process**:
  1. Select target scenario (email subject, landing page, ad copy).
  2. Set test population, traffic split ratio, and duration.
  3. Specify target metrics (open rate, click rate, registration rate, etc.).
  4. Start test and record data in real-time.
- **Success Criteria**: Accurate traffic splitting; complete data; no test interference.
- **Exception & Risk Control**: Sample size insufficient alert; test conflict warning; version approval.
- **Indicators**: Test coverage, data validity rate, significance achievement.

### Sub-scenario B: Real-time Statistics & Significance Calculation
- **Roles & Triggers**: System auto-splits traffic and calculates core metrics like open rate, click rate, conversion rate in real-time.
- **Main Process**:
  1. Data aggregated to test dashboard in real-time.
  2. System calculates significance and provides confidence intervals.
  3. Alert on abnormal metrics to pause or adjust.
  4. Support exporting raw data for further analysis.
- **Success Criteria**: Accurate statistics; reliable significance judgment; timely anomaly alerts.
- **Exception & Risk Control**: Data delay prompts; manual review interface; data retention strategy.
- **Indicators**: Statistics refresh frequency, anomaly alert count, significance pass rate.

### Sub-scenario C: Best Solution Auto-promotion
- **Roles & Triggers**: After experiment ends, system automatically calculates significance and recommends best solution; supports one-click promotion to live campaigns.
- **Main Process**:
  1. Test auto-closes after reaching preset sample size.
  2. System determines best solution and generates promotion suggestion.
  3. After operations confirmation, one-click apply best version to live journey.
  4. Save control group for future comparison.
- **Success Criteria**: Accurate recommendation; uninterrupted promotion; historical versions rollbackable.
- **Exception & Risk Control**: No significant difference prompts to continue testing; promotion requires approval; record change logs.
- **Indicators**: Promotion adoption rate, post-promotion conversion improvement, rollback count.

### Sub-scenario D: Conversion Funnel & Heatmap Analysis
- **Roles & Triggers**: Key conversion funnels generate heatmaps to help locate optimization points on forms and landing pages.
- **Main Process**:
  1. Select target journey or landing page; generate behavior funnel.
  2. System draws heatmap showing user停留 and churn locations.
  3. Provide optimization suggestions (adjust copy, shorten form, add hints).
  4. Operations record changes and plan next test.
- **Success Criteria**: Accurate funnel; clear heatmap; actionable suggestions.
- **Exception & Risk Control**: Data sampling anomaly alerts; privacy data masking; before/after change comparison records.
- **Indicators**: Funnel conversion rate, heatmap insight adoption rate, optimization iteration cycle.

## Scenario-level Test Cases

> Test Preparation: Enable A/B testing engine, statistics calculation, auto-promotion, and funnel analysis module. Prepare email subject A/B versions, two landing page sets, statistical significance threshold 95%, and heatmap scripts.

### Use Case A-1: A/B Testing Modeling (Positive)
- **Preconditions**: Target is "registration rate"; planned sample size 10,000.
- **Steps**:
  1. Create test with A/B two email subjects, 50% split each.
  2. Start test and observe traffic splitting.
- **Expected Results**:
  - Balanced split; dashboard shows real-time data; auto-alert if deviation >5%.
  - Target metrics update in real-time; no significance calculated before reaching sample size.

### Use Case B-1: Significance Calculation & Alert (Positive)
- **Preconditions**: Test reaches sample size; version B conversion rate significantly higher than version A.
- **Steps**:
  1. Refresh test dashboard.
  2. Check significance conclusion.
- **Expected Results**:
  - System prompts "Version B significantly better than Version A, confidence 97%."
  - Provides confidence interval and main contributing factors.
  - Allows exporting raw data for deep analysis.

### Use Case C-1: One-click Promote Best Solution (Positive)
- **Preconditions**: Test conclusion clear; approver authorized.
- **Steps**:
  1. Click "one-click promote".
  2. Select promotion to running journey.
- **Expected Results**:
  - Best version replaces live campaign content; update version number.
  - Create promotion log recording executor, time, and scope.
  - If campaign already sent 50%, system prompts impact scope.

### Use Case D-1: Funnel & Heatmap Analysis (Positive)
- **Preconditions**: Landing page deployed with tracking; heatmap script running normally.
- **Steps**:
  1. Open funnel analysis; select "registration process".
  2. Check heatmap and export suggestions.
- **Expected Results**:
  - Funnel shows step conversion rates; highlights drop-off nodes.
  - Heatmap shows user停留 areas; system suggests "shorten form fields".
  - Operations record optimization measures and arrange next test round.

### Use Case D-2: Insufficient Significance Prompt (Negative)
- **Preconditions**: Sample size only reached 40% of plan.
- **Steps**:
  1. Check test conclusion.
- **Expected Results**:
  - System提示"insufficient data to determine winning version".
  - Suggests extending test or expanding audience.

---

## Related Resources

### Business Domain: [Marketing Automation](/en/scenarios/meta/crm/marketing-automation/)
- [Lead Nurturing](./lead-nurturing/primary.md) - Journey design, content delivery, and human intervention
- [Campaign Orchestration & Management](./campaign-orchestration-management/primary.md) - Visual campaign design, budget control, and real-time monitoring
- [Content & Channel Outreach](./content-channel-outreach/primary.md) - Template management, multi-language support, and channel scheduling
- [Lead Scoring & Assignment](./lead-scoring-assignment/primary.md) - Scoring models, distribution rules, and fairness analysis

### Other CRM Business Domains
- [Customer Management](/en/scenarios/meta/crm/customer-management/) - Customer lifecycle, segmentation, and lead management
- [Membership & Loyalty](/en/scenarios/meta/crm/membership-loyalty/) - Member tiers, points, and engagement
- [Sales Process](/en/scenarios/meta/crm/sales-process/) - Opportunity management, quoting, and sales activities
- [Customer Success](/en/scenarios/meta/crm/customer-success/) - Case management, service delivery, and renewal operations
- [Analytics & Revenue Intelligence](/en/scenarios/meta/crm/analytics-revenue-intelligence/) - Sales forecasting, customer value analysis, and performance settlement
- [Admin & Integration](/en/scenarios/meta/crm/admin-integration/) - Access control, workflow automation, and system integration

---
