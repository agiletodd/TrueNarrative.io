import express from "express";
import {
  getIdeasForProduct,
  submitIdea,
  getIdeaById,
} from "../controllers/ideaController.js";
import { requireAuthOptional } from "../middleware/requireAuth.js";

const router = express.Router();

router.get("/ideas/:productId", requireAuthOptional, getIdeasForProduct);
router.post("/ideas/:productId", requireAuthOptional, submitIdea);
router.get("/idea/:ideaId", getIdeaById);

export default router;
