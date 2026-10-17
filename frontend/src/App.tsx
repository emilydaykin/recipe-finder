import { useEffect, useState } from "react";
import {
  BROWSE_SIZE,
  PAGE_SIZE,
  fetchRecipe,
  fetchRecipes,
} from "./api/recipes";
import PantryForm from "./components/PantryForm";
import RecipeCard from "./components/RecipeCard";
import RecipeModal from "./components/RecipeModal";
import type { RecipeDetail, RecipeSummary } from "./types/recipe";

function App() {
  const [pantry, setPantry] = useState<string[]>([]);
  const [results, setResults] = useState<RecipeSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [detail, setDetail] = useState<RecipeDetail | null>(null);
  const [loadingDetailId, setLoadingDetailId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isBrowseMode = pantry.length === 0;
  const hasMore = results.length < total;
  const pageSize = isBrowseMode ? BROWSE_SIZE : PAGE_SIZE;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchRecipes({
          ingredients: pantry,
          limit: pageSize,
          offset: 0,
        });
        setResults(data.recipes);
        setTotal(data.total);
      } catch {
        setError("Could not load recipes");
        setResults([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [pantry, pageSize]);

  const handleLoadMore = async () => {
    setLoadingMore(true);
    setError(null);

    try {
      const data = await fetchRecipes({
        ingredients: pantry,
        limit: pageSize,
        offset: results.length,
      });
      setResults((prev) => [...prev, ...data.recipes]);
      setTotal(data.total);
    } catch {
      setError("Could not load more recipes");
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSelect = async (id: number) => {
    if (loadingDetailId != null) return;

    setLoadingDetailId(id);
    setError(null);

    try {
      setDetail(await fetchRecipe(id, { ingredients: pantry }));
    } catch {
      setError("Could not load recipe");
    } finally {
      setLoadingDetailId(null);
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50/40 text-stone-900">
      <div className="mx-auto max-w-3xl p-10 md:flex md:flex-col block justify-center items-center">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold text-left md:text-center tracking-tight text-emerald-900">
            PennyPantry
          </h1>
          <p className="mt-2 text-stone-600">
            🧑‍🍳 Add what you have at home & find recipes you can make! 🍽️
          </p>
        </header>

        <PantryForm pantry={pantry} onChange={setPantry} />

        {error && (
          <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </p>
        )}

        <section className="w-full">
          <h2 className="mb-4 text-lg font-medium">
            {isBrowseMode ? "Discover recipes" : "Recipes"}
          </h2>

          {loading && <p className="text-stone-500">Loading…</p>}

          {!loading && !isBrowseMode && results.length === 0 && (
            <p className="text-stone-500 w-full">No matching recipes found.</p>
          )}

          {!loading && (
            <ul className="space-y-3">
              {results.map((recipe) => (
                <li key={recipe.id}>
                  <RecipeCard
                    recipe={recipe}
                    loading={loadingDetailId === recipe.id}
                    onSelect={() => handleSelect(recipe.id)}
                  />
                </li>
              ))}
            </ul>
          )}

          {hasMore && !loading && (
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="mt-4 w-full rounded-lg border border-stone-300 py-2 hover:bg-stone-100 disabled:opacity-50 cursor-pointer"
            >
              {loadingMore
                ? "Loading…"
                : `Load more (${results.length} of ${total})`}
            </button>
          )}
        </section>
      </div>

      {detail && (
        <RecipeModal
          recipe={detail}
          pantry={pantry}
          onClose={() => setDetail(null)}
        />
      )}
    </div>
  );
}

export default App;
