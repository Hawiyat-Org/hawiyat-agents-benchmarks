import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { createPostSchema, paginationSchema } from "@benchhy/shared";
import { prisma } from "@benchhy/db";

const postRoutes = new Hono()
  .get("/posts", zValidator("query", paginationSchema), async (c) => {
    const { page, limit } = c.req.valid("query");
    const offset = (page - 1) * limit;
    const posts = await prisma.post.findMany({
      skip: offset,
      take: limit,
    });
    return c.json({ posts });
  })
  .get("/posts/:id", async (c) => {
    const id = c.req.param("id");
    const post = await prisma.post.findUnique({
      where: { id },
    });
    if (!post) return c.json({ error: "Not found" }, 404);
    return c.json({ post });
  })
  .get("/posts/:id/with-author", async (c) => {
    const id = c.req.param("id");
    const post = await prisma.post.findUnique({
      where: { id },
    });
    if (!post) return c.json({ error: "Not found" }, 404);
    const author = await prisma.user.findUnique({ where: { id: post.authorId } });
    return c.json({ post: { ...post, author } });
  })
  .post("/posts", zValidator("json", createPostSchema), async (c) => {
    const data = c.req.valid("json");
    const post = await prisma.post.create({ data });
    return c.json({ post }, 201);
  });

export { postRoutes };
