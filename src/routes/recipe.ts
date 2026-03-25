import express, {Router} from 'express';
import {getAllRecipes,getRecipeById,getRecipeByName,getRecipesByDifficulty,getRecipesByIngredient,
  createRecipe,updateRecipe,deleteRecipe,
  getTopViewedRecipe,
  incrementRecipeView} from '../controllers/recipe';
  import { validJWTProvided , isOwnerOrAdmin } from '../middleware/validate.middleware';


const router: Router = express.Router();

router.get('/top-viewed', getTopViewedRecipe);
router.get('/difficulty/:difficulty', getRecipesByDifficulty);
router.get('/ingredient/:ingredient', getRecipesByIngredient);
router.get('/name/:name', getRecipeByName);
router.post('/:id/view', incrementRecipeView);
router.get('/:id', getRecipeById);
router.get('/', getAllRecipes);



router.post('/', validJWTProvided, createRecipe);
router.put('/:id', validJWTProvided, isOwnerOrAdmin, updateRecipe);
router.delete('/:id', validJWTProvided, isOwnerOrAdmin, deleteRecipe);



export default router;
