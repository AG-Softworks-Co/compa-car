import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import { fileURLToPath } from "node:url";
import { telefunc } from "telefunc/vite";
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    TanStackRouterVite(),
    // @ts-expect-error
    telefunc({
      disableNamingConvention: true,
    }),
  ],
  resolve: {
    alias: [
      {
        find: "@",
        replacement: fileURLToPath(new URL("./src", import.meta.url)),
      },
      {
        find: "$",
        replacement: fileURLToPath(new URL("./server/src/functions", import.meta.url)),
      }
    ],
  },
});
