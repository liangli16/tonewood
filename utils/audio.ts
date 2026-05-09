import { Soundfont, CacheStorage } from "smplr";

export type Instrument = "guitar" | "piano";

const SOUNDFONT_NAMES: Record<Instrument, string> = {
  guitar: "acoustic_guitar_steel",
  piano: "acoustic_grand_piano",
};

let context: AudioContext | null = null;
let storage: CacheStorage | undefined;
const cache: Partial<Record<Instrument, Promise<Soundfont>>> = {};

const getContext = (): AudioContext => {
  if (!context) {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    context = new Ctx();
  }
  return context;
};

const getStorage = (): CacheStorage | undefined => {
  if (storage) return storage;
  if (typeof caches === "undefined") return undefined;
  storage = new CacheStorage();
  return storage;
};

const getInstrument = (name: Instrument): Promise<Soundfont> => {
  if (!cache[name]) {
    cache[name] = new Soundfont(getContext(), {
      instrument: SOUNDFONT_NAMES[name],
      storage: getStorage(),
    }).load;
  }
  return cache[name]!;
};

export const preloadInstruments = (
  names: Instrument[] = ["guitar", "piano"]
) => {
  if (typeof window === "undefined") return;
  names.forEach((n) => {
    void getInstrument(n);
  });
};

const ensureRunning = async (ctx: AudioContext) => {
  if (ctx.state !== "running") await ctx.resume();
};

export const playChord = async (
  notes: string[],
  opts: {
    arpeggiate?: number;
    instrument?: Instrument;
  } = {}
): Promise<void> => {
  const { arpeggiate = 0, instrument = "guitar" } = opts;
  if (!notes.length) return;

  const ctx = getContext();
  await ensureRunning(ctx);
  const inst = await getInstrument(instrument);
  inst.stop();

  const now = ctx.currentTime;
  notes.forEach((note, i) => {
    const time = arpeggiate > 0 ? now + i * arpeggiate : now;
    inst.start({ note, time, velocity: 90 });
  });
};

export const playSequence = async (
  notes: string[],
  spacing = 0.4,
  duration = 0.35,
  instrument: Instrument = "guitar"
): Promise<void> => {
  if (!notes.length) return;

  const ctx = getContext();
  await ensureRunning(ctx);
  const inst = await getInstrument(instrument);
  inst.stop();

  const now = ctx.currentTime;
  notes.forEach((note, i) => {
    inst.start({ note, time: now + i * spacing, duration, velocity: 90 });
  });
};
