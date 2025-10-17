import { MongoClient, Db, Collection } from "mongodb";
import dotenv from "dotenv";
import { Recipe } from "./models/users";

dotenv.config();

const connectionString: string = process.env.DB_CONN_STRING || "";
const dbName: string = process.env.DB_NAME || "PersonalRecipeBook";

if (!connectionString) throw new Error("No connection string in .env");

const client = new MongoClient(connectionString);

export const collections: { book?: Collection<Recipe> } = {};

let db: Db;

export async function initDb(): Promise<void> {
  try {
    await client.connect();
    db = client.db(dbName);
    collections.book = db.collection<Recipe>("book");

    console.log("Connected to database");
  } catch (error) {
    console.error("Failed to connect to database:", error);
    throw error; 
  }
}

export async function closeDb(): Promise<void> {
    await client.close();
    console.log('Database connection closed');
}
