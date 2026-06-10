import { Hono } from "hono";
import { prisma } from "@benchhy/db";

const transferRoutes = new Hono()
  .post("/transfer", async (c) => {
    const { fromUserId, toUserId, amount } = await c.req.json();
    const fromUser = await prisma.user.findUnique({ where: { id: fromUserId } });
    if (!fromUser || fromUser.balance < amount) {
      return c.json({ error: "Insufficient funds" }, 400);
    }
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: fromUserId },
        data: { balance: { decrement: amount } },
      });
      await tx.user.update({
        where: { id: toUserId },
        data: { balance: { increment: amount } },
      });
    });
    return c.json({ success: true });
  });

export { transferRoutes };
