# Primary Use Case: Lead Scoring & Assignment

## Background Overview

With the surge in lead volume, automated scoring and assignment mechanisms are needed to prioritize high-potential leads and assign them to appropriate sales teams. PowerX CRM provides scoring models, assignment rules, anomaly detection, and fairness analysis. This primary use case focuses on "Lead Scoring & Assignment" to help teams improve lead response efficiency.

## Objectives & Value
- **Scoring Modeling**: Evaluate lead hotness by combining behavior, attributes, and interaction dimensions.
- **Smart Assignment**: Match best owners by region, industry, and product.
- **Fairness Guarantee**: Avoid individual overload or regional bias.
- **Anomaly Detection**: Identify abnormally high or low-scoring leads; continuously optimize model.
- **Traceability**: Scoring and assignment history logging to support review.

## Participating Roles
- **Marketing Operations**: Maintains scoring rules and monitors results.
- **Sales Manager**: Sets assignment strategy and monitors team workload.
- **Sales Rep**: Receives leads and executes follow-up.
- **Data Analyst/Agent**: Trains models and evaluates performance.

## Primary Scenario User Story
> **As a** marketing operations staff, **I want to** automatically identify high-value leads and assign them fairly, **so that** I can improve conversion efficiency and ensure fairness.

## Sub-scenarios Detailed

### Sub-scenario A: Scoring Model Training & Application
- **Roles & Triggers**: Model calculates lead hotness score in real-time based on download, open rates, in-site behavior, and other metrics.
- **Main Process**:
  1. Regularly train scoring model with historical conversion data.
  2. Calculate new lead scores in real-time; classify as cold/warm/hot.
  3. Write scores to lead profiles; drive journey or assignment strategies.
  4. Monitor model performance; adjust weights or features.
- **Success Criteria**: High correlation between scoring and conversion; timely updates; strong interpretability.
- **Exception & Risk Control**: Model drift alerts; blacklist filtering; human intervention mechanism.
- **Indicators**: Scoring accuracy rate, model update frequency, feature contribution.

### Sub-scenario B: Auto-assignment & Priority Lists
- **Roles & Triggers**: High-scoring leads auto-assigned to corresponding sales teams; generate priority follow-up lists.
- **Main Process**:
  1. Select owner based on assignment rules (region, industry, product).
  2. System generates priority list with follow-up suggestions and SLA.
  3. Sales views leads in todo list; records first contact results.
  4. Lead response fed back to scoring model.
- **Success Criteria**: Accurate assignment; timely lists; improved response rate.
- **Exception & Risk Control**: Auto-skip resigned/overloaded staff; rotation strategy ensures fairness; retry on assignment failure.
- **Indicators**: Assignment success rate, first response time, lead conversion rate.

### Sub-scenario C: Anomaly Scoring Review
- **Roles & Triggers**: Leads with abnormal high or low scores trigger model evaluation; team can adjust weights and scoring rules.
- **Main Process**:
  1. System monitors score distribution; alerts on anomaly peaks.
  2. Marketing operations or analyst checks lead details; judges if model anomaly.
  3. Adjust model parameters or mark leads as black/white list when needed.
  4. Record adjustment reasons; form model governance log.
- **Success Criteria**: Accurate anomaly identification; timely adjustments; model stability.
- **Exception & Risk Control**: Misjudgment can be rolled back; permission control; audit logging.
- **Indicators**: Anomaly lead proportion, model adjustment count, scoring stability.

### Sub-scenario D: Assignment History Review & Fairness Analysis
- **Roles & Triggers**: Scoring and assignment history reviewable; helps marketing and sales review scoring strategy effectiveness.
- **Main Process**:
  1. System records every assignment's lead, owner, time, and reason.
  2. Provide visualization reports analyzing personnel workload and conversion performance.
  3. Identify unequal distribution; give optimization suggestions (adjust rules, add alternatives).
  4. Review meeting outputs conclusions; optimize and version rules.
