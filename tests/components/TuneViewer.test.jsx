import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import abcjs from "abcjs";
import TuneViewer from "../../src/components/TuneViewer.jsx";

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

  it("renders a score for non-empty notation", () => {
    const abcString = ["X:1", "T:Test Tune", "K:C", "CDEF"].join("\n");
    vi.mocked(abcjs.renderAbc).mockImplementation((container) => {
      container.innerHTML = '<svg aria-label="Rendered score"></svg>';
    });
    render(<TuneViewer abcString={abcString} />);

    expect(screen.getByLabelText("Rendered score")).toBeInTheDocument();
  });

  it("enables ABCJS classes so grace-note spacing can be compacted", () => {
    const abcString = ["X:1", "T:Test Tune", "K:C", "CDEF"].join("\n");

    render(<TuneViewer abcString={abcString} />);

    expect(abcjs.renderAbc).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      abcString,
      { responsive: "resize", add_classes: true },
    );
  });

  it("shows an error when rendering fails", () => {
    vi.mocked(abcjs.renderAbc).mockImplementation(() => {
      throw new Error("Invalid notation");
    });
    render(<TuneViewer abcString="invalid" />);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Could not render the score: Invalid notation",
    );
  });
});
