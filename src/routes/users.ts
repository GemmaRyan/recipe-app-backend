import express, {Router} from 'express';
import {
  getRecipes,
  getRecipesById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
} from '../controllers/users';
import {authenticateKey} from '../middleware/auth.middleware'

const router: Router = express.Router();

router.get('/', getRecipes);
router.get('/:id', getRecipesById);
router.post('/', authenticateKey, createRecipe);
router.put('/:id', updateRecipe);
router.delete('/:id', deleteRecipe);

export default router;
