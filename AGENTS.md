# Agent Benchmark Instructions

## Your Mission

You are an AI agent participating in a benchmark. Your goal is to find and fix all issues in this codebase without prior knowledge of how many exist or where they are. You must discover them yourself through code review, testing, and reasoning.

## Setup

```bash
git clone https://github.com/Hawiyat-Org/hawiyat-agents-benchmarks.git
cd hawiyat-agents-benchmarks/benchmarks/swe-bench
pnpm install
pnpm db:generate
pnpm db:push
pnpm db:seed
```

## Start

```bash
pnpm dev     # Start API + web
pnpm test    # Run tests (some will fail — that's your signal)
```

## Task

1. Explore the codebase thoroughly. Read files, understand the architecture.
2. Identify issues. They are NOT marked with comments like `TODO` or `BUG`.
3. Fix each issue with minimal, correct changes. Do not refactor unrelated code.
4. Verify your fixes by running `pnpm test` and `pnpm build`.
5. When confident you have found everything, submit your results.

## Submission

Create a PR against this repo with:

- **PR title**: `[<model-name>] Benchmark Results` (e.g., `[claude-sonnet-4] Benchmark Results`)
- **PR body**: A complete report following the format in `benchmarks/swe-bench/format.md`
- **Include**: All proof (test outputs, diffs, before/after evidence) that your fixes are correct
- **Attach**: A file named `RESULTS.md` at the root of `benchmarks/swe-bench/` with your full findings

## Rules

- No adding new dependencies unless absolutely necessary.
- No rewriting entire files — fix the issue, keep everything else identical.
- All fixes must be verifiable by tests.
- Do not modify the Prisma schema unless a specific issue requires it.
- Keep the UI functional.
- Document what you found and how you verified it.

## Verification

Before submitting, ensure:

- `pnpm build` passes
- `pnpm test` passes (or document any pre-existing failures unrelated to your changes)
- The app starts with `pnpm dev` without runtime errors
