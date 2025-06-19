import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function getIdeasForProduct(req, res) {
  try {
    const productId = parseInt(req.params.productId);
    if (isNaN(productId)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }

    const ideas = await prisma.idea.findMany({
      where: { productId },
      orderBy: { createdAt: "desc" },
      include: {
        votes: {
          select: { type: true },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });

    const enrichedIdeas = ideas.map((idea) => {
      const upvotes = idea.votes.filter((v) => v.type === "UP").length;
      const downvotes = idea.votes.filter((v) => v.type === "DOWN").length;

      return {
        ...idea,
        upvotes,
        downvotes,
        commentCount: idea._count.comments,
        votes: undefined,
        _count: undefined,
      };
    });

    res.json(enrichedIdeas);
  } catch (error) {
    console.error("Error fetching ideas:", error);
    res.status(500).json({ error: "Failed to fetch ideas" });
  }
}

export async function submitIdea(req, res) {
  try {
    const { productId } = req.params;
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const idea = await prisma.idea.create({
      data: {
        title,
        description,
        productId: parseInt(productId),
        userId: req.user?.id || null,
      },
    });

    res.status(201).json(idea);
  } catch (err) {
    console.error("Error submitting idea:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function getIdeaById(req, res) {
  const ideaId = parseInt(req.params.ideaId);
  if (isNaN(ideaId)) {
    return res.status(400).json({ error: "Invalid idea ID" });
  }

  try {
    const idea = await prisma.idea.findUnique({
      where: { id: ideaId },
      include: {
        votes: true,
        comments: {
          orderBy: { createdAt: "desc" },
          include: {
            user: {
              select: {
                id: true,
                firstname: true,
                lastname: true,
              },
            },
          },
        },
        _count: { select: { comments: true } },
      },
    });

    if (!idea) return res.status(404).json({ error: "Idea not found" });

    const upvotes = idea.votes.filter((v) => v.type === "UP").length;
    const downvotes = idea.votes.filter((v) => v.type === "DOWN").length;

    res.json({
      ...idea,
      upvotes,
      downvotes,
      votes: undefined,
    });
  } catch (err) {
    console.error("Error fetching idea:", err);
    res.status(500).json({ error: "Failed to fetch idea" });
  }
}
