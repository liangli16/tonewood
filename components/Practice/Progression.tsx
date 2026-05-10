import { Radio, Space } from "antd";
import { useEffect } from "react";
import { useSnapshot } from "valtio";
import { sample } from "lodash";
import { PracticeShell, usePracticeState } from "./components";
import { FormField } from "./FormField";
import { MultiSelect } from "./MultiSelect";
import { PROGRESSIONS, type ProgressionId } from "@/constants/progressions";
import {
  NOTE_NAMES,
  buildChordsFromRomans,
  symbolsFromRomans,
} from "@/utils/music";
import { playProgression, type Instrument } from "@/utils/audio";

type State = {
  progressions: ProgressionId[];
  instrument: Instrument;
  pass: number;
  all: number;
  current: {
    key: string;
    progressionId: ProgressionId;
    answer: ProgressionId | "";
  };
};

const GUITAR_OCTAVE = 3;
const PIANO_OCTAVE = 4;

export const Progression = () => {
  const { state, resetStats } = usePracticeState<State>(
    () => ({
      progressions: ["pop", "doowop", "jazz", "blues"],
      instrument: "guitar",
      pass: 0,
      all: 0,
      current: { key: "C", progressionId: "pop", answer: "" },
    }),
    "TONEWOOD_PROGRESSION_CONFIG",
    ["progressions", "instrument"]
  );

  const { progressions, instrument, current } = useSnapshot(state);

  const newQuestion = () => {
    state.current.key = sample(NOTE_NAMES) ?? "C";
    state.current.progressionId = sample(progressions) ?? "pop";
    state.current.answer = "";
    state.all += 1;
  };

  const play = () => {
    const def = PROGRESSIONS.find((p) => p.id === current.progressionId);
    if (!def) return Promise.resolve();
    const octave =
      state.instrument === "guitar" ? GUITAR_OCTAVE : PIANO_OCTAVE;
    const chords = buildChordsFromRomans(current.key, def.romans, octave);
    const tonic = buildChordsFromRomans(current.key, ["I"], octave)[0];
    return playProgression(chords, {
      instrument: state.instrument,
      primingChord: tonic,
    });
  };

  useEffect(() => {
    resetStats();
    newQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progressions.join(",")]);

  return (
    <PracticeShell
      title="Common Progression"
      state={state}
      prompt="Which progression did you hear?"
      onPlay={play}
      onNewQuestion={newQuestion}
      getCorrectAnswer={() => current.progressionId}
      getCurrentAnswer={() => current.answer}
      onAnswerChange={(value) => (state.current.answer = value)}
      renderOptions={(hasAnswered) =>
        progressions.map((id) => {
          const def = PROGRESSIONS.find((p) => p.id === id);
          const isCorrectChoice =
            hasAnswered && id === current.progressionId;
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
        const def = PROGRESSIONS.find((p) => p.id === current.progressionId);
        if (!def) return null;
        const symbols = symbolsFromRomans(current.key, def.romans);
        const uniqueSymbols = Array.from(new Set(symbols));
        return (
          <div className="space-y-1 text-base">
            <div>
              <span className="font-semibold">{def.label}</span>
              <span className="text-gray-500 ml-2">
                in {current.key} major
              </span>
            </div>
            <div className="text-amber-800 font-medium">{def.romanLabel}</div>
            <div className="text-gray-600 text-sm">
              {uniqueSymbols.join(" · ")}
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
          <FormField label="Progressions" minWidth={280}>
            <MultiSelect<ProgressionId>
              value={progressions as ProgressionId[]}
              onChange={(v) => (state.progressions = v)}
              options={PROGRESSIONS.map((p) => ({
                value: p.id,
                label: p.label,
              }))}
            />
          </FormField>
        </Space>
      )}
    />
  );
};