- **Success Criteria**: Complete data; improved fairness; reviewable conclusions.
- **Exception & Risk Control**: Data missing alerts; report permissions; conclusions require approval to take effect.
- **Indicators**: Assignment fairness index, review execution rate, rule change impact.

## Scenario-level Test Cases

> Test Preparation: Enable scoring model, auto-assignment, anomaly detection, and fairness reports. Prepare historical conversion data, feature weight configuration, regional sales teams, and model monitoring thresholds.

### Use Case A-1: Scoring Model Real-time Calculation (Positive)
- **Preconditions**: Model trained; new lead includes downloading whitepaper and attending webinar behaviors.
- **Steps**:
  1. Import new lead and trigger scoring.
  2. Check lead profile score.
- **Expected Results**:
  - Score calculated with feature contribution displayed (download 40%, webinar 30%, etc.).
  - Lead classified as "hot" and enters high-priority queue.
  - Model monitoring panel updates real-time average score.

### Use Case B-1: Auto-assignment & SLA (Positive)
- **Preconditions**: East China team rotation enabled; lead score 90.
- **Steps**:
  1. Trigger assignment engine.
  2. Check lead owner and todo.
- **Expected Results**:
  - Lead assigned to next available sales; creates 2-hour contact task.
  - Todo list displays lead source, score, and suggested scripts.
  - Sales feedback updates lead status and model training set.

### Use Case C-1: Anomaly High Score Review (Negative)
- **Preconditions**: Lead incorrectly scored 98 due to bad data; anomaly threshold set to 95.
- **Steps**:
  1. Import lead with abnormal field.
  2. Observe anomaly monitoring list.
- **Expected Results**:
  - System marks lead as "anomaly high score"; auto-creates review task.
  - Reviewer can adjust score or mark as false positive.
  - Handling result recorded in model governance log.

### Use Case D-1: Assignment History Report (Positive)
- **Preconditions**: Past week generated 200 assignment records.
- **Steps**:
  1. Open fairness analysis report.
  2. Check assignment ratio and conversion rate by region and owner.
- **Expected Results**:
  - Report displays each owner's lead count and close rate; highlights anomalies.
  - Can export with comments to form review materials.
  - Suggest rotation strategy adjustment with simulation plan.

### Use Case D-2: Rule Change Rollback (Negative)
- **Preconditions**: Operations mistakenly changed weights causing major scoring fluctuation.
- **Steps**:
  1. Within 1 hour execute "rollback to previous version".
- **Expected Results**:
  - Model restores to previous version weights; related logs recorded.
  - Leads with abnormal scores during period enter review queue.

---

## Related Resources

### Business Domain: [Marketing Automation](/en/scenarios/meta/crm/marketing-automation/)
- [Lead Nurturing](./lead-nurturing/primary.md) - Journey design, content delivery, and human intervention
- [Campaign Orchestration & Management](./campaign-orchestration-management/primary.md) - Visual campaign design, budget control, and real-time monitoring
- [Content & Channel Outreach](./content-channel-outreach/primary.md) - Template management, multi-language support, and channel scheduling
- [Testing & Conversion Optimization](./testing-conversion-optimization/primary.md) - A/B testing, funnel analysis, and best practice promotion

### Other CRM Business Domains
- [Customer Management](/en/scenarios/meta/crm/customer-management/) - Customer lifecycle, segmentation, and lead management
- [Membership & Loyalty](/en/scenarios/meta/crm/membership-loyalty/) - Member tiers, points, and engagement
- [Sales Process](/en/scenarios/meta/crm/sales-process/) - Opportunity management, quoting, and sales activities
- [Customer Success](/en/scenarios/meta/crm/customer-success/) - Case management, service delivery, and renewal operations
- [Analytics & Revenue Intelligence](/en/scenarios/meta/crm/analytics-revenue-intelligence/) - Sales forecasting, customer value analysis, and performance settlement
- [Admin & Integration](/en/scenarios/meta/crm/admin-integration/) - Access control, workflow automation, and system integration

---
