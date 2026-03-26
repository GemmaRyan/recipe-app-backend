import { Request, Response } from 'express';
import { collections } from '../database';
import { Recipe } from '../models/recipe';
import { ObjectId } from 'mongodb';
import { createRecipeSchema } from '../models/recipe';
import { createUserSchema } from "../models/user";
import * as argon2 from "argon2";
import axios from "axios";

// Helper to safely get a single string from params/query values
const getSingleValue = (value: unknown): string | undefined => {
  if (typeof value === 'string') return value;
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0];
  return undefined;
};

// Register new user
export const registerUser = async (req: Request, res: Response) => {
  const validation = createUserSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json(validation.error);
  }

  const { name, username, email, phone, dateOfBirth, password } = validation.data;

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
    hashedPassword,
    favourites: []
  });

  res.status(201).json({ message: "User registered" });
};

export const incrementRecipeView = async (req: Request, res: Response) => {
  const id = getSingleValue(req.params.id);

  if (!id || !ObjectId.isValid(id)) {
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
  const id = getSingleValue(req.params.id);

  if (!id || !ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid recipe ID." });
  }

  try {
    const recipe = await collections.book?.findOne({
      _id: new ObjectId(id)
    }) as Recipe | null;

    if (!recipe) {
      return res.status(404).send(`Unable to find matching document with id: ${id}`);
    }

    // Public recipes can be viewed by anyone
    if (recipe.visibility === 'public') {
      return res.status(200).send(recipe);
    }

    // Private recipes need login
    const payload = res.locals.payload;

    if (!payload) {
      return res.status(403).json({ message: "This recipe is private." });
    }

    const payloadUserId = getSingleValue(payload.userId);
    const isOwner = payloadUserId ? recipe.createdBy.toString() === payloadUserId : false;
    const isAdmin = payload.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "This recipe is private." });
    }

    return res.status(200).send(recipe);
  } catch (error) {
    return res.status(404).send(`Unable to find matching document with id: ${id}`);
  }
};

// GET all recipes with optional filtering
export const getAllRecipes = async (req: Request, res: Response) => {
  try {
    const difficulty = getSingleValue(req.query.difficulty);
    const minDifficulty = getSingleValue(req.query.minDifficulty);
    const maxDifficulty = getSingleValue(req.query.maxDifficulty);
    const origin = getSingleValue(req.query.origin);
    const ingredient = getSingleValue(req.query.ingredient);
    const payload = res.locals.payload;

    let filter: any = {};

    // Visibility rules
    if (!payload) {
      filter.visibility = 'public';
    } else if (payload.role !== 'admin') {
      const payloadUserId = getSingleValue(payload.userId);

      if (!payloadUserId || !ObjectId.isValid(payloadUserId)) {
        return res.status(400).json({ message: "Invalid user ID in token." });
      }

      filter.$or = [
        { visibility: 'public' },
        { createdBy: new ObjectId(payloadUserId) }
      ];
    }

    // Exact difficulty
    if (difficulty) {
      const difficultyNum = parseInt(difficulty);
      if (!isNaN(difficultyNum) && difficultyNum >= 1 && difficultyNum <= 5) {
        filter.difficulty = difficultyNum;
      }
    }

    // Difficulty range
    if (minDifficulty || maxDifficulty) {
      if (!filter.difficulty || typeof filter.difficulty !== 'object') {
        filter.difficulty = {};
      }

      if (minDifficulty) {
        const minDiff = parseInt(minDifficulty);
        if (!isNaN(minDiff)) {
          filter.difficulty.$gte = minDiff;
        }
      }

      if (maxDifficulty) {
        const maxDiff = parseInt(maxDifficulty);
        if (!isNaN(maxDiff)) {
          filter.difficulty.$lte = maxDiff;
        }
      }
    }

    // Origin filter
    if (origin && origin.trim() !== '') {
      filter.origin = { $regex: origin.trim(), $options: 'i' };
    }

    // Ingredient filter
    if (ingredient && ingredient.trim() !== '') {
      filter.ingredients = { $regex: ingredient.trim(), $options: 'i' };
    }

    const recipes = await collections.book?.find(filter).toArray() as Recipe[] | undefined;

    if (!recipes || recipes.length === 0) {
      return res.status(404).json({ message: "No recipes found matching the criteria." });
    }

    res.status(200).json(recipes);
  } catch (error) {
    console.error("Error fetching recipes:", error);
    res.status(500).json({ message: "Failed to retrieve recipes." });
  }
};

export const getRecipeByName = async (req: Request, res: Response) => {
  const name = getSingleValue(req.params.name);

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
  const difficulty = getSingleValue(req.params.difficulty);

  if (!difficulty) {
    res.status(400).json({ message: "Difficulty is required." });
    return;
  }

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
  const ingredient = getSingleValue(req.params.ingredient);

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

  const payloadUserId = getSingleValue(res.locals.payload?.userId);
  const username = getSingleValue(res.locals.payload?.username);

  if (!payloadUserId || !ObjectId.isValid(payloadUserId) || !username) {
    return res.status(400).json({ message: "Invalid user data in token." });
  }

  const {
    name,
    ingredients,
    origin,
    difficulty,
    recipe,
    imageUrl,
    cookingDuration,
    visibility
  } = validation.data;

  if (!name || !ingredients || !difficulty || !recipe) {
    res.status(400).json({ message: "Missing required fields." });
    return;
  }

  const newRecipe: Recipe = {
    name,
    ingredients,
    origin,
    difficulty,
    recipe,
    imageUrl,
    cookingDuration,
    createdBy: new ObjectId(payloadUserId),
    createdByUsername: username,
    viewCount: 0,
    lastViewedAt: new Date(),
    visibility
  };

  try {
    const result = await collections.book?.insertOne(newRecipe);

    if (result) {
      res.status(201).location(`${result.insertedId}`).json({
        message: `Created a new recipe with id ${result.insertedId}`
      });
    } else {
      res.status(500).json({ message: "Failed to create a new recipe." });
    }
  } catch (error) {
    console.error("Error inserting recipe:", error);
    res.status(500).json({ message: "Unable to create new recipe." });
  }
};

// Updating the recipe
export const updateRecipe = async (req: Request, res: Response): Promise<void> => {
  const id = getSingleValue(req.params.id);

  if (!id || !ObjectId.isValid(id)) {
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
  const id = getSingleValue(req.params.id);

  if (!id || !ObjectId.isValid(id)) {
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