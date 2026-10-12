import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import App from "../src/App.js";

vi.mock("abcjs", () => ({
  default: {
    renderAbc: vi.fn(),
  },
}));

describe("App", () => {
  it("switches the active tune when selected from the tunebook", () => {
    render(<App />);

    fireEvent.click(
      screen.getByRole("button", { name: /The Blarney Pilgrim/ }),
    );

    expect(
      screen.getByRole<HTMLTextAreaElement>("textbox", {
        name: "Enter ABC music notation",
      }).value,
    ).toContain("T:The Blarney Pilgrim");
  });
});
