# Finance and Settlement — Product Specification

## 1. Overview

Finance & Settlement governs how PowerX Plugin Marketplace aggregates revenue, calculates revenue sharing, reconciles financial data, and disburses payments to vendors while maintaining regulatory compliance and auditability.

## 2. Goals

1. Deliver accurate, on-schedule settlements to vendors with transparent reporting.
2. Provide traceable reconciliation artefacts for finance, tax, and compliance teams.
3. Support global operations with multi-currency, taxation, and payout routing requirements.

## 3. Scope

### In Scope

- Revenue aggregation and sharing rules (platform commission, channel fees, tax).
- Billing cycles, settlement calendars, FX handling.
- Reconciliation artefacts: orders, refunds, taxes, shares, net payable.
- Settlement eligibility: thresholds, holds, risk intercepts.
- Payout orchestration (banking, third-party wallets) with failure handling.
- Invoice lifecycle (submission, validation, archival).
- Compliance retention and audit interface.

### Out of Scope

- Pricing/plan design and License enforcement.
- Plugin functional features or technical implementation specifics.
- Customer support, appeals, or dispute policy definition.

### Dependencies & Assumptions

- Payment gateway + risk engine for transactional events and fraud signals.
- Settlement/Reporting services for batch orchestration.
- Tax compliance module delivering jurisdictional tax requirements.
- Unified vendor KYC + banking profile.
- Audit ledger + encrypted storage for long-term retention.

## 4. Functional Requirements

### 4.1 Revenue Aggregation

1. Ingest payment events (capture, refund, chargeback) with idempotency.
2. Map events to Marketplace orders; unresolved mappings flagged for manual review.
3. Capture gross amount, gateway fees, tax components per currency.
4. Allow configurable commission tiers per vendor/plan plus channel uplift/discount.
5. Integrate tax module to determine VAT/GST; store jurisdiction breakdown.
6. Support FX conversion with locked-in rate at event time; preserve original + settlement currency.

### 4.2 Reconciliation & Reporting

1. Generate daily order ledger with columns:
   - order_id, vendor_id, product_id, gross_amount, tax_amount, platform_share,
     channel_fee, net_vendor_amount, currency, fx_rate, status, event_time.
2. Provide refund/chargeback ledger referencing original orders and reason codes.
3. Produce tax report per jurisdiction and filing period.
4. Deliver revenue share statement summarising platform/channel/vendor totals.
5. Expose downloads via secure API `/internal/finance/reports/*` (see Interfaces).
6. Support scheduled exports to S3/MinIO + notifications to finance ops.

### 4.3 Settlement Eligibility

1. Configurable minimum payout threshold per vendor.
2. Default rolling hold (e.g., 14 days) before funds become eligible; extended by disputes.
3. Risk engine can flag vendor for hold/freeze; settlement job respects flags.
4. Allow vendor-specific cadence (weekly/monthly) and cut-off times.

### 4.4 Payout Execution

1. Payout job assembles eligible balances, locks FX rate, generates batch ID.
2. Supported channels:
   - Bank transfer (ACH/SWIFT) requiring verified bank details.
   - Third-party wallet (e.g., PayPal, Stripe Connect) with token validation.
3. Each payout record transitions: `pending → processing → settled|failed|canceled`.
4. On failure, store gateway error message, next retry timestamp, retry count.
5. Notify vendor + finance ops on success/failure with contextual details.

### 4.5 Invoice Handling

1. Vendor uploads invoice referencing payout batch; required fields:
   - vendor_id, payout_batch_id, invoice_number, amount, currency, tax_id,
     invoice_date, due_date, attachment.
2. System validates metadata and optionally calls tax authority verification APIs.
3. Status transitions: `submitted → under_review → verified|rejected`.
4. Store signed copies in encrypted storage with checksum + signature metadata.

### 4.6 Compliance & Audit

1. Retain reconciliation files, payout records, invoices for ≥ 7 years (configurable).
2. Audit API provides filtered access with support for:
   - date range, vendor_id, artifact type, batch_id.
3. Generate export packages (zip) containing documents + checksum manifest.
4. Maintain immutable audit log entries for every payout and report generation.

## 5. Non-Functional Requirements

