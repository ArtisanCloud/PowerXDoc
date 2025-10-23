# Finance and Settlement Specification

## 1. Purpose

Define the end-to-end finance and settlement capabilities for PowerX Plugin Marketplace so that vendor revenue shares are calculated, reconciled, and paid out accurately, on schedule, and with verifiable audit trails.

## 2. Scope

### In-Scope

- Revenue aggregation and share model (platform cut, channel fees, taxation).
- Settlement calendars (net terms, grace windows, FX handling).
- Reconciliation artefacts (orders, refunds, tax, revenue share, net payable).
- Settlement eligibility (thresholds, rolling holds, risk intercepts).
- Payout execution (bank wire, third-party wallets) with retry logic.
- Invoice lifecycle (submission, validation, archival).
- Compliance retention and audit interfaces (storage, discovery).

### Out-of-Scope

- Price plan configuration or License entitlement enforcement.
- Plugin functional behaviour (delivery, validation, activation).
- Customer support and appeal policies.

### Dependencies & Assumptions

- Payment gateway + risk engine providing transaction status and chargebacks.
- Shared Settlement & Reporting services for payout orchestration.
- Tax compliance module providing jurisdictional rules and rates.
- Canonical vendor identity (banking/KYC) shared across Marketplace.
- Audit ledger & encrypted storage available for financial evidence.

## 3. Functional Overview

| Domain | Responsibilities |
|--------|------------------|
| Revenue Aggregation | Capture gross receipts, classify by channel, currency, tax jurisdiction. |
| Share Computation | Apply platform commission, partner/channel fees, statutory taxes; compute vendor net. |
| Reconciliation | Generate daily/weekly reports aligning gateway events with Marketplace order data. |
| Settlement | Release payments once thresholds & risk checks pass; handle FX conversion. |
| Disbursement | Initiate payout via bank ACH/SWIFT or third-party processors with failure monitoring. |
| Invoicing | Collect vendor invoices, validate tax IDs, store verified copies. |
| Compliance & Audit | Retain financial artefacts for statutory period; expose interface to auditors. |

## 4. Detailed Requirements

### 4.1 Revenue Aggregation & Allocation

1. **Gross Event Intake**
   - Consume payment gateway webhooks (capture, refund, chargeback) with idempotent processing.
   - Map to Marketplace order ID via metadata; log unmatched events for manual triage.
   - Store raw figures per currency, including gateway fees and applied taxes.
2. **Share Model**
   - Platform default commission configurable (e.g., 20%) with overrides per vendor/plan.
   - Channel adjustments (e.g., 5% for third-party promotions) stackable.
   - Tax determination delegated to Tax module; accept computed VAT/GST, store jurisdiction breakdown.
   - Support negative adjustments (refunds, chargebacks) reducing vendor payable.
3. **FX Handling**
   - Maintain daily FX rates (provider configurable) and lock rate at transaction timestamp.
   - Store both original and settlement currency values; expose in reports.

### 4.2 Reconciliation Artefacts

1. **Daily Order Ledger**
   - Columns: order_id, vendor_id, gross_amount, tax, platform_share, channel_fee, net_vendor_amount, currency, fx_rate, status.
   - Export CSV & Parquet; accessible via secure download + API `/internal/finance/reports/orders`.
2. **Refund/Chargeback Report**
   - Track original order reference, refund amount, reason codes, dispute windows.
3. **Tax Report**
   - Summarise tax collected per jurisdiction, filing period.
4. **Revenue Share Statement**
   - Aggregated totals for platform/channels/vendors; used for internal accounting.

### 4.3 Settlement Eligibility

1. **Thresholds**
   - Minimum payout amount configurable per vendor (e.g., 100 USD).
   - Rolling thresholds evaluate net payable after refunds, holds.
2. **Hold Periods**
   - Default hold (e.g., 14 days) before revenue becomes eligible; chargebacks extend hold.
   - Risk engine can flag vendor to increase hold or freeze payouts.
3. **Risk Intercepts**
   - Integrate with Risk service; payout job checks risk flags before issuing payment.

### 4.4 Payout Execution

1. **Payout Scheduling**
   - Support weekly and monthly cadences; vendor selects preference.
   - Generate payout batch with finalized amounts & FX conversion timestamp.
