import express, { Application, Request, Response } from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import recipeRoutes from "./routes/recipe";
import authRoutes from "./routes/auth";
import cors from "cors";
import { initDb } from "./database";

dotenv.config();

const app: Application = express();

app.use(morgan("tiny"));
app.use(express.json());

app.use(cors({
  origin: [
    "http://localhost:4200",
    "https://recipe-app-frontend-jy3h.onrender.com"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.get("/ping", (_req: Request, res: Response) => {
  res.json({ message: "hello from Gemma" });
});

app.use("/api/recipes", recipeRoutes);
app.use("/api/auth", authRoutes);

initDb()
  .then(() => {
    console.log("Connected to database");
  })
  .catch((error) => {
    console.error("Database initialization failed:", error);
    process.exit(1);
  });

export { app };