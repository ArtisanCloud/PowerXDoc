# Primary Use Case: Membership Engagement & Nurture

## Background Overview

High-value members require continuous care and personalized marketing to enhance loyalty and repurchase rates. PowerX CRM provides member segmentation, journey orchestration, care delivery, and effect analysis capabilities. This primary use case focuses on "Membership Engagement & Nurture" to connect CRM data with multi-channel touchpoints and create a continuous operational loop.

## Objectives & Value
- **Precise Segmentation**: Accurate targeting based on tier, behavior, and lifecycle.
- **Automated Care**: Automatic delivery of care on birthdays, anniversaries, and other key dates.
- **Smart Recommendations**: Agent recommends gift packages or cross-sells based on activity and preferences.
- **Quantified Effects**: Output upsell and retention reports after campaign completion.
- **Cross-channel Consistency**: Unified outreach strategies across email, SMS, social media, App, etc.

## Participating Roles
- **Member Operations Team**: Designs campaign strategies and content.
- **Marketing Team**: Executes multi-channel delivery.
- **Customer Success**: Provides one-on-one care for high-value members.
- **Data Analyst/Agent**: Evaluates campaign effects and provides suggestions.
- **System Automation Engine**: Orchestrates journeys, triggers notifications, and collects statistics.

## Primary Scenario User Story
> **As a** member operations manager, **I want to** automate member care and marketing campaigns in CRM, **so that** I can improve member stickiness and secondary consumption.

## Sub-scenarios Detailed

### Sub-scenario A: Targeted Campaign Orchestration
- **Roles & Triggers**: Operations creates targeted campaigns based on member tiers and behavior tags, generating multi-channel outreach plans.
- **Main Process**:
  1. Select target audience (e.g., Platinum members with no purchase in last 30 days).
  2. Design campaign content and preferential policies; define outreach rhythm.
  3. System generates multi-channel outreach plans (email, SMS, App Push).
  4. After launch, monitor coverage and feedback in real-time.
- **Success Criteria**: Accurate audience filtering; smooth outreach execution; trackable feedback.
- **Exception & Risk Control**: Deduplicate lists; filter blacklist; control excessive outreach frequency.
- **Indicators**: Campaign coverage rate, open/click rate, conversion rate.

### Sub-scenario B: Key Date Care Automation
- **Roles & Triggers**: System automatically delivers care benefits and coupons on member birthdays or anniversaries.
- **Main Process**:
  1. CRM records member key dates and preferences.
  2. Send warm-up, reminder, and birthday blessing 7/3/1 days before expiry.
  3. Automatically attach exclusive coupons or gift redemption codes.
  4. Customer success can view care execution in backend and add manual greetings.
- **Success Criteria**: Care delivered on time; benefits usable; positive customer feedback.
- **Exception & Risk Control**: Avoid duplicate reminders; monitor coupon inventory; respect privacy for unsubscribes.
- **Indicators**: Care delivery rate, benefit utilization rate, satisfaction score.

### Sub-scenario C: Activity Analysis & Gift Package Recommendations
- **Roles & Triggers**: Agent analyzes member activity; recommends exclusive gift packages or cross-sell solutions.
- **Main Process**:
  1. Agent aggregates member data on consumption, service usage, activity participation.
  2. Identify declining activity or potential interests; generate recommendation plans.
  3. Push to operations or CSM with suggested copy and benefits.
  4. After communication execution, feedback results and optimize model.
- **Success Criteria**: Accurate recommendations; high execution rate; improved activity.
- **Exception & Risk Control**: Filter duplicate recommendations; validate gift inventory; sensitive segments require approval.
- **Indicators**: Recommendation adoption rate, gift redemption rate, activity recovery rate.

### Sub-scenario D: Campaign Review & Retention Report
- **Roles & Triggers**: After campaign execution, system generates member upsell and retention reports for management review.
- **Main Process**:
  1. After campaign end, automatically aggregate participation, conversion, and upsell data.
  2. Generate reports including ROI, retention impact, and channel-wise performance.
  3. Share with operations, customer success, and management; propose next steps.
  4. Key insights consolidated into knowledge base for future campaigns reference.
