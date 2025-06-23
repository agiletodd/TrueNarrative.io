import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { generateToken } from "../utils/jwt.js";
import { formatUser } from "../utils/formatUser.js";

const prisma = new PrismaClient();

export async function register(req, res) {
  try {
    const { email, password, firstname, lastname, avatarUrl, bio } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required." });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstname,
        lastname,
        avatarUrl,
        bio,
        role: "USER",
        lastLogin: new Date(),
      },
    });

    const token = generateToken({ userId: user.id, role: user.role });

    res.status(201).json({ token, user: formatUser(user) });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    const token = generateToken({ userId: user.id, role: user.role });

    res.json({ token, user: formatUser(user) });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
}
