import express from "express";
import {
  registerUser,
  addFavourite,
  removeFavourite,
  getFavouriteRecipes,
  isFavouriteRecipe
} from '../controllers/user';
import { loginUser } from '../controllers/auth';
import { validJWTProvided } from '../middleware/validate.middleware';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

router.get('/favourites', validJWTProvided, getFavouriteRecipes);
router.get('/favourites/:recipeId', validJWTProvided, isFavouriteRecipe);
router.post('/favourites/:recipeId', validJWTProvided, addFavourite);
router.delete('/favourites/:recipeId', validJWTProvided, removeFavourite);

export default router;
