# Two AI Agents, One Broken Codebase, and the Three Bugs Neither Could See

We built a full-stack TypeScript application with 20 hidden bugs. Then we handed it to two different AI agents and told them to find everything. No hints. No map. Just the code and a test suite that flickered with failures.

One agent was Hawiyat Composer, a purpose-built coding assistant. The other was Claude Opus 4.8, Anthropic's flagship model. Neither knew how many bugs we planted. Neither knew where we hid them. Both had to discover them through code review, testing, and reasoning.

The result was stranger than we expected. Both found almost the same bugs. Both missed the exact same three. And the agent that used less of its quota was not the one you might guess.

## TL;DR

- Hawiyat Composer found 16 of 20 bugs using 3% of its monthly Pro subscription
- Claude Opus 4.8 found 17 of 20 bugs using 40% of its daily quota
- Both missed the same 3 bugs
- Claude Opus 4.8 found 2 extra legitimate bugs that were not in our original 20
- Hawiyat Composer fixed the broken build that Claude Opus 4.8 left untouched
- Both took about an hour. Both used roughly 230k input tokens. Both produced minimal, correct diffs.

The real surprise was not which agent won. It was that the bugs they missed were the same ones.

## What We Built

The codebase is a realistic monorepo:

- Frontend: TanStack Start (React, TanStack Router, TanStack Query)
- Backend: Hono API server with Zod validation
- Database: Prisma ORM with SQLite
- Monorepo: pnpm workspaces + Turborepo

We seeded 20 bugs across three difficulty levels:
- Easy: missing `await`, wrong HTTP status codes, staleTime/gcTime confusion, middleware ordering
- Medium: N+1 queries, missing transactions, race conditions, query invalidation bugs
- Hard: connection pool exhaustion, TOCTOU races, unhandled promise rejections, pagination logic errors

The bugs are not labeled. There are no TODO comments. There is no `BUG` marker. The agents had to find them the same way a human engineer would: by reading the code, running the tests, and noticing what did not make sense.

## Results

### Bugs Found

| Model | Original bugs found | Extra bugs found | Bugs claimed | Honest score |
|-------|-------------------|-----------------|--------------|--------------|
| Hawiyat Composer | 16/20 (80%) | 0 | 20 | 16/20 |
| Claude Opus 4.8 | 17/20 (85%) | 2 | 19 | 17/20 + 2 extras |

Both agents fixed the same core set: missing `await`, wrong status codes, TOCTOU races, middleware leaks, N+1 queries, missing transactions, unhandled promise rejections, and TanStack Query cache issues.

### The Three Bugs Both Missed

1. **N+1 in `posts.ts`**: `/posts/:id/with-author` does a separate `findUnique` for the author. This is the exact same pattern as the analytics N+1 they both found. They fixed one and missed the other.
2. **`Promise.all` fail-fast in `dashboard.ts`**: The dashboard fetches users, posts, and benchmarks with `Promise.all`. If one fails, the entire response crashes. Neither agent replaced it with `Promise.allSettled`.
3. **`undefined` filter in `users.ts`**: When no `email` query param is provided, `where: { email: undefined }` returns empty results instead of all users. This is a subtle Prisma behavior that both agents overlooked.

### Extra Findings

Claude Opus 4.8 found two bugs that were not in our original 20 but were real:
- The Hono RPC client had a double `/api` prefix that caused 404s
- The `AppType` was not re-exported from the API package entry, breaking typed RPC calls

Hawiyat Composer fixed the pre-existing `tsconfig` issues that prevented `pnpm build` from passing. This was not one of our 20 bugs, but it made the benchmark actually usable.

### Quota and Time

| Model | Quota used | API time | Wall time |
|-------|-----------|----------|-----------|
| Hawiyat Composer | 3% of monthly subscription | 12m 54s | 53m 17s |
| Claude Opus 4.8 | 40% of daily quota | 26m 9s | 55m 31s |

