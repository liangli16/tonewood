import * as Tone from "tone";

export type Instrument = "guitar" | "piano";

let pianoSynth: Tone.PolySynth | null = null;

const getPianoSynth = (): Tone.PolySynth => {
  if (!pianoSynth) {
    pianoSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "triangle" },
      envelope: {
        attack: 0.005,
        decay: 0.6,
        sustain: 0.0,
        release: 1.4,
      },
    }).toDestination();
    pianoSynth.volume.value = -10;
  }
  return pianoSynth;
};

const playGuitarNote = (note: string, time: number, duration: string) => {
  const pluck = new Tone.PluckSynth({
    attackNoise: 0.6,
    dampening: 3500,
    resonance: 0.88,
    release: 1.4,
  }).toDestination();
  pluck.volume.value = -2;
  pluck.triggerAttackRelease(note, duration, time);
  setTimeout(() => pluck.dispose(), 4000);
};

export const playChord = async (
  notes: string[],
  opts: {
    arpeggiate?: number;
    duration?: string;
    instrument?: Instrument;
  } = {}
): Promise<void> => {
  const { arpeggiate = 0, duration = "2n", instrument = "guitar" } = opts;
  if (!notes.length) return;
  await Tone.start();
  const now = Tone.now();

  if (instrument === "guitar") {
    notes.forEach((note, i) => {
      const startTime = arpeggiate > 0 ? now + i * arpeggiate : now;
      playGuitarNote(note, startTime, duration);
    });
    return;
  }

  const synth = getPianoSynth();
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
  duration = "8n",
  instrument: Instrument = "guitar"
): Promise<void> => {
  if (!notes.length) return;
  await Tone.start();
  const now = Tone.now();

  if (instrument === "guitar") {
    notes.forEach((note, i) => {
      playGuitarNote(note, now + i * spacing, duration);
    });
    return;
  }

  const synth = getPianoSynth();
  notes.forEach((note, i) => {
    synth.triggerAttackRelease(note, duration, now + i * spacing);
  });
};
