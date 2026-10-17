import type { RecipeDetail, RecipesResponse } from "../types/recipe";

export const PAGE_SIZE = 10;
export const BROWSE_SIZE = 20;

const API_URL = import.meta.env.VITE_API_URL || "";
const BROWSE_SEED = Math.random().toString(36).slice(2);

export async function fetchRecipes(options: {
  ingredients?: string[];
  limit?: number;
  offset?: number;
}): Promise<RecipesResponse> {
  const params = new URLSearchParams();
  params.set("limit", String(options.limit ?? PAGE_SIZE));
  params.set("offset", String(options.offset ?? 0));

  if (options.ingredients?.length) {
    params.set("ingredients", options.ingredients.join(","));
  } else {
    params.set("seed", BROWSE_SEED);
  }

  const res = await fetch(`${API_URL}/api/recipes?${params}`);

  if (!res.ok) throw new Error("Failed to fetch recipes");

  return res.json();
}

export async function fetchRecipe(
  id: number,
  options: { ingredients?: string[] } = {}
): Promise<RecipeDetail> {
  const params = new URLSearchParams();
  if (options.ingredients?.length) {
    params.set("ingredients", options.ingredients.join(","));
  }

  const query = params.toString();
  const res = await fetch(
    query
      ? `${API_URL}/api/recipes/${id}?${query}`
      : `${API_URL}/api/recipes/${id}`
  );

  if (!res.ok) throw new Error("Recipe not found");

  return res.json();
}
