import { Request, Response } from "express";
import { collections } from "../database";
import { createUserSchema } from "../models/user";
import * as argon2 from "argon2";

export const registerUser = async (req: Request, res: Response) => {
  const validation = createUserSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json(validation.error);
  }

  const { name, email, phone, dateOfBirth, password } = validation.data;


  const existing = await collections.users?.findOne({ email });
  if (existing) {
    return res.status(400).json({ message: "Email already exists" });
  }

  const hashedPassword = await argon2.hash(password);

  await collections.users?.insertOne({
  name,
  email,
  phone,
  dateOfBirth,
  hashedPassword
});


  res.status(201).json({ message: "User registered" });
};
