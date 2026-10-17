import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { browseRecipe } from "./test/fixtures";
import { installRecipeHttpMock } from "./test/httpMock";

describe("App", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads browse recipes and opens a recipe detail", async () => {
    const user = userEvent.setup();
    installRecipeHttpMock();

    render(<App />);

    expect(
      await screen.findByRole("heading", { name: "Discover recipes" })
    ).toBeVisible();
    expect(
      screen.getByRole("heading", { name: "Golden Cornbread" })
    ).toBeVisible();

    await user.click(screen.getByRole("button", { name: /Golden Cornbread/i }));

    expect(
      await screen.findByRole("heading", { name: "Pancakes" })
    ).toBeVisible();
    expect(screen.getByRole("dialog")).toBeVisible();
  });

  it("searches after adding an ingredient", async () => {
    const user = userEvent.setup();
    const fetchMock = installRecipeHttpMock({
      list: [
        { recipes: [browseRecipe], total: 1 },
        { recipes: [], total: 0 },
      ],
    });

    render(<App />);
    await screen.findByRole("heading", { name: "Discover recipes" });

    await user.type(screen.getByLabelText(/ingredient/i), "egg");
    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(await screen.findByRole("button", { name: /egg ×/i })).toBeVisible();
    expect(
      await screen.findByRole("heading", { name: "Recipes" })
    ).toBeVisible();
    expect(await screen.findByText("No matching recipes found.")).toBeVisible();

    await waitFor(() => {
      const searchCall = fetchMock.mock.calls.find(([input]) => {
        const url = new URL(String(input), "http://localhost");
        return (
          url.pathname === "/api/recipes" &&
          url.searchParams.get("ingredients") === "egg"
        );
      });
      expect(searchCall).toBeDefined();
    });
  });

  it("shows an error when recipes fail to load", async () => {
    installRecipeHttpMock({ networkError: true });

    render(<App />);

    expect(await screen.findByText("Could not load recipes")).toBeVisible();
  });
});
