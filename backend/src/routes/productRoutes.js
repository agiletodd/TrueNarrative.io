// src/routes/productRoutes.js
import express from "express";
import {
  getMyProducts,
  getProductById,
  addProduct,
  editProduct,
  deleteProduct,
  getProductByGuid,
} from "../controllers/productController.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

router.get("/products/mine", requireAuth, getMyProducts);
router.get("/products/:id", requireAuth, getProductById);
router.get("/products/guid/:guid", getProductByGuid);

router.post("/products/", requireAuth, addProduct);
router.put("/products/:id", requireAuth, editProduct);
router.delete("/products/:id", requireAuth, deleteProduct);

export default router;
