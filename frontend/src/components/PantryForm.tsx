import { useState } from "react";
import type { SubmitEvent } from "react";

type Props = {
  pantry: string[];
  onChange: (pantry: string[]) => void;
};

function PantryForm({ pantry, onChange }: Props) {
  const [input, setInput] = useState("");

  const handleSubmit = (event: SubmitEvent) => {
    event.preventDefault();
    const trimmed = input.trim().toLowerCase();
    if (!trimmed || pantry.includes(trimmed)) return;

    onChange([...pantry, trimmed]);
    setInput("");
  };

  return (
    <section className="mb-8 rounded-xl border border-stone-200 bg-white p-6 shadow-sm max-w-xl md:w-md">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
        <label htmlFor="pantry-ingredient" className="sr-only">
          Ingredient
        </label>
        <input
          id="pantry-ingredient"
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="e.g. egg, milk, flour"
          className="flex-1 rounded-lg border border-stone-300 px-3 py-2 focus:border-stone-500 focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-lg bg-emerald-950 px-4 py-2 text-white hover:bg-emerald-900 cursor-pointer"
        >
          Add
        </button>
      </form>

      {pantry.length > 0 && (
        <div className="mt-4 flex items-center gap-3">
          <ul className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
            {pantry.map((ingredient) => (
              <li key={ingredient}>
                <button
                  type="button"
                  onClick={() =>
                    onChange(pantry.filter((item) => item !== ingredient))
                  }
                  className="rounded-full bg-emerald-50 px-3 py-1 text-sm hover:bg-emerald-100 cursor-pointer"
                >
                  {ingredient} ×
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => onChange([])}
            className="shrink-0 self-center rounded-lg border border-red-700 px-4 py-0.5 text-red-700 hover:bg-stone-100 cursor-pointer"
          >
            Clear
          </button>
        </div>
      )}
    </section>
  );
}

export default PantryForm;
