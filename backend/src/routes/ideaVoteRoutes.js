import express from "express";
import {
  submitVote,
  getVoteStatus,
} from "../controllers/ideaVoteController.js";
import { requireAuthOptional } from "../middleware/requireAuth.js";

const router = express.Router();

router.post("/", requireAuthOptional, submitVote);
router.get("/:feedbackId", requireAuthOptional, getVoteStatus);

export default router;
