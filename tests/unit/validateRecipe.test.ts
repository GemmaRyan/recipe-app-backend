import { createRecipeSchema } from "../../src/models/recipe";

const validRecipe = {
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

describe("Recipe Schema Validation", () => {
  it("completely valid recipe data", () => {
    expect(() => createRecipeSchema.parse(validRecipe)).not.toThrow();
  });

  //Name of recipe -- cannot be just two letter and cannot be null/ undefined and cannot have special characters
  it("name too short", () => {
    expect(() =>
      createRecipeSchema.parse({ ...validRecipe, name: "A" })
    ).toThrow();
  });

  it("contains special characters -- fail", () => {         //should fail
    expect(() =>
      createRecipeSchema.parse({ ...validRecipe, name: "Cake!" })
    ).toThrow();
  });

  it("name contains letters, numbers, and spaces -- pass", () => {      //should pass
    expect(() =>
      createRecipeSchema.parse({ ...validRecipe, name: "Cake 123" })
    ).not.toThrow();
  });

  //origin is a optional field, that holds a url link to the recipe origin
  it("origin is completely empty. Not null/undefined --pass", () => {       // should pass
    const { origin, ...withoutOrigin } = validRecipe;
    expect(() => createRecipeSchema.parse(withoutOrigin)).not.toThrow();
  });

  //ingredients array -- cannot have less than 1 ingredient
  it("ingredients array is less than 1/ empty -- fail", () => {         // should fail
    expect(() =>
      createRecipeSchema.parse({ ...validRecipe, ingredients: [] })
    ).toThrow();
  });


  //difficulty level 1-5, numbers only
  it("difficulty is below 1 -- fail", () => {
    expect(() =>
      createRecipeSchema.parse({ ...validRecipe, difficulty: 0 })
    ).toThrow();
  });

  it("difficulty is above 5 -- fail", () => {
    expect(() =>
      createRecipeSchema.parse({ ...validRecipe, difficulty: 6 })
    ).toThrow();
  });

  it("difficulty is not a number -- fail", () => {
    expect(() =>
      createRecipeSchema.parse({ ...validRecipe, difficulty: "hard" as any })
    ).toThrow();
  });

  //recipe must have instructions and atleast one entry in the array
  it("recipe steps are empty -- fail", () => {
    expect(() =>
      createRecipeSchema.parse({ ...validRecipe, recipe: [] })
    ).toThrow();
  });

  //cooking duration -- optional field, can only have numbers, dashes and spaces
  it("cookingDuration contains numbers and dashes -- pass", () => {
    expect(() =>
      createRecipeSchema.parse({ ...validRecipe, cookingDuration: "30-45" })
    ).not.toThrow();
  });

  it("cookingDuration contains letters -- fail", () => {
    expect(() =>
      createRecipeSchema.parse({ ...validRecipe, cookingDuration: "30 mins" })
    ).toThrow();
  });

  //image url -- optional field similar to origin
  it("imageurl is empty", () => {
    const { imageUrl, ...withoutImage } = validRecipe;
    expect(() => createRecipeSchema.parse(withoutImage)).not.toThrow();
  });
});