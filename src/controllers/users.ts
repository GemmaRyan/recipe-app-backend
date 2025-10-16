import { Request, Response } from 'express';
import { collections } from '../database';
import { Recipe } from '../models/users';
import { ObjectId } from 'mongodb';

// GET recipe by ID
export const getRecipeById = async (req: Request, res: Response) => {
    let id: string = req.params.id;
  try {
    const query = { _id: new ObjectId(id) };
    const user = (await collections.book?.findOne(query)) as unknown as Recipe;

    if (user) {
      res.status(200).send(user);
    }
  } catch (error) {
    res.status(404).send(`Unable to find matching document with id: ${req.params.id}`);
  }
};


export const getAllRecipes = async (_req: Request, res: Response) => {
  try {
    const recipes = await collections.book?.find({}).toArray() as Recipe[] | undefined;

    if (!recipes || recipes.length === 0) {
      res.status(404).json({ message: "No recipes found." });
      return;
    }

    res.status(200).json(recipes);
  } catch (error) {
    console.error("Error fetching all recipes:", error);
    res.status(500).json({ message: "Failed to retrieve recipes." });
  }
};


//alter this to be able to search not by the exact match -- anything containing the string
export const getRecipeByName = async (req: Request, res: Response) => {
  const name = req.params.name;

  if (!name || name.trim() === "") {
    res.status(400).json({ message: "Recipe name is required." });
    return;
  }

  try {
    const recipes = await collections.book?.find({ name: name }).toArray() as Recipe[] | undefined;

    if (!recipes || recipes.length === 0) {
      res.status(404).json({ message: `No recipe found with name: ${name}` });
      return;
    }

    res.status(200).json(recipes);
  } catch (error) {
    console.error("Error fetching recipe by name:", error);
    res.status(500).json({ message: "Failed to retrieve recipe." });
  }
};


export const createRecipe = async (req: Request, res: Response): Promise<void> => {
  console.log(req.body); 
  const { name, ingredients, origin, difficulty, recipe, imageUrl, cookingDuration } = req.body;

  if (!name || !ingredients || !difficulty || !recipe) {
    res.status(400).json({ message: "Missing required fields." });
    return;
  }

  const newRecipe: Recipe = { name, ingredients, origin, difficulty, recipe, imageUrl, cookingDuration };

  try {
    const result = await collections.book?.insertOne(newRecipe);

    if (result) {
      res.status(201).location(`${result.insertedId}`).json({ message: `Created a new recipe with id ${result.insertedId}` });
    } else {
      res.status(500).json({ message: "Failed to create a new recipe." });
    }
  } catch (error) {
    console.error("Error inserting recipe:", error);
    res.status(500).json({ message: "Unable to create new recipe." });
  }
};

// UPDATE recipe by ID
export const updateRecipe = async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id;

  // Validate ID format
  if (!ObjectId.isValid(id)) {
    res.status(400).json({ message: "Invalid recipe ID." });
    return;
  }

  // Ensure there's at least one field to update
  if (!req.body || Object.keys(req.body).length === 0) {
    res.status(400).json({ message: "No fields provided for update." });
    return;
  }

  try {
    const result = await collections.book?.updateOne(
      { _id: new ObjectId(id) },
      { $set: req.body }
    );

    if (!result || result.matchedCount === 0) {
      res.status(404).json({ message: `No recipe found with id ${id}` });
      return;
    }

    res.status(200).json({ message: `Successfully updated recipe ${id}` });
  } catch (error) {
    console.error("Error updating recipe:", error);
    res.status(500).json({ message: "Failed to update recipe." });
  }
};

// DELETE recipe by ID
export const deleteRecipe = async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id;

  if (!ObjectId.isValid(id)) {
    res.status(400).json({ message: "Invalid recipe ID." });
    return;
  }

  try {
    const result = await collections.book?.deleteOne({ _id: new ObjectId(id) });

    if (!result || result.deletedCount === 0) {
      res.status(404).json({ message: `No recipe found with id ${id}` });
      return;
    }

    res.status(200).json({ message: `Deleted recipe ${id} successfully.` });
  } catch (error) {
    console.error("Error deleting recipe:", error);
    res.status(500).json({ message: "Failed to delete recipe." });
  }
};