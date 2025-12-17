import { ObjectId } from "mongodb";
import { z } from "zod";

export interface User {
  _id?: ObjectId;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  hashedPassword: string;
}

export const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z
    .string()
    .regex(/^[0-9+\s()-]{7,15}$/, "Invalid phone number"),
  dateOfBirth: z.string(), 
  password: z.string().min(6)
});

