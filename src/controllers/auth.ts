import { Request, Response } from "express";
import { collections } from "../database";
import * as argon2 from "argon2";
import * as jwt from "jsonwebtoken";

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  // Hardcoded admin login
  if (email === 'gem@email.com' && password === 'password') {
    let adminUser = await collections.users?.findOne({ email: 'gem@email.com' });

    // create the admin user in MongoDB if it does not already exist
    if (!adminUser) {
      const hashedPassword = await argon2.hash('password');

      const insertResult = await collections.users?.insertOne({
        name: 'Admin',
        username: 'admin',
        email: 'gem@email.com',
        phone: '0000000000',
        dateOfBirth: '2000-01-01',
        role: 'admin',
        hashedPassword,
        favourites: []
      });

      if (!insertResult) {
        return res.status(500).json({ message: 'Failed to create admin user' });
      }

      adminUser = await collections.users?.findOne({ _id: insertResult.insertedId });
    }

    if (!adminUser) {
      return res.status(500).json({ message: 'Admin user could not be loaded' });
    }

    const token = jwt.sign(
      {
        userId: adminUser._id.toString(),
        username: adminUser.username,
        email: adminUser.email,
        role: 'admin'
      },
      process.env.JWTSECRET!,
      { expiresIn: '2h' }
    );

    return res.json({ accessToken: token });
  }

  const user = await collections.users?.findOne({ email });

  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const valid = await argon2.verify(user.hashedPassword, password);

  if (!valid) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const token = jwt.sign(
    {
      userId: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role === 'admin' ? 'admin' : 'user'
    },
    process.env.JWTSECRET!,
    { expiresIn: '2h' }
  );

  res.json({ accessToken: token });
};
