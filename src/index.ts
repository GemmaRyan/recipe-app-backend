import express, { Application, Request, Response } from "express";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import { initDb } from "../src/database";
import userRoutes from "./routes/users";
import { authenticateKey } from "./middleware/auth.middleware";

dotenv.config(); // ✅ Load env vars first

const PORT = process.env.PORT || 3001;
const app: Application = express();

// ------------------------
// Middleware
// ------------------------
app.use(cors());          // ✅ Allow cross-origin requests
app.use(morgan("tiny"));  // ✅ Logging
app.use(express.json());  // ✅ Parse JSON

// ------------------------
// Health check route
// ------------------------
app.get("/ping", (_req: Request, res: Response) => {
  res.json({ message: "Server is running ✅" });
});

// ------------------------
// Example test route
// ------------------------
app.get("/bananas", (_req: Request, res: Response) => {
  res.send("hello world, this is bananas");
});

// ------------------------
// API routes
// ------------------------
app.use("/api/v1/users", authenticateKey, userRoutes);

// ------------------------
// Initialize DB and then start server
// ------------------------
initDb()
  .then(() => {
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch((error) => {
    console.error("❌ Failed to connect to database:", error);
    process.exit(1);
  });