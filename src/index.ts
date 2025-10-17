import express, { Application, Request, Response } from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import userRoutes from "./routes/users";
import { initDb } from "./database";
import { authenticateKey } from "./middleware/auth.middleware";
export { app }; // Export app for testing purposes + Added this myself -- check over later

dotenv.config(); 

const PORT = process.env.PORT || 3001;
const app: Application = express();


app.use(morgan("tiny"));  
app.use(express.json());  

app.get("/ping", (_req: Request, res: Response) => {
  res.json({ message: "hello from Gemma" });
});


//change this later if everything else is working 
app.use("/api/v1/users", authenticateKey, userRoutes);

initDb()
