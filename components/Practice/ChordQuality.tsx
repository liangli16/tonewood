import { Radio, Select, Space, Slider } from "antd";
import { useEffect } from "react";
import { useSnapshot } from "valtio";
import { sample } from "lodash";
import { PracticeShell, usePracticeState } from "./components";
import { Fretboard } from "@/components/Fretboard/Fretboard";
import { CHORD_QUALITIES, INVERSIONS } from "@/constants/chords";
import {
  NOTE_NAMES,
  buildChordNotes,
  type ChordTypeId,
} from "@/utils/music";
import { getChordPositions } from "@/utils/fretboard";
import { playChord, type Instrument } from "@/utils/audio";
import { getRandom } from "@/utils/number";

type State = {
  qualities: ChordTypeId[];
  inversions: number[];
  arpeggiate: number;
  instrument: Instrument;
  pass: number;
  all: number;
  current: {
    root: string;
    octave: number;
    quality: ChordTypeId;
    inversion: number;
    answer: ChordTypeId | "";
  };
};

export const ChordQuality = () => {
  const { state, resetStats } = usePracticeState<State>(
    () => ({
      qualities: ["M", "m", "7", "M7", "m7"],
      inversions: [0],
      arpeggiate: 0.06,
      instrument: "guitar",
      pass: 0,
      all: 0,
      current: {
        root: "C",
        octave: 4,
        quality: "M",
        inversion: 0,
        answer: "",
      },
    }),
    "TONEWOOD_CHORD_QUALITY_CONFIG",
    ["qualities", "inversions", "arpeggiate", "instrument"]
  );

  const { qualities, inversions, arpeggiate, instrument, current } =
    useSnapshot(state);

  const newChord = () => {
    const root = sample(NOTE_NAMES) ?? "C";
    const octave = getRandom(3, 4);
    const quality = sample(qualities) ?? "M";
    const inversion = sample(inversions) ?? 0;
    state.current.root = root;
    state.current.octave = octave;
    state.current.quality = quality;
    state.current.inversion = inversion;
    state.current.answer = "";
    state.all += 1;
  };

  const playWithSettings = (quality: ChordTypeId, inversion: number) => {
    const notes = buildChordNotes(
      state.current.root,
      quality,
      state.current.octave,
      inversion
    );
    return playChord(notes, { arpeggiate, instrument: state.instrument });
  };

  const play = () =>
    playWithSettings(state.current.quality, state.current.inversion);

  const playOption = (q: ChordTypeId) =>
    playWithSettings(q, state.current.inversion);

  useEffect(() => {
    resetStats();
    newChord();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qualities.join(","), inversions.join(",")]);

  const correctAnswer = current.quality;
  const qualityMeta = CHORD_QUALITIES.find((c) => c.value === current.quality);
  const inversionMeta = INVERSIONS.find((i) => i.value === current.inversion);

  return (
    <PracticeShell
      title="Chord Quality"
      state={state}
      prompt="Which chord did you hear?"
      onPlay={play}
      onNewQuestion={newChord}
      onOptionPlay={(q) => playOption(q as ChordTypeId)}
      getCorrectAnswer={() => current.quality}
      getCurrentAnswer={() => current.answer}
      onAnswerChange={(value) => (state.current.answer = value)}
      renderOptions={(hasAnswered, onOptionPlay) =>
        qualities.map((q) => {
          const meta = CHORD_QUALITIES.find((c) => c.value === q);
          const isCorrectChoice = hasAnswered && q === correctAnswer;
          return (
            <Radio.Button
              key={q}
              value={q}
              onClick={() =>
                hasAnswered && onOptionPlay && onOptionPlay(q)
              }
              style={
                isCorrectChoice
                  ? { borderColor: "#16a34a", color: "#16a34a" }
                  : undefined
              }
            >
              {meta?.label ?? q}
            </Radio.Button>
          );
        })
      }
      renderReveal={() => {
        const notes = buildChordNotes(
          current.root,
          current.quality,
          current.octave,
          current.inversion
        );
        const positions = getChordPositions(notes);
        return (
          <div className="space-y-2">
            <div className="text-base">
              <span className="font-semibold">
                {current.root}
                {qualityMeta?.symbol}
              </span>
              {current.inversion > 0 && (
                <span className="text-gray-500 ml-2">
                  · {inversionMeta?.label} inversion ({inversionMeta?.hint})
                </span>
              )}
              <span className="text-gray-400 ml-2 text-sm">
                {notes.join(" – ")}
              </span>
            </div>
            <Fretboard positions={positions} highlightRoot={current.root} />
            <div className="text-xs text-gray-500">
              Rose = root · Amber = other chord tones
            </div>
          </div>
        );
      }}
      renderExtra={() => (
        <Space wrap>
          <span className="flex flex-col">
            <span className="text-xs text-gray-500">Tone</span>
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
          </span>
          <span className="flex flex-col">
            <span className="text-xs text-gray-500">Qualities</span>
            <Select
              mode="multiple"
              value={qualities as unknown as string[]}
              onChange={(v) => {
                if (v.length === 0) return;
                state.qualities = v as ChordTypeId[];
              }}
              options={CHORD_QUALITIES.map((c) => ({
                value: c.value,
                label: c.label,
              }))}
              style={{ minWidth: 220 }}
              maxTagCount="responsive"
            />
          </span>
          <span className="flex flex-col">
            <span className="text-xs text-gray-500">Inversions</span>
            <Select
              mode="multiple"
              value={inversions as unknown as number[]}
              onChange={(v) => {
                if (v.length === 0) return;
                state.inversions = v as number[];
              }}
              options={INVERSIONS.map((i) => ({
                value: i.value,
                label: i.label,
              }))}
              style={{ minWidth: 160 }}
            />
          </span>
          <span className="flex flex-col" style={{ minWidth: 160 }}>
            <span className="text-xs text-gray-500">
              Arpeggiate:{" "}
              {arpeggiate === 0 ? "block" : `${arpeggiate.toFixed(2)}s`}
            </span>
            <Slider
              min={0}
              max={0.25}
              step={0.01}
              value={arpeggiate}
              onChange={(v) => (state.arpeggiate = v as number)}
            />
          </span>
        </Space>
      )}
    />
  );
};
