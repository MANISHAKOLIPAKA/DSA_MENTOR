import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db";
import authRoutes from "./routes/auth";
import progressRoutes from "./routes/progress";
import roadmapRoutes from "./routes/roadmap";
import integrationRoutes from "./routes/integrations";

const app = express();
const PORT = process.env.PORT ?? 5000;

app.use(cors({ origin: process.env.CLIENT_URL ?? "http://localhost:3000" }));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/roadmap", roadmapRoutes);
app.use("/api/integrations", integrationRoutes);

app.get("/health", (_req, res) => res.json({ status: "ok" }));

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  });
