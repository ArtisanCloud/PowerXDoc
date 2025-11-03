# Primary Use Case: Access Control & Compliance

## Background Overview

CRM involves large volumes of customer privacy and business secrets, requiring strict access control and compliance. PowerX CRM combines role-based permissions, data masking, access auditing, and API security policies to ensure data security. This primary use case focuses on "Access Control & Compliance."

## Objectives & Value
- **Fine-grained Permissions**: Control access scope by role, department, and field.
- **Temporary Access**: Support external consultant short-term access with auto-expiration.
- **Data Masking**: Mask sensitive fields per policy to reduce leakage risk.
- **Audit Trail**: All access and export operations trackable.
- **API Security**: Token management and anomaly detection to prevent abuse.

## Participating Roles
- **System Administrator**: Configures permission models and approves access requests.
- **Security/Compliance Team**: Develops strategies and audits logs.
- **Business Owner**: Applies for temporary or special access.
- **External Consultant/Partner**: Restricted access to customer data.
- **System Agent**: Executes strategies and monitors anomalies.

## Primary Scenario User Story
> **As a** system administrator, **I want** fine-grained control of CRM data access with compliance auditing, **so that** I can ensure data security and business continuity.

## Sub-scenarios Detailed

### Sub-scenario A: Temporary Account & Access Control
- **Roles & Triggers**: Admin creates temporary account for external consultant, limiting access fields and validity period.
- **Main Process**:
  1. Business owner submits access application explaining target data and duration.
  2. Admin creates temporary account, configures role and field permissions.
  3. System auto-sets expiration time; disables after expiry.
  4. All access recorded in audit log.
- **Success Criteria**: Account expires on time; access scope controlled; complete logs.
- **Exception & Risk Control**: Early revocation; violation access alerts; approval flow configuration.
- **Indicators**: Temporary account count, on-time disable rate, violation access count.

### Sub-scenario B: Sensitive Data Masking Display
- **Roles & Triggers**: Sensitive customer data export requires dual review; system auto-records audit logs.
- **Main Process**:
  1. User requests to view or export sensitive fields (phone, contract amount, etc.).
  2. System shows masked data per role; full data requires approval.
  3. Export requires dual review; add watermark and purpose description after approval.
  4. Audit log records operator, time, and data scope.
- **Success Criteria**: Masking policy effective; approval mandatory; complete logs.
- **Exception & Risk Control**: Approval timeout auto-reject; export failure alerts; watermark leak prevention.
- **Indicators**: Masking coverage, export approval pass rate, audit compliance rate.

### Sub-scenario C: Permission Change Audit
- **Roles & Triggers**: Contract fields involving personal privacy auto-mask; only authorized roles can view originals.
- **Main Process**:
  1. Permission change requires change order with reason.
  2. After change takes effect, sync to audit system; generate audit event.
  3. Regularly export permission change reports for security team review.
  4. Can quickly rollback when finding abnormal permissions.
- **Success Criteria**: Change trackable; anomaly quickly locatable; safe rollback.
- **Exception & Risk Control**: Change conflict alerts; batch changes require approval; unauthorized changes auto-blocked.
- **Indicators**: Permission change count, anomaly rollback rate, audit coverage.

### Sub-scenario D: API Call Monitoring & Blocking
- **Roles & Triggers**: System detects abnormal API calls; triggers security strategy and blocks suspicious tokens.
- **Main Process**:
  1. Real-time monitor API request frequency, source, and parameters.
  2. Abnormal patterns (brute force, illegal parameters) trigger alerts.
  3. Auto-block token or limit rate; notify admin.
  4. After handling, can unblock or replace token.
- **Success Criteria**: Accurate anomaly detection; timely response; normal calls unaffected.
- **Exception & Risk Control**: Whitelist strategy; false block appeal; security strategy version management.
- **Indicators**: Anomaly intercept count, false positive rate, block handling time.

## Scenario-level Test Cases

> Test Preparation: Enable account management, permission strategy, masking control, approval flow, and API security monitoring. Prepare external consultant account, sensitive field configuration, dual approval template, and API calling scripts.

### Use Case A-1: Temporary Account Auto-expiration (Positive)
- **Preconditions**: Create temporary account for consultant "Zhang Hua", valid for 3 days, can only access customer list fields.
- **Steps**:
  1. Create temporary account and verify login.
  2. Advance system time by 3 days and try login.
- **Expected Results**:
  - Creation logs record account, permissions, and expiration time.
  - After expiry, account auto-expires; login提示"account expired".
  - Audit log shows auto-disable action.

### Use Case B-1: Sensitive Data Masking Export Approval (Positive)
- **Preconditions**: Export customer list requires dual approval; fields include phone number.
- **Steps**:
  1. User submits export application.
  2. Two approvers complete approval.
  3. Download exported file.
- **Expected Results**:
  - Before approval, cannot download; status is "pending approval".
  - After approval, file generated; phone shows as "138****0001".
  - Export watermark includes operator, time, and purpose.

### Use Case C-1: Permission Change Audit (Positive)
- **Preconditions**: Admin adjusts sales role to add "view contract amount" permission.
- **Steps**:
  1. Submit permission change order and approve.
  2. After approval, check audit report.
- **Expected Results**:
  - Change order records new permission, operator, and approval chain.
  - Audit report generates comparison: new field access permission.
  - Can one-click rollback to pre-change version.

### Use Case D-1: API Anomaly Interception (Negative)
- **Preconditions**: API Token A configured for normal calls; anomaly threshold is 100 calls per minute.
- **Steps**:
  1. Use script to call API at high frequency (200 per minute).
- **Expected Results**:
  - After 30th call, triggers rate limiting; returns error code 429.
  - System blocks Token A and notifies admin.
  - Audit log records source IP, call path, and block duration.

### Use Case D-2: False Block Appeal (Positive)
- **Preconditions**: Admin confirms call is legitimate test.
- **Steps**:
  1. Submit unblock application in security console.
  2. Approve and restore token.
- **Expected Results**:
  - Token status changes to "unblocked"; restore calling permissions.
  - Unblock operation logged with required notes.

---

## Related Resources

### Business Domain: [Admin & Integration](/en/scenarios/meta/crm/admin-integration/)
- [Workflow & Automation Orchestration](./workflow-automation-orchestration/primary.md) - Visual workflow design, monitoring, and exception compensation
- [Ecosystem & Data Synchronization](./ecosystem-data-synchronization/primary.md) - Bidirectional integration and governance with ERP/membership/customer service systems

### Other CRM Business Domains
- [Customer Management](/en/scenarios/meta/crm/customer-management/) - Customer lifecycle, segmentation, and lead management
- [Marketing Automation](/en/scenarios/meta/crm/marketing-automation/) - Lead nurturing, campaign orchestration, and conversion optimization
- [Sales Process](/en/scenarios/meta/crm/sales-process/) - Opportunity management, quoting, and sales activities
- [Customer Success](/en/scenarios/meta/crm/customer-success/) - Case management, service delivery, and renewal operations
- [Membership & Loyalty](/en/scenarios/meta/crm/membership-loyalty/) - Member tiers, points, and engagement
- [Analytics & Revenue Intelligence](/en/scenarios/meta/crm/analytics-revenue-intelligence/) - Sales forecasting, customer value analysis, and performance settlement

---
