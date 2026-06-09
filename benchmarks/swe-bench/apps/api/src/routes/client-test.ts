import { Hono } from "hono";
import { prisma } from "@benchhy/db";

const clientRoutes = new Hono()
  .get("/users-per-request", async (c) => {
    const users = await prisma.user.findMany();
    return c.json({ users });
  });

export { clientRoutes };
