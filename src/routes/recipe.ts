import express, {Router} from 'express';
import {getAllRecipes,getRecipeById,getRecipeByName,getRecipesByDifficulty,getRecipesByIngredient,
  createRecipe,updateRecipe,deleteRecipe} from '../controllers/recipe';


const router: Router = express.Router();

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
