import type { ChordTypeId } from "@/utils/music";

export type ChordTypeOption = {
  value: ChordTypeId;
  label: string;
  symbol: string;
};

export const CHORD_QUALITIES: ChordTypeOption[] = [
  { value: "M", label: "Major", symbol: "" },
  { value: "m", label: "Minor", symbol: "m" },
  { value: "7", label: "Dominant 7", symbol: "7" },
  { value: "M7", label: "Major 7", symbol: "maj7" },
  { value: "m7", label: "Minor 7", symbol: "m7" },
];

export type InversionOption = {
  value: number;
  label: string;
  hint: string;
};

export const INVERSIONS: InversionOption[] = [
  { value: 0, label: "Root", hint: "root in bass" },
  { value: 1, label: "1st", hint: "3rd in bass" },
  { value: 2, label: "2nd", hint: "5th in bass" },
];
