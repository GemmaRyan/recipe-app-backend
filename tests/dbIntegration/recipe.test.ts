import request from 'supertest';
import { app } from '../../src/index';
import dotenv from 'dotenv';

jest.setTimeout(60000); // timeout error -- common issue with db integration tests


dotenv.config(); // needed to use the x-api-key from .env file

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

// beforeAll(async () => {
//   await initDb(); // Ensure MongoDB is connected before tests
// });

describe("Recipe API ", () => {
  test("should create a recipe and return Location header", async () => {
    const res = await request(app)
      .post("/api/v1/users")
      .set("x-api-key", process.env.API_KEY || "blahblah")  // how to add the api key and prevent access errors
      .send(newRecipe)
      .expect(201);

    const location = res.header["location"];
    expect(location).toBeDefined();

    recipeId = location;
    console.log("Created Recipe ID:", recipeId);
  });

  test("should fetch the recipe by ID", async () => {       //GET -- getting the data -- pulling whats just been created 
    const res = await request(app)
      .get(`/api/v1/users/${recipeId}`)
      .set("x-api-key", process.env.API_KEY || "blahblah")
      .expect(200);

    expect(res.body.name).toBe(newRecipe.name);     // how to check specific data within the returned object
    expect(res.body.difficulty).toBe(newRecipe.difficulty);
    expect(res.body.ingredients).toContain("185g unsalted butter");
  });

  test("should delete the recipe by ID", async () => {
    await request(app)
      .delete(`/api/v1/users/${recipeId}`)
      .set("x-api-key", process.env.API_KEY || "blahblah")
      .expect(200);
  });

  test("should return 404 when fetching deleted recipe", async () => {
    await request(app)
      .get(`/api/v1/users/${recipeId}`)
      .set("x-api-key", process.env.API_KEY || "blahblah")
      .expect(404);
  });
   
});
