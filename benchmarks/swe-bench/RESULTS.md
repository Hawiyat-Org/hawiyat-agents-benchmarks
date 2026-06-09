## Bug Fix Report

### Bug 1: Missing `await` on user creation
- **File**: `apps/api/src/routes/users.ts`
- **Line**: `32`
- **Issue**: `prisma.user.create({ data })` was called without `await`, returning a Promise instead of the actual user object to the response.
- **Fix**: Added `await` before `prisma.user.create()`.

### Bug 2: Wrong HTTP status code on user creation
- **File**: `apps/api/src/routes/users.ts`
- **Line**: `33`
- **Issue**: Creating a user returned HTTP status `200` (OK) instead of `201` (Created).
- **Fix**: Changed `return c.json({ user }, 200)` to `return c.json({ user }, 201)`.

### Bug 3: Concurrent user creation race condition
- **File**: `apps/api/src/routes/users.ts`
- **Line**: `35-42`
- **Issue**: The `/users/concurrent` endpoint did a check-then-insert pattern with a TOCTOU flaw. Two simultaneous requests with the same email could both pass the `findUnique` check, and the second `create` would throw an unhandled Prisma `P2002` error, returning 500 instead of 409.
- **Fix**: Removed the separate existence check and instead wrapped `prisma.user.create()` in try/catch — when Prisma's `P2002` unique constraint error is caught, return `409`.

### Bug 4: Global auth middleware blocking public routes
- **File**: `apps/api/src/app.ts`
- **Line**: `41`
- **Issue**: `app.use(authMiddleware)` at the root level applied authentication to **all** routes, including public ones like `/api/v1/users`, `/api/v1/public/info`, and `/api/auth/*`.
- **Fix**: Removed the global `app.use(authMiddleware)`. The admin routes already have their own auth check.

### Bug 5: Admin sub-router auth middleware leaking to sibling routes
- **File**: `apps/api/src/routes/admin.ts`
- **Line**: `5`
- **Issue**: The `adminRoutes` sub-router had `.use(authMiddleware)` at the top level. When mounted at `/api/v1` in Hono v4, this middleware leaked to all other sub-routers mounted after it, making them require authentication.
- **Fix**: Changed from sub-router-level `.use(authMiddleware)` to per-route middleware via `.get("/admin/stats", authMiddleware, ...)`.

### Bug 6: Incorrect Hono wildcard route pattern
- **File**: `apps/api/src/app.ts`
- **Line**: `39`
- **Issue**: The route `app.on(["GET", "POST"], "/api/auth/**", ...)` used `**` which is not valid Hono routing syntax. Hono uses `*` for catch-all wildcard matching.
- **Fix**: Changed `/**` to `/*`.

### Bug 7: Unhandled promise rejection in email sending
- **File**: `apps/api/src/routes/orders.ts`
- **Line**: `23`
- **Issue**: `sendConfirmationEmail()` is an async function that throws an error 50% of the time. It was called without `await` or `.catch()`, causing an unhandled promise rejection that could crash the process.
- **Fix**: Added `.catch()` to handle the rejection gracefully with a warning log.

### Bug 8: Missing transaction in balance transfer
- **File**: `apps/api/src/routes/transfer.ts`
- **Line**: `5-21`
- **Issue**: The balance transfer read fromUser's balance, deducted it, read toUser's balance, and credited it — all without a database transaction. A concurrent transfer involving the same user could corrupt balances (TOCTOU race condition). If the deduction succeeded but the credit failed, funds would be lost.
- **Fix**: Wrapped the entire transfer in `prisma.$transaction()` and used atomic `increment`/`decrement` operations.

### Bug 9: N+1 query in analytics endpoint
- **File**: `apps/api/src/routes/analytics.ts`
- **Line**: `6-13`
- **Issue**: The analytics route fetched all posts, then fetched each post's author individually in a loop (`Promise.all` map). This creates N+1 database queries.
- **Fix**: Used `prisma.post.findMany({ include: { author: true } })` to fetch posts with authors in a single query.

### Bug 10: Balance update race condition
- **File**: `apps/api/src/routes/users.ts`
- **Line**: `48-52`
- **Issue**: The balance update read the current balance, computed `user.balance + amount`, and then wrote it back. Between the read and the write, another concurrent request could modify the balance, causing a lost update.
- **Fix**: Replaced `data: { balance: user.balance + amount }` with the atomic `data: { balance: { increment: amount } }` operation.

### Bug 11: Creating PrismaClient per request
- **File**: `apps/api/src/routes/client-test.ts`
- **Line**: `6`
- **Issue**: Each request to `/users-per-request` created a new `PrismaClient` instance via constructor cast, bypassing the global singleton. This could exhaust database connections.
- **Fix**: Replaced with the shared `prisma` singleton from `@benchhy/db`.

### Bug 12: No-op error handler middleware
- **File**: `apps/api/src/middleware/error.ts`
- **Line**: `3-5`
- **Issue**: The `errorHandler` middleware just called `await next()` without catching errors, making it a complete no-op.
- **Fix**: Wrapped `await next()` in try/catch to properly catch and return error responses.

