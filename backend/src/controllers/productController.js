// src/controllers/productController.js
import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";
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

// POST /api/products
export async function addProduct(req, res) {
  try {
    const userId = req.user?.id;
    const { name, description } = req.body;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    if (!name || !description) {
      return res
        .status(400)
        .json({ error: "Name and description are required" });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        guid: randomUUID(),
        ownerId: userId,
      },
    });

    res.status(201).json(product);
  } catch (err) {
    console.error("Error adding product:", err);
    res.status(500).json({ error: "Failed to add product" });
  }
}

// PUT /api/products/:id
export async function editProduct(req, res) {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { name, description } = req.body;
    const productId = parseInt(id);

    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    if (!name || !description) {
      return res
        .status(400)
        .json({ error: "Name and description are required" });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || product.ownerId !== userId) {
      return res.status(403).json({ error: "Unauthorized access" });
    }

    const updated = await prisma.product.update({
      where: { id: productId },
      data: { name, description },
    });

    res.json(updated);
  } catch (err) {
    console.error("Error editing product:", err);
    res.status(500).json({ error: "Failed to edit product" });
  }
}

// DELETE /api/products/:id
export async function deleteProduct(req, res) {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const productId = parseInt(id);

    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || product.ownerId !== userId) {
      return res.status(403).json({ error: "Unauthorized access" });
    }

    await prisma.product.delete({ where: { id: productId } });

    res.status(204).send();
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ error: "Failed to delete product" });
  }
}
