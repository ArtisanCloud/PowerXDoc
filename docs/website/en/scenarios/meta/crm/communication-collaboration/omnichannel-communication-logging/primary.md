# Primary Use Case: Omnichannel Communication Logging

## Background Overview

Customer communications are scattered across multiple channels including phone calls, emails, meetings, and instant messages. Without unified records, teams cannot obtain complete context. This primary use case focuses on "Omnichannel Communication Logging," using automatic capture, intelligent transcription, and structured archiving to enable sales, support, and customer success teams to master communication history in a unified view.

## Objectives & Value
- **Channel Unification**: Automatically aggregate phone calls, emails, meeting notes, etc. to customer profiles.
- **Intelligent Transcription**: Voice-to-text, email parsing, auto-generation of meeting summaries.
- **Context Sharing**: Team members view latest communication updates, avoiding repetitive inquiries.
- **Task Linkage**: To-dos mentioned in communications automatically generate tasks.
- **Compliance Audit**: Traceable communication records, meeting audit and training needs.

## Participants
- **Sales/Support/Customer Success**: Communicate with customers and review historical records.
- **Marketing Team**: Focus on marketing email feedback and engagement performance.
- **Management**: Review key communications and guide messaging and strategy.
- **System Agent**: Responsible for capture, transcription, archiving, and task triggering.

## Primary Scenario User Story
> **As** a Customer Success Manager, **I want** CRM to automatically log customer communications and generate key point summaries, **so that** team collaboration and service continuity are ensured.

## Sub-scenario Details

### Sub-scenario A: Call Recording Transcription & Summary
- **Roles & Triggers**: Phone calls are automatically recorded and transcribed; system extracts key intent information and attaches to customer profiles.
- **Main Process**:
  1. After call ends, recording automatically uploads to transcription service.
  2. System generates transcript and key entities (requirements, pain points, competitors, etc.).
  3. Summary and keywords auto-written to customer profile communication timeline.
  4. Relevant responsible parties receive summary to quickly understand call highlights.
- **Success Criteria**: Accurate transcription; readable summary; timely customer profile attachment.
- **Exceptions & Risk Control**: Poor audio quality triggers manual review; sensitive term monitoring; recording permission control.
- **Suggested Metrics**: Transcription accuracy, summary read rate, task triggering rate.

### Sub-scenario B: Email Thread Auto-ingestion
- **Roles & Triggers**: Email threads sync via plugin; important unreplied emails trigger SLA alerts.
- **Main Process**:
  1. Employees enable email plugin to sync email threads to CRM.
  2. System identifies sender/recipient and links to customers and opportunities.
  3. When high-priority emails detected unreplied within SLA, sends reminders.
  4. Reply emails automatically update status, forming complete conversation records.
- **Success Criteria**: Accurate email sync; timely SLA reminders; searchable history.
- **Exceptions & Risk Control**: Duplicate sync merges; attachment virus detection; respect external customer unsubscribe preferences.
- **Suggested Metrics**: Email linkage rate, SLA timeout rate, reply time.

### Sub-scenario C: Visit Notes Voice Dictation
- **Roles & Triggers**: Sales visit notes support voice dictation; system auto-generates structured summaries and shares with team.
- **Main Process**:
  1. After visit, sales uses mobile voice input for notes.
  2. System transcribes and extracts key fields (requirements, decision makers, next steps).
  3. Generates structured summary, pushes to team with follow-up task suggestions.
  4. Summary supports comments and supplements, forming shared knowledge.
- **Success Criteria**: Accurate structured transcription; team quick access; task closed loop.
- **Exceptions & Risk Control**: Offline caching; sensitive info masking; access permission control.
- **Suggested Metrics**: Summary coverage rate, team read rate, task execution rate.

### Sub-scenario D: Meeting Summary Todo Automation
- **Roles & Triggers**: Todos in meeting summaries automatically generate tasks, assigned to corresponding members and tracking status.
- **Main Process**:
  1. After meeting ends, system identifies todos in summary (who, what, due date).
  2. Auto-generates tasks and assigns to relevant personnel, writing to collaboration board.
  3. When task status updates, syncs back to meeting summary, maintaining closed loop.
  4. Overdue tasks trigger reminders and feedback to responsible parties.
- **Success Criteria**: Accurate task generation; complete execution tracking; summary and task synchronized.
- **Exceptions & Risk Control**: Task assignment conflicts; sensitive meetings require authorization; overdue escalation mechanism.
- **Suggested Metrics**: Task generation accuracy, on-time completion rate, overdue escalation handling time.

## Scenario-level Test Case Examples

> Test Preparation: Enable call recording transcription, email plugins, mobile visit records, and meeting summary task sync. Prepare test accounts: 2 sales, 1 support, 1 customer success; configure SLA alerts and sensitive term monitoring.

### Test Case A-1: Call Recording Auto-transcription (Positive)
- **Preconditions**: CTI and transcription service connected; 5-minute phone call.
- **Steps**:
  1. Sales calls customer and ends call.
  2. View call record and transcription results.
- **Expected Results**:
  - Transcript generated within 1 minute with key intent words bolded.
  - Summary auto-archived to customer communication timeline and pushed to relevant members.
  - If sensitive terms detected, system marks "Requires Review."

### Test Case B-1: Email Thread Sync & SLA Alert (Positive)
- **Preconditions**: Outlook/Gmail plugin enabled; SLA set to 24-hour response.
- **Steps**:
  1. Customer sends high-priority email, sales doesn't respond within 24 hours.
  2. Check email status in CRM.
- **Expected Results**:
  - Email real-time synced to opportunity record and marked "Reply Required."
  - After 24 hours, automatically triggers SLA alert notification to sales and manager.
  - After reply, status changes to "Replied," recording conversation thread.

### Test Case C-1: Visit Notes Voice Dictation (Positive)
- **Preconditions**: Mobile voice input available; template configured.
- **Steps**:
  1. After sales visit, submit notes by voice.
  2. View team shared log.
- **Expected Results**:
  - Voice converted to structured summary including requirements, risks, next actions.
  - Auto-creates task for product team "Prepare Solution."
  - Summary supports team comments and attachment supplements.

### Test Case D-1: Meeting Summary Todo Generation (Positive)
- **Preconditions**: Meeting record contains "Zhang San responsible for submitting quote."
- **Steps**:
  1. Upload meeting summary document.
  2. System parses and generates todos.
- **Expected Results**:
  - Auto-creates "Submit Quote" task assigned to Zhang San with auto-calculated deadline.
  - Task status stays synchronized with meeting summary updates.
  - Overdue auto-reminds and escalates to project manager.

### Test Case D-2: Sensitive Meeting Permission Restriction (Negative)
- **Preconditions**: Meeting marked "Core Team Only Visible."
- **Steps**:
  1. Unauthorized member tries to view summary and tasks.
- **Expected Results**:
  - System denies access and prompts "You don't have permission to view this summary."
  - Audit log records access attempt.

---

## Related Resources

- Return to [Communication & Collaboration](../index.md)
- Continue to [Task & Cadence Collaboration](./task-cadence-collaboration/primary.md)
- [CRM Scenario Overview](/en/scenarios/meta/crm/)

