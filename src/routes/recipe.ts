import express, {Router} from 'express';
import { validate } from '../middleware/validate.middleware';
import { createRecipeSchema } from '../models/recipe'; 
import {
  getAllRecipes,
  getRecipeById,
  getRecipeByName ,
  createRecipe,
  updateRecipe,
  deleteRecipe,
} from '../controllers/recipe';
import {authenticateKey} from '../middleware/auth.middleware'

const router: Router = express.Router();

router.get('/', getAllRecipes);
router.get('/:id', getRecipeById);
router.get('/name/:name', getRecipeByName);
router.post('/', authenticateKey, createRecipe);
router.put('/:id', updateRecipe);
router.delete('/:id', deleteRecipe);
router.post('/', validate(createRecipeSchema), createRecipe);

export default router;
