import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function getAllFeedback(req, res) {
  const feedback = await prisma.feedback.findMany();
  res.json(feedback);
}

export async function createFeedback(req, res) {
  const { title, description } = req.body;
  const feedback = await prisma.feedback.create({
    data: { title, description },
  });
  res.status(201).json(feedback);
}
