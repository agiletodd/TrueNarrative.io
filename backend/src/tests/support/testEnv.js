// Settings for the test run. vitest.config.js applies them to the test
// workers, and globalSetup.js uses them to prepare the database. They take
// precedence over backend/.env, so tests never use dev.db or a real secret.
// SQLite paths are relative to prisma/schema.prisma: this is prisma/test.db.
export const TEST_DATABASE_URL = "file:./test.db";

export const testEnv = {
  DATABASE_URL: TEST_DATABASE_URL,
  JWT_SECRET: "test-only-secret-that-is-at-least-32-characters",
};
