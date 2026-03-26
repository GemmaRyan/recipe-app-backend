import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { collections } from '../database';


export const validate = (schema: z.ZodObject<any>) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const validation = schema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: validation.error.issues
    });
  }

  req.body = validation.data;
  next();
};


export const validJWTProvided = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWTSECRET!);
    res.locals.payload = payload;
    next();
  } catch {
    return res.status(403).json({ message: 'Invalid token' });
  }
};


export const isOwnerOrAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId, role } = res.locals.payload;

  // Admins can do anything
  if (role === 'admin') {
    return next();
  }

  const recipe = await collections.book?.findOne({
    _id: new ObjectId(String(req.params.id))
  });

  if (!recipe) {
    return res.status(404).json({ message: 'Recipe not found' });
  }

  if (recipe.createdBy.toString() === userId) {
    return next();
  }

  return res.status(403).json({ message: 'Not authorised' });
};

export const optionalJWTProvided = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return next();
  }

  try {
    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWTSECRET!);
    res.locals.payload = payload;
    next();
  } catch {
    next();
  }
};