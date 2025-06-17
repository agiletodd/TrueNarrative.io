import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import path from "path";
import { fileURLToPath } from "url";
import authRouter from "./routes/authRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Needed for __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static assets like favicon
app.use(express.static(path.join(__dirname, "../public")));

app.use("/api/auth", authRouter);
app.use("/api/feedback", feedbackRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/", (req, res) => {
  res.send("API is running");
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
