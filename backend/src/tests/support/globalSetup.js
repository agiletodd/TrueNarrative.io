// Runs once before the test files: recreates prisma/test.db from the schema
// and generates Prisma Client, so tests do not depend on a prior db:setup.
import { execFileSync } from "child_process";
import { fileURLToPath } from "url";
import { TEST_DATABASE_URL } from "./testEnv.js";

export default function setup() {
  // --force-reset drops all data, so never point it anywhere but the test database.
  if (TEST_DATABASE_URL !== "file:./test.db") {
    throw new Error(`Refusing to reset a non-test database: ${TEST_DATABASE_URL}`);
  }

  const backendDir = fileURLToPath(new URL("../../..", import.meta.url));
  execFileSync(
    process.execPath,
    ["node_modules/prisma/build/index.js", "db", "push", "--force-reset"],
    {
      cwd: backendDir,
      env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
      stdio: "pipe",
    }
  );
}
