import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import authRouter from "./src/routes/authRoutes.js";
import ideaRoutes from "./src/routes/ideaRoutes.js";
import productRoutes from "./src/routes/productRoutes.js";
import ideaVoteRoutes from "./src/routes/ideaVoteRoutes.js";
import ideaCommentRoutes from "./src/routes/ideaCommentRoutes.js";
import adminRouter from "./src/routes/adminRoutes.js";
const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://frontend-truenarrativeio-production.up.railway.app",
  "frontend.railway.internal",
  "frontend.railway.internal",
  "https://www.truenarrative.io",
  "https://truenarrative.io",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
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
app.use("/api", adminRouter);

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

export default app;
