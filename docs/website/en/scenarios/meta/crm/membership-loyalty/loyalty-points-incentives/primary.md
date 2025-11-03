# Primary Use Case: Loyalty Points & Incentives

## Background Overview

Points serve as an important mechanism connecting CRM and e-commerce experiences, involving points earning, redemption, validity periods, and risk control. PowerX CRM needs to integrate with order, marketing, and customer service systems to ensure accurate points ledgers, flexible activities, and controllable risks. This primary use case focuses on "Loyalty Points & Incentives" to manage the full lifecycle of points.

## Objectives & Value
- **Unified Ledger**: Points income and expenditure are uniformly recorded and traceable in CRM.
- **Real-time Redemption**: E-commerce redemption using points reduces in real-time for smooth customer experience.
- **Validity Management**: Automatic reminders for upcoming expiring points to reduce waste.
- **Risk Monitoring**: Identify abnormal point acquisition or point farming behaviors.
- **Operational Flexibility**: Support activity bonus points, batch adjustments, and points mall.

## Participating Roles
- **Operations Team**: Configures points strategies, activities, and adjustments.
- **E-commerce System**: Provides points earning and redemption scenarios.
- **Customer Service Team**: Handles points inquiries and exceptions.
- **Risk Control Team**: Monitors abnormal behaviors and enforces restrictions.
- **System Agent**: Calculates points, triggers reminders, and executes risk control strategies.

## Primary Scenario User Story
> **As a** member operations leader, **I want** CRM to accurately record points and provide expiry reminders and risk control, **so that** I can improve member loyalty and prevent abuse.

## Sub-scenarios Detailed

### Sub-scenario A: Points Accumulation & Event Booking
- **Roles & Triggers**: After e-commerce order completion, CRM receives events and calculates points according to strategies, recording source details.
- **Main Process**:
  1. Order completion event sent to CRM with order amount, category, and member ID.
  2. System calculates points to be issued according to points rules and writes to points ledger.
  3. Mark source (order placement, review, check-in) and associated order number.
  4. Send points crediting notification to members.
- **Success Criteria**: Accurate points calculation; timely crediting; traceable ledger.
- **Exception & Risk Control**: Auto-deduct points on order refund; prevent duplicate booking; abnormal orders trigger review.
- **Indicators**: Points issuance accuracy rate, crediting latency, refund recovery rate.

### Sub-scenario B: Points Redemption & Real-time Validation
- **Roles & Triggers**: Customers use points for redemption at checkout; system validates balance in real-time and writes usage records.
- **Main Process**:
  1. Customer selects points redemption amount at checkout.
  2. System queries points balance and available quota in real-time; calculates redemption amount.
  3. Deduct points after successful order placement; record redemption details.
  4. Customers can view redemption history in account center.
- **Success Criteria**: Smooth redemption process; accurate balance; checkable details.
- **Exception & Risk Control**: Insufficient balance prompt; multi-terminal concurrent locking; auto-rollback on redemption failure.
- **Indicators**: Points redemption usage rate, failure rate, customer satisfaction.

### Sub-scenario C: Validity & Reminder Strategy
- **Roles & Triggers**: Operations sets points validity; system monthly batch processes upcoming expiry reminders and deductions.
- **Main Process**:
  1. Monthly calculate points quantities expiring in next 30/7 days.
  2. Send reminders via channels (SMS, email, App) with recommended activities.
  3. Automatically deduct unused expired points; record reasons.
  4. Operations can view expiry analysis reports to adjust strategies.
- **Success Criteria**: Comprehensive reminder coverage; accurate deduction; improved member conversion.
- **Exception & Risk Control**: Special members can extend validity; batch deduction failure retry; reminder frequency control.
- **Indicators**: Expiry reminder reach rate, expiry usage rate, deduction accuracy rate.

### Sub-scenario D: Points Risk Control & Freezing
- **Roles & Triggers**: Risk control monitors abnormal points growth; auto-freezes suspicious accounts and initiates review.
- **Main Process**:
  1. System monitors points acquisition frequency, amount, and source in real-time; identifies suspicious patterns.
  2. Triggers risk control strategy; temporarily freezes points or restricts usage.
  3. Notifies risk team for manual review; unblocks or permanently processes after confirmation.
  4. Freeze/unfreeze records written to audit logs.
