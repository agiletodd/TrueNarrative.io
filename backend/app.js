import express from "express";
import cors from "cors";
import { config } from "./src/config.js";
import authRouter from "./src/routes/authRoutes.js";
import ideaRoutes from "./src/routes/ideaRoutes.js";
import productRoutes from "./src/routes/productRoutes.js";
import ideaVoteRoutes from "./src/routes/ideaVoteRoutes.js";
import ideaCommentRoutes from "./src/routes/ideaCommentRoutes.js";
import adminRouter from "./src/routes/adminRoutes.js";
const app = express();

app.use(
  cors({
    // Requests without an Origin header (curl, server-to-server) are allowed;
    // CORS only governs which browser pages may read API responses.
    origin: (origin, callback) => {
      callback(null, !origin || config.corsOrigins.includes(origin));
    },
  })
);
app.use(express.json());

app.use("/api", authRouter);
app.use("/api", ideaRoutes);
app.use("/api", productRoutes);
app.use("/api", ideaVoteRoutes);
app.use("/api", ideaCommentRoutes);
app.use("/api", adminRouter);

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

export default app;
