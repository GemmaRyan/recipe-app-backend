import { MongoClient, Db, Collection } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const connectionString: string = process.env.DB_CONN_STRING || "";
const dbName: string = process.env.DB_NAME || "Web2Project";
const client = new MongoClient(connectionString);

export const collections: { Recipe?: Collection } = {}

if (connectionString == "") {
    throw new Error("No connection string  in .env");
}


let db: Db;

export async function initDb(): Promise<void> {

    try {
        await client.connect();
        db = client.db(dbName);
        const recipeCollection: Collection = db.collection('Recipe')
        collections.Recipe = recipeCollection;

        console.log('connected to database')

    }

    catch (error) {
        if (error instanceof Error) {
            console.log(`issue with db connection ${error.message}`);
        } else {
            console.log(`error with ${error}`);
        }

    }

}
