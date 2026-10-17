export type RecipeIngredient = {
  raw_text: string;
  name: string;
  matched?: boolean;
};

export type RecipeSummary = {
  id: number;
  title: string;
  image: string | null;
  cook_time: number | null;
  prep_time: number | null;
  ratings: number | null;
  ingredients?: RecipeIngredient[];
  match_count?: number;
  missing_count?: number;
  missing_ingredients?: string[];
};

export type RecipesResponse = {
  recipes: RecipeSummary[];
  total: number;
};

export type RecipeDetail = {
  id: number;
  title: string;
  image: string | null;
  cook_time: number | null;
  prep_time: number | null;
  ratings: number | null;
  ingredients: RecipeIngredient[];
};
