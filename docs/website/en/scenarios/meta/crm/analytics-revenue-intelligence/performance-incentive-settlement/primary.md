# Primary Use Case: Performance & Incentive Settlement

## Background Overview

Sales performance and incentive policies need close integration with CRM data to ensure accurate, fair, and transparent settlement. PowerX CRM supports performance statistics, commission calculation, approval, and disbursement processes. This primary use case focuses on "Performance & Incentive Settlement."

## Objectives & Value
- **Auto Statistics**: Automatically calculate performance based on opportunities, orders, and collections.
- **Commission Strategy**: Support tiered commissions, team sharing, and special bonuses.
- **Approval Compliance**: Incentive settlement requires approval with audit trails to avoid disputes.
- **Anomaly Validation**: Detect abnormal orders and refunds to ensure accurate incentives.
- **Transparent Communication**: Teams can view attainment and incentive details in real-time.

## Participating Roles
- **Sales Rep**: Views performance and incentive results.
- **Sales Management**: Reviews performance and adjusts strategies.
- **Finance Team**: Executes disbursement and accounting integration.
- **Risk Control Team**: Checks abnormal orders or incentive gaps.
- **System Agent**: Calculates, reminds, and pushes reports.

## Primary Scenario User Story
> **As a** sales manager, **I want** automated commission calculation with compliance approval, **so that** I can improve trust and reduce manual workload.

## Sub-scenarios Detailed

### Sub-scenario A: Performance Statistics & Commission Calculation
- **Roles & Triggers**: System automatically aggregates sales performance and generates pending commission per commission rules.
- **Main Process**:
  1. Collect won opportunities, order amounts, and collection data within the period.
  2. Calculate individual and team performance contributions per rule engine.
  3. Output commission budget summary; generate pending approval list.
  4. Provide performance details for sales self-inspection.
- **Success Criteria**: Accurate calculation; transparent details; timely statistics.
- **Exception & Risk Control**: Duplicate accrual alerts; rule change versioning; manual adjustments require notes.
- **Indicators**: Performance calculation latency, error correction rate, detail query frequency.

### Sub-scenario B: Incentive Approval & Disbursement
- **Roles & Triggers**: After commission approval, sync to finance settlement system to reduce duplicate entry.
- **Main Process**:
  1. Management reviews incentive list online; confirms or adjusts.
  2. After approval, generate disbursement instruction; push to finance system.
  3. Finance executes disbursement and feedback status.
  4. CRM updates disbursement time and voucher; sales can view.
- **Success Criteria**: Smooth approval process; complete disbursement records; status sync.
- **Exception & Risk Control**: Approval timeout escalation; disbursement failure retry; permission control.
- **Indicators**: Approval cycle time, disbursement accuracy, timeout rate.

### Sub-scenario C: Leaderboard & Incentive Transparency
- **Roles & Triggers**: Team leaderboard displays attainment in real-time; incentive rule changes leave traceable history.
- **Main Process**:
  1. Real-time refresh leaderboard showing performance, attainment rate, and incentive level.
  2. Provide rule descriptions and change records.
  3. Support multi-dimensional filtering (region, product, time).
  4. Sales can view personal and team rankings to drive competition.
- **Success Criteria**: Real-time data; transparent rules; obvious incentive effect.
- **Exception & Risk Control**: Privacy view control; abnormal ranking alerts; traceable history.
- **Indicators**: Leaderboard visits, incentive attainment rate, rule dispute count.

### Sub-scenario D: Pre-disbursement Risk Verification
- **Roles & Triggers**: Before reward disbursement, system verifies abnormal orders or refund risks and prompts verification.
- **Main Process**:
  1. Before disbursement, re-check corresponding orders for risks (refunds, complaints, undelivered).
  2. When risks detected, mark commission as "pending verification".
  3. Risk team reviews and gives handling opinions.
  4. Only allow disbursement after verification completes.
- **Success Criteria**: Accurate risk identification; timely handling; avoid wrong incentives.
- **Exception & Risk Control**: Misjudgment can be released; repeated risk records; continuous risk strategy optimization.
- **Indicators**: Risk interception rate, false positive rate, review duration.

## Scenario-level Test Cases

> Test Preparation: Enable performance statistics, commission rule engine, approval flow, leaderboard, and risk verification. Prepare 5-person sales team, order/collection data, different commission plans, and risk verification rules.

### Use Case A-1: Performance Statistics Batch Processing (Positive)
- **Preconditions**: Period is last month; data fully synchronized.
- **Steps**:
  1. Run performance statistics task.
  2. Check generated performance summary and personal breakdown.
- **Expected Results**:
  - System calculates personal and team performance; shows contribution percentage.
  - Details traceable to opportunities, orders, and collection records.
  - Sales can view results in self-service portal.

### Use Case B-1: Commission Approval Process (Positive)
- **Preconditions**: Commission list generated; approval chain is Sales Manager → Finance.
- **Steps**:
  1. Submit commission list.
  2. Complete two-level approval.
- **Expected Results**:
  - Approval nodes show opinions and adjustment records.
  - After approval, generate "pending disbursement" instruction pushed to finance system.
  - Approval logs can export audit reports.

### Use Case C-1: Leaderboard Real-time Display (Positive)
- **Preconditions**: Leaderboard visibility set to team internal.
- **Steps**:
  1. Refresh leaderboard page.
  2. Check ranking, attainment rate, and incentive status.
- **Expected Results**:
  - Display latest performance, attainment rate, and incentive level.
  - Rule change history viewable (e.g., "2025Q1 New Tier").
  - Sales can filter time intervals.

### Use Case D-1: Pre-disbursement Risk Verification (Positive)
- **Preconditions**: Risk verification executed before commission disbursement; order #888 not collected.
- **Steps**:
  1. Run risk verification task.
  2. Check results.
- **Expected Results**:
  - System marks commission involving order #888 as "pending verification".
  - Risk team receives task; confirms to disburse or withhold.
  - Handling result written to incentive log.

### Use Case D-2: False Positive Unlock (Negative)
- **Preconditions**: Risk control misjudges order risk.
- **Steps**:
  1. Risk personnel select "remove restriction" after review.
- **Expected Results**:
  - Commission status changes to "disbursable"; record unlock reason.
  - Audit log retains entire process.

---

## Related Resources

### Business Domain: [Analytics & Revenue Intelligence](/en/scenarios/meta/crm/analytics-revenue-intelligence/)
- [Sales Forecasting & Target Management](./sales-forecasting-target-management/primary.md) - Target breakdown, forecast curves, and deviation alerts
- [Customer Value & Churn Analysis](./customer-value-churn-analysis/primary.md) - Value segmentation, churn alerts, and root cause analysis

### Other CRM Business Domains
- [Customer Management](/en/scenarios/meta/crm/customer-management/) - Customer lifecycle, segmentation, and lead management
- [Marketing Automation](/en/scenarios/meta/crm/marketing-automation/) - Lead nurturing, campaign orchestration, and conversion optimization
- [Sales Process](/en/scenarios/meta/crm/sales-process/) - Opportunity management, quoting, and sales activities
- [Customer Success](/en/scenarios/meta/crm/customer-success/) - Case management, service delivery, and renewal operations
- [Membership & Loyalty](/en/scenarios/meta/crm/membership-loyalty/) - Member tiers, points, and engagement
- [Admin & Integration](/en/scenarios/meta/crm/admin-integration/) - Access control, workflow automation, and system integration

---
