import { Request, Response } from 'express';
import { collections } from '../database';
import { Recipe } from '../models/recipe';
import { ObjectId } from 'mongodb';
import { createRecipeSchema } from '../models/recipe';
import { createUserSchema } from "../models/user";
import * as argon2 from "argon2";
import axios from "axios";


//Register new user
export const registerUser = async (req: Request, res: Response) => {
  const validation = createUserSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json(validation.error);
  }

 const { name,username,email,phone,dateOfBirth,password} = validation.data;

  const existing = await collections.users?.findOne({ email });
  if (existing) {
    return res.status(400).json({ message: "Email already exists" });
  }

  const hashedPassword = await argon2.hash(password);

  await collections.users?.insertOne({
  name,
  username,
  email,
  phone,
  dateOfBirth,
  role: 'user',
  hashedPassword
});



  res.status(201).json({ message: "User registered" });
};

export const incrementRecipeView = async (req: Request, res: Response) => {
  const id = req.params.id;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid recipe ID." });
  }

  try {
    const lambdaViewApi = process.env.LAMBDA_VIEW_API;

    if (!lambdaViewApi) {
      return res.status(500).json({
        message: "LAMBDA_VIEW_API is missing from .env"
      });
    }

    const lambdaUrl = `${lambdaViewApi}/${id}`;

    console.log("Calling Lambda API:", lambdaUrl);

    const response = await axios.post(lambdaUrl, {});

    console.log("Lambda API response:", response.data);

    return res.status(200).json({
      message: "Recipe view counted"
    });
  } catch (error: any) {
    console.error("Error calling Lambda API:", error?.response?.data || error.message);

    return res.status(500).json({
      message: "Failed to invoke Lambda API",
      error: error?.response?.data || error.message
    });
  }
};


// GET recipe by ID
export const getRecipeById = async (req: Request, res: Response) => {
  let id: string = req.params.id;
  try {
    const query = { _id: new ObjectId(id) };
    const recipe = (await collections.book?.findOne(query)) as unknown as Recipe;

    if (recipe) {
      res.status(200).send(recipe);
    } else {
      res.status(404).send(`Unable to find matching document with id: ${req.params.id}`);
    }
  } catch (error) {
    res.status(404).send(`Unable to find matching document with id: ${req.params.id}`);
  }
};


// GET all recipes with optional filtering
export const getAllRecipes = async (req: Request, res: Response) => {
  try {
    const { difficulty, minDifficulty, maxDifficulty, origin, ingredient } = req.query;
    
    let filter: any = {};

    // Filter by exact difficulty
    if (difficulty) {
      const difficultyNum = parseInt(difficulty as string);
      if (!isNaN(difficultyNum) && difficultyNum >= 1 && difficultyNum <= 5) {
        filter.difficulty = difficultyNum;
      }
    }

    // Filter by difficulty range
    if (minDifficulty || maxDifficulty) {
      filter.difficulty = {};
      if (minDifficulty) {
        const minDiff = parseInt(minDifficulty as string);
        if (!isNaN(minDiff)) {
          filter.difficulty.$gte = minDiff;
        }
      }
      if (maxDifficulty) {
        const maxDiff = parseInt(maxDifficulty as string);
        if (!isNaN(maxDiff)) {
          filter.difficulty.$lte = maxDiff;
        }
      }
    }

    // Filter by ingredient 
    if (ingredient && typeof ingredient === 'string' && ingredient.trim() !== '') {
      filter.ingredients = { $regex: ingredient.trim(), $options: 'i' };
    }

    const recipes = await collections.book?.find(filter).toArray() as Recipe[] | undefined;

    if (!recipes || recipes.length === 0) {
      res.status(404).json({ message: "No recipes found matching the criteria." });
      return;
    }

    res.status(200).json(recipes);
  } catch (error) {
    console.error("Error fetching recipes:", error);
    res.status(500).json({ message: "Failed to retrieve recipes." });
  }
};


