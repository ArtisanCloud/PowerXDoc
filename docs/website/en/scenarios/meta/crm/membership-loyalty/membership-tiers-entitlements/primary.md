# Primary Use Case: Membership Tiers & Entitlements

## Background Overview

Enterprises need to maintain customer loyalty through membership systems, requiring unified configuration of tier thresholds, benefit packages, and validity period management in CRM. PowerX CRM integrates membership systems with e-commerce, customer service, and marketing systems to achieve automated membership upgrades, benefit distribution, and renewal reminders. This primary use case focuses on "Membership Tiers & Entitlements" to ensure customers enjoy a consistent membership experience.

## Objectives & Value
- **Centralized Configuration**: Membership tiers and benefit packages are uniformly maintained in CRM.
- **Automatic Upgrades**: Immediate upgrade and notification upon meeting conditions.
- **Membership Transaction Records**: Complete tracking of payment information for membership purchases or renewals.
- **Renewal Reminders**: Trigger renewal tasks and contextual communication before expiry.
- **Multi-system Collaboration**: Benefits sync to mall, customer service, marketing, and other touchpoints.

## Participating Roles
- **CRM Administrator**: Configures tier rules, benefit packages, and validity periods.
- **Customer Success Manager**: Focuses on high-tier member experience and renewals.
- **E-commerce Operations**: Displays membership benefits and pricing in the store.
- **Customer Service Team**: Verifies membership benefits and provides services.
- **System Agent**: Calculates upgrades, sends notifications, and synchronizes data.

## Primary Scenario User Story
> **As a** CRM operations staff, **I want to** uniformly manage membership tiers and benefits in the system, **so that** I can ensure consistent membership experience and improve renewal rates.

## Sub-scenarios Detailed

### Sub-scenario A: Membership Tier & Benefit Configuration
- **Roles & Triggers**: CRM administrators configure membership tier thresholds and benefit packages; system syncs to e-commerce and customer service portals.
- **Main Process**:
  1. Admin defines tiers (Standard, Gold, Platinum) and required points/consumption conditions.
  2. Bind benefits to each tier (exclusive discounts, dedicated customer service, training courses, etc.).
  3. After publishing, system notifies e-commerce and customer service systems to refresh benefit information.
  4. Permissions and visibility controlled by customer segment.
- **Success Criteria**: Accurate configuration; error-free sync; consistent multi-system display.
- **Exception & Risk Control**: Configuration changes require approval; benefit conflict alerts; version rollback capability.
- **Indicators**: Benefit sync latency, configuration error rate, membership inquiry volume.

### Sub-scenario B: Automatic Upgrade & Notification
- **Roles & Triggers**: Members automatically upgrade upon reaching consumption or activity thresholds; system sends benefit unlock notifications and updates customer tags.
- **Main Process**:
  1. System daily calculates member consumption, points, and activity metrics.
  2. Members meeting thresholds automatically upgrade, updating validity period and benefit status.
  3. Send multi-channel notifications (SMS, email, in-app messages) informing new benefits.
  4. Record upgrade logs and tags in customer profile.
- **Success Criteria**: Accurate upgrade logic; timely notifications; tag synchronization.
- **Exception & Risk Control**: Duplicate upgrade filtering; abnormal consumption requires manual review; high-tier benefits require approval.
- **Indicators**: Upgrade success rate, notification delivery rate, benefit utilization rate.

### Sub-scenario C: Membership Purchase & Validity Extension
- **Roles & Triggers**: Users purchase annual membership in e-commerce; CRM records payment information and extends member validity.
- **Main Process**:
  1. User selects annual membership product and completes payment.
  2. E-commerce event notifies CRM; writes payment record and order number.
  3. System extends membership validity; updates renewal date.
  4. Outputs invoice and benefit activation information to user and customer service.
- **Success Criteria**: Accurate payment records; immediate validity update; benefits immediately usable.
- **Exception & Risk Control**: Payment failure rollback; duplicate purchase reminder; refunds require benefit revocation.
- **Indicators**: Membership purchase success rate, validity update latency, refund percentage.

### Sub-scenario D: Renewal Reminders & Task Assignment
- **Roles & Triggers**: When membership approaches expiry, system automatically creates renewal tasks and pushes to customer success managers for follow-up.
- **Main Process**:
  1. Send reminders 30/15/7 days before expiry in phases.
  2. System generates renewal task cards with customer history and renewal discount suggestions.
  3. CSM or sales conducts phone/email follow-up; records customer intent.
  4. Task auto-closes after renewal completion and updates profile.
