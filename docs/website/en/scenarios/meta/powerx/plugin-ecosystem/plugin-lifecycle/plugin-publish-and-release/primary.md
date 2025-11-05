# Main Scenario: Plugin Publish & Release

## Background
After development and debugging are complete, a plugin must pass testing, compliance review, and multi-tenant deployment before it can serve internal tenants or Marketplace users. The release pipeline usually spans multiple environments, dual channels (online and offline), CI/CD automation, canary monitoring, and third-party review. Without a standardized flow, the team faces high risks of version drift, compliance gaps, or launch failures. This main scenario focuses on “Plugin Publish & Release,” mapping the critical steps from test-tenant validation and offline package import to automated production rollout and Marketplace listing so that plugins reach target users safely, efficiently, and with full traceability.

## Goals & Value
- **Standardized release path**: Define a consistent flow across test, staging, and production tenants to reduce environment drift.
- **Multi-channel delivery**: Support both online pushes and offline packages so isolated networks can stay in sync.
- **Continuous delivery & compliance**: Embed quality gates, signature checks, and approval workflows into CI/CD for traceable releases.
- **Operational observability**: Capture metrics during canary rollout to surface issues early and roll back quickly.
- **Ecosystem reach**: Complete Marketplace review and listing so more tenants can discover and install the plugin.

## Participants
- **Plugin Developer**: Submits release builds, maintains release notes and change logs.
- **QA / Test Engineer**: Runs regression in test tenants and ensures quality gates are satisfied.
- **Release Manager / Operations Engineer**: Approves release requests, watches canary metrics, and executes rollback strategies.
- **Enterprise Administrator**: Imports offline packages or enables new versions for production tenants in isolated networks.
- **Marketplace Reviewer**: Checks compliance, metadata, and commercial readiness before listing.
- **CI/CD Platform & Automation**: Handles build, signature, deployment, and telemetry collection tasks.

## Supporting Capabilities
- **PowerXPlugin repository (PLG)**: Provides plugin SDKs, interfaces, and scaffolding; core workspace for building plugins.
- **CLI toolchain**: `px-plugin` for build, packaging, and publish; `px-admin` for configuring test or production tenants; `px-market` for Marketplace review and listing orchestration.
- **Host systems**: PowerX Web Admin enables plugin installation and debugging; PowerX Backend manages lifecycle and runtime state.

## Main Scenario User Story
> **As** a release manager, **I want** to deliver plugin versions to production tenants and Marketplace once quality and compliance gates pass, **so that** target users gain new capabilities quickly and every step is traceable and reversible.

## Sub-Scenarios

### Sub-Scenario A: Test-Tenant Validation & Release Approval
- **Role & Trigger**: Developer completes features and submits a release request that must be validated in test tenants and approved.
- **Flow**:
  1. Developer uploads build artifacts and release notes via `powerx publish create`, targeting the test tenant.
  2. CI/CD deploys to the test tenant and runs regression tests plus security scans.
  3. QA reviews the reports; the release manager cross-checks the change list and schedules the go-live window.
  4. After approval, the system generates a production release plan and locks the version tag.
- **Success Criteria**: Test coverage ≥ 90%; no high-severity findings; approval within 24 hours; release plan includes rollback playbook and contacts.
- **Exceptions & Risk Control**: Failed tests block the flow; approval timeouts raise reminders; unregistered changes cannot skip the test environment.
- **Metrics**: Test pass rate, approval lead time, blocker count.

### Sub-Scenario B: Offline Package Import into Isolated Environments
- **Role & Trigger**: Enterprise admin needs to deploy the plugin in networks without internet access.
- **Flow**:
  1. Release manager generates an offline bundle (signature, dependencies, checksum) via CI/CD and uploads it to the intranet repository.
  2. Enterprise admin downloads the package and runs `powerx plugin import --offline`.
  3. System verifies signatures, version compatibility, and license state, then decompresses and deploys the plugin.
  4. Admin runs console health checks and enables the plugin once results pass.
- **Success Criteria**: Signature validation succeeds; deployment < 10 minutes; health checks green; audit log records operator, timestamp, and version.
- **Exceptions & Risk Control**: Signature mismatch blocks deployment and raises alerts; missing dependencies prompt remediation; failures trigger automatic rollback to the previous version.
- **Metrics**: Offline import success rate, audit log completeness, rollback frequency.

### Sub-Scenario C: CI/CD Production Release with Canary Rollout
- **Role & Trigger**: An approved version must roll out to production tenants in batches while tracking key metrics.
- **Flow**:
  1. Pipeline executes build, unit tests, artifact signing, and packaging per the release plan.
  2. System pushes the plugin to a production canary group (e.g., 10% users) and starts telemetry collection.
  3. Release manager and operations monitor performance, error rate, and feedback, deciding whether to expand or rollback within the window.
  4. Once stable, rollout auto-expands to 100%, updates change logs, and notifies stakeholders.
- **Success Criteria**: Key metrics deviation < 5% during canary; no significant error spike; rollback strategy rehearsed; SLA met post full rollout.
- **Exceptions & Risk Control**: Anomalies trigger auto rollback; failed pushes retry thrice before escalation; dependencies and licenses revalidated before full rollout.
- **Metrics**: Canary duration, metric deviation, rollback trigger rate.

