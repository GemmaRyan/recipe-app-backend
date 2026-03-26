import { Request, Response } from "express";
import { collections } from "../database";
import { createUserSchema } from "../models/user";
import { ObjectId } from "mongodb";
import { Recipe } from "../models/recipe";
import * as argon2 from "argon2";

// Helper to safely get a single string from params/payload values
const getSingleValue = (value: unknown): string | undefined => {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  return undefined;
};

export const registerUser = async (req: Request, res: Response) => {
  const validation = createUserSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json(validation.error);
  }

  const { name, username, email, phone, dateOfBirth, password } = validation.data;

  const existingUser = await collections.users?.findOne({
    $or: [{ email }, { username }]
  });

  if (existingUser) {
    return res.status(409).json({
      message: "Email or username already exists"
    });
  }

  const hashedPassword = await argon2.hash(password);

  await collections.users?.insertOne({
    name,
    username,
    email,
    phone,
    dateOfBirth,
    role: "user",
    hashedPassword,
    favourites: []
  });

  res.status(201).json({ message: "User registered" });
};

export const addFavourite = async (req: Request, res: Response) => {
  const userId = getSingleValue(res.locals.payload?.userId);
  const recipeId = getSingleValue(req.params.recipeId);

  if (!userId || !ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  if (!recipeId || !ObjectId.isValid(recipeId)) {
    return res.status(400).json({ message: "Invalid recipe ID" });
  }

  try {
    const result = await collections.users?.updateOne(
      { _id: new ObjectId(userId) },
      { $addToSet: { favourites: new ObjectId(recipeId) } }
    );

    if (!result || result.matchedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "Recipe added to favourites" });
  } catch (error) {
    console.error("Error adding favourite:", error);
    return res.status(500).json({ message: "Failed to add favourite" });
  }
};

export const removeFavourite = async (req: Request, res: Response) => {
  const userId = getSingleValue(res.locals.payload?.userId);
  const recipeId = getSingleValue(req.params.recipeId);

  if (!userId || !ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  if (!recipeId || !ObjectId.isValid(recipeId)) {
    return res.status(400).json({ message: "Invalid recipe ID" });
  }

  try {
    const result = await collections.users?.updateOne(
      { _id: new ObjectId(userId) },
      { $pull: { favourites: new ObjectId(recipeId) } }
    );

    if (!result || result.matchedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "Recipe removed from favourites" });
  } catch (error) {
    console.error("Error removing favourite:", error);
    return res.status(500).json({ message: "Failed to remove favourite" });
  }
};

export const getFavouriteRecipes = async (req: Request, res: Response) => {
  const userId = getSingleValue(res.locals.payload?.userId);
  const role = getSingleValue(res.locals.payload?.role);

  if (!userId || !ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    const user = await collections.users?.findOne({
      _id: new ObjectId(userId)
    });

    if (!user || !user.favourites || user.favourites.length === 0) {
      return res.status(200).json([]);
    }

    const filter: any = {
      _id: { $in: user.favourites }
    };

    // normal users should only see favourites they are allowed to view
    if (role !== "admin") {
      filter.$or = [
        { visibility: "public" },
        { createdBy: new ObjectId(userId) }
      ];
    }

    const recipes = await collections.book?.find(filter).toArray() as Recipe[] | undefined;

    return res.status(200).json(recipes || []);
  } catch (error) {
    console.error("Error fetching favourite recipes:", error);
    return res.status(500).json({ message: "Failed to fetch favourite recipes" });
  }
};

export const isFavouriteRecipe = async (req: Request, res: Response) => {
  const userId = getSingleValue(res.locals.payload?.userId);
  const recipeId = getSingleValue(req.params.recipeId);

  if (!userId || !ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  if (!recipeId || !ObjectId.isValid(recipeId)) {
    return res.status(400).json({ message: "Invalid recipe ID" });
  }

  try {
    const user = await collections.users?.findOne({
      _id: new ObjectId(userId),
      favourites: new ObjectId(recipeId)
    });

    return res.status(200).json({ isFavourite: !!user });
  } catch (error) {
    console.error("Error checking favourite:", error);
    return res.status(500).json({ message: "Failed to check favourite" });
  }
};