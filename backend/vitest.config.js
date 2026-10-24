import { defineConfig } from "vitest/config";
import { testEnv } from "./src/tests/support/testEnv.js";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    env: testEnv,
    globalSetup: "./src/tests/support/globalSetup.js",
    // All test files share one SQLite database, so run them one at a time.
    fileParallelism: false,
    coverage: {
      reporter: ["text", "html"],
    },
  },
});
