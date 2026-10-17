import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { browseRecipe, readyRecipe, searchRecipe } from "../test/fixtures";
import RecipeCard from "./RecipeCard";

describe("RecipeCard", () => {
  it("shows browse details without match labels", () => {
    render(
      <RecipeCard recipe={browseRecipe} loading={false} onSelect={() => {}} />
    );

    expect(
      screen.getByRole("heading", { name: "Golden Cornbread" })
    ).toBeVisible();
    expect(screen.getByText(/1 cup flour • 1 egg/)).toBeVisible();
    expect(screen.queryByText(/matched/)).not.toBeInTheDocument();
  });

  it("shows missing ingredients on a partial search match", () => {
    render(
      <RecipeCard recipe={searchRecipe} loading={false} onSelect={() => {}} />
    );

    const card = screen.getByRole("button", { name: /Pancakes/i });
    expect(within(card).getByText("2 matched · 1 missing")).toBeVisible();
    expect(within(card).getByText("Missing: butter")).toBeVisible();
    expect(within(card).queryByText("Ready to cook")).not.toBeInTheDocument();
  });

  it("shows ready to cook when nothing is missing", () => {
    render(
      <RecipeCard recipe={readyRecipe} loading={false} onSelect={() => {}} />
    );

    const card = screen.getByRole("button", { name: /Fried Egg/i });
    expect(within(card).getByText("Ready to cook")).toBeVisible();
    expect(within(card).queryByText(/Missing:/)).not.toBeInTheDocument();
  });
});
