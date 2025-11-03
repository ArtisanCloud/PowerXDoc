# Primary Use Case: Customer Lifecycle Management

## Background Overview

Customer relationships require matched strategies and tasks at each stage from lead to intent, active, renewal, and churn. PowerX CRM's lifecycle management capabilities link customer status with business processes, enabling sales, customer success, and marketing teams to receive real-time alerts and prepared action guides. This primary use case focuses on "Customer Lifecycle Management," covering status identification, journey orchestration, risk alerts, and report export.

## Objectives & Value
- **Automatic Status Sensing**: Real-time refresh of customer stage based on interaction, transaction, product usage, and other signals.
- **Node Task Driven**: Automatic push of operation guides such as welcome, review, and renewal at different stages.
- **Risk Alert Mechanism**: Quick alerts for silent or abnormal behaviors, providing recovery suggestions.
- **High-value Customer Operations**: Strategic customers automatically assigned dedicated teams and collaboration resources.
- **Compliance Export**: Automatic data masking when exporting lifecycle reports, meeting audit requirements.

## Participants
- **Sales Team**: Responsible for advancing and recording intent to close stages.
- **Customer Success Team**: Responsible for continuous relationship maintenance during active and renewal stages.
- **Marketing Team**: Respond to pre-churn alerts, execute recovery and nurturing strategies.
- **Managers**: View lifecycle funnel and health distribution, guide resource allocation.
- **System Agent**: Responsible for status identification, reminders, task orchestration, and report generation.

## Primary Scenario User Story
> **As** a customer success team leader, **I want** to monitor customer lifecycle status in real-time and receive targeted action suggestions, **so that** I can ensure sustained growth of high-value customers and reduce churn rates.

## Sub-scenario Details

### Sub-scenario A: Automatic Welcome Journey Trigger
- **Roles & Triggers**: System monitors customer status transition from "Intent" to "Active," triggering welcome process and task checklist.
- **Main Process**:
  1. After opportunity is won, system automatically adjusts customer status to "Active."
  2. Welcome journey is triggered, generating onboarding task checklist (training, configuration, billing, etc.).
  3. Customer Success Manager receives reminder and assigns internal collaborators.
  4. After journey node completion, status updates in real-time, customer receives welcome email and resource package.
- **Success Criteria**: Welcome journey takes effect within 10 minutes; task checklist complete; customer feedback good.
- **Exceptions & Risk Control**: Journey trigger failure auto-compensation; duplicate journey detection; task overdue alerts.
- **Suggested Metrics**: Welcome task completion rate, onboarding time, customer satisfaction score.

### Sub-scenario B: Pre-churn Alert & Recovery Suggestion
- **Roles & Triggers**: System automatically downgrades customers to "Pre-churn" when they haven't interacted for a long time, pushing recovery strategies and execution suggestions.
- **Main Process**:
  1. System monitors customer login, purchase, interaction behaviors in the past 30 days. When activity falls below threshold, marks as "Pre-churn."
  2. Automatically generates recovery strategies (discounts, training, joint visits, etc.) and assigns to responsible team.
  3. Sends reminder email/message requiring recovery actions within SLA.
  4. After action execution, records results, system reassesses status and outputs review report.
- **Success Criteria**: Pre-churn identification accurate; recovery actions completed on schedule; status recovery trackable.
- **Exceptions & Risk Control**: Misjudgments can be manually corrected; repeat reminders controlled for frequency; sensitive customers require approval.
- **Suggested Metrics**: Pre-churn hit rate, recovery success rate, SLA achievement rate.

### Sub-scenario C: Strategic Customer Upgrade & Collaboration
- **Roles & Triggers**: When customers upgrade to strategic level, system assigns Customer Success Manager and collaboration team.
- **Main Process**:
  1. Customers meeting revenue, growth potential, and other conditions are automatically promoted to "Strategic."
  2. System creates collaboration group, inviting sales, customer success, product, operations, and other roles to join.
  3. Generates dedicated rhythm for this customer (quarterly QBRs, product roadmap communication, etc.).
  4. Key node reminders synchronized to collaboration tools and execution recorded.
