import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function submitVote(req, res) {
  const { ideaId, type } = req.body;
  const userId = req.user?.id;
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  if (!["UP", "DOWN"].includes(type) || !ideaId) {
    return res.status(400).json({ error: "Invalid vote payload" });
  }

  try {
    const data = {
      ideaId,
      type,
    };
    if (userId) data.userId = userId;
    else if (ip) data.ipAddress = ip;

    await prisma.$transaction(async (tx) => {
      // Check existing vote
      const existing = userId
        ? await tx.ideaVote.findUnique({
            where: { ideaId_userId: { ideaId, userId } },
          })
        : await tx.ideaVote.findUnique({
            where: { ideaId_ipAddress: { ideaId, ipAddress: ip } },
          });

      if (existing) {
        res.status(409).json({ error: "Already voted" });
        throw new Error("abort");
      }

      await tx.ideaVote.create({ data });
    });

    res.json({ success: true });
  } catch (err) {
    if (err.message === "abort") return;
    console.error("Vote error:", err);
    res.status(500).json({ error: "Vote submission failed" });
  }
}

export async function getVoteStatus(req, res) {
  const { ideaId } = req.params;
  const userId = req.user?.id;
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  try {
    const [vote, upCount, downCount] = await Promise.all([
      userId
        ? prisma.ideaVote.findUnique({
            where: {
              ideaId_userId: { ideaId: Number(ideaId), userId },
            },
          })
        : prisma.ideaVote.findUnique({
            where: {
              ideaId_ipAddress: { ideaId: Number(ideaId), ipAddress: ip },
            },
          }),
      prisma.ideaVote.count({
        where: { ideaId: Number(ideaId), type: "UP" },
      }),
      prisma.ideaVote.count({
        where: { ideaId: Number(ideaId), type: "DOWN" },
      }),
    ]);

    res.json({
      voted: Boolean(vote),
      type: vote?.type || null,
      thumbsUp: upCount,
      thumbsDown: downCount,
    });
  } catch (err) {
    console.error("Vote status error:", err);
    res.status(500).json({ error: "Failed to get vote status" });
  }
}