export const getRecipeByName = async (req: Request, res: Response) => {
  const name = req.params.name;

  if (!name || name.trim() === "") {
    res.status(400).json({ message: "Recipe name is required." });
    return;
  }

  try {
    const recipes = await collections.book?.find({ 
      name: { $regex: name.trim(), $options: 'i' } 
    }).toArray() as Recipe[] | undefined;

    if (!recipes || recipes.length === 0) {
      res.status(404).json({ message: `No recipes found containing: ${name}` });
      return;
    }

    res.status(200).json(recipes);
  } catch (error) {
    console.error("Error fetching recipe by name:", error);
    res.status(500).json({ message: "Failed to retrieve recipe." });
  }
};

// GET recipes by difficulty
export const getRecipesByDifficulty = async (req: Request, res: Response) => {
  const difficulty = req.params.difficulty;

  const difficultyNum = parseInt(difficulty);

  if (isNaN(difficultyNum) || difficultyNum < 1 || difficultyNum > 5) {
    res.status(400).json({ message: "Difficulty must be a number between 1 and 5." });
    return;
  }

  try {
    const recipes = await collections.book?.find({ difficulty: difficultyNum }).toArray() as Recipe[] | undefined;

    if (!recipes || recipes.length === 0) {
      res.status(404).json({ message: `No recipes found with difficulty level: ${difficultyNum}` });
      return;
    }

    res.status(200).json(recipes);
  } catch (error) {
    console.error("Error fetching recipes by difficulty:", error);
    res.status(500).json({ message: "Failed to retrieve recipes." });
  }
};

// GET recipes by ingredient
export const getRecipesByIngredient = async (req: Request, res: Response) => {
  const ingredient = req.params.ingredient;

  if (!ingredient || ingredient.trim() === "") {
    res.status(400).json({ message: "Ingredient is required." });
    return;
  }

  try {
    const recipes = await collections.book?.find({
      ingredients: { $regex: ingredient.trim(), $options: 'i' }
    }).toArray() as Recipe[] | undefined;

    if (!recipes || recipes.length === 0) {
      res.status(404).json({ message: `No recipes found containing ingredient: ${ingredient}` });
      return;
    }

    res.status(200).json(recipes);
  } catch (error) {
    console.error("Error fetching recipes by ingredient:", error);
    res.status(500).json({ message: "Failed to retrieve recipes." });
  }
};


export const createRecipe = async (req: Request, res: Response) => {
  console.log(req.body); 

  const validation = createRecipeSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: validation.error.issues,
    });
  }
  const { userId, username } = res.locals.payload;


  const { name, ingredients, origin, difficulty, recipe, imageUrl, cookingDuration } = validation.data;

  if (!name || !ingredients || !difficulty || !recipe) {
    res.status(400).json({ message: "Missing required fields." });
    return;
  }

  const newRecipe: Recipe = {
    name, ingredients, origin, difficulty, recipe, imageUrl, cookingDuration,
    createdBy: new ObjectId(String(userId)),   //adding the users id who created the recipe-- may be wrong check back later
    createdByUsername: username,
    viewCount: 0,
    lastViewedAt: new Date()
  };

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


//Updating the recipe
export const updateRecipe = async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id;

  if (!ObjectId.isValid(id)) {
    res.status(400).json({ message: "Invalid recipe ID." });
    return;
  }

  if (!req.body || Object.keys(req.body).length === 0) {
    res.status(400).json({ message: "No fields provided for update." });
    return;
  }

  try {
    const { _id, ...updateData } = req.body;

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ message: "No valid fields provided for update." });
      return;
    }

    const result = await collections.book?.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
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

export const getTopViewedRecipe = async (req: Request, res: Response) => {
  try {
    const topRecipe = await collections.book
      ?.find({})
      .sort({ viewCount: -1, lastViewedAt: -1 })
      .limit(1)
      .next();

    if (!topRecipe) {
      return res.status(404).json({ message: "No recipes found" });
    }

    res.status(200).json(topRecipe);
  } catch (error) {
    console.error("Error fetching top viewed recipe:", error);
    res.status(500).json({ message: "Failed to fetch top viewed recipe." });
  }
};