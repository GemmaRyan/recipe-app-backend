import { Request, Response } from "express";
import { collections } from "../database";
import { createUserSchema } from "../models/user";
import { ObjectId } from "mongodb";
import { Recipe } from "../models/recipe";
import * as argon2 from "argon2";

export const registerUser = async (req: Request, res: Response) => {
  const validation = createUserSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json(validation.error);
  }

const { name,username,email,phone,dateOfBirth,password} = validation.data;

  const existingUser = await collections.users?.findOne({
  $or: [{ email }, { username }]
});

if (existingUser) {
  return res.status(409).json({
    message: 'Email or username already exists'
  });
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

export const addFavourite = async (req: Request, res: Response) => {
  const { userId } = res.locals.payload;
  const recipeId = req.params.recipeId;

  if (!ObjectId.isValid(recipeId)) {
    return res.status(400).json({ message: "Invalid recipe ID" });
  }

  try {
    const result = await collections.users?.updateOne(
      { _id: new ObjectId(String(userId)) },
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
  const { userId } = res.locals.payload;
  const recipeId = req.params.recipeId;

  if (!ObjectId.isValid(recipeId)) {
    return res.status(400).json({ message: "Invalid recipe ID" });
  }

  try {
    const result = await collections.users?.updateOne(
      { _id: new ObjectId(String(userId)) },
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
  const { userId, role } = res.locals.payload;

  try {
    const user = await collections.users?.findOne({
      _id: new ObjectId(String(userId))
    });

    if (!user || !user.favourites || user.favourites.length === 0) {
      return res.status(200).json([]);
    }

    let filter: any = {
      _id: { $in: user.favourites }
    };

    // normal users should only see favourites they are allowed to view
    if (role !== 'admin') {
      filter.$or = [
        { visibility: 'public' },
        { createdBy: new ObjectId(String(userId)) }
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
  const { userId } = res.locals.payload;
  const recipeId = req.params.recipeId;

  if (!ObjectId.isValid(recipeId)) {
    return res.status(400).json({ message: "Invalid recipe ID" });
  }

  try {
    const user = await collections.users?.findOne({
      _id: new ObjectId(String(userId)),
      favourites: new ObjectId(recipeId)
    });

    return res.status(200).json({ isFavourite: !!user });
  } catch (error) {
    console.error("Error checking favourite:", error);
    return res.status(500).json({ message: "Failed to check favourite" });
  }
};