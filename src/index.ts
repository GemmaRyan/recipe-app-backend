import express, { Application, Request, Response } from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import userRoutes from "./routes/recipe";
import cors from 'cors';
import { initDb } from "./database";
import { authenticateKey } from "./middleware/auth.middleware";
export { app }; 

dotenv.config(); 

const PORT = process.env.PORT || 3001;
const app: Application = express();


app.use(morgan("tiny"));  
app.use(express.json());  

app.get("/ping", (_req: Request, res: Response) => {
  res.json({ message: "hello from Gemma" });
});

app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));

//adding in the authenticate key middleware to protect the routes
app.use("/api/v1/users", authenticateKey, userRoutes);

initDb()
