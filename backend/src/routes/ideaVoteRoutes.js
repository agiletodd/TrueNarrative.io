import express from "express";
import {
  submitVote,
  getVoteStatus,
} from "../controllers/ideaVoteController.js";
import { requireAuthOptional } from "../middleware/requireAuth.js";

const router = express.Router();

router.post("/:ideaId", requireAuthOptional, submitVote);
router.get("/:ideaId", requireAuthOptional, getVoteStatus);

export default router;
