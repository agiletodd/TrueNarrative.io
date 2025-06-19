import express from "express";
import {
  getCommentsForIdea,
  createComment,
  deleteComment,
  updateComment,
} from "../controllers/ideaCommentController.js";
import { requireAuthOptional } from "../middleware/requireAuth.js";

const router = express.Router();

router.get("/comments/ideas/:ideaId/comments", getCommentsForIdea);
router.post("/comments/", requireAuthOptional, createComment);
router.delete("/comments/:commentId", requireAuthOptional, deleteComment);
router.put("/comments/:commentId", requireAuthOptional, updateComment);

export default router;