- **Success Criteria**: Accurate anomaly detection; timely processing; normal members unaffected.
- **Exception & Risk Control**: Misjudgment can be appealed; remind customer service to follow up during freeze; continuous strategy optimization.
- **Indicators**: Anomaly detection rate, false positive rate, processing time.

## Scenario-level Test Cases

> Test Preparation: Enable points ledger, event access, redemption interface, validity batch processing, and risk control strategies. Pre-configure points rules, order event simulator, reminder templates, and risk monitoring thresholds.

### Use Case A-1: Order Points Booking (Positive)
- **Preconditions**: Member account has 1,000 points; points rule is 1 currency = 1 point.
- **Steps**:
  1. Simulate order completion, amount 500 currency.
  2. Check points ledger and notifications.
- **Expected Results**:
  - Ledger adds +500 record with source "Order #12345".
  - Member receives points crediting notification.
  - If order refunded, auto-generates -500 adjustment record.

### Use Case B-1: Checkout Redemption Validation (Positive)
- **Preconditions**: Member points balance 1,500; single redemption limit 1,000.
- **Steps**:
  1. Enter 800 points redemption at checkout.
  2. Submit order and check deduction result.
- **Expected Results**:
  - System validates balance in real-time; allows 800 redemption.
  - After successful order, points balance becomes 700; generates redemption details.
  - Redemption info written to order record for customer service query.

### Use Case C-1: Points Expiry Reminder & Deduction (Positive)
- **Preconditions**: 300 points expire in 7 days.
- **Steps**:
  1. Run expiry reminder task.
  2. Wait 7 days then execute deduction.
- **Expected Results**:
  - Send SMS/email reminder in advance with recommended activities.
  - Auto-deduct 300 points if still unused at expiry; ledger records reason "expired".
  - Both reminder and deduction operations recorded in customer profile.

### Use Case D-1: Points Anomaly Risk Control (Negative)
- **Preconditions**: Same account attempts to claim promotion points 10 times within 1 hour.
- **Steps**:
  1. Simulate triggering promotion points claim event 10 times.
- **Expected Results**:
  - Risk control strategy identifies anomaly; freezes account points usage.
  - Generates risk control ticket notifying operations for review.
  - Freeze can be lifted after review approval; process has audit records.

### Use Case D-2: Points Freeze Redemption Limit (Negative)
- **Preconditions**: Account is risk-control frozen.
- **Steps**:
  1. Attempt to use points redemption at checkout.
- **Expected Results**:
  - System提示"points frozen, temporarily unavailable".
  - Records failed operation log; guide to contact customer service.

---

## Related Resources

### Business Domain: [Membership & Loyalty](/en/scenarios/meta/crm/membership-loyalty/)
- [Membership Tiers & Entitlements](./membership-tiers-entitlements/primary.md) - Tier configuration, automatic upgrades, and renewal management
- [Membership Engagement & Nurture](./membership-engagement-nurture/primary.md) - Member segmentation, journey orchestration, care delivery, and campaign analysis

### Other CRM Business Domains
- [Customer Management](/en/scenarios/meta/crm/customer-management/) - Customer lifecycle, segmentation, and lead management
- [Marketing Automation](/en/scenarios/meta/crm/marketing-automation/) - Lead nurturing, campaign orchestration, and conversion optimization
- [Sales Process](/en/scenarios/meta/crm/sales-process/) - Opportunity management, quoting, and sales activities
- [Customer Success](/en/scenarios/meta/crm/customer-success/) - Case management, service delivery, and renewal operations
- [Analytics & Revenue Intelligence](/en/scenarios/meta/crm/analytics-revenue-intelligence/) - Sales forecasting, customer value analysis, and performance settlement
- [Admin & Integration](/en/scenarios/meta/crm/admin-integration/) - Access control, workflow automation, and system integration

---
