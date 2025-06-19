import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function submitVote(req, res) {
  const ideaId = parseInt(req.params.ideaId);
  const typeRaw = req.body.voteType;
  const voteType = (typeRaw || "").toUpperCase();
  const userId = req.user?.id;
  const guestId = req.body.guestId;

  if (!["UP", "DOWN"].includes(voteType) || !ideaId) {
    return res.status(400).json({ error: "Invalid vote payload" });
  }

  if (!userId && !guestId) {
    return res.status(400).json({ error: "Missing guest ID" });
  }

  try {
    const data = {
      ideaId,
      type: voteType,
    };

    if (userId) data.userId = userId;
    else data.guestId = guestId;

    const uniqueWhere = userId
      ? { ideaId_userId: { ideaId, userId } }
      : { ideaId_guestId: { ideaId, guestId } };

    const existing = await prisma.ideaVote.findUnique({ where: uniqueWhere });

    if (existing) {
      if (existing.type === voteType) {
        return res
          .status(409)
          .json({ error: "Already voted", reason: "duplicate_vote" });
      } else {
        await prisma.ideaVote.update({
          where: uniqueWhere,
          data: { type: voteType },
        });
      }
    } else {
      await prisma.ideaVote.create({ data });
    }

    const [upvotes, downvotes, updatedIdea] = await Promise.all([
      prisma.ideaVote.count({ where: { ideaId, type: "UP" } }),
      prisma.ideaVote.count({ where: { ideaId, type: "DOWN" } }),
      prisma.idea.findUnique({ where: { id: ideaId } }),
    ]);

    res.json({ ...updatedIdea, upvotes, downvotes });
  } catch (err) {
    console.error("Vote error:", err);
    res.status(500).json({ error: "Vote submission failed" });
  }
}

export async function getVoteStatus(req, res) {
  const { ideaId } = req.params;
  const userId = req.user?.id;
  const guestId = req.query.guestId;

  try {
    const [vote, upCount, downCount] = await Promise.all([
      userId
        ? prisma.ideaVote.findUnique({
            where: {
              ideaId_userId: { ideaId: Number(ideaId), userId },
            },
          })
        : guestId
        ? prisma.ideaVote.findUnique({
            where: {
              ideaId_guestId: { ideaId: Number(ideaId), guestId },
            },
          })
        : null,
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
