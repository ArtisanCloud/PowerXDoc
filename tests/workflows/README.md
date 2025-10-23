# Workflow Test Harness

PowerXDocs workflow smoke tests live under this directory and use the Node 18 `node --test` runner.

## Running the Suite

```bash
npm run test:workflows
```

The command above expands to `node --test tests/workflows`, so individual files can be targeted via:

```bash
node --test tests/workflows/publish-scenarios.spec.mjs
```

## Writing Tests

- Prefer isolated fixtures that set up temporary repositories inside the system temp directory.
- Use the shared helpers in `scripts/lib/**` (added in later phases) to keep assertions aligned with production CLIs.
- Keep each test self-cleaning; remove temporary directories and reset environment variables you set.

Failing tests should surface before CLIs are implemented so the red → green workflow remains intact.
