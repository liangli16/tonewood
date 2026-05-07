# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start the Next.js dev server on http://localhost:3000
- `npm run build` — production build
- `npm start` — run the production build
- `npm run lint` — `next lint` (extends `next/core-web-vitals`; `react/no-unescaped-entities` is disabled)

There is no test runner configured.

## Architecture

Tonewood is a Next.js 14 **Pages Router** app (TypeScript, React 18) for ear-training guitarists. The interesting architecture is the chain that turns a randomized music-theory question into audio + a fretboard diagram, plus the shared scaffolding that lets new practice modes plug in.

### Practice mode scaffolding (`components/Practice/components.tsx`)

`PracticeShell` + `usePracticeState` is the contract every practice mode implements. New modes do **not** re-implement scoring, persistence, or the play/answer/reveal UI — they just pass render-prop callbacks.

- `usePracticeState<T>(defaultConfig, localStorageKey, persistKeys)` creates a `valtio` `proxy` store, hydrates it from `localStorage` on mount, and subscribes a writer that persists only the keys listed in `persistKeys` (so the user's settings survive reloads but the current question / score do not). It also exposes `resetStats()`.
- `PracticeShell` reads `state.pass` / `state.all` / `state.current` via `useSnapshot` and drives the Play → answer → reveal → Next loop. "Has answered" is derived from `getCurrentAnswer()` being truthy, which is why answer state is initialized to `""` / `0` rather than `null`.
- A new mode (e.g. `ChordQuality.tsx`) defines its own `State` shape extending `{ pass, all }`, calls `usePracticeState`, and supplies `onPlay`, `onNewQuestion`, `getCorrectAnswer`, `getCurrentAnswer`, `onAnswerChange`, `renderOptions`, and optionally `renderReveal` / `renderExtra`. The shell increments `state.pass` automatically when the chosen answer matches `getCorrectAnswer()`.
- `pages/practice/index.tsx` mounts modes inside an antd `Tabs` whose `activeKey` is synced to `window.location.hash`, so each mode is deep-linkable (e.g. `/practice#chord-quality`).

### Music theory → audio → fretboard pipeline

The data flow for one question is: `utils/music.ts` builds notes → `utils/audio.ts` plays them → `utils/fretboard.ts` maps them to fret positions → `components/Fretboard/Fretboard.tsx` renders an SVG.

- **`utils/music.ts`** wraps the `tonal` library. `ChordTypeId` (`"M" | "m" | "7" | "M7" | "m7"`) is the app's internal id; `CHORD_TYPE_TO_TONAL` translates it to tonal's vocabulary (e.g. `"M7"` → `"maj7"`). `buildChordNotes(root, typeId, octave, inversion)` calls `Chord.getChord` and implements inversions by repeatedly moving the lowest note up a perfect octave — keep this convention if you add new chord types.
- **`utils/audio.ts`** owns a **singleton** `Tone.PolySynth` (`getSynth()`). Every `playChord` / `playSequence` call `await Tone.start()` first because browsers block audio until a user gesture; preserve that or playback will silently fail. `arpeggiate` is the gap (in seconds) between successive notes; `0` means block-chord.
- **`utils/fretboard.ts`** + **`constants/tuning.ts`** define the guitar model: `STANDARD_TUNING = ["E2".."E4"]`, `FRET_COUNT = 12`. `getChordPositions` enumerates every (string, fret) whose pitch class is in the chord and returns all of them — the SVG view shows every occurrence, not a single voicing.
- **`components/Fretboard/Fretboard.tsx`** is a pure SVG renderer; `highlightRoot` (pitch class string like `"C"`) is colored red, all other tones blue.

### UI / styling stack

- **antd 5** is the component library. The custom theme (`colorPrimary: "#7c5e3c"`, `borderRadius: 6`) is set globally in `pages/_app.tsx` via `ConfigProvider`. antd and its `rc-*` peers are listed in `next.config.mjs` `transpilePackages` — add new antd-adjacent packages there if Next complains about ESM.
- **Tailwind** is configured to scan `pages/`, `components/`, `app/` (the `app/` glob is aspirational; the project uses Pages Router). Tailwind utilities and antd components are mixed freely in JSX.
- Sass is installed but `styles/globals.css` is plain CSS; SCSS modules are not currently used.

### Conventions

- Path alias `@/*` resolves to the repo root (see `tsconfig.json`). Prefer `@/utils/...` over relative paths.
- State for practice modes is a `valtio` proxy; mutate it directly (`state.current.root = "C"`) rather than calling setters. Read it through `useSnapshot` in components.
- `localStorage` keys are namespaced `TONEWOOD_*` (e.g. `TONEWOOD_CHORD_QUALITY_CONFIG`); reuse that prefix for new modes.
