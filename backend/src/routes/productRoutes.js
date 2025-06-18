// src/routes/productRoutes.js
import express from "express";
import {
  getMyProducts,
  getProductById,
  addProduct,
  editProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

// GET /api/products/mine
router.get("/mine", requireAuth, getMyProducts);

// GET /api/products/:id
router.get("/:id", requireAuth, getProductById);

// POST /api/products
router.post("/", requireAuth, addProduct);

// PUT /api/products/:id
router.put("/:id", requireAuth, editProduct);

// DELETE /api/products/:id
router.delete("/:id", requireAuth, deleteProduct);

export default router;
