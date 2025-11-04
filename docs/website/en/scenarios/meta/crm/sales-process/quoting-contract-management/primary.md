# Primary Use Case: Quoting & Contract Management

## Background Overview

In complex B2B sales, quoting and contract processes involve product configuration, discount strategies, approval workflows, and compliance reviews. PowerX CRM needs to provide end-to-end quoting and contract management capabilities, ensuring sales can quickly generate accurate quotes, drive contract approvals, and complete archiving and renewal follow-ups after signing. This primary use case focuses on "Quoting & Contract Management," covering quote generation, approval, signing, archiving, and renewal.

## Objectives & Value
- **Standardized Quoting**: Automatic calculation of discounts and gross margin, avoiding manual errors.
- **Compliance Approval**: Multi-level approval workflows ensure prices, terms, and contract risks are controllable.
- **Signing-Archiving Integration**: Contracts automatically archived after signing and linked to opportunities.
- **Renewal Proactive Alerts**: Generate renewal drafts in advance to improve renewal success rates.
- **Cross-system Collaboration**: Integration with ERP and legal systems, reducing duplicate entry.

## Participants
- **Sales Team**: Configure quotes, drive contract approvals, communicate terms with customers.
- **Sales Management / Finance**: Review discounts, profit margins, and payment terms.
- **Legal Team**: Review contract terms and risk control.
- **Customer Success Manager**: Monitor renewal nodes and prepare solutions in advance.
- **System Agent**: Auto-calculate, push reminders, archive contracts.

## Primary Scenario User Story
> **As** a sales representative, **I want** to quickly generate compliant quotes and complete contract workflows in CRM, **so that** I can improve deal efficiency and reduce contract risks.

## Sub-scenario Details

### Sub-scenario A: Smart Quote Configuration & Profit Monitoring
- **Roles & Triggers**: Sales selects products and price list in opportunity, system automatically calculates discounts and gross margin.
- **Main Process**:
  1. Sales opens "Create Quote" in opportunity, selects product bundle and quantity.
  2. System loads standard prices and available discounts, calculating quote amount and gross margin in real-time.
  3. If discount exceeds authorization threshold, automatically triggers approval or suggests alternatives.
  4. Generated quote can be exported as PDF or shared online with customer.
- **Success Criteria**: Accurate quote calculation; immediate discount anomaly alerts; traceable quote versions.
- **Exceptions & Risk Control**: Price list missing prompts administrator; discount beyond authority requires approval; cancelled quotes retain history.
- **Suggested Metrics**: Quote generation time, discount beyond authority rate, gross margin compliance rate.

### Sub-scenario B: Contract Multi-level Approval & Legal Review
- **Roles & Triggers**: Contract approval workflows driven by role permissions, high-value contracts trigger multi-level approvals and legal reviews.
- **Main Process**:
  1. Sales submits contract draft, filling payment terms, delivery scope, contract attachments, etc.
  2. System automatically generates approval flow based on amount and risk level (Sales Manager → Finance → Legal).
  3. Each approver receives to-do, can comment online, modify, or reject.
  4. After approval, contract enters signing phase, system syncs status.
- **Success Criteria**: Complete approval nodes; approval opinions logged; process visualized.
- **Exceptions & Risk Control**: Approval timeout auto-escalates; legal rejection requires reason; contract version management traceable.
- **Suggested Metrics**: Approval cycle, rejection rate, key node timeout rate.

### Sub-scenario C: Contract Signing & Automatic Archiving
- **Roles & Triggers**: After contract signing completion, automatically archive to document library and link back to opportunity and customer records.
- **Main Process**:
  1. After contract approval, system pushes e-signing links to customer and internal signers.
  2. After signing completion, receives receipt and automatically updates contract status to "Signed."
  3. Contract PDF, version info, signing logs stored in document library, linked to opportunity, customer, and order.
  4. Key terms (amount, start/end dates) sync to billing and fulfillment systems.
- **Success Criteria**: Real-time signing status updates; complete archiving; accurate term synchronization.
- **Exceptions & Risk Control**: Signing failures auto-resend; document library permission control; contract changes require versioning.
- **Suggested Metrics**: Signing completion rate, archiving accuracy, term sync latency.

