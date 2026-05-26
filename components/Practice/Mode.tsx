import { Radio, Space } from "antd";
import { useEffect } from "react";
import { useSnapshot } from "valtio";
import { sample } from "lodash";
import {
  PracticeShell,
  usePracticeState,
  useDrillProgressReporter,
  type DrillEmbedProps,
} from "./components";
import { FormField } from "./FormField";
import { MultiSelect } from "./MultiSelect";
import { Fretboard } from "@/components/Fretboard/Fretboard";
import { MODES, type ModeId } from "@/constants/modes";
import {
  NOTE_NAMES,
  buildScaleNotes,
  buildChordNotes,
  simplifyNote,
  Note,
} from "@/utils/music";
import { findScaleLayout } from "@/utils/fretboard";
import { playProgression, type Instrument } from "@/utils/audio";

type State = {
  modes: ModeId[];
  instrument: Instrument;
  pass: number;
  all: number;
  current: {
    tonic: string;
    modeId: ModeId;
    answer: ModeId | "";
  };
};

export type ModeConfig = Partial<Pick<State, "modes" | "instrument">>;

const GUITAR_OCTAVE = 3;
const PIANO_OCTAVE = 4;

const stripOctave = (note: string) => note.replace(/-?\d+$/, "");

export const Mode = ({
  lock,
  onProgress,
}: DrillEmbedProps<ModeConfig> = {}) => {
  const { state, resetStats } = usePracticeState<State>(
    () => ({
      modes: ["ionian", "dorian", "mixolydian", "aeolian"],
      instrument: "guitar",
      pass: 0,
      all: 0,
      current: { tonic: "C", modeId: "ionian", answer: "" },
    }),
    "TONEWOOD_MODE_CONFIG",
    ["modes", "instrument"],
    lock
  );

  const snap = useSnapshot(state);
  const { modes, instrument, current } = snap;
  useDrillProgressReporter(snap.pass, snap.all, onProgress);

  const newQuestion = () => {
    state.current.tonic = sample(NOTE_NAMES) ?? "C";
    state.current.modeId = sample(modes) ?? "ionian";
    state.current.answer = "";
    state.all += 1;
  };

  const play = () => {
    const { tonic, modeId } = state.current;
    const modeDef = MODES.find((m) => m.id === modeId);
    if (!modeDef) return Promise.resolve();
    const octave =
      state.instrument === "guitar" ? GUITAR_OCTAVE : PIANO_OCTAVE;
    const raw = buildScaleNotes(tonic, modeDef.scaleName, octave);
    if (!raw.length) return Promise.resolve();
    const ascending = [...raw, Note.transpose(raw[0], "8P")];
    const scaleAsChords = ascending.map((n) => [simplifyNote(n)]);
    const priming = buildChordNotes(
      tonic,
      modeDef.tonicQuality,
      octave,
      0
    );
    return playProgression(scaleAsChords, {
      chordDurationSec: 0.4,
      primingChord: priming,
      instrument: state.instrument,
    });
  };

  useEffect(() => {
    resetStats();
    newQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modes.join(",")]);

  return (
    <PracticeShell
      title="Modes"
      state={state}
      prompt="Which mode did you hear?"
      hideExtra={!!lock}
      hideHeaderScore={!!lock}
      onPlay={play}
      onNewQuestion={newQuestion}
      getCorrectAnswer={() => current.modeId}
      getCurrentAnswer={() => current.answer}
      onAnswerChange={(value) => (state.current.answer = value)}
      renderOptions={(hasAnswered) =>
        modes.map((id) => {
          const def = MODES.find((m) => m.id === id);
          const isCorrectChoice = hasAnswered && id === current.modeId;
          return (
            <Radio.Button
              key={id}
              value={id}
              style={
                isCorrectChoice
                  ? { borderColor: "#16a34a", color: "#16a34a" }
                  : undefined
              }
            >
              {def?.label ?? id}
            </Radio.Button>
          );
        })
      }
      renderReveal={() => {
        const def = MODES.find((m) => m.id === current.modeId);
        if (!def) return null;
        const raw = buildScaleNotes(current.tonic, def.scaleName, GUITAR_OCTAVE);
        const ascending = raw.length
          ? [...raw, Note.transpose(raw[0], "8P")].map(simplifyNote)
          : [];
        const displayed = ascending.map(stripOctave);
        const layout = ascending.length ? findScaleLayout(ascending) : null;
        return (
          <div className="space-y-3">
            <div className="space-y-1 text-base">
              <div>
                <span className="font-semibold">
                  {current.tonic} {def.label}
                </span>
                {def.altName && (
                  <span className="text-gray-500 ml-2">({def.altName})</span>
                )}
              </div>
              {displayed.length > 0 && (
                <div className="text-gray-600 text-sm">
                  {displayed.join(" – ")}
                </div>
              )}
              <div className="text-amber-900 font-medium text-sm">
                {def.degrees}
              </div>
            </div>
            {layout && (
              <Fretboard
                positions={layout.positions}
                startFret={layout.startFret}
                numFrets={layout.numFrets}
                highlightRoot={current.tonic}
              />
            )}
            <div className="text-xs text-gray-500 text-center">
              Rose = tonic · Amber = other scale tones
            </div>
          </div>
        );
      }}
      renderExtra={() => (
        <Space wrap size="middle" align="start">
          <FormField label="Tone" minWidth={160}>
            <Radio.Group
              value={instrument}
              optionType="button"
              size="middle"
              onChange={(e) => (state.instrument = e.target.value)}
              options={[
                { label: "Guitar", value: "guitar" },
                { label: "Piano", value: "piano" },
              ]}
            />
          </FormField>
          <FormField label="Modes" minWidth={280}>
            <MultiSelect<ModeId>
              value={modes as ModeId[]}
              onChange={(v) => (state.modes = v)}
              options={MODES.map((m) => ({
                value: m.id,
                label: m.altName ? `${m.label} (${m.altName})` : m.label,
              }))}
            />
          </FormField>
        </Space>
      )}
    />
  );
};
