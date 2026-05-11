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

export const getChordPositions = (
  chordNotes: string[],
  maxFret: number = FRET_COUNT
): FretPosition[] => {
  const targetPCs = new Set(
    chordNotes.map((n) => Note.pitchClass(simplifyNote(n)))
  );
  const positions: FretPosition[] = [];

  STANDARD_TUNING.forEach((openNote, stringIdx) => {
    for (let fret = 0; fret <= maxFret; fret++) {
      const note = simplifyNote(fretToNote(openNote, fret));
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

// Find a single playable position to display an ascending scale (or any
// ordered list of notes). Each note gets its own (string, fret) — multiple
// notes can share a string at different frets, unlike findVoicing.
//
// Greedy: prefer the next-higher string at low fret over staying on the same
// string at high fret. This produces the natural box patterns guitarists use.
//
// Tries 5-fret windows first (the smallest), expanding to 6/7/... only if the
// scale span doesn't fit. Returns null if even a 10-fret window can't hold it.
export const findScaleLayout = (notes: string[]): Fingering | null => {
  if (!notes.length) return null;

  const midis = notes
    .map((n) => Midi.toMidi(n))
    .filter((m): m is number => m !== null);
  if (midis.length !== notes.length) return null;

  for (let windowSize = BASE_NUM_FRETS; windowSize <= 10; windowSize++) {
    const maxStart = MAX_REASONABLE_FRET - windowSize + 1;
    for (let startFret = 0; startFret <= maxStart; startFret++) {
      const positionsPerNote: { string: number; fret: number }[][] = midis.map(
        (midi) => {
          const cands: { string: number; fret: number }[] = [];
          for (let s = 0; s < 6; s++) {
            const fret = midi - TUNING_MIDI[s];
            if (fret < 0 || fret > MAX_REASONABLE_FRET) continue;
            if (fret >= startFret && fret < startFret + windowSize) {
              cands.push({ string: s, fret });
            }
          }
          return cands;
        }
      );

      if (positionsPerNote.some((c) => c.length === 0)) continue;

      let prevString = -1;
      const slots: Slot[] = [];

      for (let i = 0; i < midis.length; i++) {
        const cands = positionsPerNote[i];
        // Prefer next-string-up; if not, same string with higher fret;
        // last resort: any candidate (sorted by string then fret).
        const sorted = [...cands].sort((a, b) => {
          const aAdvance = a.string > prevString ? 0 : 1;
          const bAdvance = b.string > prevString ? 0 : 1;
          if (aAdvance !== bAdvance) return aAdvance - bAdvance;
          if (a.string !== b.string) return a.string - b.string;
          return a.fret - b.fret;
        });
        const pick = sorted[0];
        slots.push({
          stringIdx: pick.string,
          fret: pick.fret,
          note: notes[i],
        });
        prevString = pick.string;
      }

      // Build a Fingering. frets[] gets loose-filled (first-seen per string)
      // since scales have multiple notes per string; nothing in the scale
      // path consumes frets[] anyway.
      const frets: (number | null)[] = Array(6).fill(null);
      const positions: FretPosition[] = [];

      slots.forEach(({ stringIdx, fret, note }) => {
        if (frets[stringIdx] === null) frets[stringIdx] = fret;
        const displayNote = simplifyNote(note);
        positions.push({
          string: stringIdx,
          fret,
          note: displayNote,
          pitchClass: Note.pitchClass(displayNote),
        });
      });

      return {
        frets,
        positions,
        mutes: Array(6).fill(false),
        startFret: startFret > 0 ? startFret : 0,
        numFrets: windowSize,
      };
    }
  }

  return null;
};