### Sub-scenario D: Renewal Draft & Reminders
- **Roles & Triggers**: 90 days before renewal, system generates draft and reminds Customer Success Manager to arrange communication.
- **Main Process**:
  1. After contract signing, system records expiry date and creates renewal timer.
  2. 90 days before expiry, auto-generates renewal draft, continuing original terms and providing adjustment suggestions.
  3. Pushes reminders to Customer Success Manager and sales, requiring communication with customer before specified date.
  4. Renewal progress recorded in contract lifecycle view for management tracking.
- **Success Criteria**: Timely renewal alerts; accurate draft content; improved renewal rates.
- **Exceptions & Risk Control**: Special contracts can adjust reminder timing; non-renewals require reason recording; renewal failures trigger customer churn process.
- **Suggested Metrics**: Renewal reminder coverage, renewal draft adoption rate, renewal success rate.

## Scenario-level Test Case Examples

> Test Preparation: Prepare product price list, approval flow configuration (Sales Manager → Finance → Legal), e-sign platform sandbox, renewal reminder strategy. Pre-configure 3 opportunities in discussion, different discount permissions, contract templates.

### Test Case A-1: Smart Quote Discount Validation (Positive)
- **Preconditions**: Sales discount permission 20%; product standard price 100,000 yuan.
- **Steps**:
  1. Add quote in opportunity with 15% discount.
  2. Save and export quote.
- **Expected Results**:
  - Quote amount automatically calculated as 85,000 yuan, gross margin displayed synchronously.
  - Can save without approval, generate PDF quote with watermark.
  - Quote timeline records operator and discount amount.

### Test Case A-2: Discount Exceeds Limit Triggers Approval (Negative)
- **Preconditions**: Same sales tries to set 30% discount.
- **Steps**:
  1. Modify quote discount to 30%.
  2. Submit and save.
- **Expected Results**:
  - System prompts "Discount exceeds authority, approval initiated."
  - Quote status shows "Pending Approval - Sales Manager."
  - Quote cannot be used for contract before approval.

### Test Case B-1: Contract Multi-level Approval Flow (Positive)
- **Preconditions**: Contract amount 2 million, triggering Sales Manager, Finance, Legal approval.
- **Steps**:
  1. Submit contract draft and upload term attachments.
  2. Complete three approval nodes in sequence.
- **Expected Results**:
  - Each approver receives to-do, approval timeline records opinions.
  - After all approved, status changes to "Pending Signing."
  - Approval details can be exported as audit report.

### Test Case C-1: E-signing & Automatic Archiving (Positive)
- **Preconditions**: E-sign integration successful; customer contact email valid.
- **Steps**:
  1. Initiate e-signing process.
  2. Customer completes signing, system receives receipt.
- **Expected Results**:
  - Contract status switches to "Signed," signing time and IP recorded completely.
  - PDF body and signing certificate stored in document library, linked to opportunity and customer.
  - Billing system receives start date, amount, and other key fields.

### Test Case D-1: Renewal Draft & Reminders (Positive)
- **Preconditions**: Contract expiry date 2026-03-31; renewal reminder cycle 90 days.
- **Steps**:
  1. Advance system date to 2025-12-31.
  2. View renewal to-do and draft content.
- **Expected Results**:
  - Auto-generates renewal draft, continuing current terms and suggesting price adjustment.
  - CSM and sales receive renewal reminder tasks.
  - Renewal pipeline board shows customer in "Pending Communication" status.

### Test Case D-2: Renewal Draft Adjustment Approval (Negative)
- **Preconditions**: Renewal draft modified by sales with discount exceeding authority.
- **Steps**:
  1. Change renewal discount to 35%.
  2. Save draft.
- **Expected Results**:
  - Draft status changes to "Pending Approval," workflow consistent with new contracts.
  - Cannot send renewal proposal externally before approval.

---

## Related Resources

- Return to [Sales Pipeline & Opportunity](../index.md)
- Continue to [Sales Activities & Cadence](./sales-activities-cadence/primary.md)
- [CRM Scenario Overview](/en/scenarios/meta/crm/)

