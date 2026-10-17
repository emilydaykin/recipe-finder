import { vi } from "vitest";
import type { RecipeDetail, RecipesResponse } from "../types/recipe";
import { browseRecipe, recipeDetail } from "./fixtures";

type InstallRecipeHttpMockOptions = {
  list?: RecipesResponse[];
  listFails?: boolean;
  networkError?: boolean;
  detail?: RecipeDetail;
  detailFails?: boolean;
};

export function installRecipeHttpMock(
  options: InstallRecipeHttpMockOptions = {}
) {
  const listQueue = [
    ...(options.list ?? [{ recipes: [browseRecipe], total: 1 }]),
  ];

  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    if (options.networkError) {
      throw new Error("network");
    }

    const url = new URL(
      typeof input === "string" ? input : input.toString(),
      "http://localhost"
    );

    if (url.pathname === "/api/recipes") {
      if (options.listFails) {
        return { ok: false, json: async () => ({}) } as Response;
      }
      const body = listQueue.shift() ?? { recipes: [], total: 0 };
      return { ok: true, json: async () => body } as Response;
    }

    if (/^\/api\/recipes\/\d+$/.test(url.pathname)) {
      if (options.detailFails) {
        return { ok: false, json: async () => ({}) } as Response;
      }
      return {
        ok: true,
        json: async () => options.detail ?? recipeDetail,
      } as Response;
    }

    return { ok: false, json: async () => ({}) } as Response;
  });

  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}
