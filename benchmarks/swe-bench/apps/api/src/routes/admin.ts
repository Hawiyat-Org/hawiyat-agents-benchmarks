import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth.js";

const adminRoutes = new Hono()
  .use("/admin/*", authMiddleware)
  .get("/admin/stats", (c) => {
    return c.json({ stats: "admin data" });
  });

export { adminRoutes };