2. **Disbursement Channels**
   - Bank transfer: require IBAN/SWIFT + KYC-approved beneficiary.
   - Third-party wallet (e.g., PayPal, Stripe Connect): store account IDs; verify validity.
   - Retry policy for failed payouts (exponential back-off, max attempts).
3. **Status Tracking**
   - Payout record states: pending -> processing -> settled / failed / canceled.
   - On failure, record gateway error codes and enqueue manual review.

### 4.5 Invoice Handling

1. **Vendor Workflow**
   - Vendor submits invoice referencing payout batch; upload via secured API or portal.
   - Validate mandatory fields (tax ID, address, amount, currency).
2. **Verification**
   - Optional integration with tax authority validation API (where available).
   - Mark invoice as `verified` or `rejected` with reason.
3. **Archival**
   - Store signed copies in encrypted storage; link to payout record.

### 4.6 Compliance & Audit Retention

1. **Retention Rules**
   - Minimum 7 years retention for payout, invoice, and reconciliation artefacts (configurable per jurisdiction).
2. **Audit Interface**
   - Provide secure, read-only API `/internal/finance/audit` supporting filters:
     - date range
     - vendor_id
     - artefact type (order, payout, invoice)
   - Support export bundles (zip) including signatures/hash manifests.
3. **Data Integrity**
   - Hash and sign reconciliation exports; cross-check signatures when retrieved.

## 5. Non-Functional Requirements

- **Security**: All financial documents stored encrypted at rest; access gated by finance role-based policies.
- **Observability**:
  - Metrics: `finance_payout_total`, `finance_payout_failed_total`, `finance_invoice_pending_total`.
  - Alerts: payout failure rate >2% per batch, reconciliation job lag > 1 hour.
  - Logs contain `vendor_id`, `payout_batch_id`, `jurisdiction`.
- **Scalability**: Support 5k vendors, 100k orders/day, 10k payouts/month with <30 min reconciliation lag.
- **Reliability**: Reconciliation jobs recover from partial failures; payouts retried automatically.
- **Localization**: Multi-currency support with localized report formats where required.

## 6. High-Level Architecture

1. **Data Sources**: Marketplace orders, payment gateway events, tax service responses.
2. **Processing Pipelines**:
   - Ingestion jobs normalise events into Finance DB (PostgreSQL).
   - Reconciliation job aggregates daily metrics.
   - Settlement job evaluates eligibility and creates payout batches.
   - Disbursement service interacts with gateway/bank connectors.
3. **Storage**:
   - Finance DB (PostgreSQL) for structured records.
   - Object storage (S3/MinIO) for invoices and signed reports.
   - Audit ledger for hash/signature records.

## 7. Interfaces

| API | Method | Description | Auth |
|-----|--------|-------------|------|
| `/internal/finance/reports/orders` | GET | Download daily order/revenue report | Finance Ops token |
| `/internal/finance/reports/tax` | GET | Retrieve tax summaries per jurisdiction | Finance Ops token |
| `/internal/finance/payouts` | GET | List payout batches & statuses | Finance Ops token |
| `/internal/finance/payouts/:id/retry` | POST | Retry failed payout | Finance Ops token |
| `/internal/finance/invoices` | POST | Upload vendor invoice metadata + file | Vendor auth |
| `/internal/finance/invoices/:id` | PATCH | Update invoice status (verified/rejected) | Finance Ops token |
| `/internal/finance/audit` | GET | Export artefacts for auditors | Audit service token |

## 8. Reporting & Dashboards

- Dashboard widgets:
  - Outstanding payable by vendor.
  - Payout success rate (last 30 days).
  - Tax collected per jurisdiction.
  - Ageing report (amounts held beyond SLA).
- Schedule automated email reports to finance and compliance teams (configurable recipients).

## 9. Operational Considerations

- **Backfill**: Support historical rebuild of reports when commission model changes (with audit note).
- **Configuration**: Finance Ops can adjust commission rates, thresholds via secure admin UI/API.
- **Failover**: Payment gateway outage triggers fallback queue; reconciliation job replays once gateway resumes.
- **Disaster Recovery**: Ensure point-in-time recovery for Finance DB; replicate artefact storage.

## 10. Open Questions

1. Do we require dual approval for manual payout retries (four-eyes principle)?
2. Should we integrate automated VAT filing or provide exports for manual filing only?
3. For multi-entity vendors, do payouts split per entity or consolidate under parent?
4. What is the required SLA for invoice verification (e.g., 3 business days)?

