import { ObjectId } from "mongodb";
import { z } from "zod";


export interface User {
  _id?: ObjectId;
  name: string;
  username: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  role: 'user' | 'admin';
  hashedPassword: string;
  favourites?: ObjectId[];
}

export const createUserSchema = z.object({
  name: z.string().min(2),
  username: z
    .string()
    .min(3)
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.email(),
  phone: z.string().regex(/^[0-9+\s()-]{7,15}$/),
  dateOfBirth: z.string(),
  password: z.string().min(6)
});
