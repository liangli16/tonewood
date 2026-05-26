import Link from "next/link";
import Head from "next/head";
import { Fretboard } from "@/components/Fretboard/Fretboard";
import { TopNav } from "@/components/TopNav";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getChordPositions } from "@/utils/fretboard";
import { buildChordNotes } from "@/utils/music";

type Drill = {
  key: string;
  title: string;
  blurb: string;
  href: string;
};

const DRILLS: Drill[] = [
  {
    key: "chord-quality",
    title: "Chords",
    blurb: "Hear a chord, name it. maj, m, 7, maj7, m7 — in any inversion.",
    href: "/practice#chord-quality",
  },
  {
    key: "progressions",
    title: "Progressions",
    blurb:
      "Four 4-chord families: Pop, Doo-wop, Jazz turnaround, Blues.",
    href: "/practice#progression",
  },
  {
    key: "modes",
    title: "Modes",
    blurb:
      "Ionian, Dorian, Mixolydian, Aeolian — the four hobbyists actually use.",
    href: "/practice#mode",
  },
  {
    key: "scale-degree",
    title: "Scale Degrees",
    blurb: "Hear a cadence, then a single note. Name the scale degree.",
    href: "/practice#scale-degree",
  },
];

const PRINCIPLES: { eyebrow: string; title: string; body: string }[] = [
  {
    eyebrow: "Approach 01",
    title: "Ears, then eyes",
    body: "Hear the chord first. Answer. Then see every position on the fretboard so the sound and shape lock together.",
  },
  {
    eyebrow: "Approach 02",
    title: "In context, not abstract",
    body: "Cadence-primed keys and real progressions. Train how chords actually sound in songs, not as isolated puzzles.",
  },
  {
    eyebrow: "Approach 03",
    title: "Tuned for hobbyists",
    body: "Built for guitarists learning theory from books and videos who need a practice tool that actually fits.",
  },
];

export default function Home() {
  const cMajorPositions = getChordPositions(buildChordNotes("C", "M", 4, 0));

  return (
    <>
      <Head>
        <title>Tonewood — ear training for guitarists</title>
        <meta
          name="description"
          content="Ear training for guitarist hobbyists. In-context drills with fretboard reveals — chord quality, progressions, modes, scale degrees."
        />
      </Head>

      <div className="min-h-screen bg-stone-50 text-stone-900">
        <TopNav />

        <main className="px-6 md:px-12 max-w-6xl mx-auto">
          {/* Hero */}
          <section className="grid md:grid-cols-[1.1fr_1fr] gap-12 md:gap-20 items-center pt-16 md:pt-28 pb-24 md:pb-36">
            <div className="space-y-8">
              <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-amber-800">
                Ear training · for guitarists
              </p>
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-semibold leading-[1.02] tracking-tight">
                Stop guessing chords.{" "}
                <span className="text-amber-800">
                  Start hearing them in context.
                </span>
              </h1>
              <p className="text-stone-600 text-lg leading-relaxed max-w-md">
                In-context ear training for hobbyists. Cadence-primed keys,
                fretboard reveals, real-music progressions — not decontextualized
                quizzes.
              </p>
              <div className="flex flex-wrap items-center gap-5 pt-2">
                <Link href="/coach">
                  <Button variant="primary" size="lg">
                    Talk to the coach
                  </Button>
                </Link>
                <Link
                  href="/practice"
                  className="text-sm font-medium text-stone-600 hover:text-amber-800 transition-colors"
                >
                  Or browse drills →
                </Link>
              </div>
            </div>

            <div className="flex justify-center md:justify-end">
              <Card className="p-5 shadow-sm bg-white/95">
                <Fretboard positions={cMajorPositions} highlightRoot="C" />
                <p className="text-xs text-stone-500 mt-3 text-center">
                  <span className="font-medium text-stone-700">C major</span>
                  <span className="mx-2 text-stone-300">·</span>
                  Rose = root
                </p>
              </Card>
            </div>
          </section>

          {/* Drills */}
          <section
            id="drills"
            className="py-20 md:py-24 border-t border-stone-200"
          >
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-12">
              What you&apos;ll train
            </h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {DRILLS.map((drill) => (
                <Link key={drill.key} href={drill.href} className="group">
                  <Card hoverable className="h-full p-6 md:p-7">
                    <h3 className="text-lg md:text-xl font-semibold mb-2 text-stone-900">
                      {drill.title}
                    </h3>
                    <p className="text-[14px] leading-relaxed text-stone-500">
                      {drill.blurb}
                    </p>
                  </Card>
                </Link>
              ))}
            </div>
          </section>

          {/* How it's different */}
          <section className="py-20 md:py-24 border-t border-stone-200">
            <div className="grid md:grid-cols-3 gap-10 md:gap-14">
              {PRINCIPLES.map((p) => (
                <div key={p.eyebrow}>
                  <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-amber-800 mb-3">
                    {p.eyebrow}
                  </p>
                  <h3 className="text-lg font-semibold mb-2 text-stone-900">
                    {p.title}
                  </h3>
                  <p className="text-[14px] leading-relaxed text-stone-500">
                    {p.body}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </main>

        <footer className="border-t border-stone-200 mt-8">
          <div className="max-w-6xl mx-auto px-6 md:px-12 py-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-500">
            <span>Tonewood — built for guitarist hobbyists.</span>
            <a
              href="https://github.com/liangli16/tonewood"
              target="_blank"
              rel="noreferrer"
              className="hover:text-amber-800 transition-colors"
            >
              github
            </a>
          </div>
        </footer>
      </div>
    </>
  );
}
