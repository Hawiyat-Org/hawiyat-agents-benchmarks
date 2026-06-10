import { hc } from "hono/client";
import type { AppType } from "@benchhy/api";

export const client = hc<AppType>(
  typeof window !== "undefined" ? "" : "http://localhost:3001"
);
