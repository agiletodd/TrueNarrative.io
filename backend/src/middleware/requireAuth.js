import { PrismaClient } from "@prisma/client";
import { verifyToken } from "../utils/jwt.js";

const prisma = new PrismaClient();

export async function requireAuth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
}

export async function requireAuthOptional(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return next();

  try {
    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (user) {
      req.user = user;
    }
  } catch (err) {
    // Silent fail for optional
  }

  next();
}
