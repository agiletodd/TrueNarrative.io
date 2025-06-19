import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import authRouter from "./src/routes/authRoutes.js";
import ideaRoutes from "./src/routes/ideaRoutes.js";
import productRoutes from "./src/routes/productRoutes.js";
import ideaVoteRoutes from "./src/routes/ideaVoteRoutes.js";
import ideaCommentRoutes from "./src/routes/ideaCommentRoutes.js";
const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    exposedHeaders: ["Authorization"],
  })
);
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "../public")));

app.use("/api", authRouter);
app.use("/api", ideaRoutes);
app.use("/api", productRoutes);
app.use("/api", ideaVoteRoutes);
app.use("/api", ideaCommentRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

export default app;
