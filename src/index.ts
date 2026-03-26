import express, { Application, Request, Response } from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import recipeRoutes from "./routes/recipe";
import cors from 'cors';
import { initDb } from "./database";
import authRoutes from "./routes/auth";


dotenv.config(); 

const PORT = process.env.PORT || 3001;
const app: Application = express();


app.use(morgan("tiny"));  
app.use(express.json());  


app.use(cors({
  origin: ['http://localhost:4200',
    'https://recipe-app-frontend-jy3h.onrender.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.get("/ping", (_req: Request, res: Response) => {
  res.json({ message: "hello from Gemma" });
});


app.use("/api/recipes", recipeRoutes);

app.use("/api/auth", authRoutes);

initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch(error => {
  console.error("Database initialization failed:", error);
  process.exit(1);
});

export { app };