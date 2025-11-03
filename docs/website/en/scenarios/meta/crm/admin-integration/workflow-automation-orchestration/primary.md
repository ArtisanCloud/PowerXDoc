# Primary Use Case: Workflow & Automation Orchestration

## Background Overview

CRM needs to carry large cross-team processes like lead nurturing, approvals, reminders, and exception compensation. PowerX CRM's automation engine supports visual orchestration, rule management, monitoring, and compensation. This primary use case focuses on "Workflow & Automation Orchestration."

## Objectives & Value
- **Visual Orchestration**: Business users configure processes visually without coding.
- **Multi-system Integration**: Trigger actions in CRM, marketing, service, and external systems.
- **Exception Compensation**: Auto-retry or transfer to human when process fails.
- **Audit Control**: Process execution records and version management.
- **Efficiency Improvement**: Reduce manual operations and improve response speed.

## Participating Roles
- **Business Operations**: Designs processes and maintains strategies.
- **IT/Technical Team**: Provides advanced rules, monitoring, and governance.
- **Approver/Executor**: Handles manual tasks in processes.
- **System Agent**: Executes automation nodes and monitors status.

## Primary Scenario User Story
> **As a** business operations staff, **I want to** flexibly orchestrate automation processes in CRM, **so that** I can improve execution efficiency and reduce error rates.

## Sub-scenarios Detailed

### Sub-scenario A: Visual Process Design
- **Roles & Triggers**: Business operations configures follow-up reminder and task sync rules in visual orchestrator.
- **Main Process**:
  1. Drag nodes to build process (triggers, conditions, actions, waits).
  2. Set trigger conditions like new customer creation or opportunity stage changes.
  3. Add task sync, reminder, data writing actions.
  4. After testing, publish and record version.
- **Success Criteria**: Correct process configuration; easy to understand; rollback capable.
- **Exception & Risk Control**: Node conflict alerts; publish requires approval; version management.
- **Indicators**: Process launch time, error rate, version rollback count.

### Sub-scenario B: Journey Trigger Auto Actions
- **Roles & Triggers**: After new customer creation, auto-send welcome email, assign customer service, and attach training materials.
- **Main Process**:
  1. Trigger listens to customer profile creation event.
  2. Auto-send welcome email and material package.
  3. Create customer service follow-up task and assign responsible person.
  4. Record operation log in customer timeline.
- **Success Criteria**: Timely triggers; complete action execution; positive customer feedback.
- **Exception & Risk Control**: Email failure resend; task assignment conflicts; duplicate trigger filtering.
- **Indicators**: Process execution success rate, email delivery rate, task completion rate.

### Sub-scenario C: Approval List Generation & Execution
- **Roles & Triggers**: When opportunity stage enters "proposal confirmation", auto-generate approval list with required materials.
- **Main Process**:
  1. Process detects opportunity stage change; triggers approval list generation.
  2. Auto-create approval tasks (price approval, legal review).
  3. Attach required document list; remind responsible person to upload.
  4. After approval completion, process continues; record all actions.
- **Success Criteria**: Complete list; clear approval nodes; uninterrupted process.
- **Exception & Risk Control**: Material missing reminder; approval timeout escalation; human intervention logged.
- **Indicators**: Approval completion rate, timeout rate, human intervention ratio.

### Sub-scenario D: Failed Task Compensation & Human Reassignment
- **Roles & Triggers**: Failed automation tasks trigger retry or manual processing to ensure process closure.
- **Main Process**:
  1. When process execution fails, record error reasons.
  2. Auto-retry specified times; still fail then create manual task.
  3. After manual processing, continue or record process termination.
  4. Include failed cases in process optimization report.
- **Success Criteria**: Failures timely compensated; human reassignment clear; process closed-loop.
- **Exception & Risk Control**: Retry count limits; high-risk processes need extra approval; error classification statistics.
- **Indicators**: Failure rate, retry success rate, human intervention duration.

## Scenario-level Test Cases

> Test Preparation: Enable visual processes, triggers, task nodes, approval nodes, failure compensation, and version control. Prepare customer creation events, opportunity stage changes, approval list templates, and error injection tools.

### Use Case A-1: Process Design & Publishing (Positive)
- **Preconditions**: Process includes trigger "new customer", action "send welcome email + create customer service task".
- **Steps**:
  1. Drag nodes and configure parameters in orchestrator.
  2. Perform test run.
  3. Approve and publish.
- **Expected Results**:
  - After validation, process generates version V1.0; test run log has no errors.
  - After publishing, record publisher, time, and version number.

### Use Case B-1: Journey Auto Action Execution (Positive)
- **Preconditions**: Process published; new customer creation event triggered.
- **Steps**:
  1. Import new customer.
  2. Check if welcome email and customer service task generated.
- **Expected Results**:
  - Email sent instantly; customer timeline records "welcome email sent".
  - Customer service task created and assigned to responsible person; status is not started.
  - Operation log records trigger details.

### Use Case C-1: Auto-generate Approval List (Positive)
- **Preconditions**: Opportunity enters "proposal confirmation"; process configured to auto-generate approval tasks.
- **Steps**:
  1. Update opportunity stage to "proposal confirmation".
  2. Check approval task list.
- **Expected Results**:
  - Auto-create "price approval" and "legal review" tasks with required attachment list.
  - After approval, process continues executing; record approval chain.

### Use Case D-1: Failure Compensation & Human Reassignment (Negative)
- **Preconditions**: Process includes node calling external API; intentionally make API return error.
- **Steps**:
  1. Trigger process.
  2. Observe failed node handling.
- **Expected Results**:
  - Node tries 3 retries still fails; auto-create manual task "please manually execute API operation".
  - After manual completion, process marked as "success (human compensation)".
  - Failure cases written to process optimization report.

### Use Case D-2: Version Rollback (Positive)
- **Preconditions**: Published V1.1后发现 logic error.
- **Steps**:
  1. Select rollback to V1.0 in version management.
- **Expected Results**:
  - Process restored to V1.0; related running instances continue executing old version.
  - Rollback operation recorded in audit log.

---

## Related Resources

### Business Domain: [Admin & Integration](/en/scenarios/meta/crm/admin-integration/)
- [Access Control & Compliance](./access-control-compliance/primary.md) - Account and field permissions, data masking, and audit trails
- [Ecosystem & Data Synchronization](./ecosystem-data-synchronization/primary.md) - Bidirectional integration and governance with ERP/membership/customer service systems

### Other CRM Business Domains
- [Customer Management](/en/scenarios/meta/crm/customer-management/) - Customer lifecycle, segmentation, and lead management
- [Marketing Automation](/en/scenarios/meta/crm/marketing-automation/) - Lead nurturing, campaign orchestration, and conversion optimization
- [Sales Process](/en/scenarios/meta/crm/sales-process/) - Opportunity management, quoting, and sales activities
- [Customer Success](/en/scenarios/meta/crm/customer-success/) - Case management, service delivery, and renewal operations
- [Membership & Loyalty](/en/scenarios/meta/crm/membership-loyalty/) - Member tiers, points, and engagement
- [Analytics & Revenue Intelligence](/en/scenarios/meta/crm/analytics-revenue-intelligence/) - Sales forecasting, customer value analysis, and performance settlement

---
