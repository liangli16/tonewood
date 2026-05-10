import { Midi, Note } from "tonal";
import { STANDARD_TUNING, FRET_COUNT } from "@/constants/tuning";
import { simplifyNote } from "@/utils/music";

export type FretPosition = {
  string: number;
  fret: number;
  note: string;
  pitchClass: string;
};

export type Fingering = {
  frets: (number | null)[];
  positions: FretPosition[];
  mutes: boolean[];
  startFret: number;
  numFrets: number;
};

const TUNING_MIDI = STANDARD_TUNING.map((n) => Midi.toMidi(n) ?? 0);
const BASE_NUM_FRETS = 5;
const MAX_REASONABLE_FRET = 22;

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

type Slot = { stringIdx: number; fret: number; note: string };

const slotsToFingering = (slots: Slot[]): Fingering => {
  const frets: (number | null)[] = Array(6).fill(null);
  const positions: FretPosition[] = [];
  const mutes: boolean[] = Array(6).fill(true);

  slots.forEach(({ stringIdx, fret, note }) => {
    frets[stringIdx] = fret;
    mutes[stringIdx] = false;
    const displayNote = simplifyNote(note);
    positions.push({
      string: stringIdx,
      fret,
      note: displayNote,
      pitchClass: Note.pitchClass(displayNote),
    });
  });

  const usedFrets = slots.map((s) => s.fret).filter((f) => f > 0);
  const maxFret = usedFrets.length ? Math.max(...usedFrets) : 0;
  const minFret = usedFrets.length ? Math.min(...usedFrets) : 0;

  const startFret = maxFret <= BASE_NUM_FRETS ? 0 : Math.max(1, minFret);
  const span = startFret === 0 ? maxFret : maxFret - startFret + 1;
  const numFrets = Math.max(BASE_NUM_FRETS, span);

  return { frets, positions, mutes, startFret, numFrets };
};

export const findVoicing = (notes: string[]): Fingering | null => {
  if (!notes.length || notes.length > 6) return null;

  const noteData = notes
    .map((n) => ({ note: n, midi: Midi.toMidi(n) }))
    .filter((x): x is { note: string; midi: number } => x.midi !== null);
  if (noteData.length !== notes.length) return null;

  const sorted = [...noteData].sort((a, b) => a.midi - b.midi);
  const N = sorted.length;

  type Candidate = { slots: Slot[]; maxFret: number; span: number };
  const candidates: Candidate[] = [];

  for (let topString = 5; topString >= N - 1; topString--) {
    const slots: Slot[] = [];
    const used: number[] = [];
    let ok = true;

    for (let i = 0; i < N; i++) {
      const item = sorted[N - 1 - i];
      const stringIdx = topString - i;
      const fret = item.midi - TUNING_MIDI[stringIdx];
      if (fret < 0 || fret > MAX_REASONABLE_FRET) {
        ok = false;
        break;
      }
      slots.push({ stringIdx, fret, note: item.note });
      if (fret > 0) used.push(fret);
    }

    if (!ok) continue;

    const max = used.length ? Math.max(...used) : 0;
    const min = used.length ? Math.min(...used) : 0;
    candidates.push({ slots, maxFret: max, span: max - min });
  }

  if (candidates.length === 0) return null;

  candidates.sort((a, b) => a.maxFret - b.maxFret || a.span - b.span);
  return slotsToFingering(candidates[0].slots);
};
