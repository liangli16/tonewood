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
- Tone.js (audio) · tonal (music theory primitives)
- npm (yarn isn't installed on this machine)
- Hosted on Vercel, auto-deploys on push to `main`. Repo: `liangli16/tonewood`.

## Commands

```bash
npm install
npm run dev      # http://localhost:3000  — skips type-check and ESLint
npm run build    # runs type-check + ESLint; ALWAYS run before pushing
```

## File map

- `pages/practice/index.tsx` — Tabs container, one tab per drill
- `components/Practice/components.tsx` — `PracticeShell` + `usePracticeState`. Shared scaffold every drill plugs into.
- `components/Practice/ChordQuality.tsx` — reference drill; copy this pattern for new ones
- `components/Fretboard/Fretboard.tsx` — vertical amber chord diagram (div-based, not SVG)
- `utils/music.ts` — tonal wrappers
- `utils/audio.ts` — Tone.js wrapper
- `utils/fretboard.ts` — `getChordPositions` for the diagram
- `constants/chords.ts` · `constants/tuning.ts`

## What's built (v1)

- Chord Quality drill: ID Major / Minor / Dominant 7 / Maj7 / Min7 in any inversion (root/1st/2nd), with fretboard reveal.

## What's planned next (priority order)

1. Common Progression ID — I–V–vi–IV vs ii–V–I vs I–vi–IV–V vs 12-bar blues
2. Mode ID — Ionian / Dorian / Mixolydian / Aeolian (the four hobbyists use)
3. Key Identification — play a cadence, user picks tonic
4. Sample-based guitar/piano (currently triangle synth)

## Adding a new drill

Copy `ChordQuality.tsx`. Each drill is ~150 lines:
1. Define `State` extending `{ pass: number; all: number; current: {...} }`
2. `usePracticeState(default, "TONEWOOD_*_CONFIG", [persistKey1, ...])`
3. Render through `<PracticeShell>`: pass `onPlay`, `onNewQuestion`, `renderOptions`, `renderReveal`, `renderExtra`
4. Add a tab entry in `pages/practice/index.tsx`

## Gotchas (learned the hard way — read before debugging)

- **`Chord.getChord("M", "C4")` strips the octave.** Returns `["C","E","G"]`, not `["C4","E4","G4"]`. Tone.js then plays nothing. Always build notes via `chord.intervals.map(iv => Note.transpose(tonic, iv))`.
- **`next dev` does NOT run type-check or ESLint.** Bugs sail through until `next build`. Run `npm run build` locally before every push.
- **`.eslintrc.json` extends `next/core-web-vitals` only** — NOT `next/typescript`. Strict TS rules block legit `any` in the generic shell. Don't add it back.
- **Antd 6 broke Next 14 ESM resolution.** Pinned to Antd 5; don't bump major.
- **`next.config.mjs` has `transpilePackages` for the Antd `@rc-component/*` and `rc-*` packages.** If a new Antd subcomponent throws ESM resolution errors, add its package there.
- **Antd 5 emits a `useLayoutEffect` SSR warning** in dev console. Harmless. To silence, lazy-load the practice page with `dynamic({ ssr: false })` — not done because it's cosmetic.
- **No yarn on this machine.** Use npm.

## Conventions

- Mirror Two Moons patterns. Check that repo before inventing.
- Lowercase imperative commit messages, conventional prefix (`feat:` / `fix:` / `chore:`).
- No comments that just restate the code. Only when the WHY is non-obvious.
- No emojis in code or commits.
- Build for the user himself first. If he doesn't love it daily, it doesn't ship.
