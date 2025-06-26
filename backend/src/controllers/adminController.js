import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function getAdminDashboardStats(req, res) {
  try {
    const [userCount, productCount, ideaCount, voteCount, commentCount] =
      await Promise.all([
        prisma.user.count(),
        prisma.product.count(),
        prisma.idea.count(),
        prisma.ideaVote.count(),
        prisma.ideaComment.count(),
      ]);

    const recentUsers = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        email: true,
        firstname: true,
        lastname: true,
        createdAt: true,
        lastLogin: true,
        role: true,
      },
    });

    const recentIdeas = await prisma.idea.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        user: { select: { id: true, email: true } },
        product: { select: { id: true, name: true } },
      },
    });

    const ideaStatusCounts = await prisma.idea.groupBy({
      by: ["status"],
      _count: true,
    });

    const voteStats = await prisma.ideaVote.groupBy({
      by: ["type"],
      _count: true,
    });

    const topIdeas = await prisma.idea.findMany({
      take: 5,
      orderBy: {
        votes: {
          _count: "desc",
        },
      },
      include: {
        _count: {
          select: { votes: true, comments: true },
        },
        product: { select: { id: true, name: true } },
        user: { select: { id: true, email: true } },
      },
    });

    const topUsers = await prisma.user.findMany({
      take: 5,
      orderBy: {
        ideas: {
          _count: "desc",
        },
      },
      include: {
        _count: {
          select: {
            ideas: true,
            ideaVotes: true,
            comments: true,
          },
        },
      },
    });

    const topProducts = await prisma.product.findMany({
      take: 5,
      orderBy: {
        ideas: {
          _count: "desc",
        },
      },
      include: {
        _count: {
          select: {
            ideas: true,
          },
        },
        owner: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    res.json({
      totals: {
        users: userCount,
        products: productCount,
        ideas: ideaCount,
        votes: voteCount,
        comments: commentCount,
      },
      recentUsers,
      recentIdeas,
      ideaStatusCounts,
      voteStats,
      topIdeas,
      topUsers,
      topProducts,
    });
  } catch (err) {
    console.error("Failed to fetch admin stats:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
