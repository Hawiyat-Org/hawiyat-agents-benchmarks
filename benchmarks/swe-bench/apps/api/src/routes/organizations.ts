import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { createMemberSchema } from "@benchhy/shared";
import { prisma } from "@benchhy/db";

const orgRoutes = new Hono()
  .get("/organizations", async (c) => {
    const orgs = await prisma.organization.findMany({
      include: { members: { include: { user: true } } },
    });
    return c.json({ organizations: orgs });
  })
  .post("/organizations/:id/members", zValidator("json", createMemberSchema), async (c) => {
    const orgId = c.req.param("id");
    const data = c.req.valid("json");
    const member = await prisma.member.create({
      data: { orgId, userId: data.userId, role: data.role },
    });
    return c.json({ member }, 201);
  })
  .post("/organizations/:id/bulk-members", async (c) => {
    const orgId = c.req.param("id");
    const members: Array<{ userId: string; role: string }> = await c.req.json();
    const created = await Promise.all(
      members.map((m) =>
        prisma.member.upsert({
          where: { orgId_userId: { orgId, userId: m.userId } },
          update: { role: m.role },
          create: { orgId, userId: m.userId, role: m.role },
        })
      )
    );
    return c.json({ members: created }, 201);
  });

export { orgRoutes };
