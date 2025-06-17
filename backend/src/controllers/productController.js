// src/controllers/productController.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// GET /api/products/mine
export async function getMyProducts(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const products = await prisma.product.findMany({
      where: { ownerId: userId },
      include: { feedbacks: true },
    });

    res.json(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
}

// GET /api/products/:id
export async function getProductById(req, res) {
  try {
    const { id } = req.params;
    const productId = parseInt(id);

    if (isNaN(productId)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { feedbacks: true },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    console.error("Error fetching product by id:", err);
    res.status(500).json({ error: "Failed to fetch product" });
  }
}
