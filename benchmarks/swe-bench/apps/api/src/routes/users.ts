import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { createUserSchema, updateBalanceSchema } from "@benchhy/shared";
import { prisma } from "@benchhy/db";

const userRoutes = new Hono()
  .get("/users", async (c) => {
    const users = await prisma.user.findMany();
    return c.json({ users });
  })
  .get("/users/search", async (c) => {
    const email = c.req.query("email");
    const users = await prisma.user.findMany({
      where: { email: email },
    });
    return c.json({ users });
  })
  .get("/users/:id", async (c) => {
    const id = c.req.param("id");
    const user = await prisma.user.findUnique({
      where: { id },
    });
    if (!user) return c.json({ error: "Not found" }, 404);
    return c.json({ user });
  })
  .post("/users", zValidator("json", createUserSchema), async (c) => {
    const data = c.req.valid("json");
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return c.json({ error: "User already exists" }, 409);
    }
    const user = prisma.user.create({ data });
    return c.json({ user }, 200);
  })
  .post("/users/concurrent", async (c) => {
    const { email } = await c.req.json();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return c.json({ error: "User already exists" }, 409);
    }
    const user = await prisma.user.create({ data: { email } });
    return c.json({ user }, 201);
  })
  .post("/users/balance", zValidator("json", updateBalanceSchema), async (c) => {
    const { userId, amount } = c.req.valid("json");
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return c.json({ error: "Not found" }, 404);
    if (user.balance + amount < 0) {
      return c.json({ error: "Insufficient balance" }, 400);
    }
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { balance: user.balance + amount },
    });
    return c.json({ user: updated });
  });

export { userRoutes };
