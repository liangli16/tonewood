import type { ChordTypeId } from "@/utils/music";

export type ModeId = "ionian" | "dorian" | "mixolydian" | "aeolian";

export type ModeDef = {
  id: ModeId;
  label: string;
  altName?: string;
  scaleName: string;
  degrees: string;
  tonicQuality: Extract<ChordTypeId, "M" | "m">;
};

export const MODES: ModeDef[] = [
  {
    id: "ionian",
    label: "Ionian",
    altName: "Major",
    scaleName: "ionian",
    degrees: "1 2 3 4 5 6 7",
    tonicQuality: "M",
  },
  {
    id: "dorian",
    label: "Dorian",
    scaleName: "dorian",
    degrees: "1 2 ♭3 4 5 6 ♭7",
    tonicQuality: "m",
  },
  {
    id: "mixolydian",
    label: "Mixolydian",
    scaleName: "mixolydian",
    degrees: "1 2 3 4 5 6 ♭7",
    tonicQuality: "M",
  },
  {
    id: "aeolian",
    label: "Aeolian",
    altName: "Minor",
    scaleName: "aeolian",
    degrees: "1 2 ♭3 4 5 ♭6 ♭7",
    tonicQuality: "m",
  },
];
