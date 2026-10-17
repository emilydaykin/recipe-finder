import type { RecipeSummary } from "../types/recipe";
import RecipeImage from "./RecipeImage";

type Props = {
  recipe: RecipeSummary;
  loading: boolean;
  onSelect: () => void;
};

function RecipeCard({ recipe, loading, onSelect }: Props) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-busy={loading}
      className={`w-full rounded-xl border border-stone-200 bg-white p-4 text-left transition hover:border-stone-400 ${
        loading ? "animate-pulse cursor-wait" : "cursor-pointer"
      }`}
    >
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="size-[90px] shrink-0 overflow-hidden rounded-lg bg-stone-200">
          <RecipeImage
            src={recipe.image}
            alt={recipe.title}
            width={90}
            height={90}
            className="size-full object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-medium">{recipe.title}</h3>
          {recipe.ratings != null && (
            <p className="mt-1 text-sm text-stone-500">
              ★ {recipe.ratings.toFixed(1)}
            </p>
          )}
          {recipe.match_count != null && (
            <>
              <p className="mt-1 text-sm text-stone-600">
                {recipe.match_count} matched · {recipe.missing_count} missing
              </p>
              {recipe.missing_count === 0 ? (
                <span className="mt-2 inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800">
                  Ready to cook
                </span>
              ) : (
                <p className="mt-2 text-xs text-stone-500">
                  Missing: {recipe.missing_ingredients?.join(", ")}
                </p>
              )}
            </>
          )}
          {recipe.ingredients && (
            <p className="mt-2 text-xs text-stone-500">
              {recipe.ingredients
                .map((ingredient) => ingredient.raw_text)
                .join(" • ")}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}

export default RecipeCard;
