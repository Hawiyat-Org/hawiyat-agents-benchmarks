import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { createOrderSchema } from "@benchhy/shared";
import { prisma } from "@benchhy/db";

async function sendConfirmationEmail(email: string, orderId: string) {
  await new Promise((resolve) => setTimeout(resolve, 100));
  if (Math.random() > 0.5) throw new Error("Email service unavailable");
}

const orderRoutes = new Hono()
  .get("/orders", async (c) => {
    const orders = await prisma.order.findMany({
      include: { user: true },
    });
    return c.json({ orders });
  })
  .post("/orders", zValidator("json", createOrderSchema), async (c) => {
    const data = c.req.valid("json");
    const user = await prisma.user.findUnique({ where: { id: data.userId } });
    if (!user) return c.json({ error: "User not found" }, 404);
    const order = await prisma.order.create({ data });
    sendConfirmationEmail(user.email, order.id).catch((err) => {
      console.error("Failed to send confirmation email:", err);
    });
    return c.json({ order }, 201);
  });

export { orderRoutes };
