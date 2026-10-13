import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TuneObject } from "abcjs";
import abcjs from "abcjs";
import TuneViewer from "../../src/components/TuneViewer.js";

vi.mock("abcjs", () => ({
  default: {
    renderAbc: vi.fn(),
  },
}));

describe("TuneViewer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows the empty state when notation is blank", () => {
    render(<TuneViewer abcString="  " />);

    expect(
      screen.getByText("Your sheet music will appear here."),
    ).toBeInTheDocument();
    expect(abcjs.renderAbc).not.toHaveBeenCalled();
  });

  it("renders a score for non-empty notation", async () => {
    const abcString = ["X:1", "T:Test Tune", "K:C", "CDEF"].join("\n");
    vi.mocked(abcjs.renderAbc).mockImplementation((container) => {
      if (typeof container === "string") {
        throw new Error("Expected an HTML container.");
      }
      container.innerHTML = '<svg aria-label="Rendered score"></svg>';
      return [{} as TuneObject];
    });
    render(<TuneViewer abcString={abcString} />);

    expect(await screen.findByLabelText("Rendered score")).toBeInTheDocument();
  });

  it("enables ABCJS classes so grace-note spacing can be compacted", async () => {
    const abcString = ["X:1", "T:Test Tune", "K:C", "CDEF"].join("\n");

    render(<TuneViewer abcString={abcString} />);

    await waitFor(() => {
      expect(abcjs.renderAbc).toHaveBeenCalledWith(
        expect.any(HTMLElement),
        abcString,
        {
          responsive: "resize",
          add_classes: true,
          expandToWidest: true,
          paddingleft: 0,
          paddingright: 0,
          lineThickness: 0.3,
        },
      );
    });
  });

  it("shows an error when rendering fails", async () => {
    vi.mocked(abcjs.renderAbc).mockImplementation(() => {
      throw new Error("Invalid notation");
    });
    render(<TuneViewer abcString="invalid" />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Could not render the score: Invalid notation",
    );
  });
});
