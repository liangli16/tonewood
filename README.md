# Tonewood

Ear training for guitarist hobbyists who want to actually understand what they hear.

**One-liner:** Stop guessing chords. Start hearing them in context.

## What it is

A small, opinionated ear-training app for guitarists who are learning music theory from books or videos and need a practice tool that fits how they actually play. In-context drills — cadence-primed keys, fretboard reveals, real-music progressions — not decontextualized chord quizzes.

### Drills shipped (v1)

- **Chords** — identify Major / Minor / Dom7 / Maj7 / Min7 in any inversion. Reveal shows the exact voicing of the notes you just heard, on a fretboard diagram you can grab on your real guitar.
- **Progressions** — identify Pop (I–V–vi–IV), Doo-wop (I–vi–IV–V), Jazz ii–V–I, or 12-bar blues. Random major key with brief tonic priming first.

### Planned next

1. Mode ID — Ionian / Dorian / Mixolydian / Aeolian
2. Key Identification — play a cadence, pick the tonic

## Stack

Next.js 14 (Pages Router) · React 18 · TypeScript · Antd 5 · Tailwind · Valtio · [smplr](https://github.com/danigb/smplr) (sampled instruments) · [tonal](https://github.com/tonaljs/tonal) (music theory).

Hosted on Vercel.

## Running locally

```bash
npm install
npm run dev       # http://localhost:3000
npm run build     # type-check + ESLint; run before pushing
```

## Project layout

See `CLAUDE.md` for the operational guide — file map, gotchas, conventions, and how to add a new drill.
