import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { recipeDetail } from "../test/fixtures";
import RecipeModal from "./RecipeModal";

function RecipeModalWrapper({ pantry }: { pantry: string[] }) {
  const [open, setOpen] = useState(true);

  if (!open) {
    return <p>Recipe details closed</p>;
  }

  return (
    <RecipeModal
      recipe={recipeDetail}
      pantry={pantry}
      onClose={() => setOpen(false)}
    />
  );
}

describe("RecipeModal", () => {
  it("shows missing labels when pantry ingredients given", () => {
    render(<RecipeModalWrapper pantry={["egg"]} />);

    expect(screen.getByRole("heading", { name: "Pancakes" })).toBeVisible();
    expect(screen.getByText("1 egg")).toBeVisible();
    expect(screen.getByText("1 cup milk (missing)")).toBeVisible();
  });

  it("does not show missing labels when no pantry ingredients have been given", () => {
    render(<RecipeModalWrapper pantry={[]} />);

    expect(screen.getByText("1 cup milk")).toBeVisible();
    expect(screen.queryByText("(missing)")).not.toBeInTheDocument();
  });

  it("closes when the close button is clicked", async () => {
    const user = userEvent.setup();

    render(<RecipeModalWrapper pantry={[]} />);

    await user.click(
      screen.getByRole("button", { name: "Close recipe details" })
    );

    expect(screen.getByText("Recipe details closed")).toBeVisible();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
