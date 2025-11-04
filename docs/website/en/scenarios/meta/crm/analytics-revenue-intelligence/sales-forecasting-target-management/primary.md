# Primary Use Case: Sales Forecasting & Target Management

## Background Overview

Accurate sales forecasting and target management are important foundations for business decision-making. PowerX CRM combines opportunity stages, historical conversion, team plans, and actual performance to provide forecasting models and target breakdown tools. This primary use case focuses on "Sales Forecasting & Target Management."

## Objectives & Value
- **Target Breakdown**: Decompose annual/quarterly targets to teams and individuals.
- **Forecasting Model**: Generate forecast curves based on opportunity stages and historical performance.
- **Variance Alerts**: Timely reminders to adjust strategies when forecasts deviate from actuals.
- **Decision Support**: Visualization dashboards help management make decisions.
- **Collaborative Execution**: Sales, customer success, and marketing share targets and progress.

## Participating Roles
- **Sales Leader**: Sets targets and monitors execution.
- **Sales Rep**: Updates opportunity progress to achieve personal targets.
- **Management**: Reviews forecasts and adjusts resource allocation.
- **Finance Team**: Focuses on alignment between forecasts and revenue.
- **System Agent**: Calculates forecasts and pushes alerts.

## Primary Scenario User Story
> **As a** sales leader, **I want** real-time visibility into target attainment and forecast variance, **so that** I can adjust strategies to ensure performance achievement.

## Sub-scenarios Detailed

### Sub-scenario A: Target Setting & Breakdown
- **Roles & Triggers**: Sales leader sets quarterly targets; system breakdowns to teams and individuals.
- **Main Process**:
  1. Enter quarterly sales targets in target management module.
  2. Auto-breakdown to subordinate teams and individuals by region, team, and historical performance.
  3. Provide adjustment tools allowing manual fine-tuning with reason records.
  4. After publishing, sync to personal dashboards.
- **Success Criteria**: Reasonable target breakdown; smooth communication; clear responsibilities.
- **Exception & Risk Control**: Over/under alerts; adjustment requires approval; version traceability.
- **Indicators**: Target acceptance rate, adjustment count, publish timeliness.

### Sub-scenario B: Forecast Curve Generation & Updates
- **Roles & Triggers**: Agent auto-generates forecast curves based on opportunity stages and historical conversion rates.
- **Main Process**:
  1. Calculate opportunity amounts by stage; combine with historical conversion rates to generate forecasts.
  2. Provide optimistic, baseline, and conservative forecast scenarios.
  3. Daily update curves and push to management.
  4. Support drill-down to view contributing opportunity lists.
- **Success Criteria**: High forecast accuracy; timely updates; explainable data.
- **Exception & Risk Control**: Auto-exclude anomalous opportunities; model self-check; manual calibration records.
- **Indicators**: Forecast variance rate, update frequency, model hit rate.

### Sub-scenario C: Variance Alerts & Action Recommendations
- **Roles & Triggers**: When forecast deviates from actual beyond threshold, system reminds to adjust strategies and suggests key accounts.
- **Main Process**:
  1. Compare forecast values with actual attainment rates; calculate variance.
  2. Trigger alerts when exceeding threshold; show influencing factors (stage stagnation, deal delays).
  3. System recommends opportunities or upsell customers for key follow-up.
  4. Sales leaders create action plans and record execution status.
- **Success Criteria**: Timely alerts; actionable recommendations; variance improvement.
- **Exception & Risk Control**: Configurable thresholds; ignorable false positives; action plan tracking.
- **Indicators**: Variance improvement rate, recommendation adoption rate, action completion rate.

### Sub-scenario D: Management Dashboard & Decision Support
- **Roles & Triggers**: Management views attainment rates, funnel conversion, and average sales cycles in dashboard.
- **Main Process**:
  1. Dashboard displays target attainment, forecast trends, and key metrics.
  2. Support drill-down analysis by region, industry, and team.
  3. Provide hypothesis simulations (add headcount, adjust discount strategies).
  4. Output recommendation reports for weekly and quarterly meetings.
