import type { RecipeDetail, RecipeSummary } from "../types/recipe";

export const browseRecipe: RecipeSummary = {
  id: 1,
  title: "Golden Cornbread",
  image: "https://example.com/corn.jpg",
  cook_time: 25,
  prep_time: 10,
  ratings: 4.7,
  ingredients: [
    { raw_text: "1 cup flour", name: "flour" },
    { raw_text: "1 egg", name: "egg" },
  ],
};

export const searchRecipe: RecipeSummary = {
  id: 2,
  title: "Pancakes",
  image: null,
  cook_time: 15,
  prep_time: 10,
  ratings: 4.5,
  match_count: 2,
  missing_count: 1,
  missing_ingredients: ["butter"],
};

export const readyRecipe: RecipeSummary = {
  ...searchRecipe,
  id: 3,
  title: "Fried Egg",
  match_count: 1,
  missing_count: 0,
  missing_ingredients: [],
};

export const recipeDetail: RecipeDetail = {
  id: 2,
  title: "Pancakes",
  image: null,
  cook_time: 15,
  prep_time: 10,
  ratings: 4.5,
  ingredients: [
    { raw_text: "1 egg", name: "egg", matched: true },
    { raw_text: "1 cup milk", name: "milk", matched: false },
  ],
};
