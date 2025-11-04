# Primary Use Case: Lead Nurturing

## Background Overview

Before leads are converted to opportunities, they need to go through multi-touchpoint nurturing journeys. PowerX CRM's marketing automation capabilities can dynamically adjust outreach content based on lead behavior, helping sales engage at optimal moments. This primary use case focuses on "Lead Nurturing," covering journey design, content delivery, human intervention, and status writing back.

## Objectives & Value
- **Multi-stage Journeys**: Dynamically adjust paths based on lead behavior.
- **Personalized Content**: Automatically deliver educational materials, case studies, and invitations.
- **Human Collaboration**: Timely reminders for manual review or follow-up at key nodes.
- **Closed-loop Status**: Write back nurturing results to lead profiles and tags.
- **Data-driven**: Behavior data accumulation for journey strategy optimization.

## Participating Roles
- **Marketing Automation Operations**: Designs journeys and configures rules.
- **Sales Team**: Takes over leads at high-intent nodes.
- **Content Team**: Provides nurturing materials.
- **System Agent**: Executes journeys, monitors behavior, and updates status.

## Primary Scenario User Story
> **As a** marketing automation specialist, **I want to** improve lead maturity through dynamic nurturing journeys, **so that** sales can engage with higher-quality opportunities.

## Sub-scenarios Detailed

### Sub-scenario A: Journey Design & Behavior Triggers
- **Roles & Triggers**: Marketing team configures multi-stage nurturing journeys for new leads; system dynamically adjusts next touchpoints based on interaction behavior.
- **Main Process**:
  1. Design stages in journey orchestrator (welcome → education → conversion).
  2. Configure trigger conditions for each node, such as opening emails, downloading whitepapers.
  3. When lead completes a behavior, automatically flow to corresponding node.
  4. Can adjust branch strategies in real-time during journey execution.
- **Success Criteria**: Correct journey configuration; accurate behavior recognition; smooth transitions.
- **Exception & Risk Control**: Enable compensation mechanism when data delays; node conflict alerts; confirm before disabling journey.
- **Indicators**: Node conversion rate, journey completion rate, stagnant lead percentage.

### Sub-scenario B: Content Delivery & Personalized Recommendations
- **Roles & Triggers**: Automation flow pushes educational emails, whitepapers, or demo appointment invitations based on lead engagement.
- **Main Process**:
  1. System selects appropriate content templates based on tags and behavior.
  2. Send multi-channel outreach (email, SMS, social media private messages).
  3. Record interaction behaviors (open, click, appointment).
  4. Behavior data feeds back to journey adjustments.
- **Success Criteria**: High content match; improved interaction rate; increased appointment rate.
- **Exception & Risk Control**: Comply with unsubscribe regulations; frequency control; multi-language version management.
- **Indicators**: Open rate, click rate, appointment rate, unsubscribe rate.

### Sub-scenario C: Key Node Manual Review
- **Roles & Triggers**: When leads trigger manual review at key nodes, system reminds sales or customer service to intervene.
- **Main Process**:
  1. Set key nodes (e.g., high intent score, trial application submitted).
  2. After conditions met, pause auto-journey; create manual review task.
  3. Sales contacts within specified time and records results.
  4. After review completion, lead returns to journey or directly converts to opportunity.
- **Success Criteria**: Timely reminders; complete human intervention records; no lead missed.
- **Exception & Risk Control**: Auto-escalate on timeout; merge duplicate triggers; task rejection requires explanation.
- **Indicators**: Human intervention response time, conversion rate, timeout rate.

### Sub-scenario D: Nurturing Results Write-back & Tag Updates
- **Roles & Triggers**: After nurturing completion, system automatically updates lead status and writes back customer profile tags.
- **Main Process**:
  1. After journey end or lead conversion, system updates lead stage (nurtured, pending sales).
  2. Add tags such as "Interested in Product A," "Ready for trial."
  3. Notify sales and display results in dashboard.
  4. Record journey performance to optimization board for A/B adjustments.
- **Success Criteria**: Accurate status updates; tag synchronization; timely sales takeover.
- **Exception & Risk Control**: Journey interruption requires tag rollback; deduplicate duplicate writes; complete compliance logs.
- **Indicators**: Nurturing success rate, sales takeover response time, tag accuracy rate.

## Scenario-level Test Cases

> Test Preparation: Enable journey orchestrator, email/SMS channels, manual review nodes, and tag write-back functions. Prepare 50 new leads, several content templates, and manual review queue.

### Use Case A-1: Journey Branch Trigger (Positive)
- **Preconditions**: Journey includes two branches: "Download Whitepaper" and "No Download."
- **Steps**:
  1. Import leads into journey.
  2. Simulate some leads clicking download link, others not clicking.
- **Expected Results**:
  - Leads clicking download enter "Follow-up Demo" branch; others enter "Reminder Email" branch.
  - Logs show specific trigger conditions and times.
  - Journey monitoring panel displays branch member counts.

### Use Case B-1: Content Personalized Push (Positive)
- **Preconditions**: Template variables include industry and interests; lead tags already written.
- **Steps**:
  1. System sends second-stage educational email.
  2. Spot check email content.
- **Expected Results**:
  - Different industry leads receive corresponding cases and CTAs.
  - Email subject and body variables correctly replaced; unmarked content flags anomalies.
  - Click rate data written back to journey node.

### Use Case C-1: Manual Review Node (Positive)
- **Preconditions**: High intent score threshold is 80 points.
- **Steps**:
  1. Increase lead behavior score to 85 points.
  2. Check if journey pauses and creates manual review task.
- **Expected Results**:
  - Journey pauses at "Manual Review" node; generates todo assigned to sales.
  - After review completion, can choose "Convert to Opportunity" or "Return to Journey."
  - Review timeout triggers escalation notification.

### Use Case D-1: Tag Write-back & Status Update (Positive)
- **Preconditions**: Journey end node configured to write back tag "Nurtured."
- **Steps**:
  1. Complete all journey nodes.
  2. Check lead profile tags and stage.
- **Expected Results**:
  - Lead tag updates to "Nurtured"; stage becomes "Pending Sales."
  - Sales owner receives takeover reminder.
  - Lead dashboard statistics success rate.

### Use Case D-2: Journey Pause & Resume (Negative)
- **Preconditions**: Operations urgently pause journey to adjust template.
- **Steps**:
  1. Click "Pause Journey."
  2. Modify template and resume.
- **Expected Results**:
  - During pause, new leads enter queue waiting; old templates not executed.
  - After resume, continue from pause node; do not resend existing content.
  - Operation recorded in journey version history.

---

## Related Resources

### Business Domain: [Marketing Automation](/en/scenarios/meta/crm/marketing-automation/)
- [Campaign Orchestration & Management](./campaign-orchestration-management/primary.md) - Visual campaign design, budget control, and real-time monitoring
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
