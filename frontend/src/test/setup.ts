import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Unmount React trees after each test so DOM/state does not leak between files.
afterEach(() => {
  cleanup();
});

// RecipeModal calls showModal() on mount; jsdom may not implement it (would throw or leave dialog closed).
if (!HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.open = true;
  };
}

// Minimal close() so code or tests that call it do not throw; sets open like a real dialog.
if (!HTMLDialogElement.prototype.close) {
  HTMLDialogElement.prototype.close = function close() {
    this.open = false;
  };
}
