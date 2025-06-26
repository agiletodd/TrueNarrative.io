import express from "express";
import { getAdminDashboardStats } from "../controllers/adminController.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { ensureAdmin } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Protect and restrict access to admins only
router.get(
  "/admin/dashboard",
  requireAuth,
  ensureAdmin,
  getAdminDashboardStats
);

export default router;
