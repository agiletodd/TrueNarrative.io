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

router.get("/mine", requireAuth, getMyProducts);
router.get("/:id", requireAuth, getProductById);
router.get("/guid/:guid", getProductByGuid);

router.post("/", requireAuth, addProduct);
router.put("/:id", requireAuth, editProduct);
router.delete("/:id", requireAuth, deleteProduct);

export default router;
