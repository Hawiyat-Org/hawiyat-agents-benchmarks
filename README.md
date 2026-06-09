# Hawiyat Agents Benchmarks

Mono-repo of independent AI agent benchmark suites.

## Benchmarks

| Suite | Description | Location |
|-------|-------------|----------|
| `swe-bench` | 20 seeded bugs in a full-stack TypeScript monorepo (TanStack + Hono + Prisma) | [`benchmarks/swe-bench/`](benchmarks/swe-bench/) |

## Adding a New Benchmark

1. Create a directory under `benchmarks/<name>/`
2. Include its own `package.json`, tests, and README
3. Each benchmark is fully independent — no shared top-level dependencies
4. Update the table above

## Quick Start

```bash
pnpm install

# Run a specific benchmark
cd benchmarks/swe-bench
pnpm setup
pnpm test
```
