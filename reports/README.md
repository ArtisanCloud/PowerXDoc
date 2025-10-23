# Reporting Conventions

This directory captures delivery and validation outputs emitted by the PowerXDocs workflow CLIs.

- **Scenario runs**: Write JSON reports to `reports/scenarios/` (e.g. `reports/scenarios/<workflowId>.json`).
- **Template pushes**: Write JSON reports to `reports/usecases/`.
- **Standards pushes**: Write JSON reports to `reports/standards/`.
- **Collected stubs**: Write JSON reports to `reports/collected/`.
- **Builds & lint**: Capture human-readable summaries under `reports/build.md`.

Every workflow should append an entry to its report on each execution, including reruns triggered by retry tokens.

> Tip: Keep report payloads deterministic so downstream tooling and leadership dashboards can diff results cleanly.
