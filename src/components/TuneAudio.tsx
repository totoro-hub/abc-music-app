import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactElement } from "react";
import type { CursorControl, SynthObjectController, TuneObject } from "abcjs";

const BAGPIPE_MIDI_PROGRAM = 109;

interface TuneAudioProps {
  abcString: string;
  tune: TuneObject | null;
}

interface PlaybackState {
  abcString: string;
  isLoading: boolean;
  isPlaying: boolean;
  error: string;
}

function TuneAudio({ abcString, tune }: TuneAudioProps): ReactElement {
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    abcString,
    isLoading: false,
    isPlaying: false,
    error: "",
  });
  const controlHostRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<SynthObjectController | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const highlightedElementsRef = useRef<HTMLElement[]>([]);
  const generationRef = useRef(0);
  const hasTune = Boolean(abcString.trim());
  const hasRenderedTune = Boolean(tune);
  const isCurrentState = playbackState.abcString === abcString;
  const isLoading = isCurrentState && playbackState.isLoading;
  const isPlaying = isCurrentState && playbackState.isPlaying;
  const error = isCurrentState ? playbackState.error : "";

  const clearHighlights = useCallback((): void => {
    highlightedElementsRef.current.forEach((element) =>
      element.classList.remove("abcjs-playing"),
    );
    highlightedElementsRef.current = [];
  }, []);

  const disposePlayback = useCallback((): void => {
    controllerRef.current?.pause();
    controllerRef.current = null;
    clearHighlights();
    controlHostRef.current?.replaceChildren();

    const audioContext = audioContextRef.current;
    audioContextRef.current = null;
    if (audioContext && audioContext.state !== "closed") {
      void audioContext.close().catch((closeError: unknown) => {
        console.error("Could not close the tune audio context.", closeError);
      });
    }
  }, [clearHighlights]);

  useEffect(() => {
    generationRef.current += 1;

    return () => {
      generationRef.current += 1;
      disposePlayback();
    };
  }, [abcString, disposePlayback]);

  async function startPlayback(): Promise<void> {
    if (!hasTune || !tune || isLoading) return;

    setPlaybackState({
      abcString,
      isLoading: true,
      isPlaying: false,
      error: "",
    });
    const generation = generationRef.current;

    try {
      if (!controllerRef.current) {
        if (!window.AudioContext) {
          throw new Error("Audio playback is not supported in this browser.");
        }
        const audioContext = new window.AudioContext();
        audioContextRef.current = audioContext;
        await audioContext.resume();
        if (generationRef.current !== generation) return;
        const { default: abcjs } = await import("abcjs");
        if (generationRef.current !== generation) return;
        if (!abcjs.synth.supportsAudio()) {
          throw new Error("Audio playback is not supported in this browser.");
        }
        if (!abcjs.synth.registerAudioContext(audioContext)) {
          throw new Error("Could not initialize audio playback.");
        }

        const controlHost = controlHostRef.current;
        if (!controlHost) {
          throw new Error("Could not initialize the playback controls.");
        }

        const controller = new abcjs.synth.SynthController();
        const cursorControl: CursorControl = {
          onEvent: (event) => {
            clearHighlights();
            if (event.type === "end") return;
            const elements = event.elements?.flat() ?? [];
            elements.forEach((element) =>
              element.classList.add("abcjs-playing"),
            );
            highlightedElementsRef.current = elements;
          },
          onFinished: () => {
            clearHighlights();
            if (generationRef.current === generation) {
              setPlaybackState({
                abcString,
                isLoading: false,
                isPlaying: false,
                error: "",
              });
            }
          },
        };
        controller.load(controlHost, cursorControl, {
          displayLoop: false,
          displayPlay: false,
          displayProgress: false,
          displayRestart: false,
          displayWarp: false,
        });
        controllerRef.current = controller;

        const audioTune =
          tune.formatting.bagpipes === true
            ? {
                ...tune,
                formatting: {
                  ...tune.formatting,
                  midi: {
                    drummap: [],
                    volinc: [],
                    ...tune.formatting.midi,
                    program: [BAGPIPE_MIDI_PROGRAM],
                  },
                },
              }
            : tune;
        const response = await controller.setTune(audioTune, true);
        if (response.status !== "created") {
          throw new Error("Could not prepare this tune for playback.");
        }
      }

      if (generationRef.current !== generation) return;
      controllerRef.current?.play();
      setPlaybackState({
        abcString,
        isLoading: false,
        isPlaying: true,
        error: "",
      });
    } catch (playbackError) {
      if (generationRef.current !== generation) return;
      disposePlayback();
      setPlaybackState({
        abcString,
        isLoading: false,
        isPlaying: false,
        error: `Could not play this tune: ${
          playbackError instanceof Error
            ? playbackError.message
            : "An unexpected audio error occurred."
        }`,
      });
    } finally {
      if (generationRef.current === generation) {
        setPlaybackState((currentState) =>
          currentState.abcString === abcString
            ? { ...currentState, isLoading: false }
            : currentState,
        );
      }
    }
  }

  function pausePlayback(): void {
    controllerRef.current?.play();
    setPlaybackState({
      abcString,
      isLoading: false,
      isPlaying: false,
      error: "",
    });
    clearHighlights();
  }

  return (
    <section className="audio-panel no-print" aria-labelledby="audio-title">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">PLAYBACK</p>
          <h2 id="audio-title">Tune audio</h2>
        </div>
      </div>
      <div className="audio-controls">
        <button
          className="audio-button"
          type="button"
          onClick={() => {
            if (isPlaying) pausePlayback();
            else void startPlayback();
          }}
          disabled={!hasTune || !hasRenderedTune || isLoading}
        >
          {isLoading
            ? "Preparing tune…"
            : isPlaying
              ? "Pause tune"
              : "Play tune"}
        </button>
        <span className="audio-hint">
          {hasTune
            ? hasRenderedTune
              ? "Play the score and follow the highlighted notes."
              : "Preparing the score for playback."
            : "Enter ABC notation to enable playback."}
        </span>
      </div>
      {error ? (
        <p className="render-error" role="alert">
          {error}
        </p>
      ) : null}
      <div
        aria-hidden="true"
        className="audio-control-host"
        ref={controlHostRef}
      />
    </section>
  );
}

export default TuneAudio;
