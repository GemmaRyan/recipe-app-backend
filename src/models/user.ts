import { ObjectId } from "mongodb";
import { z } from "zod";

export interface User {
  _id?: ObjectId;
  name: string;
  email: string;
  phonenumber: number;
  hashedPassword: string;
}

export const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.email(),
  phonenumber: z.number().min(1000000000).max(9999999999),
  password: z.string().min(6)
});
