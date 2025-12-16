import { MongoClient, Db, Collection } from "mongodb";
import dotenv from "dotenv";
import { Recipe } from "./models/recipe";
import { User } from "./models/user";

dotenv.config();

const connectionString: string = process.env.DB_CONN_STRING || "";
const dbName: string = process.env.DB_NAME || "PersonalRecipeBook";

if (!connectionString) throw new Error("No connection string in .env");

const client = new MongoClient(connectionString);

export const collections: { 
  book?: Collection<Recipe>;
  users?: Collection<User>;
} = {};

let db: Db;

export async function initDb(): Promise<void> {
  try {
    await client.connect();
    db = client.db(dbName);
    collections.book = db.collection<Recipe>("book");
    collections.users = db.collection<User>("users");

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
