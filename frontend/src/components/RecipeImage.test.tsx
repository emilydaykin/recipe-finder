import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import RecipeImage, { PLACEHOLDER_IMAGE } from "./RecipeImage";

function imageAttributes(name: string) {
  const img = screen.getByRole("img", { name });
  return {
    src: img.getAttribute("src"),
    alt: img.getAttribute("alt"),
  };
}

describe("RecipeImage", () => {
  it("shows the placeholder when there is no image", () => {
    render(
      <RecipeImage
        src={null}
        alt="Golden Cornbread"
        width={90}
        height={90}
        className=""
      />
    );

    expect(imageAttributes("Golden Cornbread")).toEqual({
      src: PLACEHOLDER_IMAGE,
      alt: "Golden Cornbread",
    });
  });

  it("shows the placeholder after a load error", () => {
    render(
      <RecipeImage
        src="https://example.com/broken.jpg"
        alt="Pancakes"
        width={90}
        height={90}
        className=""
      />
    );

    expect(imageAttributes("Pancakes")).toEqual({
      src: "https://example.com/broken.jpg&w=90&h=90&fit=crop",
      alt: "Pancakes",
    });

    screen.getByRole("img", { name: "Pancakes" }).dispatchEvent(
      new Event("error", { bubbles: true })
    );

    expect(imageAttributes("Pancakes")).toEqual({
      src: PLACEHOLDER_IMAGE,
      alt: "Pancakes",
    });
  });
});
