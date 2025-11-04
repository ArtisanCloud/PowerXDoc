# Primary Use Case: Task & Cadence Collaboration

## Background Overview

Customer operations require multi-role collaboration from sales, support, marketing, and others to advance tasks. Without unified cadence and task boards, follow-up omissions, unclear responsibilities, or duplicate work easily occur. This primary use case focuses on "Task & Cadence Collaboration," ensuring smooth team collaboration through task assignment, collaboration cards, automatic reminders, and conflict detection.

## Objectives & Value
- **Unified Task Entry**: All customer-related tasks centralized in CRM to-do list.
- **Transparent Collaboration**: Cross-department tasks auto-created and trackable.
- **Cadence Reminders**: Intelligent Agent pushes key customer follow-up cadence.
- **Conflict Alerts**: Prompt to share information when multiple colleagues follow same customer.
- **Efficiency Metrics**: Provide task execution and cadence health indicators.

## Participants
- **Sales Owner**: Assign follow-up tasks and monitor execution.
- **Cross-department Members**: Support, product, customer success, etc. participate in collaboration tasks.
- **Intelligent Agent**: Generate priority lists and reminder follow-ups.
- **Team Lead**: Observe execution and adjust strategy.

## Primary Scenario User Story
> **As** a sales leader, **I want** CRM to automatically organize key customer tasks and coordinate cross-department cooperation, **so that** follow-up cadence remains stable and information is synchronized.

## Sub-scenario Details

### Sub-scenario A: Sales Task Assignment & Priority Push
- **Roles & Triggers**: After sales leader assigns follow-up tasks, system pushes to member to-do lists based on priority.
- **Main Process**:
  1. Owner creates tasks on opportunity or customer page, setting priority, deadline, expected results.
  2. System pushes tasks to assignee's to-do list and mobile reminders.
  3. To-do list sorted by priority and SLA, ensuring urgent matters handled first.
  4. After execution, submit results and auto-update customer status.
- **Success Criteria**: Timely task push; correct priority; traceable execution results.
- **Exceptions & Risk Control**: Rejected tasks require reason; multi-task conflict prompts reschedule; permission-restricted tasks hide sensitive content.
- **Suggested Metrics**: Task acceptance rate, on-time completion rate, overdue volume.

### Sub-scenario B: IM @ Triggers Collaboration Cards
- **Roles & Triggers**: When team members @ support colleagues in IM, system auto-creates cross-department collaboration cards.
- **Main Process**:
  1. In enterprise IM, mention "@Support-Zhang San + link customer."
  2. Bot parses command and generates "Support" card on CRM collaboration board.
  3. Card auto-carries customer information, context, and expected deliverables.
  4. After completion, receipt status in IM, forming closed loop.
- **Success Criteria**: Accurate card generation; support receives notification; progress synchronized.
- **Exceptions & Risk Control**: Unrecognized command prompts manual creation; sensitive customers require approval; IM and CRM permission synchronization.
- **Suggested Metrics**: Collaboration card generation rate, handling time, receipt accuracy.

### Sub-scenario C: Key Customer Cadence List
- **Roles & Triggers**: Agent regularly generates weekly key customer follow-up list and schedules reminder times.
- **Main Process**:
  1. Agent filters key customers based on contract amount, activity, renewal risk, and other indicators.
  2. Auto-generates weekly cadence list including recommended actions and goals.
  3. Schedules reminder times according to calendar and pushes to responsible sales.
  4. Sales provides results after execution, Agent updates cadence status and adjusts subsequent plans.
- **Success Criteria**: List covers key customers; reasonable reminder cadence; quantifiable results.
- **Exceptions & Risk Control**: Cadence conflicts merge with existing tasks; reduce noise for excessive reminders; key customer list requires approval.
- **Suggested Metrics**: Cadence execution rate, reminder response rate, key customer health.

### Sub-scenario D: Multi-member Follow-up Conflict Alert
- **Roles & Triggers**: When multiple colleagues simultaneously follow same customer, system alerts conflict and suggests information sharing.
- **Main Process**:
  1. System monitors task owner list on same customer.
  2. When detecting conflicts, pushes reminder suggesting sync meeting or designating primary owner.
  3. Supports creating shared workspace to centrally record communications and tasks.
  4. After conflict resolution, updates responsibility allocation table.
- **Success Criteria**: Accurate conflict identification; clear responsibility; improved team collaboration.
- **Exceptions & Risk Control**: Key customers allow multi-role collaboration need whitelist configuration; control conflict alert frequency; historical conflicts traceable.
- **Suggested Metrics**: Conflict alert count, conflict resolution time, shared log usage rate.

## Scenario-level Test Case Examples

> Test Preparation: Enable task center, IM bot, key customer cadence list, and conflict detection rules. Pre-configure 4-person sales team, 2 support, key customer tags, and task SLA.

### Test Case A-1: Task Assignment Priority Sorting (Positive)
- **Preconditions**: Owner Wang Qiang has 3 pending tasks; system priority strategy is Urgent → High → Medium.
- **Steps**:
  1. Sales manager creates new task "Call Customer A today" with urgent level.
  2. View Wang Qiang's to-do list sorting.
- **Expected Results**:
  - New task ranks first in to-do list marked in red.
  - Auto-creates reminder after 2 hours.
  - After completion, updates customer status to "Followed Up."

### Test Case B-1: IM @ Triggers Collaboration Card (Positive)
- **Preconditions**: IM bot connected; support Zhang Min online.
- **Steps**:
  1. Sales inputs in enterprise IM "@Support-Zhang Min help follow up with Customer B after-sales issue."
  2. View CRM collaboration board.
- **Expected Results**:
  - System auto-creates "Customer B After-sales Issue" collaboration card assigned to Zhang Min.
  - Card includes context link and expected completion time.
  - Zhang Min receives IM reminder, receipts "Completed" after handling.

### Test Case C-1: Key Customer Cadence List Publishing (Positive)
- **Preconditions**: Agent generates cadence list Monday midnight; customer "Hongda Group" rated as key customer.
- **Steps**:
  1. Login cadence panel to view this week's list.
  2. Execute recommended actions and provide feedback.
- **Expected Results**:
  - List shows Hongda Group's "Product Upgrade Communication" task and suggested scripts.
  - After task completion, status changes to "Completed," health score increased.
  - Unexecuted tasks reminded again on Wednesday.

### Test Case D-1: Multi-member Conflict Alert (Positive)
- **Preconditions**: Customer "Stellar Technology" simultaneously followed by sales Zhao and support Sun; conflict threshold set to 2+ people.
- **Steps**:
  1. Add Customer Success Manager Li to follow-up and create task.
- **Expected Results**:
  - System detects 3 people following simultaneously, pops conflict alert.
  - Suggests designating primary owner and creating shared workspace.
  - After conflict resolution, updates responsibility matrix.

### Test Case D-2: Conflict Alert Whitelist (Negative)
- **Preconditions**: Customer configured as "Key Collaboration" whitelist.
- **Steps**:
  1. Add tasks to multiple members again.
- **Expected Results**:
  - System no longer pops conflict alert, but marks as "Whitelisted Customer" in collaboration workspace.

---

## Related Resources

- Return to [Communication & Collaboration](../index.md)
- Continue to [Channel & Partner Collaboration](./channel-partner-collaboration/primary.md)
- [CRM Scenario Overview](/en/scenarios/meta/crm/)

