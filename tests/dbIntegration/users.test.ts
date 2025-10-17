import request from 'supertest';
import { app } from '../../src/index';


describe('Recipe API', () => {
  let recipeId: string;
  
const newRecipe = {
  name: "Brownies",
  origin: "https://www.bbcgoodfood.com/recipes/best-ever-chocolate-brownies-recipe",
  ingredients: [
                "185g unsalted butter",
                "185g best dark chocolate",
                "85g plain flour",
                "40g cocoa powder",
                "50g white chocolate",
                "50g milk chocolate",
                "3 large eggs",
                "275g golden caster sugar"
            ],
  difficulty: 3,
  recipe: ["Mix ingredients", "Bake cake", "Let cool"],
  cookingDuration: "45-60",
  imageUrl: "https://example.com/cake.jpg",
};



  test('should create a recipe and return Location header', async () => {
    

    const res = await request(app)
      .post('/api/v1/users')
      .set('x-api-key', process.env.API_KEY || 'blahblah')
      .send(newRecipe)
      .expect(201);

    const location = res.header['location'];

    recipeId = location;
    expect(recipeId).toBeDefined();
  }); });
