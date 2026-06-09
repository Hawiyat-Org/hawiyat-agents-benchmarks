import { serve } from "@hono/node-server";
import app from "./app.js";

const port = process.env.PORT ? parseInt(process.env.PORT) : 3001;

serve({
  fetch: app.fetch,
  port,
});

console.log(`API server running at http://localhost:${port}`);
