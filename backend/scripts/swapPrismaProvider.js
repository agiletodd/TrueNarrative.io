// scripts/swapPrismaProvider.js
import fs from "fs";

const schemaPath = "./prisma/schema.prisma";
const isProd = process.env.NODE_ENV === "production";
const desiredProvider = isProd ? "postgresql" : "sqlite";

try {
  let schema = fs.readFileSync(schemaPath, "utf8");

  const updated = schema.replace(
    /provider\s*=\s*"(sqlite|postgresql)"/,
    `provider = "${desiredProvider}"`
  );

  if (schema === updated) {
    console.log(
      `ℹ️ Provider already set to '${desiredProvider}', no changes made.`
    );
  } else {
    fs.writeFileSync(schemaPath, updated);
    console.log(`✅ Prisma provider set to '${desiredProvider}'`);
  }
} catch (err) {
  console.error("❌ Failed to update schema.prisma:", err.message);
  process.exit(1);
}
