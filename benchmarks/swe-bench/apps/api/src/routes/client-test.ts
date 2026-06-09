import { Hono } from "hono";
import { prisma } from "@benchhy/db";

const clientRoutes = new Hono()
  .get("/users-per-request", async (c) => {
    const localPrisma = new (prisma.constructor as any)({ datasourceUrl: process.env.DATABASE_URL });
    const users = await localPrisma.user.findMany();
    return c.json({ users });
  });

export { clientRoutes };
