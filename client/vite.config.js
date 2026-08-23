import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

import tailwindcss from "@tailwindcss/vite";
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // base: "/music-explorer",
  // Source - https://stackoverflow.com/a/75719691
  // Posted by Zahid Hassan Shaikot, modified by community. See post 'Timeline' for change history
  // Retrieved 2026-07-25, License - CC BY-SA 4.0
  server: {
    proxy: {
      // Whenever React asks for /api/..., forward it to your local Node server
      "/api": {
        target: "http://localhost:3001", // Change 3000 to your backend port if it's different
        changeOrigin: true,
      },
      // Whenever React asks for /auth/..., forward it to your local Node server
      "/auth": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            return id
              .toString()
              .split("node_modules/")[1]
              .split("/")[0]
              .toString();
          }
        },
      },
    },
  },
});
