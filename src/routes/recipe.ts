import express, {Router} from 'express';
import {getAllRecipes,getRecipeById,getRecipeByName,getRecipesByDifficulty,getRecipesByIngredient,
  createRecipe,updateRecipe,deleteRecipe,
  getTopViewedRecipe,
  incrementRecipeView} from '../controllers/recipe';
import { validJWTProvided, isOwnerOrAdmin, optionalJWTProvided } from '../middleware/validate.middleware';


const router: Router = express.Router();

router.get('/top-viewed', optionalJWTProvided, getTopViewedRecipe);
router.get('/difficulty/:difficulty', optionalJWTProvided, getRecipesByDifficulty);
router.get('/ingredient/:ingredient', optionalJWTProvided, getRecipesByIngredient);
router.get('/name/:name', optionalJWTProvided, getRecipeByName);
router.post('/:id/view', incrementRecipeView);
router.get('/:id', optionalJWTProvided, getRecipeById);
router.get('/', optionalJWTProvided, getAllRecipes);

router.post('/', validJWTProvided, createRecipe);
router.put('/:id', validJWTProvided, isOwnerOrAdmin, updateRecipe);
router.delete('/:id', validJWTProvided, isOwnerOrAdmin, deleteRecipe);



export default router;
