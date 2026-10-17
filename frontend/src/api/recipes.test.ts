import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("fetchRecipes", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ recipes: [], total: 0 }),
      })
    );
    vi.spyOn(Math, "random").mockReturnValue(0.42);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    vi.resetModules();
  });

  async function loadApi() {
    return import("./recipes");
  }

  it("browse mode sends seed, limit, and offset", async () => {
    const { fetchRecipes } = await loadApi();

    await fetchRecipes({ limit: 20, offset: 0 });

    const url = new URL(
      String(vi.mocked(fetch).mock.calls[0][0]),
      "http://test"
    );
    expect(url.pathname).toBe("/api/recipes");
    expect(Object.fromEntries(url.searchParams.entries())).toEqual({
      limit: "20",
      offset: "0",
      seed: expect.any(String),
    });
  });

  it("search mode sends ingredients and no seed", async () => {
    const { fetchRecipes } = await loadApi();

    await fetchRecipes({ ingredients: ["egg", "milk"], limit: 10, offset: 5 });

    const url = new URL(
      String(vi.mocked(fetch).mock.calls[0][0]),
      "http://test"
    );
    expect(Object.fromEntries(url.searchParams.entries())).toEqual({
      ingredients: "egg,milk",
      limit: "10",
      offset: "5",
    });
  });

  it("throws when the response is not ok", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({ ok: false } as Response);
    const { fetchRecipes } = await loadApi();

    await expect(fetchRecipes({ ingredients: ["egg"] })).rejects.toThrow(
      "Failed to fetch recipes"
    );
  });
});

describe("fetchRecipe", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ id: 1, title: "Test" }),
      })
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("requests the recipe with pantry ingredients when provided", async () => {
    const { fetchRecipe } = await import("./recipes");

    await fetchRecipe(7, { ingredients: ["egg"] });

    expect(fetch).toHaveBeenCalledWith("/api/recipes/7?ingredients=egg");
  });

  it("requests the recipe without a query when pantry is empty", async () => {
    const { fetchRecipe } = await import("./recipes");

    await fetchRecipe(7);

    expect(fetch).toHaveBeenCalledWith("/api/recipes/7");
  });

  it("throws when the response is not ok", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({ ok: false } as Response);
    const { fetchRecipe } = await import("./recipes");

    await expect(fetchRecipe(1)).rejects.toThrow("Recipe not found");
  });

  it("prefixes the Render URL when VITE_API_URL is set", async () => {
    vi.stubEnv("VITE_API_URL", "https://api.example.com");
    const { fetchRecipe } = await import("./recipes");

    await fetchRecipe(7);

    expect(fetch).toHaveBeenCalledWith("https://api.example.com/api/recipes/7");
  });
});
