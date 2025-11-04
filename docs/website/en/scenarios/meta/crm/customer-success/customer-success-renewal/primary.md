# Primary Use Case: Customer Success & Renewal

## Background Overview

Customer Success teams are responsible for ensuring customers continue usage, achieve value, and renew smoothly. PowerX CRM provides health monitoring, business reviews, upsell identification, and save record capabilities to help teams proactively manage customer relationships. This primary use case focuses on "Customer Success & Renewal," achieving closed loop from health assessment to renewal execution.

## Objectives & Value
- **Health Visualization**: Integrate usage, satisfaction, tickets, etc. into health scores.
- **Renewal Cadence**: Proactively plan QBRs, renewal communication, and contract drafts.
- **Upsell Identification**: Push Upsell opportunities based on usage gaps and module interest.
- **Save Review**: Record save measures and effects to build knowledge.
- **Cross-team Collaboration**: Sales, customer success, and product jointly participate in renewal strategy.

## Participants
- **Customer Success Manager (CSM)**: Responsible for customer health and renewal advancement.
- **Sales Representative**: Support renewal negotiations and upsell opportunity conversion.
- **Product Consultant**: Provide solutions and value proof.
- **Management**: Review key customer health and renewal risks.
- **System Agent**: Calculate health scores, push reminders, record actions.

## Primary Scenario User Story
> **As** a Customer Success Manager, **I want** to timely grasp customer health risks and proactively plan renewal cadence, **so that** renewal rates and upsell revenue improve.

## Sub-scenario Details

### Sub-scenario A: Health Dashboard Alerts
- **Roles & Triggers**: Customer Success Manager views health dashboard; system evaluates alerts based on usage and feedback.
- **Main Process**:
  1. Dashboard displays activity, onboarding progress, billing, ticket satisfaction, etc.
  2. When indicators fall below thresholds, automatically marked as "Yellow/Red" alerts.
  3. System generates targeted suggestions (training, product optimization, additional resources).
  4. CSM confirms and assigns specific actions, recorded in customer action plans.
- **Success Criteria**: Accurate alerts; actionable suggestions; trackable action closed loop.
- **Exceptions & Risk Control**: False positives can adjust thresholds; data delay alerts; batch processing for multiple customers.
- **Suggested Metrics**: Alert hit rate, action completion rate, health improvement rate.

### Sub-scenario B: Pre-renewal Business Review
- **Roles & Triggers**: System automatically arranges business review meetings and generates topic templates before renewal cycle.
- **Main Process**:
  1. 120/90/60 days before contract expiry, system pushes different level reminders.
  2. Auto-generates QBR topic templates including goal achievement, ROI, future plans.
  3. Arranges meetings and invites sales and product participation; customers can confirm in portal.
  4. Meeting summaries and todos sync to renewal plans.
- **Success Criteria**: Timely reminders; smooth meeting organization; actionable review outputs.
- **Exceptions & Risk Control**: Merge duplicate reminders; record customer refusal reasons; meeting material permission control.
- **Suggested Metrics**: QBR coverage rate, meeting punctuality rate, renewal success rate.

### Sub-scenario C: Upsell Opportunity Recommendation
- **Roles & Triggers**: Upsell opportunities pushed by Agent based on product usage gaps; sales and success teams collaborate follow-up.
- **Main Process**:
  1. Agent analyzes customer usage modules and account structure, identifying unenabled features or expansion potential.
  2. Generates Upsell cards including value points, reference customer cases, suggested scripts.
  3. Assigned to sales and CSM collaborative follow-up with target dates.
  4. Follow-up results (won/lost/pending) written back to train recommendation model.
- **Success Criteria**: Accurate recommendation; smooth collaboration; improved conversion rate.
- **Exceptions & Risk Control**: Filter duplicate recommendations; sensitive customers require approval; model continuous calibration.
- **Suggested Metrics**: Upsell recommendation adoption rate, conversion rate, additional revenue.

### Sub-scenario D: Save Plan Execution & Review
- **Roles & Triggers**: After customer success executes save plan, system records measures and effects for review.
- **Main Process**:
  1. For at-risk customers, create save plans (gift services, custom support, etc.).
  2. During execution, record each step measure and customer feedback.
  3. System tallies save results (health restored, renewed, still churned).
  4. Generates review reports deposited as knowledge base entries.
- **Success Criteria**: Save actions traceable; quantifiable effects; reusable experience.
- **Exceptions & Risk Control**: Save budget approval; duplicate plan reminders; failures escalate to management.
- **Suggested Metrics**: Save execution rate, success rate, knowledge reuse rate.

## Scenario-level Test Case Examples

> Test Preparation: Enable health dashboard, renewal reminders, Upsell recommendation, and save plan modules. Pre-configure 5 customers with different health scores; configure QBR templates, renewal calendar, and recommendation models.

### Test Case A-1: Health Alert Trigger (Positive)
- **Preconditions**: Customer "Beichen Electric" product usage decreased 60% in past 30 days; satisfaction survey score 2.
- **Steps**:
  1. Refresh health dashboard.
  2. View alert list and suggestions.
- **Expected Results**:
  - Customer marked with red alert and suggestion "Schedule Product Optimization Meeting."
  - Auto-creates follow-up action assigned to CSM.
  - Alert recorded in customer action plan for completion tracking.

### Test Case B-1: Renewal QBR Planning (Positive)
- **Preconditions**: Contract expires in 90 days; renewal reminder strategy effective.
- **Steps**:
  1. Advance system date to 90 days before contract expiry.
  2. View renewal board and tasks.
- **Expected Results**:
  - Auto-generates QBR meeting task with topic template and historical indicator screenshots.
  - Task assigned to CSM and invites sales and product participation.
  - Customer portal synchronously displays meeting invitation with time confirmation support.

### Test Case C-1: Upsell Recommendation Collaboration (Positive)
- **Preconditions**: Customer hasn't purchased "Advanced Reports" module; recommendation model identifies gap.
- **Steps**:
  1. Manually trigger Upsell recommendation task.
  2. View generated recommendation card.
- **Expected Results**:
  - Card includes value points, success cases, and suggested scripts.
  - Assigned to sales and CSM collaborative follow-up with target completion time.
  - Follow-up results written back to model for learning.

### Test Case D-1: Save Plan Execution Record (Positive)
- **Preconditions**: Customer health is red; save plan template includes "Gift Training + Expert Support."
- **Steps**:
  1. CSM creates and executes save plan.
  2. Record completion of each action.
- **Expected Results**:
  - Plan includes multiple action items; customer feedback recorded after execution.
  - When save successful, health recovers to yellow/green and marks "Save Successful."
  - Generates review report and deposits to knowledge base.

### Test Case D-2: Renewal Refusal Write-back (Negative)
- **Preconditions**: Customer explicitly states won't renew; CSM updates result in system.
- **Steps**:
  1. Select "Customer Refused" in renewal task.
  2. Fill in reasons.
- **Expected Results**:
  - Renewal pipeline moves customer to "Not Renewed" column.
  - System requires filling reasons (budget insufficient/product doesn't meet needs, etc.), counted in churn analysis.
  - Triggers marketing team to plan next save or reactivation campaigns.

---

## Related Resources

- Return to [Customer Service & Success](../index.md)
- Continue to [Case Management & SLA](./case-management-sla/primary.md)
- [CRM Scenario Overview](/en/scenarios/meta/crm/)

