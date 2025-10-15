import { ObjectId } from "mongodb";

export interface Recipe {
    id?: ObjectId;
    name: string;
    origin?:string;
    ingredients: string[];
    difficulty: number;
    recipe: string[];
    cookingDuration?: string;
    imageUrl?: string;
}
