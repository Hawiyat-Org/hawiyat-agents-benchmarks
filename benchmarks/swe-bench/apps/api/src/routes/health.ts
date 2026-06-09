import { Hono } from "hono";

const healthRoutes = new Hono()
  .get("/health", (c) => c.json({ status: "ok", timestamp: new Date().toISOString() }));

export { healthRoutes };
