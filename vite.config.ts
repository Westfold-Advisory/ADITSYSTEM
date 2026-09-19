import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // MapLibre resolves its worker as a separate ESM entrypoint. Let Vite serve
  // the package directly in development instead of generating a stale worker
  // reference under node_modules/.vite/deps.
  optimizeDeps: {
    exclude: ["maplibre-gl"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
