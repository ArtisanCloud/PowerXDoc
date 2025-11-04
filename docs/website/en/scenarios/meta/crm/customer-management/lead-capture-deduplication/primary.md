# Primary Use Case: Lead Capture & Deduplication

## Background Overview

PowerX CRM needs to handle continuous inflows of leads from official websites, offline events, partner channels, and other sources. Without standardized ingestion and deduplication mechanisms, sales teams would be overwhelmed by duplicate information, and privacy compliance would be difficult to guarantee. This primary use case focuses on the entire "Lead Capture & Deduplication" pipeline, ensuring that leads complete format validation, duplicate detection, permission filtering, and automatic assignment the moment they enter the system, delivering high-value leads to appropriate sales personnel quickly.

## Objectives & Value
- **Omnichannel Ingestion**: Unify forms, imports, APIs and other methods into the same data pipeline, reducing the risk of lead omission.
- **High-precision Deduplication**: Multi-field matching through phone numbers, emails, and enterprise information to avoid duplicate sales follow-ups.
- **Compliance Protection**: Execute NDA and field authorization checks at the ingestion stage to ensure secure data transmission.
- **Smart Assignment**: Automatically assign leads based on region, industry, and priority immediately upon entering the system, improving response speed.
- **Auditability**: Complete records of lead sources, processing actions, and responsible parties for review and accountability.

## Participants
- **Marketing Operations Staff**: Design and maintain lead collection channels, event forms, and import templates.
- **Channel Partners**: Upload leads in batches through the partner portal and share opportunities with the enterprise.
- **Sales Managers**: Configure assignment rules and priorities according to business strategy.
- **Customer Privacy Compliance Team**: Develop sensitive field authorization policies and NDA verification rules.
- **Intelligent Agent / Automated Workflows**: Handle automatic tasks such as field identification, deduplication, assignment, and alerts.

## Primary Scenario User Story
> **As** a marketing and sales coordination team, **I want** leads from any channel to be accurately deduplicated and quickly assigned to the right sales representative, **so that** we can improve first response efficiency and reduce customer experience loss from duplicate follow-ups.

## Sub-scenario Details

### Sub-scenario A: Automatic Deduplication of Website Form Leads
- **Roles & Triggers**: After marketing collects leads through web forms, the system automatically validates duplicate phone numbers and merges records.
- **Main Process**:
  1. Customers submit leads on the official website form, including name, phone, email, company information, etc.
  2. The system calls the deduplication service in real-time to perform fuzzy matching on key fields (phone, email, company tax ID).
  3. If a duplicate lead is identified, the system merges historical records and appends the latest behavior tags; if it's a new lead, it creates a new profile.
  4. After successful ingestion, notifications are triggered and pushed to the matched sales manager or lead nurturing process.
- **Success Criteria**: Deduplication hit rate reaches set threshold; both new and old leads ingested within 1 minute; notifications delivered accurately.
- **Exceptions & Risk Control**: Missing fields automatically fallback to completion queue; duplicate determination conflicts require manual review; prevent malicious script injection.
- **Suggested Metrics**: Lead ingestion latency, duplicate lead ratio, manual review ratio, rejection/blacklist hit rate.

### Sub-scenario B: Business Card Recognition & Field Normalization from Offline Events
- **Roles & Triggers**: Agent automatically recognizes key fields from imported business card data at offline events and archives them to the follow-up pool.
- **Main Process**:
  1. The marketing team imports business card photos or Excel into CRM and selects corresponding event tags.
  2. Agent OCR recognizes business card information and matches with company name library, automatically completing industry, scale, and other attributes.
  3. System validates field formats (phone, email, position), non-compliant records return to manual correction queue.
  4. Processed leads are written to the event-specific pool for subsequent nurturing and assignment.
- **Success Criteria**: Recognition accuracy meets target; field formats unified; event tags completely associated.
- **Exceptions & Risk Control**: Fuzzy recognition fields require manual review; import failures provide error reports; prevent duplicate import of same file.
- **Suggested Metrics**: OCR recognition accuracy, manual correction ratio, event conversion tracking efficiency.

### Sub-scenario C: Confidentiality Verification for Partner-Uploaded Leads
- **Roles & Triggers**: Confidentiality agreement verification triggers when channel partners upload leads, unauthorized fields are masked.
- **Main Process**:
  1. Channel partners upload lead files through the partner portal and select sharing level.
  2. System loads field authorization matrix based on cooperation agreement, automatically determining which fields require masking.
  3. For partners who haven't signed NDAs, the system rejects leads containing sensitive fields and requires completion of the process.
  4. Compliant uploads are written to the shared pool and record partner information and benefit sharing terms.
