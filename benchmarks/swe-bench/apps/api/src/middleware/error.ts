import { createMiddleware } from "hono/factory";

export const errorHandler = createMiddleware(async (c, next) => {
  try {
    await next();
  } catch (err) {
    console.error(err);
    return c.json({ error: "Internal server error" }, 500);
  }
});
