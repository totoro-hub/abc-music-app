import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import TuneAudio from "../../src/components/TuneAudio.jsx";

describe("TuneAudio", () => {
  it("shows the playback placeholder", () => {
    render(<TuneAudio />);

    expect(
      screen.getByRole("heading", { name: "Tune audio" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("The playback engine will live here."),
    ).toBeInTheDocument();
  });
});
