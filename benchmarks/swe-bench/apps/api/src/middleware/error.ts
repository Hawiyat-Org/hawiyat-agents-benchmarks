import { createMiddleware } from "hono/factory";

export const errorHandler = createMiddleware(async (c, next) => {
  await next();
});
