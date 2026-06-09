import { Hono } from "hono";
import { prisma } from "@benchhy/db";

const transferRoutes = new Hono()
  .post("/transfer", async (c) => {
    const { fromUserId, toUserId, amount } = await c.req.json();
    const fromUser = await prisma.user.findUnique({ where: { id: fromUserId } });
    if (!fromUser || fromUser.balance < amount) {
      return c.json({ error: "Insufficient funds" }, 400);
    }
    await prisma.user.update({
      where: { id: fromUserId },
      data: { balance: fromUser.balance - amount },
    });
    const toUser = await prisma.user.findUnique({ where: { id: toUserId } });
    await prisma.user.update({
      where: { id: toUserId },
      data: { balance: (toUser?.balance ?? 0) + amount },
    });
    return c.json({ success: true });
  });

export { transferRoutes };
