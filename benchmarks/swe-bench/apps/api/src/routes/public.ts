import { Hono } from "hono";

const publicRoutes = new Hono()
  .get("/public/info", (c) => {
    return c.json({ info: "public data" });
  });

export { publicRoutes };
