import { ObjectId } from "mongodb";
import { z } from "zod";

export interface User {
  _id?: ObjectId;
  name: string;
  email: string;
  hashedPassword: string;
}

export const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.email(),
  password: z.string().min(6)
});
