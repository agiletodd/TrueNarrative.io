import express from "express";
import {
  getIdeasForProduct,
  submitIdea,
  getIdeaById,
} from "../controllers/ideaController.js";
import { requireAuthOptional } from "../middleware/requireAuth.js";

const router = express.Router();

router.get("/ideas/:productId", requireAuthOptional, getIdeasForProduct);
router.get("/idea/:ideaId", requireAuthOptional, getIdeaById);
router.post("/ideas/:productId", requireAuthOptional, submitIdea);

export default router;
