# Primary Use Case: AI-driven Outreach Recommendation

## Background Overview

Faced with a vast customer pool, choosing when and what content to use for customer outreach is a challenge. AIGC and machine learning can recommend optimal outreach strategies based on customer profiles, behaviors, and external environments. This primary use case focuses on AI outreach recommendations, from modeling, recommendation publishing, adoption tracking to continuous learning, achieving integrated advice on "who to contact, when to contact, and what to say."

## Goals & Value
- **Intelligent Strategy**: AI comprehensively outputs outreach timing, channels, and script suggestions.
- **Efficiency Improvement**: Reduce manual judgment, improve response efficiency and conversion.
- **Continuous Learning**: Optimize models and script libraries based on feedback.
- **Compliance & Control**: Recommendations are explainable and auditable.

## Participating Roles
- **Sales/Customer Service/Operations**: Receive and execute AI recommendations.
- **Data Science Team**: Build models, evaluate effectiveness.
- **Content Team**: Provide script templates and assets.
- **Compliance Team**: Review sensitive content to ensure policy compliance.
- **IT Middle Platform**: Maintain recommendation services and interfaces.

## Primary Scenario User Story
> **As a** sales representative, **I want** the system to tell me when to contact customers and recommend scripts, **so that** I can improve conversion and reduce trial-and-error.

## Sub-scenario Details

### Sub-scenario A: Recommendation Model Training & Launch
- **Roles & Triggers**: Data team needs to release new models.
- **Main Process**:
  1. Collect historical outreach data (timing, channels, content, results).
  2. Feature engineering: customer profiles, behaviors, seasons, activities.
  3. Train models, output recommendation strategies and confidence levels.
  4. Go live after verification through A/B testing.
- **Success Criteria**: Model accuracy; sufficient explainability; smooth launch.
- **Exceptions & Risk Control**: Model deviation alerts; downgrade when output has no results; version retention.
- **Metric Suggestions**: Model hit rate, confidence level, A/B improvement.

### Sub-scenario B: Recommendation Suggestion Push & Execution
- **Roles & Triggers**: Customers meet trigger conditions.
- **Main Process**:
  1. System pushes recommendation cards with "estimated optimal contact time," "suggested channels," and "script drafts."
  2. Sales can adopt with one tap or make modifications.
  3. After execution, record actual behaviors and results.
  4. Within SLA, remind or reassign if not executed.
- **Success Criteria**: Timely suggestions; relevant content; convenient execution.
- **Exceptions & Risk Control**: Automatically merge excessive suggestions; secondary confirmation required for sensitive customers; provide rejection reason options.
- **Metric Suggestions**: Suggestion adoption rate, execution rate, conversion rate.

### Sub-scenario C: Effect Feedback & Model Iteration
- **Roles & Triggers**: Collect feedback after execution.
- **Main Process**:
  1. Count adoption and rejection reasons, conversion results, customer feedback.
  2. Model learns from adoption results, updates weights.
  3. Business can provide manual rule supplements or overrides.
  4. Regularly evaluate model performance and output optimization reports.
- **Success Criteria**: Complete feedback; rapid iteration; continuous effect improvement.
- **Exceptions & Risk Control**: Alert when feedback is missing; rollback for model overfitting; record manual interventions.
- **Metric Suggestions**: Feedback coverage, iteration cycle, effect improvement amplitude.

### Sub-scenario D: Compliance Review & Explainability
- **Roles & Triggers**: Recommendations involve sensitive scripts or customers.
- **Main Process**:
  1. Recommendation cards display key reasons (e.g., "recently browsed Product A," "not followed up for 14 days").
  2. Trigger compliance approval for sensitive customers or content.
  3. Compliance team can view model rationale and data sources.
  4. Record approval results for auditing.
- **Success Criteria**: Recommendations are explainable; approval process is smooth; compliance security.
- **Exceptions & Risk Control**: Suppress recommendations when reasons are missing; compliance rejections require relearning; record logs.
- **Metric Suggestions**: Reason display rate, compliance approval rate, audit pass rate.

## Scenario-level Test Case Examples

> Test Preparation: Prepare historical outreach data, model services, recommendation card templates, feedback systems, compliance approval processes.

### Test Case A-1: Recommendation Adoption & Conversion (Positive)
- **Prerequisites**: Model is live; customer has recent browsing behavior.
- **Steps**:
  1. Accept recommendation card and execute suggestion.
  2. Record conversion results.
- **Expected Results**:
  - Recommendation displays reasons (recent browsing, no follow-up).
  - Sales copy script and send, customer responds positively and converts.
  - System records adoption and conversion data.

### Test Case B-1: Compliance Approval Interception (Negative)
- **Prerequisites**: Recommendation involves sensitive industry customers.
- **Steps**:
  1. Trigger recommendation, wait for approval.
  2. Compliance rejects and provides reasons.
- **Expected Results**:
  - Recommendation card marked "requires approval," cannot be sent without approval.
  - Compliance provides feedback reasons and requests content changes.
  - Model records this case for subsequent optimization.

---
