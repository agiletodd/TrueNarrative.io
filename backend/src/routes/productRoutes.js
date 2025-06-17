// src/routes/productRoutes.js
import express from "express";
import { getMyProducts } from "../controllers/productController.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();
router.get("/mine", requireAuth, getMyProducts);
export default router;
