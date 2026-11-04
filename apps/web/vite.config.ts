import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      // Auth routes: forward /api/auth/* to the backend WITHOUT stripping the
      // prefix, because better-auth is mounted at /api/auth on the server.
      // This rule must come before the generic /api rule so it matches first.
      "/api/auth": {
        target: "http://localhost:5050",
        changeOrigin: true,
      },
      "/api": {
        target: "http://localhost:5050",
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, "")
      },
    }
  }
});