- **Success Criteria**: Real-time data; comprehensive analysis; decision support.
- **Exception & Risk Control**: Data permission control; anomaly filtering; simulation results tagged with assumptions.
- **Indicators**: Dashboard usage rate, decision response time, metric accuracy rate.

## Scenario-level Test Cases

> Test Preparation: Enable target management, forecasting models, variance alerts, and management dashboards. Pre-configure annual targets, regional team data, historical opportunity conversion rates, and simulated actual performance.

### Use Case A-1: Target Breakdown & Publishing (Positive)
- **Preconditions**: Quarterly target 30M; East China and South China teams exist.
- **Steps**:
  1. Set quarterly total target.
  2. View system-recommended breakdown and fine-tune.
- **Expected Results**:
  - System allocates based on historical data: East 18M, South 12M.
  - Managers can manually adjust with reason records.
  - After publishing, team member dashboards show personal targets.

### Use Case B-1: Forecast Curve Generation (Positive)
- **Preconditions**: Opportunity stage data up-to-date; model configured with optimistic/baseline/conservative curves.
- **Steps**:
  1. Refresh forecast model.
  2. View forecast charts.
- **Expected Results**:
  - Three curves displayed simultaneously; click to view contributing opportunity list.
  - Model provides win probability, estimated amount, and expected close date.
  - Data supports CSV export.

### Use Case C-1: Variance Alert (Positive)
- **Preconditions**: Actual attainment only 40%; forecast should be 60%; variance threshold 10%.
- **Steps**:
  1. Update actual performance.
  2. Check alert center.
- **Expected Results**:
  - System提示"actual 20% below forecast"; lists main causes (stage stagnation, key opportunity delays).
  - Recommends priority follow-up customer list.
  - Managers can generate action plans and track completion.

### Use Case D-1: Management Dashboard Simulation (Positive)
- **Preconditions**: Dashboard has region and industry filters; supports hypothesis simulation.
- **Steps**:
  1. Select "add 2 sales reps" simulation in dashboard.
  2. View forecast changes.
- **Expected Results**:
  - Dashboard shows adjusted forecast values and impacted opportunity list post-simulation.
  - Generates strategy suggestions; can export for management meeting.
  - Operation logs record simulation parameters.

### Use Case D-2: Permission-restricted View (Negative)
- **Preconditions**: Regular sales can only view personal targets.
- **Steps**:
  1. Attempt to view company-level forecast as sales.
- **Expected Results**:
  - System提示"no permission"; only shows personal attainment rate.
  - Administrators can see access attempts in audit log.

---

## Related Resources

### Business Domain: [Analytics & Revenue Intelligence](/en/scenarios/meta/crm/analytics-revenue-intelligence/)
- [Customer Value & Churn Analysis](./customer-value-churn-analysis/primary.md) - Value segmentation, churn alerts, and root cause analysis
- [Performance & Incentive Settlement](./performance-incentive-settlement/primary.md) - Performance statistics, commission approval, and payout risk control

### Other CRM Business Domains
- [Customer Management](/en/scenarios/meta/crm/customer-management/) - Customer lifecycle, segmentation, and lead management
- [Marketing Automation](/en/scenarios/meta/crm/marketing-automation/) - Lead nurturing, campaign orchestration, and conversion optimization
- [Sales Process](/en/scenarios/meta/crm/sales-process/) - Opportunity management, quoting, and sales activities
- [Customer Success](/en/scenarios/meta/crm/customer-success/) - Case management, service delivery, and renewal operations
- [Membership & Loyalty](/en/scenarios/meta/crm/membership-loyalty/) - Member tiers, points, and engagement
- [Admin & Integration](/en/scenarios/meta/crm/admin-integration/) - Access control, workflow automation, and system integration

---
