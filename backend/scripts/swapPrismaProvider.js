// scripts/swapPrismaProvider.js
import fs from "fs";

const schemaPath = "./prisma/schema.prisma";
const isProd = process.env.NODE_ENV === "production";

let schema = fs.readFileSync(schemaPath, "utf8");
schema = schema.replace(
  /provider = "(sqlite|postgresql)"/,
  `provider = "${isProd ? "postgresql" : "sqlite"}"`
);
fs.writeFileSync(schemaPath, schema);

console.log(`✅ Prisma provider set to ${isProd ? "postgresql" : "sqlite"}`);