- **Success Criteria**: Collaboration team assembled timely; dedicated rhythm executed completely; customer satisfaction improved.
- **Exceptions & Risk Control**: Team member changes auto-update; collaboration task delay alerts; strategic customer list requires approval.
- **Suggested Metrics**: Strategic customer coverage, collaboration task punctuality, renewal/upsell contribution.

### Sub-scenario D: Lifecycle Report Export & Masking
- **Roles & Triggers**: System automatically masks sensitive fields and adds watermarks when users export lifecycle reports.
- **Main Process**:
  1. Operations staff selects customer lifecycle report in analytics module, sets filter conditions.
  2. System generates dataset and masks personal privacy fields (phone numbers, emails, etc.).
  3. Output PDF/Excel automatically watermarked, recording exporter, time, and purpose.
  4. Reports archived and download records traceable, meeting audit requirements.
- **Success Criteria**: Masking rules fully effective; export time controllable; audit logs complete.
- **Exceptions & Risk Control**: High-sensitivity reports require approval; export failures auto-retry; abnormal downloads trigger alerts.
- **Suggested Metrics**: Report export frequency, masking coverage, audit compliance pass rate.

## Scenario-level Test Case Examples

> Test Preparation: Enable lifecycle status engine, journey orchestrator, and reporting module. Pre-configure 10 customers at different stages, welcome journey template, risk thresholds, strategic customer collaboration team, and masked export strategy.

### Test Case A-1: Welcome Journey Auto-trigger (Positive)
- **Preconditions**: Customer "YunChao Tech" opportunity won, status automatically switches to "Active"; welcome journey configured.
- **Steps**:
  1. Update opportunity status to "Won."
  2. Observe journey trigger and task generation results.
- **Expected Results**:
  - System triggers welcome journey within 5 minutes, generating onboarding task checklist.
  - CSM receives to-do, customer receives welcome package via email.
  - Customer timeline records journey nodes and execution progress.

### Test Case B-1: Pre-churn Alert & Recovery Action (Positive)
- **Preconditions**: Customer "Xinghui Logistics" has no login or orders in past 30 days; pre-churn threshold set to 21 days no interaction.
- **Steps**:
  1. Manually refresh activity indicators.
  2. View risk list and auto-generated recovery tasks.
- **Expected Results**:
  - Customer status marked as "Pre-churn" with orange color.
  - System generates "Phone Care + Product Training" recovery suggestion, assigned to CSM.
  - Execution results can be recorded as "Contacted" or "Refused Communication," feeding back to model.

### Test Case C-1: Strategic Customer Collaboration Team Formation (Positive)
- **Preconditions**: Customer "Hongtu Group" meets strategic level conditions; collaboration template configured with sales, CSM, product, operations roles.
- **Steps**:
  1. Update customer revenue above strategic threshold.
  2. View auto-created collaboration team results.
- **Expected Results**:
  - System auto-creates "Hongtu Group Strategic Collaboration Team," members receive join notification.
  - QBR and other dedicated rhythm tasks synchronized and displayed on team board.
  - Collaboration info written to customer collaboration log for management view.

### Test Case D-1: Lifecycle Report Masked Export (Positive)
- **Preconditions**: Operations has "Partial Mask Export" permission; report template includes contact phone numbers.
- **Steps**:
  1. In analytics module, select "Lifecycle Analysis" template, check partial masking level.
  2. Export PDF report and view watermark.
- **Expected Results**:
  - Exported contact phone numbers display as "138****0001."
  - Report footer includes exporter, time, and purpose watermark.
  - Audit logs record export behavior, download records traceable.

### Test Case D-2: High-sensitivity Report Approval Rejected (Negative)
- **Preconditions**: Same report requires security approval for "Full Data" export.
- **Steps**:
  1. Submit full export application.
  2. Security team rejects application.
- **Expected Results**:
  - Report status displays "Rejected," reason written back to applicant.
  - No files generated; audit logs record approval action.
  - System suggests using partial masking instead.

---

## Related Resources

- Return to [Customer & Lead Management](../index.md)
- Continue to [Lead Capture & Deduplication](./lead-capture-deduplication/primary.md)
- [CRM Scenario Overview](/en/scenarios/meta/crm/)

