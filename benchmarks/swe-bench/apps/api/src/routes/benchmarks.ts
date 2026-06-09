import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { createBenchmarkSchema } from "@benchhy/shared";
import { prisma } from "@benchhy/db";

const benchmarkRoutes = new Hono()
  .get("/benchmarks", async (c) => {
    const benchmarks = await prisma.benchmark.findMany();
    return c.json({ benchmarks });
  })
  .get("/benchmarks/:id", async (c) => {
    const id = c.req.param("id");
    const benchmark = await prisma.benchmark.findUnique({
      where: { id },
    });
    if (!benchmark) return c.json({ error: "Not found" }, 404);
    return c.json({ benchmark });
  })
  .post("/benchmarks", zValidator("json", createBenchmarkSchema), async (c) => {
    const data = c.req.valid("json");
    const benchmark = await prisma.benchmark.create({ data });
    return c.json({ benchmark }, 201);
  });

export { benchmarkRoutes };
