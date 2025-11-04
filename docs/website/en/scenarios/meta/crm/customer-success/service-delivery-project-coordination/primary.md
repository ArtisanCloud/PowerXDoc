# Primary Use Case: Service Delivery & Project Coordination

## Background Overview

After complex solutions are signed, implementation teams, products, customer success, and other roles collaborate to complete delivery. PowerX CRM connects delivery projects with contracts and customer profiles to achieve milestone management, risk collaboration, customer confirmation, and experience accumulation. This primary use case focuses on "Service Delivery & Project Coordination," ensuring delivery process is transparent and controllable.

## Objectives & Value
- **Project Management**: Automatically generate projects after contract signing with clear milestones and responsible parties.
- **Customer Portal Sync**: Progress, milestones, and confirmation processes online and transparent.
- **Risk Collaboration**: Risk events trigger cross-department meetings and action plans.
- **Experience Accumulation**: Delivery summaries become knowledge assets for future project reference.
- **Data Write-back**: Delivery outcomes feed back to customer health and satisfaction models.

## Participants
- **Implementation/Project Manager**: Responsible for project planning, progress, and resource coordination.
- **Product & Development**: Solution design and change handling.
- **Customer Success Manager**: Connects customers with internal teams, focuses on value delivery.
- **Customer Representative**: Confirms delivery outcomes through portal.
- **System Agent**: Milestone reminders, risk alerts, summary archiving.

## Primary Scenario User Story
> **As** an implementation project manager, **I want** CRM to provide a unified delivery collaboration platform, **so that** projects are completed on schedule and customers confirm value timely.

## Sub-scenario Details

### Sub-scenario A: Project Initialization & Milestone Setup
- **Roles & Triggers**: Implementation team creates delivery project; system automatically links contract scope and milestones.
- **Main Process**:
  1. After opportunity win, system generates delivery project based on contract template.
  2. Auto-imports standard milestones; project manager can further decompose tasks.
  3. Set responsible parties, planned completion dates, and acceptance criteria.
  4. Project plan syncs to team calendar and collaboration tools.
- **Success Criteria**: Auto-generated projects; trackable milestones; clear responsibilities.
- **Exceptions & Risk Control**: Customizable project templates; milestone changes require approval; resource conflict early warnings.
- **Suggested Metrics**: Project start speed, plan accuracy, resource matching degree.

### Sub-scenario B: Milestone Completion & Customer Confirmation
- **Roles & Triggers**: After project milestone completion, sync progress to customer portal; customers can confirm online.
- **Main Process**:
  1. After team completes milestone, submit deliverables and explanations in system.
  2. System automatically notifies corresponding contacts in customer portal for acceptance.
  3. Customer confirms online or provides adjustment feedback; sync back to project view.
  4. Acceptance results written to project log, affecting health scores.
- **Success Criteria**: Instant notifications; smooth customer confirmation; complete records.
- **Exceptions & Risk Control**: Customer long-term non-confirmation triggers escalation; deliverable permission control; adjustment requirements generate change tickets.
- **Suggested Metrics**: Milestone on-time rate, customer confirmation time, acceptance satisfaction.

### Sub-scenario C: Critical Risk Collaboration Meetings
- **Roles & Triggers**: Critical risk items trigger cross-department meetings; conclusions written back to project and customer records.
- **Main Process**:
  1. Project members submit risk items (e.g., schedule delays, resource shortages).
  2. System evaluates risk level; high risks trigger urgent collaboration meetings.
  3. Meeting summaries auto-sync to project space, generating action items and responsible parties.
  4. Risk handling progress loop updates until closed.
- **Success Criteria**: Timely risk identification; clear action items; trackable handling effects.
- **Exceptions & Risk Control**: Merge duplicate risks; absent members receive meeting summaries; risk closure requires verification.
- **Suggested Metrics**: Risk response time, resolution rate, recurrence rate.

### Sub-scenario D: Delivery Summary & Knowledge Accumulation
- **Roles & Triggers**: After delivery completion, generate experience summary incorporated into industry knowledge base and future solution templates.
- **Main Process**:
  1. After project completion, system reminds team to write summaries including success experiences, risk reviews, customer feedback.
  2. After review, publish to knowledge base and link with customer and industry tags.
  3. Next similar projects can directly reference template.
  4. Summary results simultaneously feed back to sales and product to optimize subsequent solutions.
- **Success Criteria**: Summary completed on time; searchable knowledge; reused by future projects.
- **Exceptions & Risk Control**: Summary content needs masking; low-quality scores require revision; reuse statistics trackable.
- **Suggested Metrics**: Summary completion rate, knowledge reuse rate, customer satisfaction changes.

## Scenario-level Test Case Examples

> Test Preparation: Enable project management, customer portal, risk registry, and knowledge base. Pre-configure 2 won opportunities with corresponding contract scopes and delivery templates; configure collaboration members and notification strategies.

### Test Case A-1: Project Initialization & Milestone Generation (Positive)
- **Preconditions**: Opportunity "Implementation Project-001" just won; contract includes standard 4 milestones.
- **Steps**:
  1. Trigger project auto-creation process.
  2. View project plan.
- **Expected Results**:
  - Project auto-generated; milestones created from template with assigned responsible parties.
  - Synced to team calendar and resources reserved.
  - Project status is "Planning" awaiting confirmation to enter execution.

### Test Case B-1: Milestone Customer Confirmation (Positive)
- **Preconditions**: Milestone "UAT Completion" deliverables uploaded.
- **Steps**:
  1. Implementation manager submits acceptance application.
  2. Customer portal user logs in to confirm.
- **Expected Results**:
  - Customer receives email/portal notification, views and confirms or rejects.
  - After confirmation, milestone status changes to "Accepted," generating signature document.
  - Customer feedback synchronously updates customer health.

### Test Case C-1: Risk Event Triggers Collaboration Meeting (Positive)
- **Preconditions**: Project member records risk "Key Interface Delay."
- **Steps**:
  1. Set risk level to high.
  2. Submit and view system response.
- **Expected Results**:
  - System automatically arranges urgent collaboration meeting inviting project team and product owner.
  - Generates action items (add resources, communicate with customer) recorded in risk log.
  - After action completion, risk status changes to "Mitigated."

### Test Case D-1: Delivery Summary Knowledge Accumulation (Positive)
- **Preconditions**: All project milestones completed; summary template configured.
- **Steps**:
  1. Project manager submits delivery summary including success experiences and risk reviews.
  2. After review, publish to knowledge base.
- **Expected Results**:
  - Knowledge entries link to industry tags and customer names (masked).
  - Future projects can search and reference summary content.
  - Sales and product teams receive notifications to learn from experience.

### Test Case D-2: Summary Quality Failed Rejection (Negative)
- **Preconditions**: Reviewer determines summary lacks key metrics.
- **Steps**:
  1. Reviewer selects "Reject."
  2. Fill improvement suggestions.
- **Expected Results**:
  - Summary status marked "Needs Supplement," prompting project manager to improve.
  - After revision, resubmit with version history preserved.

---

## Related Resources

- Return to [Customer Service & Success](../index.md)
- Continue to [Customer Success & Renewal](./customer-success-renewal/primary.md)
- [CRM Scenario Overview](/en/scenarios/meta/crm/)

