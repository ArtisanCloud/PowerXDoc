# Research Findings

## Decision: Use native Git CLI orchestration via Node `child_process`
- **Rationale**: The repository already depends on standard Node.js tooling, the Git CLI is guaranteed on contributor machines, and native commands let us manage branches, commits, and pushes without introducing heavy libraries or fighting ESM/TypeScript interoperability.
- **Alternatives considered**: `simple-git` (adds dependency surface and extra abstraction for sparse checkout handling); `isomorphic-git` (lacks first-class support for push via SSH out of the box for large repos).

## Decision: Implement workflow tests with `node --test` integration suites
- **Rationale**: Node 18 ships the test runner, enabling hermetic smoke tests that exercise CLI scripts against temporary repositories while keeping the toolchain light and runnable in CI without extra packages.
- **Alternatives considered**: Vitest (needs additional dependencies and config); Jest (heavier setup and CommonJS defaults that complicate ESM scripts).

## Decision: Target <8 minute end-to-end SLA per publication or distribution run
- **Rationale**: Sequential processing of four downstream repositories with templated branches, validation, and reporting can complete within 2 minutes per repo using caching and batched file writes, leaving buffer for retries and notifications.
- **Alternatives considered**: <5 minute SLA (risks flaky network-bound Git pushes and fails when repos are large); no explicit SLA (hard to enforce operational expectations or size workflows for scale).
