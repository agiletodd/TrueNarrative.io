import express from "express";
import {
  getIdeasForProduct,
  submitIdea,
} from "../controllers/ideaController.js";

const router = express.Router();

router.get("/:productId", getIdeasForProduct);
router.post("/:productId", submitIdea);

export default router;
