import { Hono } from "hono";
import { prisma } from "@benchhy/db";

const transferRoutes = new Hono()
  .post("/transfer", async (c) => {
    const { fromUserId, toUserId, amount } = await c.req.json();
    const result = await prisma.$transaction(async (tx) => {
      const fromUser = await tx.user.findUnique({ where: { id: fromUserId } });
      if (!fromUser || fromUser.balance < amount) {
        return { error: "Insufficient funds" };
      }
      await tx.user.update({
        where: { id: fromUserId },
        data: { balance: { decrement: amount } },
      });
      await tx.user.update({
        where: { id: toUserId },
        data: { balance: { increment: amount } },
      });
      return { success: true };
    });
    if ("error" in result) {
      return c.json(result, 400);
    }
    return c.json(result);
  });

export { transferRoutes };
