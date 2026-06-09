import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth.js";

const adminRoutes = new Hono()
  .get("/admin/stats", authMiddleware, (c) => {
    return c.json({ stats: "admin data" });
  });

export { adminRoutes };
