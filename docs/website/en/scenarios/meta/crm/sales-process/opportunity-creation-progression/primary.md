# Primary Use Case: Opportunity Creation & Progression

## Background Overview

PowerX CRM's sales process centers on opportunities as the core hub, covering the entire process from lead conversion, requirement confirmation, solution development to contract signing. Without standardized progression mechanisms, opportunities can stall, information can be missing, or follow-up timing can be missed. This primary use case focuses on "Opportunity Creation & Progression," helping sales teams efficiently convert leads, maintain complete stage information, and handle stagnant opportunities promptly.

## Objectives & Value
- **Quick Profile Creation**: Support one-click conversion from leads to opportunities, reducing duplicate data entry.
- **Stage Governance**: Each stage requires key fields, next-step plans, and success probability assessment.
- **Stagnation Alerts**: Automatically identify stagnant opportunities and generate review suggestions.
- **Win-Loss Integration**: Automatically generate projects/orders after winning, connecting to subsequent fulfillment and finance processes.
- **Data Closed Loop**: Complete progression logs provide reliable data for forecasting and review.

## Participants
- **Sales Representatives**: Create, edit, and advance opportunities, recording follow-up information.
- **Sales Managers**: Monitor opportunity quality, approve key information, and support critical nodes.
- **Customer Success / Fulfillment Teams**: Take over subsequent work after opportunity wins.
- **Intelligent Agent**: Responsible for stagnation identification, review suggestions, and automatic reminders.

## Primary Scenario User Story
> **As** a sales representative, **I want** to quickly create and advance opportunities while receiving system prompts at critical stages, **so that** I can improve close rates and ensure information completeness.

## Sub-scenario Details

### Sub-scenario A: One-Click Lead to Opportunity Conversion
- **Roles & Triggers**: Sales converts lead to opportunity with one click from lead list, system inherits customer information and generates initial follow-up plan.
- **Main Process**:
  1. Sales selects lead in "Lead Pool" and clicks "Convert to Opportunity."
  2. System copies customer, contact, and requirement summary from lead to new opportunity.
  3. Automatically generates initial stage (e.g., "Requirement Confirmation") and creates first follow-up task.
  4. Updates lead status to "Converted" and links to opportunity record.
- **Success Criteria**: Conversion requires no duplicate input; opportunity auto-generated; lead status synchronized.
- **Exceptions & Risk Control**: Duplicate conversion warnings; conversion blocked when key fields missing; conversion logs auditable.
- **Suggested Metrics**: Lead conversion time, conversion success rate, first visit time after conversion.

### Sub-scenario B: Stage Progression & Information Completion
- **Roles & Triggers**: When opportunity stage changes, system prompts to fill key fields and automatically evaluates success probability.
- **Main Process**:
  1. Sales advances opportunity from "Requirement Confirmation" to "Solution Development."
  2. System pops required fields (budget range, decision makers, competitor info, etc.).
  3. Automatically calculates success probability based on historical data and scoring models, showing next-step suggestions.
  4. Stage changes recorded on timeline for manager review.
- **Success Criteria**: High stage information completeness; accurate success probability assessment; smooth approvals and reminders.
- **Exceptions & Risk Control**: Cannot advance without required fields; abnormal success probability triggers review; stage rollback requires reason notes.
- **Suggested Metrics**: Stage progression cycle, field completeness rate, success probability accuracy.

### Sub-scenario C: Stagnant Opportunity Review Suggestions
- **Roles & Triggers**: When opportunities stagnate beyond set days, Agent generates review suggestions and notifies manager for intervention.
- **Main Process**:
  1. System scans opportunity stage duration daily, comparing with SLA thresholds.
  2. Timed-out opportunities enter "Stagnation List," Agent generates review suggestions based on historical data (e.g., accelerate decision maker visits, adjust discount strategy).
  3. Notifies sales and manager to collaboratively review, system provides record templates.
  4. After review completion, updates next-step plan and restarts timer.
