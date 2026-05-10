export type ProgressionId = "pop" | "doowop" | "jazz" | "blues";

export type ProgressionDef = {
  id: ProgressionId;
  label: string;
  romanLabel: string;
  romans: string[];
  description: string;
};

export const PROGRESSIONS: ProgressionDef[] = [
  {
    id: "pop",
    label: "Pop",
    romanLabel: "I – V – vi – IV",
    romans: ["I", "V", "vim", "IV"],
    description: "The pop/rock workhorse",
  },
  {
    id: "doowop",
    label: "Doo-wop",
    romanLabel: "I – vi – IV – V",
    romans: ["I", "vim", "IV", "V"],
    description: "The 50s sound",
  },
  {
    id: "jazz",
    label: "Jazz ii–V–I",
    romanLabel: "ii7 – V7 – Imaj7",
    romans: ["iim7", "V7", "IM7"],
    description: "Jazz cadence with 7ths",
  },
  {
    id: "blues",
    label: "12-bar blues",
    romanLabel: "I7 ×4 · IV7 ×2 · I7 ×2 · V7 · IV7 · I7 ×2",
    romans: [
      "I7",
      "I7",
      "I7",
      "I7",
      "IV7",
      "IV7",
      "I7",
      "I7",
      "V7",
      "IV7",
      "I7",
      "I7",
    ],
    description: "Classic 12-bar form with dominant 7ths",
  },
];
