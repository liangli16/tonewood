# Tonewood

Ear training for guitarist hobbyists who want to actually understand what they hear.

## Audience and positioning

- **Built for**: hobbyist guitarists learning music theory from books/videos who can't find a good practice tool. The owner is the prototypical user.
- **Not built for**: music majors, total beginners, piano players. Don't drift into those audiences.
- **Wedge**: in-context ear training — cadence-primed keys, fretboard reveals, real-music-tied progressions. NOT explanation engines, NOT decontextualized chord quizzes.
- **One-liner**: "Stop guessing chords. Start hearing them in context."

## Tech stack

Mirrors `~/myProjects/two-moons` deliberately. Reference Two Moons before introducing new patterns.

- Next.js 14.2.35 (Pages Router) · React 18 · TypeScript
- Antd 5 (UI) · Tailwind 3 · Valtio (state)
- smplr (sampled instruments via Web Audio) · tonal (music theory primitives)
- Tone.js is still in `package.json` from earlier synth-based playback but is no longer imported anywhere. Safe to remove in a follow-up.
- npm (yarn isn't installed on this machine)
- Hosted on Vercel, auto-deploys on push to `main`. Repo: `liangli16/tonewood`.

## Commands

```bash
npm install
npm run dev      # http://localhost:3000  — skips type-check and ESLint
npm run build    # runs type-check + ESLint; ALWAYS run before pushing
```

## File map

- `pages/index.tsx` — landing page (hero, drill cards, fretboard preview). Reuses `Fretboard` for the hero visual.
- `pages/practice/index.tsx` — Tabs container, one tab per drill. Calls `preloadInstruments()` on mount so samples are warm by the time the user clicks Play.
- `components/Practice/components.tsx` — `PracticeShell` + `usePracticeState`. Shared scaffold every drill plugs into.
- `components/Practice/ChordQuality.tsx` — reference drill; copy this pattern for new ones
- `components/Practice/Progression.tsx` — progression drill (uses `playProgression` + tonic priming, text-only reveal)
- `components/Practice/FormField.tsx` · `components/Practice/MultiSelect.tsx` — shared config-bar primitives. **Use these for any per-drill setting row** (label-above-control wrapper + Antd Select with `<Tag>` chips). Standard look across drills.
- `constants/progressions.ts` — roman-numeral definitions for the 4 progressions
- `components/Fretboard/Fretboard.tsx` — vertical amber chord diagram (div-based, not SVG). Supports `startFret` (windowed view with `Nfr` label), `numFrets` (adaptive window size — defaults to 5; widen for spread voicings), and `mutes[]` (renders `×` above muted strings).
- `components/TopNav.tsx` — shared top bar (brand link + page-aware right action). Used by `/` and `/practice`.
- `utils/music.ts` — tonal wrappers (`buildChordNotes`, `buildChordsFromRomans`, `symbolsFromRomans`, `simplifyNote`, scale/mode helpers, re-exports `Chord/Scale/Mode/Note/Progression`). `simplifyNote` rewrites tonal's enharmonics to sharp/natural form (`C##` → `D`, `E#` → `F`, `Db` → `C#`) — always use it before showing a note to the user.
- `utils/audio.ts` — smplr wrapper. Lazy-loads SoundFont (`acoustic_guitar_steel`, `acoustic_grand_piano`) on first use, with browser `CacheStorage` for cross-session caching. Exports `playChord`, `playSequence`, `playProgression`, `preloadInstruments`.
- `utils/fretboard.ts` — `findVoicing(notes)` returns the tightest playable voicing for the **exact** notes played (including inversion). It assigns one note per consecutive string set, minimizing max fret then span; returns `{ positions, mutes, startFret, numFrets }` for direct rendering. `getChordPositions(notes)` (returns all positions of the chord tones across the neck) is still around for decorative use like the landing-page hero.
- `constants/chords.ts` — `ChordTypeOption` carries `label` (full, used in dropdown menu), `shortLabel` (compact, used as the chip text on the multi-select via `MultiSelect`'s `chipLabel`), and `symbol` (suffix appended to the root for the chord-name reveal like `Cmaj7`)
- `constants/tuning.ts`

## What's built (v1)

- Chords drill: ID Major / Minor / Dominant 7 / Maj7 / Min7 in any inversion (root/1st/2nd), with fretboard reveal showing the exact voicing of the played notes.
- Common Progression drill: ID Pop (I–V–vi–IV) / Doo-wop (I–vi–IV–V) / Jazz ii–V–I / 12-bar blues. Random major key, brief tonic priming, reveal shows roman numerals + chord names in the key.

## What's planned next (priority order)

1. Mode ID — Ionian / Dorian / Mixolydian / Aeolian (the four hobbyists use)
2. Key Identification — play a cadence, user picks tonic

## Adding a new drill

Copy `ChordQuality.tsx`. Each drill is ~150 lines:
1. Define `State` extending `{ pass: number; all: number; current: {...} }`
2. `usePracticeState(default, "TONEWOOD_*_CONFIG", [persistKey1, ...])`
3. Render through `<PracticeShell>`: pass `onPlay`, `onNewQuestion`, `renderOptions`, `renderReveal`, `renderExtra`
4. Add a tab entry in `pages/practice/index.tsx`

## Gotchas (learned the hard way — read before debugging)

- **`Chord.getChord("M", "C4")` strips the octave.** Returns `["C","E","G"]`, not `["C4","E4","G4"]`. Audio playback then plays nothing. Always build notes via `chord.intervals.map(iv => Note.transpose(tonic, iv))`.
- **`Progression.fromRomanNumerals` does NOT infer chord quality from case.** `["vi"]` returns `["A"]`, not `["Am"]`. Must use explicit suffixes: `vim` for minor triad, `iim7` / `V7` / `IM7` for 7ths. Get this wrong and the jazz cadence sounds like power chords.
- **tonal's `Midi.midiToNoteName` defaults to flats** (`midi 49` → `Db3`, not `C#3`). Always pass `{ sharps: true }` or run notes through `simplifyNote`. `Note.transpose` can also produce theoretically-correct-but-ugly notes like `C##5` / `E#5` for chords on sharp roots — `simplifyNote` collapses those too.
- **The Chords drill's `newChord` validates with `findVoicing` and retries up to 30 times.** Some random combinations (e.g., `Bm7` 2nd inversion at octave 4) can't be voiced as four strings on a 22-fret guitar; the retry loop quietly skips them. If you change the chord universe and start seeing the diagram disappear, this is why.
- **`next dev` does NOT run type-check or ESLint.** Bugs sail through until `next build`. Run `npm run build` locally before every push.
- **`.eslintrc.json` extends `next/core-web-vitals` only** — NOT `next/typescript`. Strict TS rules block legit `any` in the generic shell. Don't add it back.
- **Antd 6 broke Next 14 ESM resolution.** Pinned to Antd 5; don't bump major.
- **`next.config.mjs` has `transpilePackages` for the Antd `@rc-component/*` and `rc-*` packages.** If a new Antd subcomponent throws ESM resolution errors, add its package there.
- **Antd 5 emits a `useLayoutEffect` SSR warning** in dev console. Harmless. To silence, lazy-load the practice page with `dynamic({ ssr: false })` — not done because it's cosmetic.
- **smplr samples come from a GitHub Pages CDN (`smpldsnds`).** First load of an instrument fetches a few hundred KB. We mitigate with two layers: `preloadInstruments()` on `/practice` mount (warm by click time) and `CacheStorage` (instant on subsequent sessions). Cache API needs a secure context — works on `localhost` and HTTPS, but not over plain HTTP on a non-localhost host.
- **AudioContext must be created on the client only.** `utils/audio.ts` lazy-creates it inside `getContext()`; never at module top level (would crash SSR).
- **No yarn on this machine.** Use npm.

## Conventions

- Mirror Two Moons patterns. Check that repo before inventing.
- Lowercase imperative commit messages, conventional prefix (`feat:` / `fix:` / `chore:`).
- No comments that just restate the code. Only when the WHY is non-obvious.
- No emojis in code or commits.
- Build for the user himself first. If he doesn't love it daily, it doesn't ship.
