import { Hono } from "hono";
import { prisma } from "@benchhy/db";

const analyticsRoutes = new Hono()
  .get("/analytics/posts-with-authors", async (c) => {
    const posts = await prisma.post.findMany({
      include: { author: true },
    });
    return c.json({ posts });
  });

export { analyticsRoutes };
