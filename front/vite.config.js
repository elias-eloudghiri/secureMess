import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import viteBasicSslPlugin from "@vitejs/plugin-basic-ssl";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), viteBasicSslPlugin()],
  server: {
    https: true,
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
});
