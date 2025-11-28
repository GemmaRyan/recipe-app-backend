import express, {Router} from 'express';
import { validate } from '../middleware/validate.middleware';
import { createRecipeSchema } from '../models/recipe'; 
import {getAllRecipes,getRecipeById,getRecipeByName,getRecipesByDifficulty,getRecipesByIngredient,
  createRecipe,updateRecipe,deleteRecipe} from '../controllers/recipe';
import {authenticateKey} from '../middleware/auth.middleware'

const router: Router = express.Router();

// GET routes -- filters
router.get('/difficulty/:difficulty', getRecipesByDifficulty);
router.get('/ingredient/:ingredient', getRecipesByIngredient);
router.get('/name/:name', getRecipeByName);
router.get('/:id', getRecipeById);
router.get('/', getAllRecipes);

// POST routes
router.post('/', createRecipe); //removing the authenticateKey for testing purposes

// PUT routes
router.put('/:id', updateRecipe);

// DELETE routes
router.delete('/:id', deleteRecipe);

export default router;
