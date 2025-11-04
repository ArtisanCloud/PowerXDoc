# Primary Use Case: Social Touchpoint Dashboard

## Background Overview

WeCom touchpoints cover customer additions, group interactions, content outreach, and transaction conversions. Without unified data dashboards, operations would fly blind with delayed decisions. This primary use case provides cross-touchpoint dashboard design: real-time metrics, funnels, comparative analysis, and alerts, providing visual insights for management and operations.

## Goals & Value
- **Global Perspective**: Unify display of friend growth, group activity, content clicks, order conversions.
- **Real-time Alerts**: Automatic alerts for metric anomalies with quick response.
- **Multi-dimensional Analysis**: Compare by channel, department, employee, activity.
- **Action Guidance**: Support drilling down to customer, lead, activity information to form actions.

## Participating Roles
- **Management/Operations Directors**: Focus on overall metrics and strategies.
- **Community Operations/Marketing**: View activity effectiveness.
- **Sales Managers**: Analyze outreach and conversion performance.
- **Data Analysis**: Maintain models, metrics, and data quality.
- **IT Middle Platform**: Ensure data pipelines, permissions, security.

## Primary Scenario User Story
> **As an** operations director, **I want** to view private domain core metrics and receive alerts in one dashboard, **so that** I can make quick decisions.

## Sub-scenario Details

### Sub-scenario A: Metric System & Dashboard Design
- **Roles & Triggers**: Need to build a global dashboard.
- **Main Process**:
  1. Define metrics (new friends, activity, retention, GMV, etc.) and definitions.
  2. Design dashboard layout: funnels, trends, leaderboards.
  3. Integrate data sources (WeCom, CRM, orders, activity platforms).
  4. Set refresh frequency and permissions.
- **Success Criteria**: Unified, explainable metrics; easy-to-use dashboard; secure permissions.
- **Exceptions & Risk Control**: Data break alerts; metric conflicts require approval; sensitive data redacted.
- **Metric Suggestions**: Metric coverage, refresh timeliness, user access volume.

### Sub-scenario B: Multi-dimensional Drilling & Linked Analysis
- **Roles & Triggers**: Management wants to view a certain channel's performance.
- **Main Process**:
  1. Select dimensions on dashboard (channel, department, employee, etc.).
  2. Drill down to specific activities, customers, or groups.
  3. Compare with historical data to analyze anomaly reasons.
  4. Generate tasks or notify responsible parties with one tap.
- **Success Criteria**: Smooth drilling; actionable analysis; closed-loop actions.
- **Exceptions & Risk Control**: Prompt when accessing unauthorized data; paginate for large datasets; record drilling logs.
- **Metric Suggestions**: Drilling usage rate, problem resolution rate, action conversion rate.

### Sub-scenario C: Alerts & Automated Suggestions
- **Roles & Triggers**: Metrics exceed thresholds or trends are abnormal.
- **Main Process**:
  1. Set alert rules (e.g., new friend decline, activity reduction).
  2. When metrics are abnormal, automatically push alerts to WeCom.
  3. Include suggestions (e.g., publish content, launch activities, adjust strategies).
  4. Track alert handling results.
- **Success Criteria**: Timely alerts; useful suggestions; closed-loop handling.
- **Exceptions & Risk Control**: Adjust thresholds for frequent false positives; escalate reminders if unhandled; retain logs.
- **Metric Suggestions**: Alert hit rate, handling time, improvement amplitude.

### Sub-scenario D: Report Generation & Sharing
- **Roles & Triggers**: Need periodic reporting.
- **Main Process**:
  1. Generate daily/weekly/monthly reports with one tap, support custom templates.
  2. Reports can be exported as PDF/Excel or pushed to WeCom groups.
  3. Set recipients, view permissions, and deadlines.
  4. Collect feedback to optimize report content.
- **Success Criteria**: Accurate, timely reports; high read rate; fast feedback.
- **Exceptions & Risk Control**: Auto-retry on export failures; sensitive version reports require approval; record read logs.
- **Metric Suggestions**: Report punctuality rate, read rate, feedback adoption rate.

## Scenario-level Test Case Examples

> Test Preparation: Build data warehouse, BI dashboards, alert rules, report templates, and permission configurations.

### Test Case A-1: Multi-dimensional Drilling Analysis (Positive)
- **Prerequisites**: Dashboard configured with channel, department, employee dimensions.
- **Steps**:
  1. Select "Live Activity Channel," drill down to specific activity.
  2. View conversion metrics and participating user lists.
- **Expected Results**:
  - Dashboard displays real-time reach, registration, and transaction data for the activity.
  - Can export customer lists with one tap and generate follow-up tasks.
  - Logs record operation trajectories.

### Test Case B-1: Metric Anomaly Alert (Negative)
- **Prerequisites**: Set alert for "New friends drop 30% from last week."
- **Steps**:
  1. Simulate declining trend.
  2. View alert notification and handling process.
- **Expected Results**:
  - System pushes alert to operations group with handling suggestions.
  - Operations fill in handling results and alert status updates.
  - If unhandled, escalate to supervisor after 24 hours.

---
