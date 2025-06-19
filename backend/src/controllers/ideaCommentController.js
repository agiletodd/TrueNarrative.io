import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function getCommentsForIdea(req, res) {
  const ideaId = parseInt(req.params.ideaId);

  if (isNaN(ideaId)) {
    return res.status(400).json({ error: "Invalid idea ID" });
  }

  try {
    const comments = await prisma.ideaComment.findMany({
      where: { ideaId },
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
    });

    res.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
}

export async function createComment(req, res) {
  const { ideaId, content, guestName, guestId } = req.body;
  const userId = req.user?.id;

  if (!ideaId || !content?.trim()) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (!userId && (!guestName?.trim() || !guestId)) {
    return res
      .status(400)
      .json({ error: "Guest name and ID required for unauthenticated users." });
  }

  try {
    const newComment = await prisma.ideaComment.create({
      data: {
        ideaId,
        content: content.trim(),
        userId: userId || null,
        guestId: userId ? null : guestId,
        guestName: userId ? null : guestName.trim(),
      },
      include: {
        user: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
          },
        },
      },
    });

    res.status(201).json(newComment);
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ error: "Failed to create comment" });
  }
}

export async function deleteComment(req, res) {
  const commentId = parseInt(req.params.commentId);
  const userId = req.user?.id;

  if (isNaN(commentId)) {
    return res.status(400).json({ error: "Invalid comment ID" });
  }

  try {
    const comment = await prisma.ideaComment.findUnique({
      where: { id: commentId },
    });

    if (!comment) return res.status(404).json({ error: "Comment not found" });

    if (comment.userId !== userId) {
      return res.status(403).json({ error: "Unauthorized to delete comment" });
    }

    await prisma.ideaComment.delete({ where: { id: commentId } });

    res.status(204).end();
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ error: "Failed to delete comment" });
  }
}

export async function updateComment(req, res) {
  const commentId = parseInt(req.params.commentId);
  const userId = req.user?.id;
  const { content } = req.body;

  if (isNaN(commentId) || !content?.trim()) {
    return res.status(400).json({ error: "Invalid request" });
  }

  try {
    const existing = await prisma.ideaComment.findUnique({
      where: { id: commentId },
    });

    if (!existing) {
      return res.status(404).json({ error: "Comment not found" });
    }

    if (existing.userId !== userId) {
      return res
        .status(403)
        .json({ error: "Unauthorized to edit this comment" });
    }

    const updated = await prisma.ideaComment.update({
      where: { id: commentId },
      data: { content: content.trim() },
    });

    res.json(updated);
  } catch (error) {
    console.error("Error updating comment:", error);
    res.status(500).json({ error: "Failed to update comment" });
  }
}
