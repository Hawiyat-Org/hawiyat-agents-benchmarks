We audited the Same Codebase with Hawiyat Composer and Claude Opus 4.8

Our task is Benchmarking our llms with the same harness layer by auditing the Same Codebase with Hawiyat Composer (max) and Claude Opus 4.8 (high)

We used **Claude Code** as the harness layer — the orchestration tool that runs the agents and manages the benchmark environment. The actual models under test were Hawiyat Composer (at its max reasoning level) and Claude Opus 4.8 (at its high reasoning level).

Hawiyat Composer is a specialized AI agent built for software engineering tasks by [https://hawiya.org](https://hawiya.org). Claude Opus 4.8 is Anthropic's flagship reasoning model by [https://claude.ai](https://claude.ai). The two sit at very different price points and quota structures, and we wanted to see how they perform head-to-head.

We gave both the same task: find and fix all bugs in a real codebase. No hints. No map. Just the code and a test suite that flickered with failures.

The exact benchmark prompt and instructions and layout can be found in [AGENTS.md](https://github.com/Hawiyat-Org/hawiyat-agents-benchmarks/blob/main/AGENTS.md)

**TL;DR:** Hawiyat Composer found 16 of 20 bugs using 2.5% of its monthly Pro subscription. Claude Opus 4.8 found 17 of 20 bugs using 54% of its daily quota and 16% of weekly subscription. Both missed the exact same 3 bugs. Claude Opus 4.8 found 2 extra legitimate bugs not in the original set, but Hawiyat Composer fixed the broken build that Claude left untouched.

The real surprise was not which agent won. It was that the bugs they missed were the same ones.

## Our Setup

The codebase is a full-stack TypeScript monorepo:

- **Frontend:** TanStack Start (React, TanStack Router, TanStack Query)
- **Backend:** Hono API server with Zod validation
- **Database:** Prisma ORM with SQLite
- **Monorepo:** pnpm workspaces + Turborepo

We seeded 20 bugs across three difficulty levels:
- the bugs followed the leading ai agents benchmark in SWE tasks [https://github.com/SWE-bench/SWE-bench.git](https://github.com/SWE-bench/SWE-bench.git)
- **Easy:** missing `await`, wrong HTTP status, staleTime/gcTime confusion, middleware ordering
- **Medium:** N+1 queries, missing transactions, race conditions, invalidation bugs
- **Hard:** connection pool exhaustion, TOCTOU races, unhandled promise rejections, pagination logic errors

The bugs are not labeled. There are no TODO comments. There is no `BUG` marker. The agents had to find them the same way a human engineer would: by reading the code, running the tests, and noticing what did not make sense.

We asked each model to review the code. Each run got the same prompt:

> Clone this repo, follow AGENTS.md, and submit your fixes as a PR with your model name in the title.

Each model ran in its own isolated environment with no shared state, orchestrated by Claude Code as the harness layer. We tracked tokens, quota usage, wall-clock time, and bugs found.

## About the Models

**Hawiyat Composer** is not a single model. It is a smart router and optimization layer built on top of a collection of frontier models. The Hawiyat team designed it to keep costs low by routing requests to the most efficient model for each task. It is currently offered at three subscription tiers with monthly usage limits.

The architecture supports a 1M context window, but the team currently limits it to 200K tokens to balance cost cutting with quality. This trade-off is intentional: they found that 200K is enough for most code review tasks while keeping the subscription price reasonable.

**Claude Opus 4.8** is Anthropic's flagship reasoning model. For this benchmark, we ran it at the **high** reasoning level. It runs as a single model with no routing layer, which is part of why it costs more and burns through daily quotas faster than Hawiyat Composer.

**Hawiyat Composer** was run at the **max** reasoning level for this benchmark. At max, it uses its full smart routing pipeline and the largest available context window.

## Results

### Bugs Found

| Model | Original bugs found | Extra bugs found | Bugs claimed | Honest score |
|-------|-------------------|-----------------|--------------|--------------|
| Hawiyat Composer | 16/20 (80%) | 1 (build error) | 20 | 16/20 + 1 extra |
| Claude Opus 4.8 | 17/20 (85%) | 2 | 19 | 17/20 + 2 extras |

Both agents found and correctly fixed the same core set: missing `await`, wrong status codes, TOCTOU races, middleware leaks, N+1 queries, missing transactions, unhandled promise rejections, and TanStack Query cache issues.

### The Three Bugs Both Missed

1. **N+1 in `posts.ts`:** `/posts/:id/with-author` does a separate `findUnique` for the author. This is the exact same pattern as the analytics N+1 they both found. They fixed one and missed the other.

2. **`Promise.all` fail-fast in `dashboard.ts`:** The dashboard fetches users, posts, and benchmarks with `Promise.all`. If one fails, the entire response crashes. Neither agent replaced it with `Promise.allSettled`.

3. **`undefined` filter in `users.ts`:** When no `email` query param is provided, `where: { email: undefined }` returns empty results instead of all users. This is a subtle Prisma behavior that both agents overlooked.

### Extra Findings

Claude Opus 4.8 found two bugs that were not in our original 20 but were real:
- The Hono RPC client had a double `/api` prefix that caused 404s
- The `AppType` was not re-exported from the API package entry, breaking typed RPC calls

Hawiyat Composer fixed the pre-existing `tsconfig` issues that prevented `pnpm build` from passing. This was not one of our 20 bugs, but it made the benchmark actually usable.

### Quota and Time

| Model | Quota used | API time | Wall time |
|-------|-----------|----------|-----------|
| Hawiyat Composer | 2.5% of monthly subscription | 12m 54s | 53m 17s |
| Claude Opus 4.8 | 54% of daily quota | 26m 9s | 55m 31s |

Both agents took about an hour. Claude Opus 4.8 spent twice as much API time thinking, but the wall-clock difference was only two minutes.

### Code Changes

Both produced minimal, focused diffs. No large refactors. No rewrites. The fixes were surgical.

| Model | Files modified | Lines added | Lines removed |
|-------|---------------|-------------|--------------|
| Hawiyat Composer | 16 | 204 | 68 |
| Claude Opus 4.8 | 14 | 216 | 55 |

## What Each Run Found

### Hawiyat Composer (max)

Found the major blockers and most of the hard bugs. Caught the missing `await`, the TOCTOU race, the auth middleware leak, the N+1 query, the missing transaction, the unhandled promise rejection, the TanStack Query cache issues, and the pagination logic error.

It claimed 20 bugs but padded the count with 4 extra fixes that were not in our original set. The honest score was 16/20.

### Claude Opus 4.8 (high)

Found the same major blockers plus one more original bug (the `useInfiniteQuery` termination logic). It also discovered two legitimate extra bugs not in our original 20.

It claimed 19 bugs and broke them down honestly: 17 original + 2 extras.

It did not fix the pre-existing `tsconfig` build failures. Hawiyat Composer did.

## Quota Efficiency

Hawiyat Composer used 2.5% of its monthly subscription for 16 bugs. That means roughly 33 full bechmark runs per month on a single subscription.

Claude Opus 4.8 used 54% of its daily quota for 17 bugs. That means roughly 2.5 full benchmark runs per day before hitting the cap.

The billing models are different: monthly subscription vs. daily usage limits. If you need to run many benchmarks, the monthly subscription is more predictable. If you need one deep audit, the daily quota is fine.

## The Real Finding: Convergent Failure

The most interesting part of this benchmark is not the score. It is the overlap.

Both agents missed the exact same three bugs. This is not a coincidence. These three bugs represent failure modes that even frontier models struggle with:

- **Cross-file consistency:** The `posts.ts` N+1 is identical to the `analytics.ts` N+1 they both found. The difference is that one is in a list endpoint and the other is in a single-resource endpoint. The pattern is the same, but the context is different, and neither agent transferred the pattern.

- **Defensive programming:** Replacing `Promise.all` with `Promise.allSettled` is a habit, not a bug. Neither agent had the habit.

- **Framework edge cases:** Prisma's `undefined` filter behavior is a subtle framework quirk. Both agents missed it because it does not look like a bug. It looks like working code.

The bugs they found are the ones that break production loudly. The bugs they missed are the ones that break production quietly.

## Limitations and Caveats

This is one benchmark, one run each. We did not run statistical significance tests. We did not test on larger codebases or with more bugs. The results are directional, not definitive.

Hawiyat Composer's 20 claimed bugs included fixes that were not in our original 20. Whether this counts as over-claiming depends on whether you count only the bugs we planted or every fixable issue in the codebase. We counted only the planted bugs for scoring.

Claude Opus 4.8's 54% daily quota usage means a single benchmark consumed nearly half a day's allocation. Your mileage may vary depending on your plan.

## Conclusion

The choice here is less about which model is better and more about matching the run to the job.

For high-volume or low-cost screening, Hawiyat Composer at max is the value pick. It found 16 of 20 bugs for 2.5% of a monthly subscription and finished in under an hour. It caught most of the serious problems, including the N+1 query and the middleware leak that the cheaper Claude Opus 4.8 runs also missed.

For a more thorough single pass, Claude Opus 4.8 at high produced the best report. It surfaced 17 of 20 original bugs plus 2 extra legitimate issues, and it was the only run to catch the RPC client double-prefix and the missing AppType export.

The broader trend worth watching is that the bugs both agents missed are not model-specific. They are pattern-specific. They are the kinds of bugs that slip through any automated review, whether the reviewer is a neural network or a human engineer who has not slept enough.

The practical approach is to test a few agents on the kind of work you actually do, look at how they perform, and pick based on your requirements, budget, and how much coverage the task needs.

**Try it yourself:** The benchmark is open source at https://github.com/Hawiyat-Org/hawiyat-agents-benchmarks. Clone it, run it, and see what your agent misses.

---

**Related links:**
- [PR #1: Hawiyat Composer results](https://github.com/Hawiyat-Org/hawiyat-agents-benchmarks/pull/1)
- [PR #2: Claude Opus 4.8 results](https://github.com/Hawiyat-Org/hawiyat-agents-benchmarks/pull/2)
- [Benchmark repository](https://github.com/Hawiyat-Org/hawiyat-agents-benchmarks)
- [Agent instructions (AGENTS.md)](https://github.com/Hawiyat-Org/hawiyat-agents-benchmarks/blob/main/AGENTS.md)
- [SWE-bench reference](https://github.com/SWE-bench/SWE-bench.git)
