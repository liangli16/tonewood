import { Midi, Note } from "tonal";
import { STANDARD_TUNING, FRET_COUNT } from "@/constants/tuning";

export type FretPosition = {
  string: number;
  fret: number;
  note: string;
  pitchClass: string;
};

const fretToNote = (openNote: string, fret: number): string => {
  const midi = Midi.toMidi(openNote);
  if (midi === null) return openNote;
  return Midi.midiToNoteName(midi + fret);
};

export const getChordPositions = (chordNotes: string[]): FretPosition[] => {
  const targetPCs = new Set(chordNotes.map((n) => Note.pitchClass(n)));
  const positions: FretPosition[] = [];

  STANDARD_TUNING.forEach((openNote, stringIdx) => {
    for (let fret = 0; fret <= FRET_COUNT; fret++) {
      const note = fretToNote(openNote, fret);
      const pc = Note.pitchClass(note);
      if (targetPCs.has(pc)) {
        positions.push({ string: stringIdx, fret, note, pitchClass: pc });
      }
    }
  });

  return positions;
};
