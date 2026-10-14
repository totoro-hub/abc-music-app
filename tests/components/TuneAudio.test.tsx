import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { TuneObject } from "abcjs";
import TuneAudio from "../../src/components/TuneAudio.js";

const { mockController } = vi.hoisted(() => ({
  mockController: {
    load: vi.fn(),
    setTune: vi.fn(),
    play: vi.fn(),
    pause: vi.fn(),
  },
}));

vi.mock("abcjs", () => ({
  default: {
    parseOnly: vi.fn(() => [{}]),
    synth: {
      supportsAudio: vi.fn(() => true),
      registerAudioContext: vi.fn(() => true),
      SynthController: class {
        constructor() {
          return mockController;
        }
      },
    },
  },
}));

describe("TuneAudio", () => {
  const abcString = "X:1\nT:Test Tune\nK:C\nCDEF";
  const tune = { formatting: { bagpipes: true } } as TuneObject;

  beforeEach(() => {
    vi.clearAllMocks();
    mockController.setTune.mockResolvedValue({ status: "created" });
    vi.stubGlobal(
      "AudioContext",
      class {
        state = "running";
        close = vi.fn().mockResolvedValue(undefined);
        resume = vi.fn().mockResolvedValue(undefined);
      },
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("disables playback when the ABC notation is blank", () => {
    render(<TuneAudio abcString="  " tune={null} />);

    expect(
      screen.getByRole("heading", { name: "Tune audio" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Play tune" })).toBeDisabled();
  });

  it("starts playback and highlights the notes from playback events", async () => {
    const { container } = render(
      <TuneAudio abcString={abcString} tune={tune} />,
    );
    const note = document.createElement("span");

    fireEvent.click(screen.getByRole("button", { name: "Play tune" }));

    await waitFor(() => {
      expect(mockController.play).toHaveBeenCalledOnce();
    });
    const [audioTune, userAction] = mockController.setTune.mock.calls[0];
    expect(userAction).toBe(true);
    expect(audioTune.formatting).toEqual({
      bagpipes: true,
      midi: { drummap: [], volinc: [], program: [109] },
    });

    const cursorControl = mockController.load.mock.calls[0][1];
    cursorControl.onEvent({ type: "event", elements: [[note]] });
    expect(note).toHaveClass("abcjs-playing");
    expect(
      screen.getByRole("button", { name: "Pause tune" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Pause tune" }));
    expect(mockController.play).toHaveBeenCalledTimes(2);
    expect(note).not.toHaveClass("abcjs-playing");
    expect(container.querySelector(".audio-control-host")).toBeInTheDocument();
  });

  it("shows a useful error when preparing playback fails", async () => {
    mockController.setTune.mockRejectedValue(new Error("Sound font failed"));
    render(<TuneAudio abcString={abcString} tune={tune} />);

    fireEvent.click(screen.getByRole("button", { name: "Play tune" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Could not play this tune: Sound font failed",
    );
  });
});
