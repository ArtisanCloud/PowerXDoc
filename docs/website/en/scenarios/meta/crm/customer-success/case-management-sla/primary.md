# Primary Use Case: Case Management & SLA

## Background Overview

Customer service teams need to efficiently handle issues, maintain SLA commitments, and build knowledge. PowerX CRM connects the ticket center with customer profiles to achieve automatic ticket assignment, timing, knowledge base reference, and satisfaction tracking. This primary use case focuses on "Case Management & SLA," ensuring service experience is quantifiable and continuously optimizable.

## Objectives & Value
- **Automatic Assignment**: Auto-dispatch tickets based on skills, language, and priority.
- **SLA Control**: Visualize response and resolution time limits; auto-escalate on timeout.
- **Knowledge Reuse**: Service staff quickly reference knowledge base to shorten handling time.
- **Satisfaction Closed Loop**: Collect feedback after service completion and write back to profiles.
- **Data Analysis**: Support capacity planning for queues and problem types.

## Participants
- **Customer**: Submit issues through portal or channels.
- **Support Agent**: Handle tickets, reference knowledge, record solutions.
- **Support Manager**: Monitor SLAs and handle escalated tickets.
- **Knowledge Base Administrator**: Maintain knowledge content and ratings.
- **System Agent**: Timing, reminders, and survey triggering.

## Primary Scenario User Story
> **As** a support manager, **I want** tickets to be automatically assigned and SLAs strictly enforced, **so that** customer satisfaction improves and escalation rates decrease.

## Sub-scenario Details

### Sub-scenario A: Portal Ticket Submission & Smart Dispatch
- **Roles & Triggers**: After customers submit issues in self-service portal, tickets auto-generated and matched with product specialists.
- **Main Process**:
  1. Customer selects issue type and urgency level, submits ticket.
  2. System identifies issue tags and matches appropriate agents via skill matrix.
  3. Agent receives dispatch notification; ticket status changes to "In Progress."
  4. Customer can view real-time progress in portal.
- **Success Criteria**: Accurate dispatch; response time meets SLA; customer receives confirmation.
- **Exceptions & Risk Control**: No available agents transfers to manual scheduling; duplicate tickets merged; malicious ticket identification.
- **Suggested Metrics**: First response time, dispatch accuracy rate, duplicate ticket rate.

### Sub-scenario B: SLA Timing & Escalation Mechanism
- **Roles & Triggers**: SLA timers calculate response and resolution time limits based on service tier; auto-escalate on timeout.
- **Main Process**:
  1. When ticket created, set response and resolution SLA based on customer tier and issue severity.
  2. System countdown in real-time, remind handlers to focus on tickets approaching deadline.
  3. After timeout, auto-escalate to manager or expert group and record reason.
  4. After escalation, SLA recalculated until issue resolved.
- **Success Criteria**: Accurate timing; clear escalation path; decreased overdue rate.
- **Exceptions & Risk Control**: False escalation can rollback; suspended tickets pause timing; cross-timezone handling calibration.
- **Suggested Metrics**: SLA achievement rate, escalated ticket ratio, average overdue duration.

### Sub-scenario C: Knowledge Base Recommendation & Reference
- **Roles & Triggers**: When support references knowledge base articles in tickets, system records article reuse rate for content optimization.
- **Main Process**:
  1. When agent opens ticket, system recommends related articles based on issue tags.
  2. Agent directly references articles or template replies to customer and can edit supplements.
  3. System records article reference count and satisfaction results.
  4. Popular articles marked as "Best Practices;" unpopular articles trigger optimization tasks.
- **Success Criteria**: Accurate recommendation; convenient reference; continuous knowledge base optimization.
- **Exceptions & Risk Control**: Article expiry reminders for updates; reference failures can manually upload attachments; sensitive content requires approval.
- **Suggested Metrics**: Knowledge reference rate, first-contact resolution rate, knowledge satisfaction score.

### Sub-scenario D: Satisfaction Survey & Feedback Write-back
- **Roles & Triggers**: After ticket closure, customers receive satisfaction survey; results feed back to customer profiles.
- **Main Process**:
  1. After ticket status changes to "Resolved," system automatically sends survey link.
  2. Customer fills ratings and comments; system receives in real-time.
  3. Satisfaction written to customer profile, marking trends and feedback to responsible parties.
  4. Low-score tickets trigger review process or customer success follow-up.
- **Success Criteria**: High survey reach rate; timely feedback; rapid response to negative reviews.
- **Exceptions & Risk Control**: Avoid harassment with multiple surveys; anonymous feedback option; data analysis anti-fraud.
- **Suggested Metrics**: Survey response rate, NPS/CSAT, low-score review completion rate.

## Scenario-level Test Case Examples

> Test Preparation: Enable ticket center, automatic dispatch, SLA timers, knowledge base, and satisfaction survey. Pre-configure 3 agents and 1 manager; configure different priorities and service tiers, knowledge recommendation rules.

### Test Case A-1: Ticket Auto-dispatch (Positive)
- **Preconditions**: Customer portal available; product specialist Li Lei has skill tag "API Integration."
- **Steps**:
  1. Customer submits "API Integration Error" ticket with high priority.
  2. View ticket assignment.
- **Expected Results**:
  - Ticket assigned to Li Lei within 1 minute with response SLA timer created.
  - Customer receives confirmation notification with status "In Progress."
  - Ticket details show matched skill rules and reasoning.

### Test Case B-1: SLA Timeout Escalation (Positive)
- **Preconditions**: Response SLA = 2 hours; Li Lei doesn't update ticket within 2 hours.
- **Steps**:
  1. Wait for SLA to expire.
  2. Check escalation notification and ticket status.
- **Expected Results**:
  - Ticket auto-escalates to support manager, status changes to "Pending Manager Review."
  - Timer continues counting resolution SLA.
  - Escalation log records timeout reason and handler.

### Test Case C-1: Knowledge Base Recommendation Reuse (Positive)
- **Preconditions**: Knowledge base has article "API Call Signature Failure Troubleshooting"; ticket tags match.
- **Steps**:
  1. Li Lei opens ticket and views recommended articles.
  2. Uses article template to reply to customer.
- **Expected Results**:
  - Recommended list shows matched article with rating displayed.
  - After referencing article, system records reuse count and satisfaction results.
  - If customer satisfaction is full score, article rating auto-increases.

### Test Case D-1: Satisfaction Survey Write-back (Positive)
- **Preconditions**: CSAT survey auto-sent 30 minutes after ticket resolution.
- **Steps**:
  1. Customer completes survey with 4 score and comment "Timely Response."
  2. View customer profile and ticket record.
- **Expected Results**:
  - Customer profile adds satisfaction record affecting health score.
  - Ticket timeline records survey results; CSAT metrics updated.
  - If below 3 score, triggers review task; this test case doesn't trigger.

### Test Case D-2: Malicious Ticket Merge (Negative)
- **Preconditions**: Same customer submits 5 identical tickets in short time.
- **Steps**:
  1. Create duplicate tickets.
  2. Observe system handling.
- **Expected Results**:
  - System identifies as duplicates, merges into original ticket and marks "Suspected Malicious."
  - Recorded in risk control panel for support manager review.

---

## Related Resources

- Return to [Customer Service & Success](../index.md)
- Continue to [Customer Success & Renewal](./customer-success-renewal/primary.md)
- [CRM Scenario Overview](/en/scenarios/meta/crm/)

