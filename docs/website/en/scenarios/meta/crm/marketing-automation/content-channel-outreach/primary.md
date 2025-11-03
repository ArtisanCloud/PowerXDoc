# Primary Use Case: Content & Channel Outreach

## Background Overview

Efficient marketing automation relies on multi-channel content collaboration. PowerX CRM supports template management, content reuse, and channel scheduling to help operations teams maintain brand consistency while achieving multi-language, multi-region outreach. This primary use case focuses on "Content & Channel Outreach" to cover email, social media, SMS, and other channel operations.

## Objectives & Value
- **Template Reuse**: Unified content assets to reduce production costs.
- **Multi-language Management**: Support translation, proofreading, and multi-region publishing.
- **Channel Scheduling**: Automatic scheduling and publishing per channel rules.
- **Compliance Logging**: Full audit trail for approval, publishing, and review.
- **Data Loop**: Collect interaction data from all channels for optimization.

## Participating Roles
- **Content Team**: Writes templates and manages assets.
- **Marketing Operations**: Schedules, publishes, and monitors effects.
- **Compliance Team**: Reviews content for brand and regulatory compliance.
- **System Agent**: Schedules channels, collects data, and pushes alerts.

## Primary Scenario User Story
> **As a** marketing content operations, **I want to** uniformly manage multi-channel content publishing in CRM, **so that** I can maintain brand consistency and improve outreach efficiency.

## Sub-scenarios Detailed

### Sub-scenario A: Template Management & Multi-language Versions
- **Roles & Triggers**: Marketing staff create email templates and reuse dynamic content blocks; system auto-manages multi-language versions.
- **Main Process**:
  1. Create master template in content library with configurable variables and dynamic blocks.
  2. System auto-generates multi-language copies supporting translation workflow and review.
  3. After template passes compliance approval, publish to marketing campaigns.
  4. Template updates remind to sync related campaigns.
- **Success Criteria**: Centralized template management; synchronized multi-language versions; timely approval.
- **Exception & Risk Control**: Unapproved templates forbidden to publish; version conflict alerts; sensitive word detection.
- **Indicators**: Template reuse rate, translation cycle, approval pass rate.

### Sub-scenario B: Social Media Scheduling & Data Collection
- **Roles & Triggers**: After social media plan scheduling, system auto-publishes per platform rules and collects interaction data.
- **Main Process**:
  1. Select target platforms (LinkedIn, Weibo, etc.), set publish time and content.
  2. System checks character count, images, topics per platform rules.
  3. Auto-publish at scheduled time; record exposure, interaction, click data.
  4. Data written back to campaign dashboard for analysis and optimization.
- **Success Criteria**: Accurate scheduling; successful publishing; complete data.
- **Exception & Risk Control**: Platform API exception auto-retry; sensitive topic alerts; permission control.
- **Indicators**: Publish success rate, interaction rate, scheduling conflict rate.

### Sub-scenario C: Unified SMS/Push Outreach
- **Roles & Triggers**: SMS/push and other channels uniformly called by automation engine ensuring rhythm and content consistency.
- **Main Process**:
  1. Configure SMS/push nodes in journey specifying template and variables.
  2. System calls SMS gateway or push service to send messages.
  3. Record delivery, click, unsubscribe status; associate with user profile.
  4. Control frequency to avoid multiple messages to same user in short time.
- **Success Criteria**: High send success rate; controlled frequency; compliant unsubscribe.
- **Exception & Risk Control**: Gateway failure auto-switch to backup channel; real-time unsubscribe list sync; message content review.
- **Indicators**: Delivery rate, click rate, unsubscribe rate, frequency violations.

### Sub-scenario D: Content Approval & Publishing Tracking
- **Roles & Triggers**: After content material approval, system updates brand asset library and retains audit trail.
- **Main Process**:
  1. Content submitted for approval; compliance team annotates online.
  2. After approval, auto-update asset library status and record approval chain.
  3. After publishing, generate audit log with publisher, time, and channels.
  4. Non-compliant content can be one-click withdrawn with notification to responsible person.
- **Success Criteria**: Smooth approval process; complete audit records; effective withdrawal mechanism.
- **Exception & Risk Control**: Approval timeout escalation; duplicate approval merge; asset library version control.
- **Indicators**: Approval time, rejection rate, withdrawal response time.

## Scenario-level Test Cases

> Test Preparation: Enable content template library, multi-language management, social media scheduling, SMS gateway, approval workflow, and audit logs. Prepare 1 Chinese/English template each, 2 social media accounts, and 1 set of primary/backup SMS vendors.

### Use Case A-1: Template Multi-language Sync (Positive)
- **Preconditions**: Master template includes dynamic variable {{industry}}; translation workflow configured.
- **Steps**:
  1. Create Chinese template and submit translation task.
  2. Review and publish.
- **Expected Results**:
  - English and Japanese copies auto-generated and enter translation task list.
  - After approval, copy status is "Available" with version number consistent with master.
  - Template update prompts sync modifications to copies.

### Use Case B-1: Social Media Scheduling Execution (Positive)
- **Preconditions**: Plan to publish content on LinkedIn and Weibo; rule checking enabled.
- **Steps**:
  1. Set scheduled publish time.
  2. Wait for execution and check logs.
- **Expected Results**:
  - System checks character count and topic format meet requirements.
  - Auto-publish at scheduled time; record exposure and interaction data written back to CRM.
  - If platform fails, trigger retry and alert.

### Use Case C-1: SMS Frequency Control (Positive)
- **Preconditions**: Same user SMS frequency limit is 3 messages/24 hours.
- **Steps**:
  1. Send 3 campaign SMS to same user.
  2. Attempt to send 4th.
- **Expected Results**:
  - First 3 sent successfully with delivery/click status recorded.
  - 4th blocked with提示"exceeds frequency limit".
  - System suggests using other channels.

### Use Case D-1: Content Approval & Tracking (Positive)
- **Preconditions**: Content requires compliance team approval; audit enabled.
- **Steps**:
  1. Submit content for approval.
  2. Compliance annotates and approves.
- **Expected Results**:
  - Approval flow shows annotations; after approval, content status becomes "Publishable".
  - After publishing, generate audit log recording publisher/time/channel.
  - Can query complete history by content ID.

### Use Case D-2: Non-compliant Content Withdrawal (Negative)
- **Preconditions**: Published content found containing prohibited words.
- **Steps**:
  1. Compliance clicks "one-click withdrawal".
- **Expected Results**:
  - Content immediately withdrawn from all channels; notify operations responsible person.
  - Generate remediation task and review report template.

---

## Related Resources

### Business Domain: [Marketing Automation](/en/scenarios/meta/crm/marketing-automation/)
- [Lead Nurturing](./lead-nurturing/primary.md) - Journey design, content delivery, and human intervention
- [Campaign Orchestration & Management](./campaign-orchestration-management/primary.md) - Visual campaign design, budget control, and real-time monitoring
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