- **Success Criteria**: Accurate and timely reports; actionable insights; clear retention metrics.
- **Exception & Risk Control**: Auto-recalculate missing data; alert on abnormal metrics; report permission control.
- **Indicators**: Upsell revenue, retention rate change, report adoption rate.

## Scenario-level Test Cases

> Test Preparation: Enable audience filtering, journey orchestration, key date care, recommendation algorithm, and campaign review reports. Pre-configure 100 Platinum members, birthday data, coupon inventory, and multi-channel outreach settings.

### Use Case A-1: Targeted Campaign Filtering & Execution (Positive)
- **Preconditions**: Condition is "Platinum members + no purchase in last 30 days".
- **Steps**:
  1. Select audience in journey designer and create campaign.
  2. After publishing, check outreach plan.
- **Expected Results**:
  - System filters member list meeting conditions and generates outreach schedule.
  - Multi-channel (email/SMS/App) all scheduled at configured times.
  - Campaign monitoring panel shows real-time coverage and click rate data.

### Use Case B-1: Birthday Care Automation (Positive)
- **Preconditions**: Member "Zhang Min" birthday is June 1; template set to warm up 7 days early.
- **Steps**:
  1. Adjust system date to May 25 to trigger warm-up message.
  2. Verify care push and coupon issuance on June 1.
- **Expected Results**:
  - Warm-up message and birthday blessing sent sequentially with delivery recorded.
  - Coupons automatically issued and written to redemption system.
  - Customer success can view care execution and choose to add manual greetings.

### Use Case C-1: Declining Activity Gift Recommendation (Positive)
- **Preconditions**: Member "Li Lei" activity score declining for 3 consecutive weeks.
- **Steps**:
  1. Manually execute recommendation model.
  2. Check generated gift package suggestions.
- **Expected Results**:
  - Recommendation card lists suggested gift package, expected value, and target conversion.
  - Operations can one-click send gift package or add to subsequent campaigns.
  - Execution results fed back to model; update activity trend.

### Use Case D-1: Campaign Review Report (Positive)
- **Preconditions**: Campaign ends; system aggregates data.
- **Steps**:
  1. Generate report in review center.
  2. Check upsell, retention metrics and channel performance.
- **Expected Results**:
  - Report displays new GMV, retention rate improvement, ROI, and other metrics.
  - Generates improvement suggestions (e.g., strengthen SMS outreach).
  - Can export PDF and auto-archive to knowledge base.

### Use Case D-2: Unsubscribed User Filtering (Negative)
- **Preconditions**: Some members unsubscribed from SMS channel.
- **Steps**:
  1. Execute campaign outreach again.
- **Expected Results**:
  - System automatically filters unsubscribed users; does not send SMS.
  - Campaign logs prompt number of excluded users.

---

## Related Resources

### Business Domain: [Membership & Loyalty](/en/scenarios/meta/crm/membership-loyalty/)
- [Membership Tiers & Entitlements](./membership-tiers-entitlements/primary.md) - Tier configuration, automatic upgrades, and renewal management
- [Loyalty Points & Incentives](./loyalty-points-incentives/primary.md) - Points lifecycle management, redemption validation, expiration alerts, and risk control

### Other CRM Business Domains
- [Customer Management](/en/scenarios/meta/crm/customer-management/) - Customer lifecycle, segmentation, and lead management
- [Marketing Automation](/en/scenarios/meta/crm/marketing-automation/) - Lead nurturing, campaign orchestration, and conversion optimization
- [Sales Process](/en/scenarios/meta/crm/sales-process/) - Opportunity management, quoting, and sales activities
- [Customer Success](/en/scenarios/meta/crm/customer-success/) - Case management, service delivery, and renewal operations
- [Analytics & Revenue Intelligence](/en/scenarios/meta/crm/analytics-revenue-intelligence/) - Sales forecasting, customer value analysis, and performance settlement
- [Admin & Integration](/en/scenarios/meta/crm/admin-integration/) - Access control, workflow automation, and system integration

---
