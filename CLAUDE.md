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

- `pages/index.tsx` — landing page (hero, drill cards, fretboard preview). Hero primary CTA leads to `/coach` (the conversational coach preview); "Or browse drills" sends to `/practice`. Reuses `Fretboard` for the hero visual.
- `pages/coach/index.tsx` — conversational coach surface. Renders a message stream (coach bubbles + user bubbles), input affordances (button choices OR activity cards), and a "Reset session" / "Start new session" control. Reads from `useCoachMemory`; calls `nextStubTurn` after every user reply / activity completion to advance.
- `pages/practice/index.tsx` — Tabs container, one tab per drill. Calls `preloadInstruments()` on mount so samples are warm by the time the user clicks Play.
- `components/Practice/components.tsx` — `PracticeShell` + `usePracticeState`. Shared scaffold every drill plugs into. **Also exports the drill-embedding API**: `DrillEmbedProps<TConfig>` + `useDrillProgressReporter`. Every drill component accepts optional `lock` (locks its config + skips localStorage hydration; the embedder owns the config) and `onProgress` (fires `{attempts, correct}` on every answer). `PracticeShell` accepts `hideExtra` and `hideHeaderScore` so the embedder can suppress the per-drill config bar and inline running score. This is what `pages/coach/index.tsx` uses to embed a drill inside a coach session.
- `components/Coach/CoachMessage.tsx` — single message bubble (coach left, user right). Tiny inline markdown for paragraph breaks + **bold**.
- `components/Coach/BackingTrackCard.tsx` — plays a chord progression (`buildChordsFromRomans` + `playProgression`); shows a prompt and a Done button that emits a `{kind:"backing-track",done:true}` activity result.
- `components/Coach/DrillCard.tsx` — wraps the appropriate drill via the embed API (`lock` + `onProgress`), tracks running attempts/correct, surfaces a Done button once the user has answered enough to advance.
- `components/Coach/ReflectionCard.tsx` — multi-question form (radio choices or short text); emits `{kind:"reflection",answers:{id→value}}`.
- `components/Practice/ChordQuality.tsx` — reference drill; copy this pattern for new ones
- `components/Practice/Progression.tsx` — progression drill (uses `playProgression` + tonic priming, text-only reveal)
- `components/Practice/Mode.tsx` — modes drill (tonic-triad priming + scale ascending; scale notes ride through `playProgression` as one-note "chords")
- `components/Practice/ScaleDegree.tsx` — scale-degree ID drill (I–IV–V–I cadence, rest beat, single test note, 1–7 answer row). Reuses `playProgression` with single-note "chords" and an empty array as a rest beat.
- `components/Practice/FormField.tsx` · `components/Practice/MultiSelect.tsx` — shared config-bar primitives. **Use these for any per-drill setting row** (label-above-control wrapper + Antd Select with `<Tag>` chips). Standard look across drills.
- `constants/progressions.ts` — roman-numeral definitions for the 4 progressions
- `constants/modes.ts` — the 4 modes (Ionian / Dorian / Mixolydian / Aeolian) with tonal scale name, degrees formula, and tonic-triad quality for priming
- `components/Fretboard/Fretboard.tsx` — vertical amber chord diagram (div-based, not SVG). Supports `startFret` (windowed view with `Nfr` label), `numFrets` (adaptive window size — defaults to 5; widen for spread voicings or scale charts), `mutes[]` (renders `×` above muted strings), and `compact` (smaller dimensions for laying out multiple diagrams in a row, e.g. progression chord-by-chord reveal).
- `components/TopNav.tsx` — shared top bar (brand link + page-aware right action). Used by `/` and `/practice`.
- `utils/music.ts` — tonal wrappers (`buildChordNotes`, `buildChordsFromRomans`, `symbolsFromRomans`, `simplifyNote`, `simplifyChordSymbol`, scale/mode helpers, re-exports `Chord/Scale/Mode/Note/Progression`). `simplifyNote` rewrites tonal's enharmonics to sharp/natural form (`C##` → `D`, `E#` → `F`, `Db` → `C#`); `simplifyChordSymbol` does the same for chord symbols (`F##m` → `Gm`, `B#m` → `Cm`, `E#7` → `F7`). Always use these before showing a note or chord name to the user.
- `utils/coachMemory.ts` — Valtio + localStorage backing for the conversational coach: `transcript` (current session messages), `profile` (free-form notes the coach has accumulated about the user — empty in stub mode), `sessions` (archived past sessions). Also the shared **type contract** for the coach: `Message`, `CoachTurn`, `Activity` (one of `drill` / `backing-track` / `reflection`), `ActivityResult`. The same contract the future LLM API route will satisfy.
- `utils/coachStub.ts` — deterministic state machine. `nextStubTurn(transcript)` walks the transcript, finds the last coach `stubNode`, and emits the next `CoachTurn`. **Designed to be swapped wholesale** for `await fetch('/api/coach/turn', {...})` once the Anthropic API key is in place; the rest of the coach UI doesn't change.
- `utils/audio.ts` — smplr wrapper. Lazy-loads SoundFont (`acoustic_guitar_steel`, `acoustic_grand_piano`) on first use, with browser `CacheStorage` for cross-session caching. Exports `playChord`, `playSequence`, `playProgression`, `preloadInstruments`.
- `utils/fretboard.ts` — `findVoicing(notes)` returns the tightest playable chord voicing (one note per consecutive string set). `findScaleLayout(notes)` returns a single playable scale position for an ordered (typically ascending) list of notes — greedy "next-string-up first" assignment in the smallest fret window that fits, expanding from 5 to up to 10 frets only when necessary; multiple notes per string allowed. Both return a `Fingering` (`{ positions, mutes, startFret, numFrets }`). `getChordPositions(notes, maxFret?)` returns every position of any of the target pitch classes across the neck (used for the landing-page hero). All three pass results through `simplifyNote` so positions display in sharp/natural form.
- `constants/chords.ts` — `ChordTypeOption` carries `label` (full, used in dropdown menu), `shortLabel` (compact, used as the chip text on the multi-select via `MultiSelect`'s `chipLabel`), and `symbol` (suffix appended to the root for the chord-name reveal like `Cmaj7`)
- `constants/tuning.ts`

## What's built (v1)

- Chords drill: ID Major / Minor / Dominant 7 / Maj7 / Min7 in any inversion (root/1st/2nd), with fretboard reveal showing the exact voicing of the played notes.
- Common Progression drill: ID Pop (I–V–vi–IV) / Doo-wop (I–vi–IV–V) / Jazz turnaround (ii7–V7–Imaj7–vi7) / Blues (I7–IV7–V7–I7). All four progressions are exactly 4 chords so the user can't tell them apart by chord count. Random major key, brief tonic priming, reveal shows roman numerals + chord names + a row of compact chord-fingering diagrams.
- Modes drill: ID Ionian / Dorian / Mixolydian / Aeolian. Random tonic, priming triad sized to mode quality (M or m), then scale ascending. Reveal shows tonic + mode label + scale notes + scale-degree formula.
- Scale Degrees drill: hear a I–IV–V–I cadence in a random major key, then a single test note from that scale; identify which degree (1–7) the note was. The relative-pitch / functional-ear-training workhorse.

## v2 in progress — Conversational Coach (feature branch)

Branch `feat/coach-conversational` adds an AI-coach surface on top of v1's drills. The MVP **runs without any API key** — `utils/coachStub.ts` is a deterministic state machine standing in for the LLM. Same `CoachTurn` shape the real LLM will return; swap-only-the-engine when an Anthropic key is added.

Loop: coach greets → asks open question → user picks a choice → coach proposes an activity (drill / backing-track + prompt / reflection) → user does it → coach reads the result and proposes the next step → eventually wraps up + archives the session.

Opening focus: improvisation guidance, anchored on "I feel lost on the fretboard." The stub script runs ~12 nodes covering diagnose → target chord-tone-targeting → backing-track exercise → reflect → branch to either harder backing track or a Scale-Degree drill → wrap up.

When the API key lands: add `pages/api/coach/turn.ts` that calls Anthropic; have `pages/coach/index.tsx` fetch from there instead of calling `nextStubTurn` synchronously. Same I/O contract; no other code changes.

A prior curriculum-shaped coach was attempted on `feat/coach-mvp` and abandoned as too textbook-y; that branch is kept as reference but should not be merged.

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
