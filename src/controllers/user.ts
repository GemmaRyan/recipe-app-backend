import { Request, Response } from "express";
import { collections } from "../database";
import { createUserSchema } from "../models/user";
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
  hashedPassword
});


  res.status(201).json({ message: "User registered" });
};
