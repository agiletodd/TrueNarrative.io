import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  // The third argument loads variables without the VITE_ prefix. These are
  // used only by the dev server here and are never bundled into the browser.
  const env = loadEnv(mode, __dirname, "");

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    server: {
      open: true,
      // Forward API calls to the backend so the browser sees one origin in
      // development: no CORS setup, and the frontend port can be anything.
      proxy: {
        "/api": env.API_PROXY_TARGET || "http://localhost:4000",
      },
    },
  };
});
