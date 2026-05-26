# Tonewood

Ear training for guitarist hobbyists who want to actually understand what they hear.

**One-liner:** Stop guessing chords. Start hearing them in context.

## What it is

A small, opinionated ear-training app for guitarists who are learning music theory from books or videos and need a practice tool that fits how they actually play. In-context drills — cadence-primed keys, fretboard reveals, real-music progressions — not decontextualized chord quizzes.

### Drills shipped (v1)

- **Chords** — identify Major / Minor / Dom7 / Maj7 / Min7 in any inversion. Reveal shows the exact voicing of the notes you just heard, on a fretboard diagram you can grab on your real guitar.
- **Progressions** — identify Pop (I–V–vi–IV), Doo-wop (I–vi–IV–V), Jazz turnaround (ii7–V7–Imaj7–vi7), or Blues (I7–IV7–V7–I7). All four are exactly 4 chords so you can't cheat by counting. Random major key with brief tonic priming first; reveal shows compact chord-fingering diagrams.
- **Modes** — identify Ionian / Dorian / Mixolydian / Aeolian. Tonic-triad priming, then the scale ascending. Reveal shows the scale-degree formula.
- **Scale Degrees** — hear a I–IV–V–I cadence, then a single note from that key. Name the scale degree (1–7). The core relative-pitch drill — trains the ear that lets you find any note's place inside a key.

## Stack

Next.js 14 (Pages Router) · React 18 · TypeScript · Antd 5 · Tailwind · Valtio · [smplr](https://github.com/danigb/smplr) (sampled instruments) · [tonal](https://github.com/tonaljs/tonal) (music theory).

Hosted on Vercel.

## Running locally

```bash
npm install
npm run dev       # http://localhost:3000
npm run build     # type-check + ESLint; run before pushing
```

The conversational coach (`/coach`) calls the Anthropic API server-side. For local dev, drop your key in `.env.local`:

```
ANTHROPIC_API_KEY=sk-ant-...
```

`.env.local` is git-ignored. Without a key, the coach page will surface an error from the API route on first call.

## Deploy

Auto-deploys to Vercel on push to `main`. Preview deploys on every PR.

Set `ANTHROPIC_API_KEY` in the Vercel dashboard under **Project Settings → Environment Variables** (scope to Production + Preview). The key is read only server-side in `pages/api/coach/turn.ts`; it is never sent to the browser.

## Project layout

See `CLAUDE.md` for the operational guide — file map, palette, gotchas, conventions, and how to add a new drill.
