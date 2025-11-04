# Primary Use Case: Ecosystem & Data Synchronization

## Background Overview

CRM needs data exchange with marketing, ERP, customer service, and other systems to ensure customer information, orders, tickets, etc. are consistent. PowerX CRM provides event bus, API gateway, sync monitoring, and compensation mechanisms. This primary use case focuses on "Ecosystem & Data Synchronization."

## Objectives & Value
- **Unified Tagging**: CRM shares customer tags with marketing automation platforms.
- **Business Collaboration**: Contract collections, ticket status, etc. sync in real-time across systems.
- **Monitoring Compensation**: Sync exceptions auto-retry or compensate.
- **Governance Capability**: Provide latency monitoring, failure alerts, and auditing.
- **Scalability**: Open APIs support various business integrations.

## Participating Roles
- **System Integration Engineer**: Configures interfaces and monitors sync.
- **Business Operations**: Focuses on data consistency.
- **Finance/Customer Service Teams**: Rely on cross-system data.
- **System Agent**: Executes sync tasks and alerts.

## Primary Scenario User Story
> **As an** integration engineer, **I want** CRM to maintain data consistency with other systems and monitor anomalies, **so that** I can support cross-system business collaboration.

## Sub-scenarios Detailed

### Sub-scenario A: Tag Sync to Marketing Platform
- **Roles & Triggers**: CRM and marketing automation platform sync tags to ensure segmentation strategy consistency.
- **Main Process**:
  1. Define tag mapping and sync frequency.
  2. Trigger incremental sync; push new/changed tags to marketing platform.
  3. Verify feedback results; record success/failure details.
  4. Auto-retry and alert on sync failure.
- **Success Criteria**: Consistent tags; low latency; failure traceable.
- **Exception & Risk Control**: Conflict tag handling; permission validation; sync frequency control.
- **Indicators**: Sync success rate, latency, retry count.

### Sub-scenario B: Contract Collection Progress Write-back
- **Roles & Triggers**: After ERP integration, contract collection progress written back to opportunity in real-time.
- **Main Process**:
  1. After ERP updates collection record, push event to CRM.
  2. CRM matches contract and collection stage; update opportunity and customer balance.
  3. Trigger reminders to sales and finance to confirm invoice or service delivery.
  4. Record sync for collection anomalies (refunds) and trigger risk control.
- **Success Criteria**: Accurate collection info; timely reminders; anomalies trackable.
- **Exception & Risk Control**: Matching failure requires manual review; duplicate event deduplication; sensitive data encryption.
- **Indicators**: Collection sync timeliness, anomaly handling time, data accuracy rate.

### Sub-scenario C: Customer Service Ticket Status Sync
- **Roles & Triggers**: When integrating with customer service system, sync ticket status and customer satisfaction metrics.
- **Main Process**:
  1. When customer service system ticket status changes, push to CRM.
  2. CRM updates customer profile and health score.
  3. Trigger related automation (recovery tasks, renewal reminders).
  4. Satisfaction feedback sync to CRM for analysis.
- **Success Criteria**: Real-time status sync; health score updates; action closed-loop.
- **Exception & Risk Control**: Duplicate event filtering; sync failure retry; permission control.
- **Indicators**: Sync latency, health score update frequency, action success rate.

### Sub-scenario D: API Gateway Monitoring & Compensation
- **Roles & Triggers**: API gateway monitors data sync latency and provides retry and compensation mechanisms.
- **Main Process**:
  1. Gateway records response time and result for each sync.
  2. Trigger alert when exceeding threshold or failing; call compensation process.
  3. Compensation process resends requests or rolls back operations.
  4. Generate monitoring report for team review.
- **Success Criteria**: Timely alerts; successful compensation; latency convergence.
- **Exception & Risk Control**: Duplicate compensation limits; sensitive data masking; monitoring metric version management.
- **Indicators**: Alert count, compensation success rate, average latency.

## Scenario-level Test Cases

> Test Preparation: Enable tag sync tasks, ERP collection interface, customer service system integration, API gateway monitoring, and compensation processes. Prepare simulated marketing platform, ERP sandbox, customer service system, and latency injection tools.

### Use Case A-1: Tag Sync Verification (Positive)
- **Preconditions**: CRM has 20 recently updated tags "high-value prospects"; marketing platform subscribes to tag events.
- **Steps**:
  1. Start tag incremental sync task.
  2. Check audience list in marketing platform.
- **Expected Results**:
  - 20 tags sync completed within 5 minutes with status "success".
  - If any fail, provide retry button and record error reason.
  - Sync logs queryable by time and object.

### Use Case B-1: Collection Progress Write-back (Positive)
- **Preconditions**: ERP records order #5001 collection 50%; CRM associated opportunity pending update.
- **Steps**:
  1. Trigger ERP→CRM collection event.
  2. Check opportunity and customer balance.
- **Expected Results**:
  - Opportunity collection progress updates to 50%; billing status syncs accordingly.
  - Sales and finance receive reminder "please confirm subsequent invoice".
  - When anomaly (amount mismatch), mark as "needs verification".

### Use Case C-1: Customer Service Ticket Status Sync (Positive)
- **Preconditions**: Customer service system ticket #A100 changes from "processing" to "resolved" with satisfaction score 5.
- **Steps**:
  1. Update status in customer service system.
  2. Check CRM customer profile.
- **Expected Results**:
  - CRM ticket record syncs update; satisfaction written to customer profile and affects health score.
  - If status is "negative", trigger customer success review task.

### Use Case D-1: API Latency Alert & Compensation (Negative)
- **Preconditions**: API gateway threshold is 3 seconds; intentionally inject 10 seconds latency.
- **Steps**:
  1. Execute sync request.
  2. Observe monitoring and compensation process.
- **Expected Results**:
  - Gateway triggers alert and records latency when exceeding threshold.
  - Auto-execute compensation retry; still fail then generate ticket.
  - Monitoring report shows latency trend for review.

### Use Case D-2: Compensation Failure Escalation (Negative)
- **Preconditions**: Compensation retry 3 times still fails.
- **Steps**:
  1. Continuously produce failed responses.
- **Expected Results**:
  - System escalates to "severe alert"; notifies integration engineer and business owner.
  - Data sync paused; wait for manual confirmation.
  - After lift, can replay failed event queue.

---

## Related Resources

### Business Domain: [Admin & Integration](/en/scenarios/meta/crm/admin-integration/)
- [Access Control & Compliance](./access-control-compliance/primary.md) - Account and field permissions, data masking, and audit trails
- [Workflow & Automation Orchestration](./workflow-automation-orchestration/primary.md) - Visual workflow design, monitoring, and exception compensation

### Other CRM Business Domains
- [Customer Management](/en/scenarios/meta/crm/customer-management/) - Customer lifecycle, segmentation, and lead management
- [Marketing Automation](/en/scenarios/meta/crm/marketing-automation/) - Lead nurturing, campaign orchestration, and conversion optimization
- [Sales Process](/en/scenarios/meta/crm/sales-process/) - Opportunity management, quoting, and sales activities
- [Customer Success](/en/scenarios/meta/crm/customer-success/) - Case management, service delivery, and renewal operations
- [Membership & Loyalty](/en/scenarios/meta/crm/membership-loyalty/) - Member tiers, points, and engagement
- [Analytics & Revenue Intelligence](/en/scenarios/meta/crm/analytics-revenue-intelligence/) - Sales forecasting, customer value analysis, and performance settlement

---
