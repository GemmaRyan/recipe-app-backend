import express, {Application, Request, Response} from "express" ;
import userRoutes from './routes/users';
import dotenv from "dotenv";
import morgan from "morgan";
import {initDb} from "../src/database";
import {authenticateKey} from './middleware/auth.middleware';

const PORT = process.env.PORT || 3001;

const app: Application = express();

 

app.get("/ping", async (_req : Request, res: Response) => {
    res.json({
    message: "hello from Gemma",
    });
});

app.listen(PORT, () => {
    console.log("Server is running on port", PORT);
    });


app.get('/bananas', async (_req : Request, res: Response) =>
  res.send('hello world, this is bananas'));

app.use(morgan("tiny"));

app.use(express.json());

app.use('/api/v1/users', authenticateKey, userRoutes)

dotenv.config();

initDb()