import { Chord, Note, Scale, Mode, Progression, Midi } from "tonal";

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
  const chord = Chord.getChord(tonalType, root);
  let notes = chord.intervals.map((iv) => Note.transpose(tonic, iv));

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

// Normalize enharmonics to sharp spelling and collapse double-accidentals.
// tonal's Note.transpose can return theoretically-correct but ugly notes
// like "C##5" or "E#5" for chords on sharp roots; this rewrites those to
// "D5" / "F5" while leaving plain notes ("C#5", "F5") alone.
export const simplifyNote = (note: string): string => {
  const midi = Midi.toMidi(note);
  if (midi === null) return note;
  return Midi.midiToNoteName(midi, { sharps: true }) ?? note;
};

// Same idea for chord symbols. Progression.fromRomanNumerals can return
// "F##m" or "B#" or "E#7" for sharp keys; we want "Gm", "C", "F7".
// Parses tonic via tonal, simplifies the tonic, reattaches the suffix.
export const simplifyChordSymbol = (symbol: string): string => {
  const c = Chord.get(symbol);
  if (!c.tonic) return symbol;
  const cleanTonic = simplifyNote(`${c.tonic}4`).replace(/-?\d+$/, "");
  const suffix = c.symbol.slice(c.tonic.length);
  return cleanTonic + suffix;
};

export const buildChordsFromRomans = (
  key: string,
  romans: string[],
  octave = 4
): string[][] => {
  const symbols = Progression.fromRomanNumerals(key, romans);
  return symbols.map((symbol) => {
    const c = Chord.get(symbol);
    if (!c.tonic || !c.intervals.length) return [];
    const tonic = `${c.tonic}${octave}`;
    return c.intervals.map((iv) => Note.transpose(tonic, iv));
  });
};

export const symbolsFromRomans = (key: string, romans: string[]): string[] =>
  Progression.fromRomanNumerals(key, romans);

export { Chord, Scale, Mode, Note, Progression };
