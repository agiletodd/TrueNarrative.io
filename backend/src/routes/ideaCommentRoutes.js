import express from "express";
import {
  getCommentsForIdea,
  createComment,
  deleteComment,
  updateComment,
} from "../controllers/ideaCommentController.js";
import { requireAuthOptional } from "../middleware/requireAuth.js";

const router = express.Router();

// Fetch comments for a specific idea
// corrected path from "/comments/ideas/:ideaId/comments" which was invalid
router.get("/ideas/:ideaId/comments", getCommentsForIdea);
router.post("/comments/", requireAuthOptional, createComment);
router.delete("/comments/:commentId", requireAuthOptional, deleteComment);
router.put("/comments/:commentId", requireAuthOptional, updateComment);

export default router;
