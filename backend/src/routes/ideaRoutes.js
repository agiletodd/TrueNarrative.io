import express from "express";
import {
  getIdeasForProduct,
  submitIdea,
} from "../controllers/ideaController.js";
import { requireAuthOptional } from "../middleware/requireAuth.js";

const router = express.Router();

router.get("/:productId", requireAuthOptional, getIdeasForProduct);
router.post("/:productId", requireAuthOptional, submitIdea);

export default router;