### Sub-Scenario D: Marketplace Review & Listing
- **Role & Trigger**: Vendor submits the plugin for Marketplace distribution and must pass review.
- **Flow**:
  1. Vendor fills pricing, highlights, screenshots, and support policies in the release console and submits for listing.
  2. Marketplace reviewer validates compliance, signatures, and security reports, requesting additional material if needed.
  3. Once approved, the system syncs metadata to the Marketplace catalog and sets visibility and promotion tags.
  4. After listing, operations reports are generated, tenants are notified, and trial/purchase flows become available.
- **Success Criteria**: Complete documentation; signatures verified; review SLA ≤ 3 business days; catalog entries searchable and accurate; subscription flow connected.
- **Exceptions & Risk Control**: Compliance issues reject the listing with documented reasons; expired signatures require resubmission; post-launch metrics monitor downloads vs. churn.
- **Metrics**: Review pass rate, listing lead time, Marketplace conversion rate.

### Sub-Scenario E: Developer Local Debug Loop
- **Role & Trigger**: Plugin developer finishes new functionality and needs to validate builds quickly without Marketplace dependency.
- **Flow**:
  1. Run `px-plugin build` or `px-plugin dev` in the PowerXPlugin repo to produce outputs (e.g., `dist/`).
  2. Open PowerX Web Admin, choose “Install from Local Directory,” and point to the artifacts.
  3. PowerX Backend installs and activates the plugin, persisting it in the local plugin store.
  4. Developer validates UI, APIs, and permissions in Admin, hot-reloads code as needed, and rebuilds.
- **Success Criteria**: Plugin loads in the local tenant and responds to interactions; artifacts stay in sync with source; debug logs are traceable.
- **Exceptions & Risk Control**: Build failures block installation; activation issues roll back to the last working version; missing permissions trigger minimum-privilege templates.
- **Metrics**: Iteration time per loop, interrupted installs, debug error volume.

### Sub-Scenario F: Offline Package Submission to Marketplace
- **Role & Trigger**: Vendor or enterprise admin operating in offline/low-bandwidth environments must submit packages for review and listing.
- **Flow**:
  1. Developer runs `px-plugin pack` to produce a `.pxp` bundle with signatures, dependencies, and release notes.
  2. Admin uploads the offline package and metadata via the `px-market` console.
  3. Marketplace validates signatures, compatibility matrix, and licensing, recording the version.
  4. After approval, the release manager syncs the package to the target intranet distribution library for tenant import.
- **Success Criteria**: Signature and compatibility checks pass; Marketplace stores complete version metadata; package is downloadable in the target environment.
- **Exceptions & Risk Control**: Signature mismatch triggers rejection and repack; missing dependencies require resubmission; upload failures are logged for auditing.
- **Metrics**: Offline package validation success, review turnaround, rework count.

### Sub-Scenario G: Online Publish & Marketplace Listing
- **Role & Trigger**: Vendor wants to publish directly to Marketplace for public or multi-tenant distribution.
- **Flow**:
  1. Developer runs `px-plugin publish` or submits via the PowerXPlugin console with release notes, pricing, and support details.
  2. `px-market` ingests the artifact and initiates Marketplace review, covering compliance, signature, and security scans.
  3. Once approved, the system lists the plugin, notifies subscribers, and enables trial or purchase flows.
  4. Subsequent versions follow the same workflow with automated notifications and diff checks.
- **Success Criteria**: Review SLA ≤ 2 business days; catalog shows the latest version; notifications reach intended tenants.
- **Exceptions & Risk Control**: Review rejections must include reasons and sync back to `px-plugin`; signature or scan failures block listing; version conflicts preserve prior versions and highlight upgrade paths.
- **Metrics**: Review pass rate, post-launch installs/activations, rejection reasons by category.

## Scope Boundaries & Out-of-Scope Topics
- Plugin source development and debugging belong to the “Plugin Development & Debugging” main scenario.
- Runtime lifecycle operations (start/stop/upgrade) fall under the “Plugin Installation & Operations” main scenario.
- Marketplace billing and revenue sharing are covered by “Plugin Listing & Sales” or commercial-layer scenarios.
- Host-to-plugin or plugin-to-plugin integration details live in the “Plugin Communication & Integration” series.

## Dependencies & Interfaces
- **PowerX CI/CD Platform**: Provides build, packaging, signing, and release pipelines.
- **Artifact & Version Repository**: Stores build outputs, offline bundles, and metadata.
- **Identity & Access Services**: Ensure approvals and imports carry proper authorization and audit records.
- **Monitoring & Logging Platform**: Collects metrics, errors, and user feedback during canary and full rollout.
- **Marketplace Management System**: Handles review, metadata management, and operational reporting.
- **License & Compliance Services**: Verify plugin entitlements, legality, and regulatory adherence.

## Tool Collaboration Loop
- `px-plugin` handles build, packaging, publish, and signature — the entry point for releases.
- PowerX Web Admin provides local installation, debugging, and health checks to support canary validation.
- PowerX Backend manages runtime state, permissions, and lifecycle events.
- `px-market` and the Marketplace platform run review, version governance, and distribution analytics, closing the loop from release to operations.

## Acceptance Criteria
1. Release flow covers testing, approvals, signature validation, and rollback strategy with full audit trails.
2. Supports both online pushes and offline imports so isolated environments can follow the same standard.
3. Canary stage offers real-time metrics and alerts; failures trigger rollback within five minutes.
4. Marketplace listing links back to release records with consistent metadata and valid signatures for traceable reviews.
