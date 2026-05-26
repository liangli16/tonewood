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
import { ButtonRow } from "@/components/ui/ButtonRow";
import {
  NOTE_NAMES,
  buildChordsFromRomans,
  buildScaleNotes,
  simplifyNote,
} from "@/utils/music";
import { playProgression, type Instrument } from "@/utils/audio";

type State = {
  degrees: number[];
  instrument: Instrument;
  pass: number;
  all: number;
  current: {
    key: string;
    degree: number;
    answer: number;
  };
};

export type ScaleDegreeConfig = Partial<Pick<State, "degrees" | "instrument">>;

const ALL_DEGREES = [1, 2, 3, 4, 5, 6, 7];
const CADENCE = ["I", "IV", "V", "I"];
const GUITAR_OCTAVE = 3;
const PIANO_OCTAVE = 4;
const CHORD_DURATION = 0.7;

const stripOctave = (note: string) => note.replace(/-?\d+$/, "");

export const ScaleDegree = ({
  lock,
  onProgress,
}: DrillEmbedProps<ScaleDegreeConfig> = {}) => {
  const { state, resetStats } = usePracticeState<State>(
    () => ({
      degrees: [...ALL_DEGREES],
      instrument: "guitar",
      pass: 0,
      all: 0,
      current: { key: "C", degree: 1, answer: 0 },
    }),
    "TONEWOOD_SCALE_DEGREE_CONFIG",
    ["degrees", "instrument"],
    lock
  );

  const snap = useSnapshot(state);
  const { degrees, instrument, current } = snap;
  useDrillProgressReporter(snap.pass, snap.all, onProgress);

  const newQuestion = () => {
    state.current.key = sample(NOTE_NAMES) ?? "C";
    state.current.degree = sample(degrees) ?? 1;
    state.current.answer = 0;
    state.all += 1;
  };

  const play = () => {
    const { key, degree } = state.current;
    const octave =
      state.instrument === "guitar" ? GUITAR_OCTAVE : PIANO_OCTAVE;

    const cadence = buildChordsFromRomans(key, CADENCE, octave);
    const scale = buildScaleNotes(key, "major", octave);
    if (!scale.length) return Promise.resolve();
    const testNote = simplifyNote(scale[degree - 1]);

    const sequence: string[][] = [...cadence, [], [testNote]];

    return playProgression(sequence, {
      instrument: state.instrument,
      chordDurationSec: CHORD_DURATION,
    });
  };

  useEffect(() => {
    resetStats();
    newQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [degrees.join(",")]);

  const answers = degrees.map((d) => ({ value: d, label: String(d) }));

  return (
    <PracticeShell<number>
      title="Scale Degrees"
      state={state}
      prompt="Which scale degree was the last note?"
      hideExtra={!!lock}
      hideHeaderScore={!!lock}
      onPlay={play}
      onNewQuestion={newQuestion}
      getCorrectAnswer={() => current.degree}
      getCurrentAnswer={() => current.answer}
      onAnswerChange={(value) => (state.current.answer = value)}
      answers={answers}
      renderReveal={() => {
        const scale = buildScaleNotes(current.key, "major", 4);
        const target = scale[current.degree - 1];
        const noteOnly = target ? stripOctave(simplifyNote(target)) : "";
        return (
          <div className="space-y-1 text-base text-stone-800">
            <div>
              <span className="font-semibold">Degree {current.degree}</span>
              <span className="text-stone-500 ml-2 text-sm">
                — {noteOnly} in the key of {current.key} major
              </span>
            </div>
            <div className="text-amber-800 font-medium text-sm">
              Cadence: I – IV – V – I
            </div>
          </div>
        );
      }}
      renderExtra={() => (
        <div className="flex flex-wrap gap-5 items-start">
          <FormField label="Tone" minWidth={160}>
            <ButtonRow<Instrument>
              items={[
                { value: "guitar", label: "Guitar" },
                { value: "piano", label: "Piano" },
              ]}
              value={instrument}
              onItemClick={(v) => (state.instrument = v)}
            />
          </FormField>
          <FormField label="Degrees" minWidth={280}>
            <MultiSelect<number>
              value={degrees as number[]}
              onChange={(v) => (state.degrees = [...v].sort((a, b) => a - b))}
              options={ALL_DEGREES.map((n) => ({
                value: n,
                label: String(n),
              }))}
            />
          </FormField>
        </div>
      )}
    />
  );
};
