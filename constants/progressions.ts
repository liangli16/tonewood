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
    label: "Jazz turnaround",
    romanLabel: "ii7 – V7 – Imaj7 – vi7",
    romans: ["iim7", "V7", "IM7", "vim7"],
    description: "ii–V–I with a vi7 turnaround back to the top",
  },
  {
    id: "blues",
    label: "Blues",
    romanLabel: "I7 – IV7 – V7 – I7",
    romans: ["I7", "IV7", "V7", "I7"],
    description: "Dominant-7 I, IV, V — the blues color",
  },
];
