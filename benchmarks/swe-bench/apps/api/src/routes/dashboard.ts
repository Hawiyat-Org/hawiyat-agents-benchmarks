import { Hono } from "hono";
import { prisma } from "@benchhy/db";

const dashboardRoutes = new Hono()
  .get("/dashboard", async (c) => {
    const [users, posts, benchmarks] = await Promise.all([
      prisma.user.findMany(),
      prisma.post.findMany(),
      prisma.benchmark.findMany(),
    ]);
    return c.json({ users, posts, benchmarks });
  });

export { dashboardRoutes };
