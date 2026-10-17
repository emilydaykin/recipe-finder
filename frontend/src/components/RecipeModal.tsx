import { useLayoutEffect, useRef } from "react";
import type { RecipeDetail } from "../types/recipe";
import RecipeImage from "./RecipeImage";

type Props = {
  recipe: RecipeDetail;
  pantry: string[];
  onClose: () => void;
};

function RecipeModal({ recipe, pantry, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useLayoutEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="recipe-detail-title"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="inset-x-5 m-auto max-h-[90vh] w-auto max-w-lg rounded-xl bg-white shadow-lg transition-opacity duration-300 starting:opacity-0 backdrop:bg-black/50 backdrop:transition-opacity backdrop:duration-300 starting:backdrop:opacity-0 motion-reduce:transition-none motion-reduce:backdrop:transition-none"
    >
      <div className="relative p-6">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close recipe details"
          className="absolute right-4 top-4 rounded-full px-2 py-1 text-lg leading-none text-stone-500 hover:bg-stone-100 hover:text-stone-800 cursor-pointer"
        >
          ×
        </button>

        <article>
          <h3 id="recipe-detail-title" className="pr-8 text-xl font-semibold">
            {recipe.title}
          </h3>
          <p className="mt-2 text-sm text-stone-600">
            Prep {recipe.prep_time ?? "—"} min · Cook {recipe.cook_time ?? "—"}{" "}
            min
            {recipe.ratings != null && ` · ★ ${recipe.ratings.toFixed(1)}`}
          </p>

          <h4 className="mt-6 mb-2 font-medium">Ingredients</h4>
          <ul className="space-y-1 text-sm mb-4">
            {recipe.ingredients.map((ingredient) => (
              <li
                key={`${ingredient.name}-${ingredient.raw_text}`}
                className={
                  ingredient.matched ? "text-stone-900" : "text-stone-400"
                }
              >
                {ingredient.raw_text}
                {!ingredient.matched && pantry.length > 0 && " (missing)"}
              </li>
            ))}
          </ul>
          <div className="mb-4 h-48 overflow-hidden rounded-lg bg-stone-200">
            <RecipeImage
              src={recipe.image}
              alt={recipe.title}
              width={800}
              height={400}
              className="size-full rounded-lg object-contain"
            />
          </div>
        </article>
      </div>
    </dialog>
  );
}

export default RecipeModal;
