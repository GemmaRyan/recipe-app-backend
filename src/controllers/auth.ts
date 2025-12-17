import { Request, Response } from "express";
import { collections } from "../database";
import * as argon2 from "argon2";
import { sign as jwtSign } from "jsonwebtoken";

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  const user = await collections.users?.findOne({ email });

  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const valid = await argon2.verify(user.hashedPassword, password);

  if (!valid) {
    return res.status(401).json({ message: "Invalid email or password" });
  }


  //token sign in with auto logout 
  const token = jwtSign(
    {
      userId: user._id,
      email: user.email
    },
    process.env.JWTSECRET || "not very secret",
    { expiresIn: "2h" }
  );

  res.json({ accessToken: token });
};
