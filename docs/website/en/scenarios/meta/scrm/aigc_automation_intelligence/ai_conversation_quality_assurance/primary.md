# Primary Use Case: AI Conversation Quality Assurance

## Background Overview

WeCom conversations are massive in volume, with traditional manual QA having low coverage. AI can automatically analyze conversation quality, compliance risks, and sales opportunities. This primary use case focuses on AI QA processes: voice transcription, intent recognition, scoring models, remediation closed loops, etc., to improve customer experience and team capabilities.

## Goals & Value
- **High-coverage QA**: Automatic sampling or full-volume QA to improve coverage.
- **Multi-dimensional Scoring**: Service attitude, professionalism, compliance, opportunity identification, etc.
- **Remediation Closed Loop**: Automatically generate remediation suggestions and training plans.
- **Continuous Optimization**: Adjust script libraries and strategies based on QA results.

## Participating Roles
- **QA Team**: Configure rules, review results.
- **Customer Service/Sales Managers**: View QA reports, guide teams.
- **Customer Service/Sales Representatives**: Receive remediation tasks, improve service.
- **Compliance Team**: Focus on violating scripts and sensitive risks.
- **Data Team**: Maintain models and scoring systems.

## Primary Scenario User Story
> **As a** QA supervisor, **I want** to use AI to automatically analyze conversations and generate remediation suggestions, **so that** I can improve service quality and compliance levels.

## Sub-scenario Details

### Sub-scenario A: QA Rules & Model Configuration
- **Roles & Triggers**: QA team develops scoring standards.
- **Main Process**:
  1. Define QA dimensions (greetings, completeness of answers, response time, sensitive words).
  2. Configure AI models and rule engines, set scoring thresholds.
  3. Select sampling ratio or full analysis.
  4. Verify in sandbox before going live.
- **Success Criteria**: Clear rules; stable models; reasonable thresholds.
- **Exceptions & Risk Control**: Rule conflict alerts; model deviation rollback; version management.
- **Metric Suggestions**: QA coverage, model accuracy, sampling success rate.

### Sub-scenario B: Automatic Scoring & Report Generation
- **Roles & Triggers**: Conversations enter QA queue after generation.
- **Main Process**:
  1. AI performs transcription, intent recognition, emotion analysis on conversations.
  2. Output scores, labels (excellent/needs improvement/violating), generate reports.
  3. Visualize individual, team, and metric trends.
  4. QA personnel can spot-check and adjust scores.
- **Success Criteria**: Accurate, timely reports; quick problem conversation viewing.
- **Exceptions & Risk Control**: Score abnormality alerts; support manual review; sensitive content encryption.
- **Metric Suggestions**: Score accuracy, report generation time, review rate.

### Sub-scenario C: Remediation Tasks & Training Closed Loop
- **Roles & Triggers**: Conversation scores below threshold or violating.
- **Main Process**:
  1. System automatically generates remediation tasks, assigns to responsible parties.
  2. Provide remediation suggestions, script templates, training courses.
  3. After task completion, retest and record improvement.
  4. Managers can view remediation progress on dashboard.
- **Success Criteria**: High remediation rate; thorough training; significant improvement effect.
- **Exceptions & Risk Control**: Task timeout escalation; repeated violations trigger disciplinary processes; training content requires approval.
- **Metric Suggestions**: Remediation completion rate, retest improvement amplitude, training attendance rate.

### Sub-scenario D: Opportunity Identification & Business Feedback
- **Roles & Triggers**: Potential sales or product needs appear in conversations.
- **Main Process**:
  1. AI marks opportunity types (upsell, cross-sell, product improvements).
  2. Automatically create opportunity or product requirement tasks.
  3. Track handling results and revenue.
  4. Feedback improves model accuracy.
- **Success Criteria**: Accurate opportunity identification; timely handling; quantifiable revenue.
- **Exceptions & Risk Control**: Misjudgments can be closed; sensitive suggestions require approval; record revenue attribution.
- **Metric Suggestions**: Opportunity conversion rate, model hit rate, revenue contribution.

## Scenario-level Test Case Examples

> Test Preparation: Prepare conversation samples, QA rules, model services, remediation processes, training resources.

### Test Case A-1: Automatic QA Reports (Positive)
- **Prerequisites**: QA rules and models are configured.
- **Steps**:
  1. Import a batch of conversations.
  2. View QA report.
- **Expected Results**:
  - System generates scores, problem labels, suggestions.
  - QA panel displays individual rankings and metrics.
  - Can jump to view specific conversation content.

### Test Case B-1: Violation Remediation Escalation (Negative)
- **Prerequisites**: Conversations contain violating promises.
- **Steps**:
  1. Simulate violating conversation.
  2. View remediation process.
- **Expected Results**:
  - AI marks violation and generates remediation task.
  - If responsible party times out without handling, escalate to manager and record punishment.
  - Training courses automatically assigned to that member.

---
