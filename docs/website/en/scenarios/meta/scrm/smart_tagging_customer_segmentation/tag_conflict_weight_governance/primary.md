# Primary Use Case: Tag Conflict & Weight Governance

## Background Overview

Customers can have multiple tags that sometimes conflict or overlap. Without proper governance, tag conflicts lead to confusion and poor decisions. This primary use case describes conflict detection, weight management, and governance processes to maintain tag integrity.

## Goals & Value
- **Conflict Identification**: Detect and flag tag conflicts automatically.
- **Priority Strategy**: Define tag priorities and resolution rules.
- **Approval & Auditing**: Ensure tag changes are reviewed and documented.
- **Data Quality**: Maintain clean and consistent tag data.

## Participating Roles
- **Data Governance Team**: Define tag policies and resolution rules.
- **Operations**: Review and approve tag changes.
- **Marketing**: Use tags for targeting and campaigns.
- **Sales**: Apply tags in customer interactions.
- **Compliance**: Audit tag usage and governance.

## Primary Scenario User Story
> **As a** data governance manager, **I want** to detect and resolve tag conflicts automatically, **so that** I can ensure data quality and prevent confusion in customer targeting.

## Sub-scenario Details

### Sub-scenario A: Conflict Detection Engine
- **Roles & Triggers**: Need to identify tag conflicts.
- **Main Process**:
  1. Analyze customer tags for conflicts.
  2. Apply conflict detection rules and algorithms.
  3. Flag conflicts for review and resolution.
  4. Document conflict types and frequencies.
- **Success Criteria**: Accurate conflict detection; clear flagging; comprehensive documentation.
- **Exceptions & Risk Control**: False positives; missed conflicts; documentation gaps.
- **Metric Suggestions: Detection accuracy, false positive rate, documentation completeness.

### Sub-scenario B: Weight-based Resolution
- **Roles & Triggers**: Need to resolve conflicts using weights.
- **Main Process**:
  1. Define tag weights based on importance and reliability.
  2. Apply weight-based rules to resolve conflicts.
  3. Preserve lower-priority tags for reference.
  4. Update resolution logs and history.
- **Success Criteria**: Consistent resolution; proper weighting; preserved history.
- **Exceptions & Risk Control**: Weighting errors; history loss; resolution inconsistencies.
- **Metric Suggestions: Resolution accuracy, weighting effectiveness, history preservation.

### Sub-scenario C: Approval Workflow
- **Roles & Triggers**: Tag changes require approval.
- **Main Process**:
  1. Submit tag changes for review.
  2. Operations team reviews and approves.
  3. Document approval decisions and reasons.
  4. Implement approved changes.
- **Success Criteria**: Proper review; documented decisions; timely implementation.
- **Exceptions & Risk Control**: Review delays; documentation issues; implementation errors.
- **Metric Suggestions: Review time, documentation quality, implementation success.

### Sub-scenario D: Audit & Reporting
- **Roles & Triggers**: Need to audit tag governance.
- **Main Process**:
  1. Generate tag governance reports.
  2. Track resolution history and outcomes.
  3. Monitor governance compliance.
  4. Identify improvement opportunities.
- **Success Criteria**: Comprehensive reports; complete audit trail; compliance monitoring.
- **Exceptions & Risk Control**: Report inaccuracies; audit gaps; compliance issues.
- **Metric Suggestions: Report accuracy, audit completeness, compliance score.

## Scenario-level Test Case Examples

> Test Preparation: Prepare conflict detection system, weight management tools, approval workflows, and audit reporting.

### Test Case A-1: Tag Conflict Detection (Positive)
- **Prerequisites**: Customer has potentially conflicting tags.
- **Steps**:
  1. System analyzes customer tags.
  2. Flags conflict for review.
- **Expected Results**:
  - Conflict accurately detected.
  - Conflict details documented.
  - Review process initiated.

### Test Case B-1: Weight-based Resolution (Negative)
- **Prerequisites**: Conflicting tags identified.
- **Steps**:
  1. Apply weight-based resolution rules.
  2. Resolve conflict automatically.
- **Expected Results**:
  - Conflict resolved using weights.
  - Primary tag identified.
  - Resolution logged for audit.

---

