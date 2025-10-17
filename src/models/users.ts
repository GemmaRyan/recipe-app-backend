import { ObjectId } from "mongodb";
import { z } from "zod";

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

//getting the regex patterns in place for validation
  const ALPHANUM_AND_SPACES = /^[A-Za-z0-9\s]+$/;


export const createRecipeSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters.")
    .regex(ALPHANUM_AND_SPACES),

  origin: z
    .string()
    .optional() // this alone does not allow undefined values
    .or(z.literal(undefined)), // got from chatgpt to allow underfined fields too  -- not just blank

  ingredients: z
    .array(
      z
        .string()
        .min(1, "Ingredient cannot be empty.")
    )
    .min(1, "At least one ingredient is required."),

  difficulty: z.number({error: "Difficulty must be a number." })
    .min(1, "Difficulty must be at least 1")
    .max(5, "Difficulty cannot be greater than 5"),

  recipe: z
    .array(
      z
        .string()
        .min(1, "Recipe step cannot be empty.")
    )
    .min(1, "At least one recipe step is required."),

  cookingDuration: z
    .string()
    .regex(/^[0-9-\s]+$/, "Cooking duration can only contain numbers, dashes, and spaces")
    .optional(),

  imageUrl: z.string().optional(),
  
});

