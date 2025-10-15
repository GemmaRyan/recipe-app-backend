import { Request, Response } from 'express';
import { collections } from '../database';
import { Recipe } from '../models/users';
import { ObjectId } from 'mongodb';
//import { createrecipeSchema } from '../models/recipes';

export const getRecipes = async (req: Request, res: Response) => {

  try {
    const recipe = (await collections.recipes?.find({}).toArray()) as unknown as Recipe[];

  } catch (error ) {
    res.status(500).send("oops");
  }
};

export const getRecipesById = async (req: Request, res: Response) => {
  //get a single recipe by ID from the database

  let id: string = req.params.id;
  try {
    const query = { _id: new ObjectId(id) };
    const recipe = (await collections.recipes?.findOne(query)) as unknown as Recipe;

    if (recipe) {
      res.status(200).send(recipe);
    }
  } catch (error) {
    res.status(404).send(`Unable to find matching document with id: ${req.params.id}`);
  }
};


export const createRecipe = async (req: Request, res: Response) => {
  // create a new recipe in the database

  console.log(req.body); //for now still log the data


  //new safeparse area
    // const validation = createrecipeSchema.safeParse(req.body);

    // if (!validation.success) {
    //   return res.status(400).json({
    //     message: 'Validation failed',
    //     errors: validation.error.issues
    //   });
    // }

    const { name,ingredients,origin , difficulty, recipe, imageUrl , cookingDuration} = req.body;
    const newRecipe : Recipe = {name : name, ingredients: ingredients, origin: origin, difficulty: difficulty, recipe:recipe , cookingDuration:cookingDuration, imageUrl:imageUrl};
  try {
    const result = await collections.recipes?.insertOne(newRecipe)

    if (result) {
      res.status(201).location(`${result.insertedId}`).json({ message: `Created a new recipe with id ${result.insertedId}` })
    }
    else {
      res.status(500).send("Failed to create a new recipe.");
    }
  }
  catch (error) {
    if (error instanceof Error)
    {
     console.log(`issue with inserting ${error.message}`);
    }
    else{
      console.log(`error with ${error}`)
    }
    res.status(400).send(`Unable to create new recipe`);
  }
}


// issues with updating the recipe details -- ask again in class 
export const updateRecipe = async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id;

  try {
    const query = { _id: new ObjectId(id) };
    const update = { $set: req.body };

    const result = await collections.recipes?.updateOne(query, update);

    if (!result || result.matchedCount === 0) {
      res.status(404).json({ message: `No recipe found with id ${id}` });
      return;
    }

    res.status(200).json({ message: `Successfully updated recipe ${id}` });
  } catch (error) {
    console.error("Error updating recipe:", error);
    res.status(400).json({ message: "Invalid ID or update failed." });
  }
};



export const deleteRecipe = async (req: Request, res: Response) => {
  // logic to delete recipe by ID from the database
const id = req.params.id;

  try {
    const query = { _id: new ObjectId(id) };
    const result = await collections.recipes?.deleteOne(query);

    if (!result || result.deletedCount === 0) {
      res.status(404).json({ message: `No recipe found with id ${id}` });
      return;
    }

    res.status(200).json({ message: `Deleted recipe ${id} successfully.` });
  } catch (error) {
    console.error("Error deleting recipe:", error);
    res.status(400).json({ message: "Invalid ID or delete failed." });
  }
};
