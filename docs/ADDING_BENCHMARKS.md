# Adding a New Benchmark

## Structure

Each benchmark is a self-contained directory under `benchmarks/<name>/`:

```
benchmarks/my-benchmark/
├── README.md           # Instructions for the agent
├── package.json        # Dependencies (if needed)
├── src/               # Code to be tested
├── tests/             # Validation tests
├── task.md            # Agent-facing task description
└── format.md          # Expected output format
```

## Rules

1. **Independent**: Each benchmark must run standalone. No shared top-level dependencies.
2. **Testable**: Include tests that can validate agent fixes (pass/fail).
3. **Documented**: `README.md` must explain the challenge. `task.md` and `format.md` must guide the agent.
4. **No secrets**: Never commit `.env`, API keys, or answer keys.
5. **Docker optional**: If a benchmark needs services, provide `docker-compose.yaml`.

## Example

See `benchmarks/swe-bench/` for a working example.
