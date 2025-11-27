import express, { Application, Request, Response } from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import recipeRoutes from "./routes/recipe";
import cors from 'cors';
import { initDb } from "./database";
import { authenticateKey } from "./middleware/auth.middleware";

dotenv.config(); 

const PORT = process.env.PORT || 3001;
const app: Application = express();

app.use(morgan("tiny"));  
app.use(express.json());  


app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));

app.get("/ping", (_req: Request, res: Response) => {
  res.json({ message: "hello from Gemma" });
});

// Recipe routes - remove authenticateKey if you want to test without auth first
app.use("/api/recipes", recipeRoutes);

// OR if you want to keep authentication:
// app.use("/api/recipes", authenticateKey, recipeRoutes);

// Initialize database
initDb().then(() => {
  // Start server after DB connection
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch(error => {
  console.error("Database initialization failed:", error);
  process.exit(1);
});

export { app };