- **Success Criteria**: Stagnant opportunities identified timely; review suggestions actionable; significant advancement after remediation.
- **Exceptions & Risk Control**: False positive opportunities can be exempt; repeated stagnation triggers escalation; review results included in evaluation.
- **Suggested Metrics**: Stagnation identification rate, review completion rate, stagnation improvement rate.

### Sub-scenario D: Win-Loss Integration with Projects & Orders
- **Roles & Triggers**: After winning, system automatically generates projects or orders, syncing to fulfillment and finance systems.
- **Main Process**:
  1. Sales marks opportunity as "Won," filling contract amount, signing date, and other information.
  2. System automatically generates implementation projects or sales orders based on opportunity type.
  3. Related information syncs to fulfillment system, finance billing system, and customer lifecycle module.
  4. Opportunity archived and recorded in forecasting model for subsequent analysis.
- **Success Criteria**: Accurate project/order generation; automatic data sync; timely lifecycle status updates.
- **Exceptions & Risk Control**: Abnormal amounts require manager confirmation; generation failures auto-retry; archived key fields non-editable.
- **Suggested Metrics**: Win conversion rate, delivery start time, data sync success rate.

## Scenario-level Test Case Examples

> Test Preparation: Enable lead pool, opportunity stage rules, stagnation monitoring, and project/order integration. Pre-configure 5 leads for conversion, 3 stage templates, review suggestion knowledge base, and fulfillment system sandbox.

### Test Case A-1: One-Click Lead to Opportunity Conversion (Positive)
- **Preconditions**: Lead "North China-Manufacturing-Engineer Wang" status is "Requirement Confirmed"; lead information complete.
- **Steps**:
  1. Select lead in lead list and click "Convert to Opportunity."
  2. Check new opportunity fields and relationships.
- **Expected Results**:
  - Opportunity auto-generated inheriting customer, contact, and requirement summary.
  - System creates first follow-up task "Requirement Clarification Meeting" with not-started status.
  - Original lead marked "Converted" and linked to opportunity ID.

### Test Case B-1: Stage Progression with Key Fields (Positive)
- **Preconditions**: Opportunity at "Requirement Confirmation" stage, required fields include budget, decision makers, expected close date.
- **Steps**:
  1. Change stage to "Solution Development."
  2. Try saving with missing "Budget" field.
  3. Complete fields and save again.
- **Expected Results**:
  - Prompts "Please complete budget amount" when key fields missing.
  - After completion, stage advances successfully, success probability auto-updates.
  - Stage change log recorded on opportunity timeline.

### Test Case C-1: Stagnant Opportunity Triggers Review (Positive)
- **Preconditions**: Opportunity at "Solution Development" stage for 10 days, SLA threshold is 7 days.
- **Steps**:
  1. Manually run stagnation detection task.
  2. Review suggestions and notification targets.
- **Expected Results**:
  - Opportunity marked "Stagnant" with note "Stagnant 10 days, 3 days over SLA."
  - Agent generates review suggestions (e.g., increase executive visits) and notifies sales and manager.
  - Review meeting record template auto-created, requiring conclusion and next-step plan.

### Test Case D-1: Won-Loss Generates Project & Order (Positive)
- **Preconditions**: Opportunity amount 2 million, type "Software Subscription + Implementation"; fulfillment system integration enabled.
- **Steps**:
  1. Update opportunity status to "Won."
  2. View generated project and order records.
- **Expected Results**:
  - Implementation project auto-generated, milestones created based on template.
  - Subscription order sync-generated, pushed to billing system with "Pending Activation" status.
  - Customer lifecycle status auto-refreshed to "Active-Pending Onboarding."

### Test Case D-2: Won-Loss Archive Field Lock (Negative)
- **Preconditions**: Opportunity already won and archived; field lock policy enabled.
- **Steps**:
  1. Try to modify contract amount field.
- **Expected Results**:
  - System prompts "Won opportunity amount cannot be modified, please submit change process."
  - Operation rejected and recorded in audit log.

---

## Related Resources

- Return to [Sales Pipeline & Opportunity](../index.md)
- Continue to [Quoting & Contract Management](./quoting-contract-management/primary.md)
- [CRM Scenario Overview](/en/scenarios/meta/crm/)

