import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { saveScoreAsPdf } from "../../src/saveScoreAsPdf.js";
import TuneInput from "../../src/components/TuneInput.js";

vi.mock("../../src/saveScoreAsPdf.js", () => ({
  saveScoreAsPdf: vi.fn(),
}));

describe("TuneInput", () => {
  const abcString = "X:1\nT:Test Tune\nK:C\nCDEF";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("notifies when the notation changes", () => {
    const onAbcChange = vi.fn();
    render(
      <TuneInput
        abcString={abcString}
        onAbcChange={onAbcChange}
        onClear={vi.fn()}
      />,
    );

    fireEvent.change(
      screen.getByRole("textbox", { name: "Enter ABC music notation" }),
      {
        target: { value: "X:1\nT:Updated Tune" },
      },
    );

    expect(onAbcChange).toHaveBeenCalledWith("X:1\nT:Updated Tune");
  });

  it("notifies when the notation is cleared", () => {
    const onClear = vi.fn();
    render(
      <TuneInput
        abcString={abcString}
        onAbcChange={vi.fn()}
        onClear={onClear}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Clear" }));

    expect(onClear).toHaveBeenCalledOnce();
  });

  it("exports the rendered score as a PDF", async () => {
    render(
      <>
        <div className="score">
          <svg aria-label="Rendered score" />
        </div>
        <TuneInput
          abcString={abcString}
          onAbcChange={vi.fn()}
          onClear={vi.fn()}
        />
      </>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Save as PDF" }));

    await waitFor(() => {
      expect(saveScoreAsPdf).toHaveBeenCalledWith(
        document.querySelector(".score svg"),
        abcString,
      );
    });
  });

  it("shows an error when no rendered score is available", async () => {
    render(
      <TuneInput
        abcString={abcString}
        onAbcChange={vi.fn()}
        onClear={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Save as PDF" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Could not save the PDF: The sheet music is not ready to export.",
    );
  });
});
