# Primary Use Case: Customer Value & Churn Analysis

## Background Overview

Understanding customer contribution and churn risk is the foundation of precision operations. PowerX CRM combines order, interaction, and service satisfaction data to provide customer value segmentation, early warning, and churn cause analysis. This primary use case focuses on "Customer Value & Churn Analysis."

## Objectives & Value
- **Value Segmentation**: Identify high-value, potential, and low-value customer groups.
- **Early Warning**: Monitor risk signals like declining activity and complaints.
- **Root Cause Analysis**: Identify main churn factors from data to develop strategies.
- **Visualization Dashboards**: Share insights between operations and management.
- **Strategy Implementation**: Connect analysis results to marketing and customer success actions.

## Participating Roles
- **Data Analyst/Agent**: Builds models and generates analysis reports.
- **Customer Success Team**: Receives alerts and executes recovery.
- **Marketing Operations**: Develops segmented marketing strategies.
- **Management**: Evaluates customer structure and risk.

## Primary Scenario User Story
> **As a** customer operations leader, **I want** timely insight into customer value and churn risk, **so that** I can reallocate resources and improve retention rates.

## Sub-scenarios Detailed

### Sub-scenario A: Customer Value Segmentation & Recommendations
- **Roles & Triggers**: System segments customers based on contribution and growth potential; generates coaching recommendations.
- **Main Process**:
  1. Calculate customer lifetime value (LTV), growth rate, cross-purchase, and other metrics.
  2. Auto-segment into strategic, key, growth, and watch categories.
  3. Generate operational recommendations for different tiers (VIP care, cross-sell, nurture).
  4. Sync recommendations to sales, CSM, and marketing teams.
- **Success Criteria**: Accurate segmentation; actionable recommendations; coverage of key customers.
- **Exception & Risk Control**: Data gap filling; adjustable thresholds; manual review mechanism.
- **Indicators**: Segmentation accuracy rate, recommendation adoption rate, high-value customer retention rate.

### Sub-scenario B: Activity Warning & Communication
- **Roles & Triggers**: Declining customer interaction frequency triggers early warning and proactive communication.
- **Main Process**:
  1. Monitor login, purchase, service usage behaviors; issue alerts when below thresholds.
  2. Auto-create recovery tasks or nurturing journeys.
  3. Customer success follows up and records feedback.
  4. Alert handling results fed back to model to optimize thresholds.
- **Success Criteria**: Timely alerts; action execution; activity recovery.
- **Exception & Risk Control**: Misreporting can be flagged; batch alert triage; reminder frequency control.
- **Indicators**: Alert hit rate, recovery rate, action completion rate.

### Sub-scenario C: Retention Metrics & Satisfaction Correlation
- **Roles & Triggers**: Repurchase rate, customer satisfaction, and NPS metrics centrally displayed and linked to improvement plans.
- **Main Process**:
  1. Dashboard integrates repurchase, renewal, NPS, CSAT, and other metrics.
  2. Cross-analyze metrics with customer segmentation, industry, and other dimensions.
  3. Identify underperforming areas and generate improvement suggestions.
  4. After plan execution, track metric changes.
- **Success Criteria**: Accurate metrics; deep analysis; effective improvement measures.
- **Exception & Risk Control**: Data delay alerts; anomaly filtering; plan execution tracking.
- **Indicators**: Retention rate change, satisfaction improvement, improvement plan completion rate.

### Sub-scenario D: Analysis Report Export & Permissions
- **Roles & Triggers**: Users can select anonymization level and share permissions when exporting analysis reports.
- **Main Process**:
  1. Select report template and anonymization level (partial/full masking).
  2. Specify recipients or share links with expiration dates.
  3. System records export logs for auditing.
  4. Reports auto-expire after expiration to prevent leaks.
- **Success Criteria**: Secure export; clear permissions; complete audit trail.
- **Exception & Risk Control**: Sensitive reports require approval; expiration reminders; abnormal download alerts.
- **Indicators**: Report export count, anonymization coverage, compliance incident count.

## Scenario-level Test Cases

> Test Preparation: Enable value segmentation model, activity monitoring, satisfaction metric aggregation, and report export anonymization strategy. Pre-configure 50 customers with different LTVs, activity data, and NPS/CSAT results.

### Use Case A-1: Value Segmentation & Recommendation Push (Positive)
- **Preconditions**: Customer "Xinghai Medical" in top 10% LTV with high growth potential score.
- **Steps**:
  1. Run value segmentation task.
  2. Check customer profile and operational recommendations.
- **Expected Results**:
  - Customer marked as "strategic"; recommendations include "executive visit + joint product seminar".
  - Recommendations pushed to sales and customer success; generate tasks in action center.

### Use Case B-1: Activity Warning (Positive)
- **Preconditions**: Customer "Xinzhi Software" hasn't logged in for 21 days; threshold is 14 days.
- **Steps**:
  1. Refresh activity monitoring.
  2. Check warning list.
- **Expected Results**:
  - Customer enters warning list; triggers recovery task.
  - After execution, record result "recovered/still declining".
  - Model automatically adjusts thresholds based on feedback.

### Use Case C-1: Retention Metrics Correlation Analysis (Positive)
- **Preconditions**: Dashboard loads repurchase rate, NPS, CSAT; supports dimension drill-down.
- **Steps**:
  1. Filter "manufacturing" customers in dashboard.
  2. Check correlation between repurchase rate and satisfaction.
- **Expected Results**:
  - Shows manufacturing repurchase rate 78%, average NPS 45; highlights below-average customers.
  - System suggests launching special actions for low-satisfaction customers.

### Use Case D-1: Report Anonymized Export (Positive)
- **Preconditions**: Export level set to partial anonymization.
- **Steps**:
  1. Select report template and export.
  2. Check exported file.
- **Expected Results**:
  - Contact phone/email in report anonymized; LTV values retained.
  - File watermarked and download valid for 7 days.
  - Audit log records export operation.

### Use Case D-2: Unapproved Full Export (Negative)
- **Preconditions**: Full export requires security approval.
- **Steps**:
  1. Regular operations attempt direct full data export.
- **Expected Results**:
  - System提示"security approval required"; blocks export.
  - Audit log records attempt.

---

## Related Resources

### Business Domain: [Analytics & Revenue Intelligence](/en/scenarios/meta/crm/analytics-revenue-intelligence/)
- [Sales Forecasting & Target Management](./sales-forecasting-target-management/primary.md) - Target breakdown, forecast curves, and deviation alerts
- [Performance & Incentive Settlement](./performance-incentive-settlement/primary.md) - Performance statistics, commission approval, and payout risk control

### Other CRM Business Domains
- [Customer Management](/en/scenarios/meta/crm/customer-management/) - Customer lifecycle, segmentation, and lead management
- [Marketing Automation](/en/scenarios/meta/crm/marketing-automation/) - Lead nurturing, campaign orchestration, and conversion optimization
- [Sales Process](/en/scenarios/meta/crm/sales-process/) - Opportunity management, quoting, and sales activities
- [Customer Success](/en/scenarios/meta/crm/customer-success/) - Case management, service delivery, and renewal operations
- [Membership & Loyalty](/en/scenarios/meta/crm/membership-loyalty/) - Member tiers, points, and engagement
- [Admin & Integration](/en/scenarios/meta/crm/admin-integration/) - Access control, workflow automation, and system integration

---