Both agents took about an hour. Claude Opus 4.8 spent twice as much API time thinking, but the wall-clock difference was only two minutes.

### Code Changes

Both produced minimal, focused diffs. No large refactors. No rewrites. The fixes were surgical.

| Model | Files modified | Lines added | Lines removed |
|-------|---------------|-------------|--------------|
| Hawiyat Composer | 16 | 204 | 68 |
| Claude Opus 4.8 | 14 | 216 | 55 |

## What Each Agent Did

### Hawiyat Composer

Found the major blockers and most of the hard bugs. Caught the missing `await`, the TOCTOU race, the auth middleware leak, the N+1 query, the missing transaction, the unhandled promise rejection, the TanStack Query cache issues, and the pagination logic error.

It claimed 20 bugs but padded the count with 4 extra fixes that were not in our original set. The honest score was 16/20.

### Claude Opus 4.8

Found the same major blockers plus one more original bug (the `useInfiniteQuery` termination logic). It also discovered two legitimate extra bugs not in our original 20.

It claimed 19 bugs and broke them down honestly: 17 original + 2 extras.

It did not fix the pre-existing `tsconfig` build failures. Hawiyat Composer did.

## Quota Efficiency

Hawiyat Composer used 3% of its monthly subscription for 16 bugs. That means roughly 33 full benchmark runs per month on a single subscription.

Claude Opus 4.8 used 40% of its daily quota for 17 bugs. That means roughly 2.5 full benchmark runs per day before hitting the cap.

The billing models are different: monthly subscription vs. daily usage limits. If you need to run many benchmarks, the monthly subscription is more predictable. If you need one deep audit, the daily quota is fine.

## The Real Finding: Convergent Failure

The most interesting part of this benchmark is not the score. It is the overlap.

Both agents missed the exact same three bugs. This is not a coincidence. These three bugs represent failure modes that even frontier models struggle with:

- **Cross-file consistency**: The `posts.ts` N+1 is identical to the `analytics.ts` N+1 they both found. The difference is that one is in a list endpoint and the other is in a single-resource endpoint. The pattern is the same, but the context is different, and neither agent transferred the pattern.
- **Defensive programming**: Replacing `Promise.all` with `Promise.allSettled` is a habit, not a bug. Neither agent had the habit.
- **Framework edge cases**: Prisma's `undefined` filter behavior is a subtle framework quirk. Both agents missed it because it does not look like a bug. It looks like working code.

The bugs they found are the ones that break production loudly. The bugs they missed are the ones that break production quietly.

## Limitations and Caveats

This is one benchmark, one run each. We did not run statistical significance tests. We did not test on larger codebases or with more bugs. The results are directional, not definitive.

Hawiyat Composer's 20 claimed bugs included fixes that were not in our original 20. Whether this counts as over-claiming depends on whether you count only the bugs we planted or every fixable issue in the codebase. We counted only the planted bugs for scoring.

Claude Opus 4.8's 40% daily quota usage means a single benchmark consumed nearly half a day's allocation. Your mileage may vary depending on your plan.

## What We Recommend

If you need to run many benchmarks or screen every PR, Hawiyat Composer is the more practical choice. The monthly subscription means you do not have to ration runs. You can benchmark every PR, every branch, every experiment.

If you need a deep audit on a critical path before a major release, Claude Opus 4.8 is the more thorough choice. It found more original bugs and caught edge cases that the other agent missed. Just budget your daily quota accordingly.

The convergent failure is the real takeaway. Both agents missed the same three bugs. That means these bugs are not model-specific. They are pattern-specific. They are the kinds of bugs that slip through any automated review, whether the reviewer is a neural network or a human engineer who has not slept enough.

That gap is where the next generation of models should focus. Not on finding more of the bugs that break production loudly. On finding the ones that break it quietly.

**Try it yourself**: The benchmark is open source at https://github.com/Hawiyat-Org/hawiyat-agents-benchmarks. Clone it, run it, and see what your agent misses.