### Bug 13: Module-level QueryClient breaking cache invalidation
- **File**: `apps/web/src/lib/hooks/use-queries.ts`
- **Line**: `4`
- **Issue**: A separate `new QueryClient()` was created at module scope instead of using the one from React context. The `onSuccess` callback in `useBenchmarks` used this orphaned instance, so its `invalidateQueries` call had no effect on the actual query cache.
- **Fix**: Removed the module-level QueryClient instance.

### Bug 14: `onSuccess` callback in `useQuery` (removed in TanStack Query v5)
- **File**: `apps/web/src/lib/hooks/use-queries.ts`
- **Line**: `14`
- **Issue**: `onSuccess` was removed from `useQuery` options in TanStack Query v5. It was silently ignored, so the analytics invalidation never fired.
- **Fix**: Removed the `onSuccess` callback entirely (it had the wrong invalidation target anyway — invalidating analytics when benchmarks were fetched was backwards logic).

### Bug 15: `exact: true` preventing posts query invalidation
- **File**: `apps/web/src/lib/hooks/use-queries.ts`
- **Line**: `60`
- **Issue**: `queryClient.invalidateQueries({ queryKey: ["posts"], exact: true })` could never invalidate the actual query `["posts", { status: "published" }]` because `exact: true` requires the keys to match exactly.
- **Fix**: Removed `exact: true` so the prefix matches all posts queries.

### Bug 16: Optimistic update targeting wrong query key
- **File**: `apps/web/src/lib/hooks/use-queries.ts`
- **Line**: `54`
- **Issue**: `queryClient.setQueryData(["posts"], ...)` set optimistic data on key `["posts"]`, but the actual query was keyed at `["posts", { status: "published" }]`. The optimistic update had no visible effect.
- **Fix**: Changed the key to `["posts", { status: "published" }]` to match the actual query key.

### Bug 17: Infinite re-render loop in auto-refresh hook
- **File**: `apps/web/src/lib/hooks/use-auto-refresh.ts`
- **Line**: `9-12`
- **Issue**: The `useEffect` depended on `data` from `useDashboard()` and invalidated the dashboard query inside the effect. Each invalidation triggered a refetch, which created a new `data` reference, which triggered the effect again — creating an infinite loop.
- **Fix**: Replaced with `setInterval`-based periodic refresh that doesn't depend on query data.

### Bug 18: `gcTime: 0` causing immediate garbage collection
- **File**: `apps/web/src/lib/query-client.ts`
- **Line**: `7`
- **Issue**: Setting `gcTime: 0` caused cached query data to be garbage collected immediately after a query became unused (e.g., navigating away from a page). Combined with `staleTime: 5 * 60 * 1000`, this made the cache behave counterintuitively — data stayed fresh for 5 minutes but was evicted instantly.
- **Fix**: Changed `gcTime` to `5 * 60 * 1000` (5 minutes) to match the `staleTime`.

### Bug 19: TypeScript unused imports and parameters
- **File**: Multiple files
- **Issue**: Several unused imports and parameters across the codebase caused `tsc --noUnusedLocals` / `--noUnusedParameters` build failures:
  - `auth.ts`: Unused `Hono` import
  - `orders.ts`: Unused `email`/`orderId` parameters in `sendConfirmationEmail`
  - `routes.test.ts`: Unused `prisma` import, unused `testUserId`/`testUserId2` variables
  - `use-queries.ts`: Unused `QueryClient` import, unused `lastPage` parameter
- **Fix**: Removed unused declarations and prefixed intentionally-unused parameters with `_`.

### Bug 20: Monorepo tsconfig rootDir misconfiguration
- **File**: `apps/api/tsconfig.json`
- **Line**: `5`
- **Issue**: The API's tsconfig had `rootDir: "."` which resolved to `apps/api/`. Since workspace packages (`@benchhy/db`, `@benchhy/shared`) exist at `../../packages/*`, TypeScript errored with "File is not under 'rootDir'". This also blocked `pnpm build` from succeeding.
- **Fix**: Changed `rootDir` to `"../.."` and updated `include` to cover the workspace packages.

## Verification

- **`pnpm build`**: PASS (all TypeScript errors resolved)
- **`pnpm test`**: PASS (22/22 tests pass, 0 unhandled errors)
- **`pnpm dev` (API)**: PASS (server starts at http://localhost:3001)
- **`pnpm dev` (Web)**: Pre-existing peer dependency issue — `vinxi` requires `vite@^6` but the project has `vite@^5`. This is not related to any of the 20 bugs.

## Notes

- All fixes are minimal and targeted — no files were rewritten, no dependencies were added.
- No Prisma schema was modified.
- No test files were deleted or modified in ways that would make tests pass artificially.
- The `format.md` and `task.md` files were not modified.
- The web frontend startup error (`isRunnableDevEnvironment` missing from vite) is a pre-existing peer dependency compatibility issue between `vinxi` and `vite`, not a seeded bug.
- The dashboard route and health routes were reviewed and confirmed correct (no bugs found).
