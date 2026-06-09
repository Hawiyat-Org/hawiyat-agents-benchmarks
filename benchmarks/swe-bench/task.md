# Benchhy Agent Benchmark

## Mission

You are an AI agent tasked with finding and fixing all issues in this codebase. The issues range from simple syntax errors to subtle race conditions and framework-specific pitfalls. You have no prior knowledge of how many exist or where they are — you must discover them yourself through code review, testing, and reasoning.

## Repository Overview

This is a full-stack monorepo containing:

- **apps/web**: TanStack Start (React + TanStack Router + TanStack Query) frontend
- **apps/api**: Hono backend API server
- **packages/db**: Prisma ORM with SQLite database
- **packages/shared**: Shared Zod schemas and TypeScript types
- **packages/ui**: Shared React UI components

Tech stack: TypeScript, pnpm workspaces, Turborepo, Hono, Prisma, TanStack Query, TanStack Router, Tailwind CSS.

## Your Task

1. **Explore** the codebase. Read files, understand the architecture, and look for anomalies.
2. **Identify** issues. They are NOT marked with comments like `TODO` or `BUG` — you must find them yourself.
3. **Fix** each issue with minimal, correct changes. Do not refactor unrelated code.
4. **Verify** your fixes by running tests (`pnpm test`) and ensuring the app still builds (`pnpm build`).

## Rules

- **No adding new dependencies** unless absolutely necessary.
- **No rewriting entire files** — fix the issue, keep everything else identical.
- **All fixes must be verifiable** — a test should be able to catch the before/after difference.
- **Do not modify the Prisma schema** unless a specific issue requires it.
- **Keep the UI functional** — the frontend should still render and interact with the API.

## How to Start

1. Read the codebase structure (`pnpm-workspace.yaml`, `turbo.json`, app configs).
2. Review the API routes (`apps/api/src/routes/`) and middleware (`apps/api/src/middleware/`).
3. Review the frontend hooks (`apps/web/src/lib/hooks/`) and query client setup.
4. Run `pnpm setup` to install dependencies, generate Prisma client, and seed the database.
5. Run `pnpm dev` to start both API and web servers.
6. Run `pnpm test` to see the current test failures.
7. Fix issues one by one, running tests after each fix.

## Expected Output

When you believe you have found everything, you should be able to:

- Run `pnpm build` successfully
- Run `pnpm test` with 0 failures (or document any pre-existing failures unrelated to your changes)
- Start `pnpm dev` and interact with the app without errors

## Hints

- Look for places where `await` is missing in async functions.
- Check HTTP status codes on creation endpoints.
- Verify middleware registration order in Hono.
- Check Prisma query patterns for N+1 issues and missing transactions.
- Review TanStack Query configuration for staleTime/gcTime confusion.
- Look for query key mismatches between queries and invalidations.
- Check for race conditions in concurrent operations.
- Watch for unhandled promises that could crash the process.
- Verify route wildcard patterns match Hono's syntax.
- Check if interactive transactions hold connections during non-DB operations.
