import { Chord, Note, Scale, Mode } from "tonal";

export const NOTE_NAMES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

export type ChordTypeId = "M" | "m" | "7" | "M7" | "m7";

const CHORD_TYPE_TO_TONAL: Record<ChordTypeId, string> = {
  M: "M",
  m: "m",
  "7": "7",
  M7: "maj7",
  m7: "m7",
};

export const buildChordNotes = (
  root: string,
  typeId: ChordTypeId,
  octave = 4,
  inversion = 0
): string[] => {
  const tonalType = CHORD_TYPE_TO_TONAL[typeId];
  const tonic = `${root}${octave}`;
  const chord = Chord.getChord(tonalType, tonic);
  let notes = [...chord.notes];

  for (let i = 0; i < inversion; i++) {
    if (notes.length === 0) break;
    const [first, ...rest] = notes;
    const raised = Note.transpose(first, "8P");
    notes = [...rest, raised];
  }

  return notes;
};

export const buildScaleNotes = (
  tonic: string,
  scaleName: string,
  octave = 4
): string[] => {
  const scale = Scale.get(`${tonic}${octave} ${scaleName}`);
  return scale.notes;
};

export const buildModeNotes = (
  tonic: string,
  modeName: string,
  octave = 4
): string[] => {
  return buildScaleNotes(tonic, modeName, octave);
};

export const pitchClassOf = (note: string): string => Note.pitchClass(note);

export { Chord, Scale, Mode, Note };
