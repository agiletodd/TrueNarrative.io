// One Prisma Client for the whole process. Each client owns a connection
// pool, so modules share this instance rather than creating their own.
import { PrismaClient } from "@prisma/client";
import "./config.js"; // validates DATABASE_URL before the client is created

export const prisma = new PrismaClient();
