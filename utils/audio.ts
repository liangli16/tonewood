import * as Tone from "tone";

let polySynth: Tone.PolySynth | null = null;

const getSynth = (): Tone.PolySynth => {
  if (!polySynth) {
    polySynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "triangle" },
      envelope: { attack: 0.02, decay: 0.1, sustain: 0.5, release: 1.2 },
    }).toDestination();
    polySynth.volume.value = -8;
  }
  return polySynth;
};

export const playChord = async (
  notes: string[],
  opts: { arpeggiate?: number; duration?: string } = {}
): Promise<void> => {
  const { arpeggiate = 0, duration = "2n" } = opts;
  if (!notes.length) return;
  await Tone.start();
  const synth = getSynth();
  const now = Tone.now();
  if (arpeggiate > 0) {
    notes.forEach((note, i) => {
      synth.triggerAttackRelease(note, duration, now + i * arpeggiate);
    });
  } else {
    synth.triggerAttackRelease(notes, duration, now);
  }
};

export const playSequence = async (
  notes: string[],
  spacing = 0.4,
  duration = "8n"
): Promise<void> => {
  if (!notes.length) return;
  await Tone.start();
  const synth = getSynth();
  const now = Tone.now();
  notes.forEach((note, i) => {
    synth.triggerAttackRelease(note, duration, now + i * spacing);
  });
};
