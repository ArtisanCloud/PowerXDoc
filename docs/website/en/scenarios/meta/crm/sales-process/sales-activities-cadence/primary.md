# Primary Use Case: Sales Activities & Cadence

## Background Overview

Sales teams need to execute a series of rhythm-based activities around opportunities, including visits, calls, demos, and internal collaboration. Without cadence management, issues like scheduling conflicts, disorganized follow-ups, and inactive activities can easily occur. This primary use case focuses on "Sales Activities & Cadence," ensuring stable and efficient sales rhythms through intelligent scheduling, mobile capture, collaboration tasks, and activity alerts.

## Objectives & Value
- **Intelligent Schedule Planning**: Automatically identify conflicts, optimize visit routes and time arrangements.
- **Mobile Recording Closed Loop**: Record visit notes anytime, real-time data sync and sharing.
- **Multi-department Collaboration**: Automatically decompose tasks at key nodes, promoting team collaboration.
- **Activity Information Transparency**: Present promotional policies and available discounts instantly, reducing information gaps.
- **Cadence Visualization**: Provide cadence boards to assess plan execution.

## Participants
- **Sales Representatives**: Create visit plans, execute activities, and record results.
- **Sales Managers**: Review key activities, monitor cadence execution quality.
- **Solution/Pre-sales/Product Teams**: Participate in collaboration tasks at critical stages.
- **Marketing Team**: Provide activity policies and discount resources.
- **System Agent**: Responsible for conflict detection, reminders, and log synchronization.

## Primary Scenario User Story
> **As** a sales representative, **I want** CRM to help me automatically arrange visit cadence and sync activity information, **so that** I can maintain efficient follow-ups and team collaboration.

## Sub-scenario Details

### Sub-scenario A: Visit Plan Conflict Detection
- **Roles & Triggers**: When sales creates visit plans, system automatically detects schedule conflicts and suggests alternative times.
- **Main Process**:
  1. Sales creates customer visit plan in schedule, selecting time slot, location, and participants.
  2. System compares with personal calendar and collaborative meeting schedules, identifying time conflicts or locations too far.
  3. If conflicts found, provides feasible alternative times or online video meeting solutions.
  4. After confirmation, auto-generates tasks and notifies relevant personnel.
- **Success Criteria**: Accurate conflict identification; actionable suggestions; synchronized schedule updates.
- **Exceptions & Risk Control**: Auto-sync in offline mode; cross-team conflicts require approval; sensitive schedule permission isolation.
- **Suggested Metrics**: Conflict identification rate, rescheduling time, visit punctuality rate.

### Sub-scenario B: Mobile Visit Summary Sync
- **Roles & Triggers**: Responsible party records visit notes on mobile, system automatically syncs to team shared logs.
- **Main Process**:
  1. After visit completion, sales opens visit record form on mobile.
  2. Uses speech-to-text or template input to summarize requirements, concerns, next actions.
  3. System auto-syncs to opportunity/customer logs, pushing to related teams.
  4. Summary supports attachment uploads (business cards, photos) and triggers subsequent tasks.
- **Success Criteria**: Timely recording; accurate sync; team can quickly view.
- **Exceptions & Risk Control**: Offline cache; sensitive attachments encrypted; duplicate uploads merged.
- **Suggested Metrics**: Summary coverage rate, sync latency, team read rate.

### Sub-scenario C: Multi-department Collaboration Task Breakdown
- **Roles & Triggers**: When critical stages require multi-department collaboration, system generates task breakdown and tracks execution results.
- **Main Process**:
  1. When opportunity enters "Solution Review" stage, system automatically identifies need for pre-sales and product participation.
  2. Generates collaboration task list, assigning owners, deadlines, and deliverables.
  3. Task status and comments sync in real-time, supporting @ functionality and file sharing.
  4. After stage completion, system automatically archives collaboration records for review.
