import { Hono } from "hono";
import { prisma } from "@benchhy/db";

const analyticsRoutes = new Hono()
  .get("/analytics/posts-with-authors", async (c) => {
    const posts = await prisma.post.findMany();
    const result = await Promise.all(
      posts.map(async (post) => {
        const author = await prisma.user.findUnique({
          where: { id: post.authorId },
        });
        return { ...post, author };
      })
    );
    return c.json({ posts: result });
  });

export { analyticsRoutes };
