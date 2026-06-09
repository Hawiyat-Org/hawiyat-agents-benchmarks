import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { userRoutes } from "./routes/users.js";
import { postRoutes } from "./routes/posts.js";
import { benchmarkRoutes } from "./routes/benchmarks.js";
import { orderRoutes } from "./routes/orders.js";
import { orgRoutes } from "./routes/organizations.js";
import { healthRoutes } from "./routes/health.js";
import { dashboardRoutes } from "./routes/dashboard.js";
import { analyticsRoutes } from "./routes/analytics.js";
import { transferRoutes } from "./routes/transfer.js";
import { clientRoutes } from "./routes/client-test.js";
import { adminRoutes } from "./routes/admin.js";
import { publicRoutes } from "./routes/public.js";
import { authMiddleware } from "./middleware/auth.js";
import { errorHandler } from "./middleware/error.js";

const app = new Hono()
  .use(cors())
  .use(logger())
  .use(errorHandler);

app.get("/", (c) => c.json({ message: "Benchhy API" }));

app.route("/api/v1", healthRoutes);
app.route("/api/v1", benchmarkRoutes);
app.route("/api/v1", publicRoutes);
app.route("/api/v1", adminRoutes);
app.route("/api/v1", userRoutes);
app.route("/api/v1", postRoutes);
app.route("/api/v1", orderRoutes);
app.route("/api/v1", orgRoutes);
app.route("/api/v1", dashboardRoutes);
app.route("/api/v1", analyticsRoutes);
app.route("/api/v1", transferRoutes);
app.route("/api/v1", clientRoutes);

app.on(["GET", "POST"], "/api/auth/**", (c) => c.json({ auth: true }));

app.use(authMiddleware);

app.onError((err, c) => {
  console.error(err);
  return c.json({ error: "Internal server error" }, 500);
});

export type AppType = typeof app;
export default app;