- **Success Criteria**: Timely collaboration task creation; clear owners and deadlines; high completion rate.
- **Exceptions & Risk Control**: Task overdue reminders to manager; auto-reassignment when owner changes; sensitive data permission control.
- **Suggested Metrics**: Collaboration task on-time rate, cross-department participation, review feedback quality.

### Sub-scenario D: Promotional Activities & Discount Alerts
- **Roles & Triggers**: When promotional activities start, opportunity interface displays activity policies and available discount limits in real-time.
- **Main Process**:
  1. Marketing team publishes activity policies in CRM, marking applicable industries, products, and time periods.
  2. Opportunity page auto-loads related activities, showing discount caps and benefit descriptions.
  3. When sales clicks "Apply Discount," system validates benefits and pre-fills approval forms.
  4. After activity ends, automatically hides or marks as archived, retaining historical records.
- **Success Criteria**: Real-time activity updates; smooth discount application process; traceable history.
- **Exceptions & Risk Control**: Expired activities automatically invalidated; duplicate application restrictions; discount quota monitoring.
- **Suggested Metrics**: Activity matching accuracy, discount application approval rate, activity conversion gains.

## Scenario-level Test Case Examples

> Test Preparation: Enable calendar integration, mobile app, collaboration tasks, and activity policy center. Pre-configure 3 sales representatives, pre-sales/product team members, and upcoming promotional activity configuration.

### Test Case A-1: Visit Schedule Conflict Detection (Positive)
- **Preconditions**: Sales Zhang San has internal meeting at 14:00; CRM synchronized with enterprise calendar.
- **Steps**:
  1. Zhang San tries to create 14:00-15:00 customer visit.
- **Expected Results**:
  - System prompts "Conflicts with internal meeting," recommends feasible time slots.
  - Can one-click change to online meeting and sync invitation to customer.
  - After update, schedule written to both CRM and enterprise calendar.

### Test Case B-1: Mobile Visit Summary Sync (Positive)
- **Preconditions**: Mobile app login normal; speech-to-text service available.
- **Steps**:
  1. After visit, Zhang San opens app and records summary by voice.
  2. After submission, view team shared log.
- **Expected Results**:
  - Voice real-time transcribed to text, automatically extracting requirements and key contacts.
  - Summary pushed to opportunity collaborators with next-step suggestions.
  - Related tasks (e.g., "Send Product Proposal") auto-generated.

### Test Case C-1: Solution Review Collaboration Tasks (Positive)
- **Preconditions**: Opportunity enters "Solution Review" stage; collaboration template includes pre-sales, product, legal.
- **Steps**:
  1. Update opportunity stage, observe task generation.
  2. View execution on task board.
- **Expected Results**:
  - System auto-creates 3 tasks and assigns to corresponding roles.
  - Tasks not completed on time reminded 1 hour before SLA.
  - After task completion, automatically archives review records for review.

### Test Case D-1: Activity Discount Alert & Application (Positive)
- **Preconditions**: Marketing activity "Spring Promotion" applicable to opportunity product line; discount cap 15%.
- **Steps**:
  1. Open opportunity page, view activity alert.
  2. Click "Apply Discount," input 10%.
- **Expected Results**:
  - Activity popup displays policy summary, validity period, and available discount quota.
  - After applying 10% discount, auto-recorded and generates approval form (if required).
  - After activity ends, prompts "Expired," cannot apply further.

### Test Case D-2: Insufficient Discount Quota Warning (Negative)
- **Preconditions**: Activity remaining quota only supports 5% discount.
- **Steps**:
  1. Apply 10% discount again.
- **Expected Results**:
  - System prompts "Activity quota insufficient, maximum 5% can be applied."
  - Can choose to adjust application or switch to alternative policy.

---

## Related Resources

- Return to [Sales Pipeline & Opportunity](../index.md)
- Continue to [Opportunity Creation & Progression](./opportunity-creation-progression/primary.md)
- [CRM Scenario Overview](/en/scenarios/meta/crm/)

