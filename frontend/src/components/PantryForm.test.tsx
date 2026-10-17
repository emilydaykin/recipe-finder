import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { beforeEach, describe, expect, it } from "vitest";
import PantryForm from "./PantryForm";

function PantryFormWrapper({
  initialPantry = [],
}: {
  initialPantry?: string[];
}) {
  const [pantry, setPantry] = useState(initialPantry);
  return <PantryForm pantry={pantry} onChange={setPantry} />;
}

describe("PantryForm", () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  it("adds a trimmed, lowercased ingredient", async () => {
    render(<PantryFormWrapper />);

    await user.type(screen.getByLabelText(/ingredient/i), "  Egg ");
    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(screen.getByRole("button", { name: /egg ×/i })).toBeVisible();
    expect(screen.getByLabelText(/ingredient/i)).toHaveValue("");
  });

  it("does not add duplicates or empty values", async () => {
    render(<PantryFormWrapper initialPantry={["egg"]} />);

    await user.type(screen.getByLabelText(/ingredient/i), "egg");
    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(screen.getAllByRole("button", { name: /egg ×/i })).toHaveLength(1);

    await user.clear(screen.getByLabelText(/ingredient/i));
    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(screen.getAllByRole("button", { name: /egg ×/i })).toHaveLength(1);
  });

  it("removes one ingredient and clears the pantry", async () => {
    render(<PantryFormWrapper initialPantry={["egg", "milk"]} />);

    await user.click(screen.getByRole("button", { name: /egg ×/i }));
    expect(screen.getByRole("button", { name: /milk ×/i })).toBeVisible();
    expect(
      screen.queryByRole("button", { name: /egg ×/i })
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect(
      screen.queryByRole("button", { name: /milk ×/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Clear" })
    ).not.toBeInTheDocument();
  });
});