- **Success Criteria**: All unauthorized fields are masked; compliant records completely logged; illegal uploads intercepted in time.
- **Exceptions & Risk Control**: Abnormal fields trigger alerts; partner account permission changes require real-time synchronization; generate monthly compliance reports.
- **Suggested Metrics**: Compliance interception rate, partner upload success rate, illegal upload response time.

### Sub-scenario D: Automatic Lead Assignment & Notification
- **Roles & Triggers**: Lead assignment strategy automatically matches responsible parties based on sales territory and industry, notifying personal task boxes.
- **Main Process**:
  1. System reads lead's region, industry, lead score and other attributes, matching with assignment rule engine.
  2. Automatically assign leads to best responsible party or fallback queue, setting processing SLA.
  3. New responsible party receives notification on desktop or mobile, system creates to-do tasks and follow-up suggestions.
  4. If no response within SLA, leads automatically escalate or reassign, while recording processing logs.
- **Success Criteria**: High assignment accuracy; timely notifications; leads receive initial response within SLA.
- **Exceptions & Risk Control**: Priority or round-robin strategy when rules conflict; automatic lead recovery for departed personnel; generate assignment fairness reports.
- **Suggested Metrics**: First response time, lead dispatch accuracy, SLA overdue rate, lead recovery ratio.

## Scenario-level Test Case Examples

> Test Preparation: Set up CRM sandbox, enable web forms, partner portal, OCR service, and lead deduplication engine. Pre-configure 3 historical leads (including duplicate phone/email), 1 offline event template, 2 channel partner accounts, configure East China/South China sales teams and automated assignment rules.

### Test Case A-1: Website Form Lead Automatic Deduplication (Positive)
- **Preconditions**: Historical lead database already has phone number 13800000001; web form enabled with required field validation.
- **Steps**:
  1. Fill website form with lead information using the same phone number as historical lead but different name.
  2. Submit form and observe deduplication engine processing results.
  3. Login to CRM to verify lead profile.
- **Expected Results**:
  - System determines as duplicate lead, merges historical records and appends "Website Second Submission" tag.
  - No new lead ID created, timeline adds one visit behavior.
  - Sales manager receives second submission notification, no need for additional welcome call in to-do list.

### Test Case B-1: Offline Event Business Card OCR Recognition (Positive)
- **Preconditions**: Event "2025 Spring Summit" enabled; OCR service available.
- **Steps**:
  1. Upload 10 business card photos through event import interface.
  2. Verify name/title/phone recognition results in import preview.
  3. Complete import and view event lead pool.
- **Expected Results**:
  - OCR recognition success rate ≥ 80%, abnormal fields marked in yellow for manual confirmation.
  - After correction and save, written to event lead pool with "2025 Spring Summit" tag.
  - System automatically generates import report listing fields requiring manual input.

### Test Case C-1: Channel Partner Sensitive Field Interception (Negative)
- **Preconditions**: Channel partner "South China Agent" hasn't signed NDA; account has upload permission.
- **Steps**:
  1. Partner uploads Excel containing customer business license numbers and contract amounts.
  2. After submission, view upload results and system alerts.
- **Expected Results**:
  - System rejects import, prompts "Please sign NDA before uploading sensitive fields".
  - Import record status is "Intercepted", log records triggered compliance policy number.
  - Administrator receives compliance alert notification, can guide partner to complete process.

### Test Case D-1: Lead Smart Assignment SLA Monitoring (Positive)
- **Preconditions**: East China sales "Zhang San" available; SLA set to first response within 2 hours.
- **Steps**:
  1. Import 5 high-score leads from Shanghai.
  2. Observe smart assignment results and Zhang San's to-do list.
  3. If no response after 2 hours, verify escalation strategy.
- **Expected Results**:
  - Leads automatically assigned to Zhang San, creating "First Contact" task with deadline 2 hours after creation.
  - If Zhang San responds "Contacted" within SLA, task auto-completes.
  - If timeout without processing, lead status marks "Pending Escalation", automatically reassigns to supervisor and records escalation reason.

### Test Case D-2: Departed Personnel Lead Automatic Recovery (Negative)
- **Preconditions**: Sales "Li Si" marked as departed in system; still has 3 leads assigned.
- **Steps**:
  1. Trigger assignment engine refresh task (manual or scheduled).
  2. View lead assignment results and notifications.
- **Expected Results**:
  - System detects departure status, automatically recovers leads to public lead pool.
  - Triggers engine to reassign to available sales in same region, preserving original follow-up logs.
  - HR or sales manager receives recovery confirmation notification to avoid lead loss.

---

## Related Resources

- Return to [Customer & Lead Management](../index.md)
- Continue to [Customer Profile & Segmentation](./customer-profile-segmentation/primary.md)
- [CRM Scenario Overview](/en/scenarios/meta/crm/)