- **Security**: RBAC controls for finance operations; documents encrypted at rest. All API calls require signed tokens and audit context.
- **Scalability**: Designed for 5k vendors, 100k orders/day, 10k payouts/month with < 30 min reconciliation lag.
- **Reliability**: Reconciliation and payout jobs must resume safely after failure; use job queue with idempotent handlers.
- **Observability**:
  - Metrics: `finance_payout_total`, `finance_payout_failed_total`, `finance_invoice_pending_total`, `finance_reconciliation_duration_seconds`.
  - Alerts: payout failure rate > 2% per batch, reconciliation job lag > 1 hour, invoice backlog > 3 days.
  - Logs include `vendor_id`, `payout_batch_id`, `jurisdiction`.
- **Localization**: Support multi-currency, multi-language invoice templates where required.

## 6. Business Processes / Flows

### 6.1 Revenue to Settlement Flow

1. Payment gateway sends capture event → ingestion service records gross revenue.
2. Tax module computes VAT/GST; revenue share engine applies commission + channel fees.
3. Daily reconciliation job aggregates and stores reports.
4. Settlement job evaluates eligibility (threshold/hod/risk) and schedules payout.
5. Payout processor executes transfer; status recorded and notifications sent.

### 6.2 Refund / Chargeback Flow

1. Gateway sends refund/chargeback event.
2. Reversal applied to revenue share, net vendor, and payout eligibility.
3. If payout already processed, create clawback entry in next settlement cycle.

### 6.3 Invoice Workflow

1. Vendor downloads payout statement → uploads invoice referencing batch.
2. Finance team reviews invoices (auto + manual checks) and marks verified.
3. Verified invoice archived; vendor receives confirmation; status used for future compliance audits.

## 7. Data Model (High-Level)

| Entity | Key Fields | Notes |
|--------|------------|-------|
| `finance_orders` | order_id, vendor_id, gross_amount, tax_amount, platform_share, net_vendor_amount, currency, fx_rate, status, event_time | Single source for reconciliation. |
| `finance_refunds` | refund_id, order_id, amount, reason_code, event_time | Tracks adjustments. |
| `finance_payout_batches` | batch_id, vendor_id, cadence, scheduled_at, status, currency, total_amount, holds_applied | One row per vendor batch. |
| `finance_payout_items` | payout_item_id, batch_id, order_id/ref_id, amount, type (order/refund), state | Detailed components. |
| `finance_invoices` | invoice_id, vendor_id, batch_id, amount, currency, status, verification_meta, file_uri | Invoice lifecycle. |
| `finance_reports` | report_id, type, period_start, period_end, file_uri, checksum | Stored artefacts for download. |

All tables require `created_at`, `updated_at`, and `created_by` (system/service account). Sensitive data stored encrypted as needed.

## 8. Interfaces

### Internal APIs (authenticated via service tokens)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/internal/finance/reports/orders` | GET | Download order ledger for specified date range (CSV/Parquet). |
| `/internal/finance/reports/refunds` | GET | Fetch refund/chargeback report. |
| `/internal/finance/reports/tax` | GET | Retrieve tax summary grouped by jurisdiction. |
| `/internal/finance/payouts` | GET | List payout batches with filter by vendor/status/date. |
| `/internal/finance/payouts/:id/retry` | POST | Retry failed payout with audit reason. |
| `/internal/finance/invoices` | POST | Vendor uploads invoice metadata + file (multipart). |
| `/internal/finance/invoices/:id` | PATCH | Update invoice status (`verified`/`rejected`) and notes. |
| `/internal/finance/audit` | GET | Export artefacts for auditors (zip bundle). |

### Batch Jobs / Integrations

- `finance-reconciliation-job` (daily) – writes reports to object storage, updates `finance_reports`.
- `finance-settlement-job` (configurable cadence) – evaluates eligibility, creates payout batches.
- `finance-payout-processor` – communicates with banking/wallet APIs; updates statuses.
- `finance-invoice-reminder` – notifies vendors if invoice outstanding beyond SLA.

## 9. Metrics & Dashboards

- Dashboard panels:
  - Outstanding net payable by vendor (top N).
  - Payout completion rate (last 30 days).
  - Tax collected by jurisdiction compared to filings.
  - Ageing report for holds and invoice backlog.
- Integrate with existing telemetry exporters; instrumentation must be added to reconciliation and payout jobs.

## 10. Open Questions

1. Should payout retries require dual-approval (four-eyes principle)?
2. Is automated VAT filing in scope for future phases or manual only?
3. How to handle multi-entity vendors with different banking destinations?
4. What are legal retention periods per region (EU vs. US vs. APAC)?
5. Should we support vendor self-service for payout cadence/threshold adjustments?

