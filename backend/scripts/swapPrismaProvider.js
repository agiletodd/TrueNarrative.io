// Sets the datasource provider in prisma/schema.prisma.
//
// The committed schema uses SQLite for local development. Prisma does not
// allow the provider to come from an environment variable, so the production
// start script runs `node scripts/swapPrismaProvider.js postgresql` inside the
// deployment container before applying the PostgreSQL migrations.
//
// Running it locally edits a tracked file; restore SQLite with
// `node scripts/swapPrismaProvider.js sqlite` (or `git checkout prisma/schema.prisma`).
import fs from "fs";
import { fileURLToPath } from "url";

const schemaPath = fileURLToPath(new URL("../prisma/schema.prisma", import.meta.url));
const desiredProvider = process.argv[2];

if (!["sqlite", "postgresql"].includes(desiredProvider)) {
  console.error("Usage: node scripts/swapPrismaProvider.js <sqlite|postgresql>");
  process.exit(1);
}

try {
  const schema = fs.readFileSync(schemaPath, "utf8");

  const updated = schema.replace(
    /provider\s*=\s*"(sqlite|postgresql)"/,
    `provider = "${desiredProvider}"`
  );

  if (schema === updated) {
    console.log(`ℹ️ Provider already set to '${desiredProvider}', no changes made.`);
  } else {
    fs.writeFileSync(schemaPath, updated);
    console.log(`✅ Prisma provider set to '${desiredProvider}'`);
  }
} catch (err) {
  console.error("❌ Failed to update schema.prisma:", err.message);
  process.exit(1);
}
