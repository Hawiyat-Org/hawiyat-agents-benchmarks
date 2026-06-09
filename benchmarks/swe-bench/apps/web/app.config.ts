import { defineConfig } from "@tanstack/start/config";
import viteReact from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  vite: {
    plugins: [viteReact()],
    resolve: {
      alias: {
        "@benchhy/web": resolve(__dirname, "./src"),
        "@benchhy/db": resolve(__dirname, "../../packages/db/src"),
        "@benchhy/shared": resolve(__dirname, "../../packages/shared/src"),
        "@benchhy/ui": resolve(__dirname, "../../packages/ui/src"),
      },
    },
    server: {
      proxy: {
        "/api": {
          target: "http://localhost:3001",
          changeOrigin: true,
        },
      },
    },
  },
});
