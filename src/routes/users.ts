import express, {Router} from 'express';
import {
  getAllRecipes,
  getRecipeById,
  getRecipeByName ,
  createRecipe,
  updateRecipe,
  deleteRecipe,
} from '../controllers/users';
import {authenticateKey} from '../middleware/auth.middleware'

const router: Router = express.Router();

router.get('/', getAllRecipes);
router.get('/:id', getRecipeById);
router.get('/name/:name', getRecipeByName);
router.post('/', authenticateKey, createRecipe);
router.put('/:id', updateRecipe);
router.delete('/:id', deleteRecipe);

export default router;
