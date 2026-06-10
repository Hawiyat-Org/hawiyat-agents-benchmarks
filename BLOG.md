We Audited the Same Codebase with Hawiyat Composer and Claude Opus 4.8

We benchmarked two AI agents against the same harness layer: Hawiyat Composer (max) and Claude Opus 4.8 (high). We used **Claude Code** as the orchestration tool that manages the benchmark environment and runs both agents.

Hawiyat Composer is a specialized AI agent for software engineering built by [Hawiya](https://hawiya.org). Claude Opus 4.8 is Anthropic's flagship reasoning model from [Claude](https://claude.ai). The two sit at very different price points and quota structures, so we wanted to see how they compare head-to-head on a real code audit task.

The full benchmark setup, prompt, and submission format are documented in [AGENTS.md](https://github.com/Hawiyat-Org/hawiyat-agents-benchmarks/blob/main/AGENTS.md).

## TL;DR

![TL;DR comparison table](https://raw.githubusercontent.com/Hawiyat-Org/hawiyat-agents-benchmarks/main/reports/blog/tldr-table.png)

Both missed the exact same three bugs. Claude Opus 4.8 found two extra issues not in the original set. Hawiyat Composer fixed the broken build that Claude left untouched.

---

## Our Setup

### The Codebase

We built a full-stack TypeScript monorepo with 20 seeded bugs:

- **Frontend:** TanStack Start (React, TanStack Router, TanStack Query)
- **Backend:** Hono API server with Zod validation
- **Database:** Prisma ORM with SQLite
- **Monorepo:** pnpm workspaces + Turborepo

### Bug Distribution

The bugs follow the established SWE-bench pattern ([reference](https://github.com/SWE-bench/SWE-bench.git)) and are distributed across difficulty levels:

![Difficulty distribution table](https://raw.githubusercontent.com/Hawiyat-Org/hawiyat-agents-benchmarks/main/reports/blog/difficulty-distribution.png)

The bugs are not labeled. There are no TODO comments. No `BUG` markers. The agents had to find them the same way a human engineer would: by reading the code, running the tests, and noticing what does not make sense.

### How We Ran the Test

Each agent received the same prompt:

> Clone this repo, follow AGENTS.md, and submit your fixes as a PR with your model name in the title.

Each run happened in its own isolated environment with no shared state. We tracked tokens, quota usage, wall-clock time, and bugs found.

## About the Models

**Hawiyat Composer** is not a single model. It is a smart router and optimization layer built on top of a collection of frontier models. The Hawiyat team designed it to keep costs low by routing requests to the most efficient model for each task. It is offered at three subscription tiers with monthly usage limits.

The architecture supports a 1M context window, but the team currently limits it to 200K tokens to balance cost and quality. This trade-off is intentional: 200K tokens is sufficient for most code review tasks while keeping the subscription price accessible.

For this benchmark, we ran Hawiyat Composer at **max** reasoning level, which activates its full routing pipeline and largest available context window.

**Claude Opus 4.8** is Anthropic's flagship reasoning model, run as a single model with no routing layer. We ran it at the **high** reasoning level. The single-model architecture is part of why it consumes more tokens and burns through daily quotas faster than Hawiyat Composer.

---

## Results

### Bugs Found

![Bugs found comparison table](https://raw.githubusercontent.com/Hawiyat-Org/hawiyat-agents-benchmarks/main/reports/blog/bugs-found.png)

Both agents found and correctly fixed the same core set: missing `await`, wrong status codes, TOCTOU races, middleware leaks, N+1 queries, missing transactions, unhandled promise rejections, and TanStack Query cache issues.

### The Three Bugs Both Missed

All three missed bugs share a common thread: they are not obvious from error messages or stack traces. They look like working code.

1. **N+1 in `posts.ts`.** The `/posts/:id/with-author` endpoint does a separate `findUnique` call for the author. This is the exact same pattern as the analytics N+1 that both agents found. They fixed one instance and missed the other because it appeared in a different endpoint context.

2. **`Promise.all` fail-fast in `dashboard.ts`.** The dashboard fetches users, posts, and benchmarks with `Promise.all`. If one fetch fails, the entire response crashes. Neither agent replaced it with `Promise.allSettled` — a defensive programming habit that neither model has internalized.

3. **`undefined` filter in `users.ts`.** When no `email` query parameter is provided, the Prisma query `where: { email: undefined }` returns zero results instead of all users. This is a subtle framework-specific behavior that both agents overlooked.

### Extra Findings

Claude Opus 4.8 discovered two genuine bugs outside our planted set:
- The Hono RPC client had a double `/api` prefix causing 404s on all typed client calls.
- The `AppType` was not re-exported from the API package entry, breaking typed RPC routes.

Hawiyat Composer fixed pre-existing `tsconfig` issues that prevented `pnpm build` from passing. This was not one of our 20 bugs, but without it the benchmark was broken.

### Quota and Time

![Quota and time comparison table](https://raw.githubusercontent.com/Hawiyat-Org/hawiyat-agents-benchmarks/main/reports/blog/quota-time.png)

Both agents finished in about an hour. Claude Opus 4.8 spent twice as much compute time thinking, but the wall-clock difference was only two minutes.

### Quota Efficiency

Hawiyat Composer used 2.5% of its monthly subscription for 16 bugs — roughly 33 full benchmark runs per month on a single plan.

Claude Opus 4.8 used 54% of its daily quota for 17 bugs — roughly 2.5 full benchmark runs per day before hitting the cap.

The billing models are fundamentally different: a monthly subscription with a predictable ceiling versus daily usage limits that reset. Monthly subscriptions suit high-volume screening. Daily quotas work for individual deep audits.

### Code Changes

Both agents produced surgical diffs. No large refactors. No rewrites.

![Code changes comparison table](https://raw.githubusercontent.com/Hawiyat-Org/hawiyat-agents-benchmarks/main/reports/blog/code-changes.png)

---

## Convergent Failure Analysis

The most striking result is not the score difference. It is the overlap.

Both agents missed the exact same three bugs. This is not random. These three bugs represent failure modes that frontier models consistently struggle with:

- **Cross-file pattern transfer.** The N+1 in `posts.ts` is structurally identical to the one in `analytics.ts`. Both agents found the first instance and missed the second. The pattern did not transfer across file boundaries.

- **Defensive programming gaps.** `Promise.allSettled` instead of `Promise.all` is an engineering habit, not a bug fix. Neither model applied the defensive pattern unprompted.

- **Framework-specific knowledge.** Prisma's `undefined` filter behavior is a framework quirk that looks like correct code unless you know the gotcha. Both agents treated it as working code.

The bugs they found break production loudly — crashes, timeouts, wrong status codes. The bugs they missed break production quietly — gradually degrading data quality and user experience over time.

---

## Limitations

This is one benchmark with one run per agent. We did not run statistical significance tests. The results are directional, not definitive.

Hawiyat Composer's 20 claimed fixes included changes that were not in our original 20 bugs. Whether this counts as over-claiming depends on whether you count only planted bugs or every fixable issue in the codebase. We scored only planted bugs.

Claude Opus 4.8's 54% daily quota consumption means a single benchmark run uses roughly half a day's allocation. Results will vary by plan tier and workload.

---

## Conclusion

The choice between these two agents depends on the job.

For high-volume screening or cost-sensitive work, **Hawiyat Composer at max** is the value pick. It found 16 of 20 bugs for 2.5% of a monthly subscription, finished in under an hour, and fixed the broken build that made the benchmark runnable in the first place.

For a single thorough pass, **Claude Opus 4.8 at high** produced the most complete report. It surfaced 17 of 20 original bugs plus two extra legitimate issues, and it was the only run to catch the RPC double-prefix and the missing AppType export.

The broader finding is that the missed bugs are not model-specific. They are pattern-specific. Both agents failed on the same three categories: cross-file consistency, defensive programming, and framework edge cases. These are the kinds of problems that slip through any automated review — whether the reviewer is a frontier model or a human engineer working against a deadline.

The benchmark is open source. Clone it, run your own agent, and see what it misses.

---

**Related links:**
- [PR #1: Hawiyat Composer results](https://github.com/Hawiyat-Org/hawiyat-agents-benchmarks/pull/1)
- [PR #2: Claude Opus 4.8 results](https://github.com/Hawiyat-Org/hawiyat-agents-benchmarks/pull/2)
- [Benchmark repository](https://github.com/Hawiyat-Org/hawiyat-agents-benchmarks)
- [Agent instructions (AGENTS.md)](https://github.com/Hawiyat-Org/hawiyat-agents-benchmarks/blob/main/AGENTS.md)
- [SWE-bench reference](https://github.com/SWE-bench/SWE-bench.git)
