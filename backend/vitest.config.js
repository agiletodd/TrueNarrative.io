import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    // Test-only settings. These take precedence over backend/.env, so tests
    // never sign tokens with a developer's secret or touch dev.db.
    env: {
      JWT_SECRET: "test-only-secret-that-is-at-least-32-characters",
      DATABASE_URL: "file:./test.db",
    },
    coverage: {
      reporter: ["text", "html"],
    },
  },
});