- **Success Criteria**: Timely reminders; improved renewal rate; closed-loop tasks.
- **Exception & Risk Control**: Customer-initiated renewal auto-closes task; reminder frequency adjustable; record reason for renewal refusal.
- **Indicators**: Renewal reminder coverage, renewal conversion rate, task overdue rate.

## Scenario-level Test Cases

> Test Preparation: Enable membership tier rules, benefit package configuration, e-commerce event subscription, and renewal reminders. Pre-configure three tiers (Standard/Gold/Platinum), several benefit items, annual membership products, and renewal task templates.

### Use Case A-1: Tier Configuration Sync Multi-system (Positive)
- **Preconditions**: Add "Diamond" tier with benefits including dedicated customer service and 12-month installment interest-free.
- **Steps**:
  1. Create new tier and bind benefits in CRM Configuration Center.
  2. Trigger sync to e-commerce and customer service systems.
- **Expected Results**:
  - CRM saves successfully with version number.
  - E-commerce membership page shows "Diamond" within 5 minutes; customer service system can query benefits.
  - Sync logs record success status; retry provided on failure.

### Use Case B-1: Automatic Upgrade Notification (Positive)
- **Preconditions**: Member "Wang Xiaoming" cumulative consumption reaches Diamond threshold; notification template available.
- **Steps**:
  1. Refresh points/consumption cumulative.
  2. Check member profile and notification center.
- **Expected Results**:
  - System adjusts tier to "Diamond"; updates validity period.
  - Sends SMS/email/in-app notification with new benefit details.
  - Customer profile records upgrade log with operator as "System".

### Use Case C-1: Membership Purchase Validity Extension (Positive)
- **Preconditions**: E-commerce order for "Premium Annual Membership" placed; payment success event pushable.
- **Steps**:
  1. Simulate member completing payment in e-commerce.
  2. After CRM receives event, check member validity.
- **Expected Results**:
  - Member validity extends 365 days; generates payment record.
  - Customer service system can query latest validity; benefits take effect immediately.
  - If already high-tier member, benefit stacking logic follows settings.

### Use Case D-1: Renewal Reminder Task (Positive)
- **Preconditions**: Member expires in 30 days; renewal task template exists.
- **Steps**:
  1. Run renewal reminder batch job.
  2. Check customer success manager's to-do list.
- **Expected Results**:
  - Creates "Contact Customer for Renewal" task with historical consumption and recommended discount packages.
  - Task syncs to mobile; update renewal intent after completion.
  - If customer renews themselves, task auto-closes.

### Use Case D-2: Renewal Task Frequency Limit (Negative)
- **Preconditions**: Same member generates tasks repeatedly within 7 days.
- **Steps**:
  1. Execute renewal reminder again.
- **Expected Results**:
  - System提示"existing valid renewal task"; does not create duplicate.
  - Logs record skip reason.

---

## Related Resources

### Business Domain: [Membership & Loyalty](/en/scenarios/meta/crm/membership-loyalty/)
- [Loyalty Points & Incentives](./loyalty-points-incentives/primary.md) - Points lifecycle management, redemption validation, expiration alerts, and risk control
- [Membership Engagement & Nurture](./membership-engagement-nurture/primary.md) - Member segmentation, journey orchestration, care delivery, and campaign analysis

### Other CRM Business Domains
- [Customer Management](/en/scenarios/meta/crm/customer-management/) - Customer lifecycle, segmentation, and lead management
- [Marketing Automation](/en/scenarios/meta/crm/marketing-automation/) - Lead nurturing, campaign orchestration, and conversion optimization
- [Sales Process](/en/scenarios/meta/crm/sales-process/) - Opportunity management, quoting, and sales activities
- [Customer Success](/en/scenarios/meta/crm/customer-success/) - Case management, service delivery, and renewal operations
- [Analytics & Revenue Intelligence](/en/scenarios/meta/crm/analytics-revenue-intelligence/) - Sales forecasting, customer value analysis, and performance settlement
- [Admin & Integration](/en/scenarios/meta/crm/admin-integration/) - Access control, workflow automation, and system integration

---
